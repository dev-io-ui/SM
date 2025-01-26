const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('../config/logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
});

redis.on('error', (error) => {
  logger.error('Redis error:', error);
});

// General API rate limiter
exports.apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
  },
});

// Auth endpoints rate limiter
exports.authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many login attempts, please try again later.',
  },
});

// Trading endpoints rate limiter
exports.tradingLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:trading:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    error: 'Too many trading requests, please try again later.',
  },
});

// Stock API rate limiter
exports.stockApiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:stockapi:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many stock API requests, please try again later.',
  },
});
