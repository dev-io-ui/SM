const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'achievement'],
    required: true,
  },
  requirements: {
    action: {
      type: String,
      required: true,
    },
    target: {
      type: Number,
      required: true,
    },
  },
  rewards: {
    points: {
      type: Number,
      required: true,
    },
    badge: {
      type: String,
    },
    xp: {
      type: Number,
      default: 0,
    },
  },
  startDate: Date,
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
});

const userChallengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  rewardsClaimed: {
    type: Boolean,
    default: false,
  },
});

const levelSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
    unique: true,
  },
  xpRequired: {
    type: Number,
    required: true,
  },
  rewards: {
    points: Number,
    badge: String,
    tradingLimit: Number,
  },
});

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  points: {
    type: Number,
    default: 0,
  },
  badges: [{
    name: String,
    description: String,
    imageUrl: String,
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  achievements: [{
    name: String,
    description: String,
    completedAt: Date,
    rewards: {
      points: Number,
      xp: Number,
      badge: String,
    },
  }],
  dailyStreak: {
    count: {
      type: Number,
      default: 0,
    },
    lastLoginDate: Date,
  },
  activeChallenges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserChallenge',
  }],
  completedChallenges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserChallenge',
  }],
  tradingStats: {
    totalTrades: {
      type: Number,
      default: 0,
    },
    successfulTrades: {
      type: Number,
      default: 0,
    },
    profitLoss: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
    },
  },
  courseProgress: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    progress: {
      type: Number,
      default: 0,
    },
    completedModules: [{
      module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
      },
      completedAt: Date,
      score: Number,
    }],
    startedAt: Date,
    completedAt: Date,
  }],
}, {
  timestamps: true,
});

// Methods for UserProgress
userProgressSchema.methods.addXP = async function(amount) {
  this.xp += amount;
  await this.checkLevelUp();
  return this.save();
};

userProgressSchema.methods.checkLevelUp = async function() {
  const Level = mongoose.model('Level');
  const nextLevel = await Level.findOne({ level: this.level + 1 });
  
  if (nextLevel && this.xp >= nextLevel.xpRequired) {
    this.level += 1;
    this.points += nextLevel.rewards.points;
    
    if (nextLevel.rewards.badge) {
      this.badges.push({
        name: nextLevel.rewards.badge,
        description: `Reached level ${this.level}`,
        earnedAt: new Date(),
      });
    }
    
    // Recursive check for multiple level ups
    await this.checkLevelUp();
  }
};

userProgressSchema.methods.updateDailyStreak = function() {
  const now = new Date();
  const lastLogin = this.dailyStreak.lastLoginDate;
  
  if (!lastLogin) {
    this.dailyStreak.count = 1;
  } else {
    const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.dailyStreak.count += 1;
    } else if (diffDays > 1) {
      this.dailyStreak.count = 1;
    }
  }
  
  this.dailyStreak.lastLoginDate = now;
  return this.save();
};

userProgressSchema.methods.updateTradingStats = function(trade) {
  this.tradingStats.totalTrades += 1;
  
  if (trade.profitLoss > 0) {
    this.tradingStats.successfulTrades += 1;
  }
  
  this.tradingStats.profitLoss += trade.profitLoss;
  this.tradingStats.winRate = (this.tradingStats.successfulTrades / this.tradingStats.totalTrades) * 100;
  
  return this.save();
};

const Challenge = mongoose.model('Challenge', challengeSchema);
const UserChallenge = mongoose.model('UserChallenge', userChallengeSchema);
const Level = mongoose.model('Level', levelSchema);
const UserProgress = mongoose.model('UserProgress', userProgressSchema);

module.exports = {
  Challenge,
  UserChallenge,
  Level,
  UserProgress,
};
