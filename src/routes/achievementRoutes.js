const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAchievements,
  getLeaderboard,
  awardPoints,
  updateTradingStats,
  completeCourse,
} = require('../controllers/achievementController');

// Get user achievements
router.get('/achievements', protect, getAchievements);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Award points
router.post('/award-points', protect, awardPoints);

// Update trading stats
router.post('/trading-stats', protect, updateTradingStats);

// Complete course
router.post('/complete-course', protect, completeCourse);

module.exports = router;
