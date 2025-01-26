const admin = require('firebase-admin');
const emailService = require('./emailService');
const logger = require('../config/logger');

class NotificationService {
  constructor() {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async sendNotification(user, notification) {
    try {
      const promises = [];

      // Send push notification if user has FCM token
      if (user.fcmToken && notification.push) {
        promises.push(this.sendPushNotification(user.fcmToken, notification));
      }

      // Send email notification if enabled
      if (user.notifications?.email && notification.email) {
        promises.push(emailService.sendNotificationEmail(user.email, notification));
      }

      // Send in-app notification
      promises.push(this.saveInAppNotification(user._id, notification));

      await Promise.all(promises);
      logger.info(`Notifications sent successfully to user ${user._id}`);
    } catch (error) {
      logger.error('Error sending notifications:', error);
      throw error;
    }
  }

  async sendPushNotification(fcmToken, notification) {
    try {
      const message = {
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'trading_alerts',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      logger.info(`Push notification sent: ${response}`);
      return response;
    } catch (error) {
      logger.error('Error sending push notification:', error);
      throw error;
    }
  }

  async saveInAppNotification(userId, notification) {
    try {
      const InAppNotification = require('../models/notificationModel');
      
      const newNotification = new InAppNotification({
        user: userId,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        data: notification.data,
        priority: notification.priority || 'normal',
      });

      await newNotification.save();
      logger.info(`In-app notification saved for user ${userId}`);
    } catch (error) {
      logger.error('Error saving in-app notification:', error);
      throw error;
    }
  }

  async sendPriceAlert(user, symbol, price, condition, targetPrice) {
    const notification = {
      title: 'Price Alert',
      body: `${symbol} is now ${condition} ${targetPrice}! Current price: $${price}`,
      type: 'price_alert',
      data: {
        symbol,
        price,
        condition,
        targetPrice,
      },
      push: true,
      email: true,
      priority: 'high',
    };

    await this.sendNotification(user, notification);
  }

  async sendTradeExecution(user, order) {
    const notification = {
      title: 'Trade Executed',
      body: `Your ${order.type} order for ${order.quantity} ${order.symbol} at $${order.price} has been executed`,
      type: 'trade_execution',
      data: {
        orderId: order._id,
        symbol: order.symbol,
        type: order.type,
        quantity: order.quantity,
        price: order.price,
      },
      push: true,
      email: true,
    };

    await this.sendNotification(user, notification);
  }

  async sendAchievementUnlocked(user, achievement) {
    const notification = {
      title: 'Achievement Unlocked! 🏆',
      body: `Congratulations! You've earned the "${achievement.name}" badge`,
      type: 'achievement',
      data: {
        achievementId: achievement._id,
        name: achievement.name,
        description: achievement.description,
        points: achievement.rewards.points,
      },
      push: true,
      email: true,
    };

    await this.sendNotification(user, notification);
  }

  async sendCourseProgress(user, course, progress) {
    const notification = {
      title: 'Course Progress Update',
      body: `You've completed ${progress}% of "${course.title}"`,
      type: 'course_progress',
      data: {
        courseId: course._id,
        title: course.title,
        progress,
      },
      push: true,
      email: false,
    };

    await this.sendNotification(user, notification);
  }

  async sendDailyStreak(user, streakCount) {
    const notification = {
      title: 'Daily Streak! 🔥',
      body: `You're on fire! ${streakCount} days learning streak`,
      type: 'daily_streak',
      data: {
        streakCount,
      },
      push: true,
      email: false,
    };

    await this.sendNotification(user, notification);
  }
}

module.exports = new NotificationService();
