const Achievement = require('../models/achievementModel');
const User = require('../models/userModel');
const logger = require('../config/logger');

// Get user achievements
exports.getAchievements = async (req, res) => {
  try {
    let achievements = await Achievement.findOne({ user: req.user._id })
      .populate('completedCourses.course', 'title description')
      .lean();

    if (!achievements) {
      achievements = await Achievement.create({ user: req.user._id });
    }

    res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    logger.error('Error in getAchievements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Achievement.find()
      .sort('-points')
      .limit(10)
      .populate('user', 'name avatar')
      .lean();

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    logger.error('Error in getLeaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
    });
  }
};

// Award points
exports.awardPoints = async (req, res) => {
  try {
    const { points, action } = req.body;
    const achievement = await Achievement.findOne({ user: req.user._id });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement record not found',
      });
    }

    // Add points and update level
    achievement.addPoints(points);

    // Check for new badges based on points
    if (achievement.points >= 1000 && !achievement.badges.some(b => b.name === 'Novice Trader')) {
      achievement.addBadge({
        name: 'Novice Trader',
        description: 'Earned 1000 points',
        imageUrl: '/badges/novice-trader.png',
      });
    }

    if (achievement.points >= 5000 && !achievement.badges.some(b => b.name === 'Expert Trader')) {
      achievement.addBadge({
        name: 'Expert Trader',
        description: 'Earned 5000 points',
        imageUrl: '/badges/expert-trader.png',
      });
    }

    // Update daily streak
    achievement.updateDailyStreak();

    await achievement.save();

    res.status(200).json({
      success: true,
      data: achievement,
    });
  } catch (error) {
    logger.error('Error in awardPoints:', error);
    res.status(500).json({
      success: false,
      message: 'Error awarding points',
    });
  }
};

// Update trading stats
exports.updateTradingStats = async (req, res) => {
  try {
    const { trade } = req.body;
    const achievement = await Achievement.findOne({ user: req.user._id });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement record not found',
      });
    }

    achievement.updateTradingStats(trade);
    await achievement.save();

    res.status(200).json({
      success: true,
      data: achievement.tradingStats,
    });
  } catch (error) {
    logger.error('Error in updateTradingStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trading stats',
    });
  }
};

// Complete course
exports.completeCourse = async (req, res) => {
  try {
    const { courseId, grade } = req.body;
    const achievement = await Achievement.findOne({ user: req.user._id });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement record not found',
      });
    }

    // Add completed course
    achievement.completedCourses.push({
      course: courseId,
      grade,
    });

    // Award points based on grade
    const pointsAwarded = Math.floor(grade * 10);
    achievement.addPoints(pointsAwarded);

    // Check for course completion badges
    const completedCoursesCount = achievement.completedCourses.length;
    if (completedCoursesCount === 1) {
      achievement.addBadge({
        name: 'First Course',
        description: 'Completed your first course',
        imageUrl: '/badges/first-course.png',
      });
    } else if (completedCoursesCount === 5) {
      achievement.addBadge({
        name: 'Course Master',
        description: 'Completed 5 courses',
        imageUrl: '/badges/course-master.png',
      });
    }

    await achievement.save();

    res.status(200).json({
      success: true,
      data: {
        achievement,
        pointsAwarded,
      },
    });
  } catch (error) {
    logger.error('Error in completeCourse:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing course',
    });
  }
};
