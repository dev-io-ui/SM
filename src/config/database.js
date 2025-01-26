const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    // Initialize models
    require('../models/userModel');
    require('../models/courseModel');
    require('../models/achievementModel');
    require('../models/orderModel');
    require('../models/portfolioModel');
    require('../models/gamificationModel');

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Create indexes
    const Portfolio = mongoose.model('Portfolio');
    await Portfolio.collection.createIndex({ user: 1 }, { unique: true });
    await Portfolio.collection.createIndex({ 'holdings.symbol': 1 });

    const Order = mongoose.model('Order');
    await Order.collection.createIndex({ user: 1 });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ symbol: 1 });
    await Order.collection.createIndex({ createdAt: 1 });

    const UserProgress = mongoose.model('UserProgress');
    await UserProgress.collection.createIndex({ user: 1 }, { unique: true });
    await UserProgress.collection.createIndex({ level: 1 });
    await UserProgress.collection.createIndex({ points: -1 });

    const Challenge = mongoose.model('Challenge');
    await Challenge.collection.createIndex({ type: 1, isActive: 1 });
    await Challenge.collection.createIndex({ startDate: 1, endDate: 1 });

    const UserChallenge = mongoose.model('UserChallenge');
    await UserChallenge.collection.createIndex({ user: 1, challenge: 1 }, { unique: true });
    await UserChallenge.collection.createIndex({ completed: 1 });

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
