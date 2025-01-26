const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Portfolio = require('../models/portfolioModel');
const UserProgress = require('../models/gamificationModel').UserProgress;
const stockService = require('../services/stockService');
const emailService = require('../services/emailService');
const logger = require('../config/logger');

// @desc    Execute trade
// @route   POST /api/trading/execute
// @access  Private
const executeTrade = asyncHandler(async (req, res) => {
  try {
    const { type, symbol, quantity, price, orderType, limitPrice, stopLoss, takeProfit } = req.body;

    // Get user's portfolio
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user._id });
    }

    // Validate trade
    const stockPrice = await stockService.getStockPrice(symbol);
    const totalCost = quantity * stockPrice.price;

    if (type === 'buy' && totalCost > portfolio.cash) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds',
      });
    }

    if (type === 'sell') {
      const holding = portfolio.holdings.find(h => h.symbol === symbol);
      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient holdings',
        });
      }
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      portfolio: portfolio._id,
      type,
      symbol,
      quantity,
      price: stockPrice.price,
      orderType,
      limitPrice,
      stopLoss,
      takeProfit,
      status: 'completed',
      executedAt: new Date(),
      profitLoss: type === 'sell' ? (stockPrice.price - portfolio.holdings.find(h => h.symbol === symbol).averagePrice) * quantity : 0,
    });

    // Update portfolio
    if (type === 'buy') {
      portfolio.cash -= totalCost;
      portfolio.addHolding(symbol, quantity, stockPrice.price);
    } else {
      portfolio.cash += totalCost;
      portfolio.removeHolding(symbol, quantity);
    }

    await portfolio.calculateTotalValue({ [symbol]: stockPrice.price });

    // Update user progress
    const userProgress = await UserProgress.findOne({ user: req.user._id });
    if (userProgress) {
      await userProgress.updateTradingStats(order);
    }

    // Send email notification
    await emailService.sendTradeConfirmation(req.user, order);

    res.status(200).json({
      success: true,
      data: {
        order,
        portfolio,
      },
    });
  } catch (error) {
    logger.error('Error in executeTrade:', error);
    res.status(500).json({
      success: false,
      message: 'Error executing trade',
    });
  }
});

// @desc    Get portfolio
// @route   GET /api/trading/portfolio
// @access  Private
const getPortfolio = asyncHandler(async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user._id });
    }

    // Get current prices for all holdings
    const currentPrices = {};
    for (const holding of portfolio.holdings) {
      const stockPrice = await stockService.getStockPrice(holding.symbol);
      currentPrices[holding.symbol] = stockPrice.price;
    }

    await portfolio.calculateTotalValue(currentPrices);

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    logger.error('Error in getPortfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching portfolio',
    });
  }
});

// @desc    Get trading history
// @route   GET /api/trading/history
// @access  Private
const getTradingHistory = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    logger.error('Error in getTradingHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trading history',
    });
  }
});

// @desc    Add to watchlist
// @route   POST /api/trading/watchlist
// @access  Private
const addToWatchlist = asyncHandler(async (req, res) => {
  try {
    const { symbol } = req.body;
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found',
      });
    }

    portfolio.addToWatchlist(symbol);
    await portfolio.save();

    res.status(200).json({
      success: true,
      data: portfolio.watchlist,
    });
  } catch (error) {
    logger.error('Error in addToWatchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to watchlist',
    });
  }
});

// @desc    Remove from watchlist
// @route   DELETE /api/trading/watchlist/:symbol
// @access  Private
const removeFromWatchlist = asyncHandler(async (req, res) => {
  try {
    const { symbol } = req.params;
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found',
      });
    }

    portfolio.removeFromWatchlist(symbol);
    await portfolio.save();

    res.status(200).json({
      success: true,
      data: portfolio.watchlist,
    });
  } catch (error) {
    logger.error('Error in removeFromWatchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from watchlist',
    });
  }
});

// @desc    Get watchlist
// @route   GET /api/trading/watchlist
// @access  Private
const getWatchlist = asyncHandler(async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found',
      });
    }

    // Get current prices for watchlist
    const watchlistData = await Promise.all(
      portfolio.watchlist.map(async (item) => {
        const stockPrice = await stockService.getStockPrice(item.symbol);
        return {
          ...item.toObject(),
          currentPrice: stockPrice.price,
          change: stockPrice.change,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: watchlistData,
    });
  } catch (error) {
    logger.error('Error in getWatchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching watchlist',
    });
  }
});

module.exports = {
  executeTrade,
  getPortfolio,
  getTradingHistory,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist
};
