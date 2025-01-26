const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'price_alert',
        'trade_execution',
        'achievement',
        'course_progress',
        'daily_streak',
        'system',
      ],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    expiresAt: {
      type: Date,
      index: true,
      expires: 0, // Document will be automatically deleted when current time > expiresAt
    },
  },
  {
    timestamps: true,
  }
);

// Set expiration date based on notification type
notificationSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const now = new Date();
    switch (this.type) {
      case 'price_alert':
      case 'trade_execution':
        // Keep for 1 week
        this.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'achievement':
      case 'course_progress':
      case 'daily_streak':
        // Keep for 1 month
        this.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case 'system':
        // Keep for 3 months
        this.expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        // Default to 2 weeks
        this.expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

// Mark notification as read
notificationSchema.methods.markAsRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to mark multiple notifications as read
notificationSchema.statics.markManyAsRead = function (userId, notificationIds) {
  return this.updateMany(
    {
      user: userId,
      _id: { $in: notificationIds },
      read: false,
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
      },
    }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    user: userId,
    read: false,
  });
};

// Static method to get notifications with pagination
notificationSchema.statics.getNotifications = function (userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    read,
    sort = '-createdAt',
  } = options;

  const query = { user: userId };

  if (type) {
    query.type = type;
  }

  if (typeof read === 'boolean') {
    query.read = read;
  }

  return this.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
};

module.exports = mongoose.model('Notification', notificationSchema);
