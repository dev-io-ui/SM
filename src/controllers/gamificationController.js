const asyncHandler = require('express-async-handler');
const User = require('../database/models/userModel');

// Point values for different actions
const POINTS = {
  COMPLETE_MODULE: 50,
  COMPLETE_COURSE: 200,
  DAILY_LOGIN: 10,
  TRADE_EXECUTED: 5,
  PROFITABLE_TRADE: 20,
  STREAK_MILESTONE: 100
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  1000,   // Level 2
  2500,   // Level 3
  5000,   // Level 4
  10000,  // Level 5
  20000,  // Level 6
  35000,  // Level 7
  50000,  // Level 8
  75000,  // Level 9
  100000  // Level 10
];

// @desc    Award points to user
// @route   POST /api/gamification/award-points
// @access  Private
const awardPoints = asyncHandler(async (req, res) => {
  const { action, context } = req.body;
  const user = await User.findById(req.user.id);

  let pointsEarned = 0;

  switch (action) {
    case 'COMPLETE_MODULE':
      pointsEarned = POINTS.COMPLETE_MODULE;
      break;
    case 'COMPLETE_COURSE':
      pointsEarned = POINTS.COMPLETE_COURSE;
      break;
    case 'DAILY_LOGIN':
      pointsEarned = POINTS.DAILY_LOGIN;
      break;
    case 'TRADE_EXECUTED':
      pointsEarned = POINTS.TRADE_EXECUTED;
      break;
    case 'PROFITABLE_TRADE':
      pointsEarned = POINTS.PROFITABLE_TRADE;
      break;
    default:
      pointsEarned = 0;
  }

  // Add points
  user.gamification.points += pointsEarned;

  // Check for level up
  const currentLevel = user.gamification.level;
  const newLevel = LEVEL_THRESHOLDS.findIndex(threshold => user.gamification.points < threshold);
  user.gamification.level = newLevel === -1 ? LEVEL_THRESHOLDS.length : newLevel;

  // Check for streak milestone
  if (user.gamification.dailyStreak.count % 7 === 0) {
    user.gamification.points += POINTS.STREAK_MILESTONE;
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      pointsEarned,
      totalPoints: user.gamification.points,
      level: user.gamification.level,
      leveledUp: currentLevel !== user.gamification.level
    }
  });
});

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await User.find()
    .select('name gamification.points gamification.level gamification.badges')
    .sort('-gamification.points')
    .limit(10);

  res.status(200).json({
    success: true,
    data: leaderboard
  });
});

// @desc    Get user achievements
// @route   GET /api/gamification/achievements
// @access  Private
const getAchievements = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('gamification');

  res.status(200).json({
    success: true,
    data: {
      points: user.gamification.points,
      level: user.gamification.level,
      badges: user.gamification.badges,
      dailyStreak: user.gamification.dailyStreak
    }
  });
});

// @desc    Award badge
// @route   POST /api/gamification/award-badge
// @access  Private
const awardBadge = asyncHandler(async (req, res) => {
  const { badgeName } = req.body;
  const user = await User.findById(req.user.id);

  // Check if badge already awarded
  if (user.gamification.badges.some(badge => badge.name === badgeName)) {
    res.status(400);
    throw new Error('Badge already awarded');
  }

  // Add badge
  user.gamification.badges.push({
    name: badgeName,
    earnedAt: Date.now()
  });

  // Award bonus points for badge
  user.gamification.points += 100;

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      badge: {
        name: badgeName,
        earnedAt: Date.now()
      },
      totalPoints: user.gamification.points
    }
  });
});

// @desc    Get daily challenges
// @route   GET /api/gamification/daily-challenges
// @access  Private
const getDailyChallenges = asyncHandler(async (req, res) => {
  // Generate daily challenges based on user's level and progress
  const challenges = [
    {
      id: 1,
      title: 'Complete 2 Modules',
      description: 'Complete any 2 modules today',
      points: 50,
      progress: 0,
      target: 2
    },
    {
      id: 2,
      title: 'Execute 5 Trades',
      description: 'Make 5 virtual trades',
      points: 75,
      progress: 0,
      target: 5
    },
    {
      id: 3,
      title: 'Achieve 10% Profit',
      description: 'Make a trade with 10% or more profit',
      points: 100,
      progress: 0,
      target: 1
    }
  ];

  res.status(200).json({
    success: true,
    data: challenges
  });
});

module.exports = {
  awardPoints,
  getLeaderboard,
  getAchievements,
  awardBadge,
  getDailyChallenges
};
