const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    badges: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        imageUrl: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completedCourses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        grade: Number,
      },
    ],
    dailyStreak: {
      count: {
        type: Number,
        default: 0,
      },
      lastLoginDate: {
        type: Date,
        default: Date.now,
      },
    },
    tradingStats: {
      successfulTrades: {
        type: Number,
        default: 0,
      },
      totalTrades: {
        type: Number,
        default: 0,
      },
      profitability: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate level based on points
achievementSchema.methods.calculateLevel = function () {
  // Simple level calculation: Every 1000 points = 1 level
  this.level = Math.floor(this.points / 1000) + 1;
  return this.level;
};

// Update daily streak
achievementSchema.methods.updateDailyStreak = function () {
  const now = new Date();
  const lastLogin = new Date(this.dailyStreak.lastLoginDate);
  const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    this.dailyStreak.count += 1;
  } else if (diffDays > 1) {
    // Streak broken
    this.dailyStreak.count = 1;
  }
  this.dailyStreak.lastLoginDate = now;

  return this.dailyStreak;
};

// Add points and recalculate level
achievementSchema.methods.addPoints = function (points) {
  this.points += points;
  this.calculateLevel();
  return this.points;
};

// Add badge
achievementSchema.methods.addBadge = function (badge) {
  if (!this.badges.some((b) => b.name === badge.name)) {
    this.badges.push(badge);
  }
  return this.badges;
};

// Update trading stats
achievementSchema.methods.updateTradingStats = function (trade) {
  this.tradingStats.totalTrades += 1;
  if (trade.profitLoss > 0) {
    this.tradingStats.successfulTrades += 1;
  }
  this.tradingStats.profitability =
    (this.tradingStats.successfulTrades / this.tradingStats.totalTrades) * 100;
  return this.tradingStats;
};

module.exports = mongoose.model('Achievement', achievementSchema);
