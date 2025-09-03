const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

const { authenticateUser } = require('../middleware/authentication');

router.route('/').get(authenticateUser, getUserNotifications);
router.route('/mark-all-read').patch(authenticateUser, markAllAsRead);
router.route('/:id/read').patch(authenticateUser, markAsRead);
router.route('/:id').delete(authenticateUser, deleteNotification);

module.exports = router;