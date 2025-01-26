const Notification = require('../models/notificationModel');
const asyncHandler = require('express-async-handler');
const logger = require('../config/logger');

// Get notifications with pagination
exports.getNotifications = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const read = req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined;

    const notifications = await Notification.getNotifications(req.user._id, {
      page,
      limit,
      type,
      read,
    });

    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total: await Notification.countDocuments({ user: req.user._id }),
        },
      },
    });
  } catch (error) {
    logger.error('Error in getNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
    });
  }
});

// Mark notification as read
exports.markAsRead = asyncHandler(async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      data: {
        notificationId: notification._id,
      },
    });
  } catch (error) {
    logger.error('Error in markAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
    });
  }
});

// Mark all notifications as read
exports.markAllAsRead = asyncHandler(async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error('Error in markAllAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
    });
  }
});

// Delete notification
exports.deleteNotification = asyncHandler(async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await notification.remove();

    res.status(200).json({
      success: true,
      data: {
        notificationId: req.params.id,
      },
    });
  } catch (error) {
    logger.error('Error in deleteNotification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
    });
  }
});

// Clear all notifications
exports.clearAllNotifications = asyncHandler(async (req, res) => {
  try {
    await Notification.deleteMany({
      user: req.user._id,
      read: true,
    });

    res.status(200).json({
      success: true,
      message: 'All read notifications cleared',
    });
  } catch (error) {
    logger.error('Error in clearAllNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing notifications',
    });
  }
});

// Get notification settings
exports.getNotificationSettings = asyncHandler(async (req, res) => {
  try {
    const user = await req.user.populate('notificationSettings');

    res.status(200).json({
      success: true,
      data: user.notificationSettings,
    });
  } catch (error) {
    logger.error('Error in getNotificationSettings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification settings',
    });
  }
});

// Update notification settings
exports.updateNotificationSettings = asyncHandler(async (req, res) => {
  try {
    const { email, push, priceAlerts, tradeExecutions, achievements, courseProgress } = req.body;

    const user = await req.user.populate('notificationSettings');
    
    user.notificationSettings = {
      ...user.notificationSettings,
      email: email !== undefined ? email : user.notificationSettings.email,
      push: push !== undefined ? push : user.notificationSettings.push,
      priceAlerts: priceAlerts !== undefined ? priceAlerts : user.notificationSettings.priceAlerts,
      tradeExecutions: tradeExecutions !== undefined ? tradeExecutions : user.notificationSettings.tradeExecutions,
      achievements: achievements !== undefined ? achievements : user.notificationSettings.achievements,
      courseProgress: courseProgress !== undefined ? courseProgress : user.notificationSettings.courseProgress,
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user.notificationSettings,
    });
  } catch (error) {
    logger.error('Error in updateNotificationSettings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings',
    });
  }
});
