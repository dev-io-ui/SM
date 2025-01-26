const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6).max(30),
});

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});

// Course validation schemas
const courseSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10),
  difficulty: Joi.string().required().valid('beginner', 'intermediate', 'advanced'),
  price: Joi.number().min(0),
  modules: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      content: Joi.string().required(),
      duration: Joi.number().required().min(1),
      order: Joi.number().required(),
    })
  ),
});

// Trading validation schemas
const executeTradeSchema = Joi.object({
  type: Joi.string().required().valid('buy', 'sell'),
  symbol: Joi.string().required().min(1).max(10),
  quantity: Joi.number().required().min(1),
  orderType: Joi.string().required().valid('market', 'limit'),
  limitPrice: Joi.when('orderType', {
    is: 'limit',
    then: Joi.number().required().min(0),
    otherwise: Joi.number().optional(),
  }),
  stopLoss: Joi.number().optional().min(0),
  takeProfit: Joi.number().optional().min(0),
});

const watchlistSchema = Joi.object({
  symbol: Joi.string().required().min(1).max(10),
});

// Achievement validation schemas
const achievementSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required().valid('trading', 'learning', 'social'),
  criteria: Joi.object({
    type: Joi.string().required(),
    target: Joi.number().required(),
  }),
  rewards: Joi.object({
    points: Joi.number().required().min(0),
    badge: Joi.string().optional(),
  }),
});

// Notification validation schemas
const notificationSettingsSchema = Joi.object({
  email: Joi.boolean().optional(),
  push: Joi.boolean().optional(),
  priceAlerts: Joi.boolean().optional(),
  tradeExecutions: Joi.boolean().optional(),
  achievements: Joi.boolean().optional(),
  courseProgress: Joi.boolean().optional(),
});

const priceAlertSchema = Joi.object({
  symbol: Joi.string().required().min(1).max(10),
  condition: Joi.string().required().valid('above', 'below'),
  price: Joi.number().required().min(0),
});

// Profile validation schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().optional().min(2).max(50),
  email: Joi.string().optional().email(),
  currentPassword: Joi.string().optional().min(6),
  newPassword: Joi.string().optional().min(6),
  avatar: Joi.string().optional().uri(),
  bio: Joi.string().optional().max(500),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark'),
    emailNotifications: Joi.boolean(),
    pushNotifications: Joi.boolean(),
  }).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  courseSchema,
  executeTradeSchema,
  watchlistSchema,
  achievementSchema,
  notificationSettingsSchema,
  priceAlertSchema,
  updateProfileSchema,
};
