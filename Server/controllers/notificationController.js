const Notification = require('../models/Notification');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const getUserNotifications = async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const { userId } = req.user;

  const queryObject = { recipient: userId };

  if (isRead !== undefined) {
    queryObject.isRead = isRead === 'true';
  }

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(queryObject)
    .populate('sender', 'name profilePicture')
    .populate('relatedResource')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const totalNotifications = await Notification.countDocuments(queryObject);
  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false
  });

  res.status(StatusCodes.OK).json({
    notifications,
    totalNotifications,
    unreadCount,
    numOfPages: Math.ceil(totalNotifications / limit),
    currentPage: Number(page),
  });
};

const markAsRead = async (req, res) => {
  const { id: notificationId } = req.params;
  const { userId } = req.user;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new CustomError.NotFoundError(`No notification with id : ${notificationId}`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Notification marked as read' });
};

const markAllAsRead = async (req, res) => {
  const { userId } = req.user;

  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(StatusCodes.OK).json({ msg: 'All notifications marked as read' });
};

const deleteNotification = async (req, res) => {
  const { id: notificationId } = req.params;
  const { userId } = req.user;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new CustomError.NotFoundError(`No notification with id : ${notificationId}`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Notification deleted successfully' });
};

const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Helper function to create notifications for different events
const createResourceNotification = async (resourceId, uploaderId, courseId) => {
  // This would typically get users enrolled in the course
  // For now, we'll create a basic notification
  const notificationData = {
    recipient: uploaderId, // This should be replaced with course subscribers
    type: 'new_resource',
    title: 'New Resource Available',
    message: 'A new resource has been uploaded to your course',
    relatedResource: resourceId,
    relatedModel: 'Resource',
  };

  return await createNotification(notificationData);
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createResourceNotification,
};