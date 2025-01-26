const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../database/models/userModel');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
});

// Instructor middleware
const instructor = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'instructor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an instructor');
  }
});

// Rate limiting middleware for virtual trading
const tradingRateLimit = asyncHandler(async (req, res, next) => {
  const WINDOW_SIZE = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 100;
  
  const now = Date.now();
  const userRequests = req.user.tradingRequests || [];
  
  // Remove old requests
  const recentRequests = userRequests.filter(time => now - time < WINDOW_SIZE);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    res.status(429);
    throw new Error('Too many trading requests. Please try again later.');
  }
  
  // Add current request
  recentRequests.push(now);
  req.user.tradingRequests = recentRequests;
  await req.user.save();
  
  next();
});

module.exports = {
  protect,
  admin,
  instructor,
  tradingRateLimit
};
