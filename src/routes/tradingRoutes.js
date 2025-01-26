const express = require('express');
const router = express.Router();
const {
  executeTrade,
  getPortfolio,
  getTradingHistory,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
} = require('../controllers/tradingController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { rateLimiter } = require('../middleware/rateLimitMiddleware');
const {
  executeTradeSchema,
  watchlistSchema,
} = require('../utils/validation');

// Apply rate limiting to all trading routes
router.use(rateLimiter('trading', 100, 60)); // 100 requests per minute

// Portfolio routes
router.route('/portfolio')
  .get(protect, getPortfolio);

// Trading routes
router.route('/execute')
  .post(
    protect,
    validateRequest(executeTradeSchema),
    executeTrade
  );

router.route('/history')
  .get(protect, getTradingHistory);

// Watchlist routes
router.route('/watchlist')
  .get(protect, getWatchlist)
  .post(
    protect,
    validateRequest(watchlistSchema),
    addToWatchlist
  );

router.route('/watchlist/:symbol')
  .delete(protect, removeFromWatchlist);

module.exports = router;
