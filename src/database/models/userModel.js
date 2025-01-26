const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'instructor', 'admin'],
    default: 'user'
  },
  gamification: {
    level: {
      type: Number,
      default: 1
    },
    points: {
      type: Number,
      default: 0
    },
    badges: [{
      name: String,
      earnedAt: Date
    }],
    dailyStreak: {
      count: { type: Number, default: 0 },
      lastLoginDate: Date
    }
  },
  virtualTrading: {
    balance: {
      type: Number,
      default: 100000 // Starting balance for virtual trading
    },
    portfolio: [{
      symbol: String,
      quantity: Number,
      averageBuyPrice: Number,
      lastUpdated: Date
    }],
    transactions: [{
      type: { type: String, enum: ['buy', 'sell'] },
      symbol: String,
      quantity: Number,
      price: Number,
      timestamp: Date
    }]
  },
  progress: {
    completedCourses: [{
      courseId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course'
      },
      completedAt: Date,
      score: Number
    }],
    completedModules: [{
      moduleId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Module'
      },
      completedAt: Date
    }]
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  tradingRequests: [Date], // For rate limiting
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update daily streak
userSchema.methods.updateDailyStreak = async function() {
  const now = new Date();
  const lastLogin = this.gamification.dailyStreak.lastLoginDate;
  
  if (!lastLogin) {
    this.gamification.dailyStreak.count = 1;
  } else {
    const daysSinceLastLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastLogin === 1) {
      this.gamification.dailyStreak.count += 1;
    } else if (daysSinceLastLogin > 1) {
      this.gamification.dailyStreak.count = 1;
    }
  }
  
  this.gamification.dailyStreak.lastLoginDate = now;
  await this.save();
};

// Virtual for total portfolio value
userSchema.virtual('virtualTrading.portfolioValue').get(function() {
  return this.virtualTrading.portfolio.reduce((total, holding) => {
    return total + (holding.quantity * holding.averageBuyPrice);
  }, 0);
});

module.exports = mongoose.model('User', userSchema);
