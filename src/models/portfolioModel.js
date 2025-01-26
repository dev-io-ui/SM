const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  averagePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    cash: {
      type: Number,
      required: true,
      default: 100000, // Starting cash amount
      min: 0,
    },
    holdings: [holdingSchema],
    performance: {
      totalValue: {
        type: Number,
        default: 100000,
      },
      dailyReturn: {
        type: Number,
        default: 0,
      },
      totalReturn: {
        type: Number,
        default: 0,
      },
      history: [
        {
          date: Date,
          value: Number,
          cash: Number,
          holdings: Array,
        },
      ],
    },
    watchlist: [
      {
        symbol: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
        alerts: [
          {
            type: {
              type: String,
              enum: ['price', 'volume', 'percentage'],
            },
            condition: {
              type: String,
              enum: ['above', 'below'],
            },
            value: Number,
            active: {
              type: Boolean,
              default: true,
            },
          },
        ],
      },
    ],
    settings: {
      tradingEnabled: {
        type: Boolean,
        default: true,
      },
      maxLeverage: {
        type: Number,
        default: 1,
      },
      stopLossDefault: {
        type: Number,
        default: 5, // 5%
      },
      takeProfitDefault: {
        type: Number,
        default: 10, // 10%
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total portfolio value
portfolioSchema.methods.calculateTotalValue = async function (currentPrices) {
  const holdingsValue = this.holdings.reduce((total, holding) => {
    const currentPrice = currentPrices[holding.symbol] || holding.averagePrice;
    return total + holding.quantity * currentPrice;
  }, 0);

  const totalValue = this.cash + holdingsValue;
  
  // Update performance metrics
  const previousValue = this.performance.totalValue;
  this.performance.totalValue = totalValue;
  this.performance.totalReturn = ((totalValue - 100000) / 100000) * 100;
  this.performance.dailyReturn = ((totalValue - previousValue) / previousValue) * 100;

  // Add to history
  this.performance.history.push({
    date: new Date(),
    value: totalValue,
    cash: this.cash,
    holdings: this.holdings.map(h => ({
      symbol: h.symbol,
      quantity: h.quantity,
      value: h.quantity * (currentPrices[h.symbol] || h.averagePrice),
    })),
  });

  // Keep only last 365 days of history
  if (this.performance.history.length > 365) {
    this.performance.history.shift();
  }

  return this.save();
};

// Add holding
portfolioSchema.methods.addHolding = function (symbol, quantity, price) {
  const holding = this.holdings.find(h => h.symbol === symbol);
  
  if (holding) {
    const totalQuantity = holding.quantity + quantity;
    holding.averagePrice = ((holding.quantity * holding.averagePrice) + (quantity * price)) / totalQuantity;
    holding.quantity = totalQuantity;
    holding.lastUpdated = new Date();
  } else {
    this.holdings.push({
      symbol,
      quantity,
      averagePrice: price,
    });
  }
};

// Remove holding
portfolioSchema.methods.removeHolding = function (symbol, quantity) {
  const holdingIndex = this.holdings.findIndex(h => h.symbol === symbol);
  
  if (holdingIndex !== -1) {
    const holding = this.holdings[holdingIndex];
    if (holding.quantity <= quantity) {
      this.holdings.splice(holdingIndex, 1);
    } else {
      holding.quantity -= quantity;
      holding.lastUpdated = new Date();
    }
  }
};

// Add to watchlist
portfolioSchema.methods.addToWatchlist = function (symbol) {
  if (!this.watchlist.find(w => w.symbol === symbol)) {
    this.watchlist.push({ symbol });
  }
};

// Remove from watchlist
portfolioSchema.methods.removeFromWatchlist = function (symbol) {
  this.watchlist = this.watchlist.filter(w => w.symbol !== symbol);
};

// Add price alert
portfolioSchema.methods.addAlert = function (symbol, alertData) {
  const watchlistItem = this.watchlist.find(w => w.symbol === symbol);
  if (watchlistItem) {
    watchlistItem.alerts.push(alertData);
  }
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
