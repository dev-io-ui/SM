const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { notificationSettingsSchema } = require('../utils/validation');

// Apply authentication middleware to all routes
router.use(protect);

// Notification routes
router.route('/')
  .get(getNotifications);

router.route('/:id/read')
  .put(markAsRead);

router.route('/read-all')
  .put(markAllAsRead);

router.route('/:id')
  .delete(deleteNotification);

router.route('/clear-all')
  .delete(clearAllNotifications);

// Notification settings routes
router.route('/settings')
  .get(getNotificationSettings)
  .put(validateRequest(notificationSettingsSchema), updateNotificationSettings);

module.exports = router;
