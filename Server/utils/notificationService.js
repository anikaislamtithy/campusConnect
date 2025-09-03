const Notification = require('../models/Notification');

class NotificationService {
  // Create a notification for a specific user
  static async createNotification({
    recipient,
    sender = null,
    type,
    title,
    message,
    relatedResource = null,
    relatedModel = null,
    priority = 'medium',
    expiresAt = null
  }) {
    try {
      const notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        relatedResource,
        relatedModel,
        priority,
        expiresAt
      });

      console.log(`Notification created for user ${recipient}: ${title}`);
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Resource-related notifications
  static async notifyResourceUploaded(resourceId, resourceTitle, uploaderId, uploaderName) {
    return this.createNotification({
      recipient: uploaderId,
      type: 'new_resource',
      title: 'Resource uploaded successfully',
      message: `Your resource "${resourceTitle}" has been uploaded and is pending approval.`,
      relatedResource: resourceId,
      relatedModel: 'Resource',
      priority: 'medium'
    });
  }

  static async notifyResourceApproved(resourceId, resourceTitle, uploaderId, adminId) {
    return this.createNotification({
      recipient: uploaderId,
      sender: adminId,
      type: 'resource_approved',
      title: 'Resource approved',
      message: `Your resource "${resourceTitle}" has been approved and is now available to other students.`,
      relatedResource: resourceId,
      relatedModel: 'Resource',
      priority: 'high'
    });
  }

  static async notifyResourceLiked(resourceId, resourceTitle, resourceOwnerId, likerId, likerName) {
    return this.createNotification({
      recipient: resourceOwnerId,
      sender: likerId,
      type: 'resource_liked',
      title: 'Resource liked',
      message: `${likerName} liked your resource "${resourceTitle}".`,
      relatedResource: resourceId,
      relatedModel: 'Resource',
      priority: 'low'
    });
  }

  static async notifyResourceCommented(resourceId, resourceTitle, resourceOwnerId, commenterId, commenterName) {
    return this.createNotification({
      recipient: resourceOwnerId,
      sender: commenterId,
      type: 'resource_commented',
      title: 'New comment on your resource',
      message: `${commenterName} commented on your resource "${resourceTitle}".`,
      relatedResource: resourceId,
      relatedModel: 'Resource',
      priority: 'medium'
    });
  }

  // Bookmark notifications
  static async notifyBookmarkAdded(resourceId, resourceTitle, userId, userName) {
    return this.createNotification({
      recipient: userId,
      type: 'system',
      title: 'Bookmark added',
      message: `You bookmarked "${resourceTitle}".`,
      relatedResource: resourceId,
      relatedModel: 'Resource',
      priority: 'low'
    });
  }

  // Request-related notifications
  static async notifyRequestCreated(requestId, requestTitle, requesterId, requesterName) {
    return this.createNotification({
      recipient: requesterId,
      type: 'system',
      title: 'Request created',
      message: `Your request "${requestTitle}" has been created and is now visible to other students.`,
      relatedResource: requestId,
      relatedModel: 'ResourceRequest',
      priority: 'medium'
    });
  }

  static async notifyRequestFulfilled(requestId, requestTitle, requesterId, fulfillerId, fulfillerName) {
    return this.createNotification({
      recipient: requesterId,
      sender: fulfillerId,
      type: 'request_fulfilled',
      title: 'Request fulfilled',
      message: `${fulfillerName} has fulfilled your request "${requestTitle}".`,
      relatedResource: requestId,
      relatedModel: 'ResourceRequest',
      priority: 'high'
    });
  }

  static async notifyRequestCommented(requestId, requestTitle, requesterId, commenterId, commenterName) {
    return this.createNotification({
      recipient: requesterId,
      sender: commenterId,
      type: 'request_commented',
      title: 'New comment on your request',
      message: `${commenterName} commented on your request "${requestTitle}".`,
      relatedResource: requestId,
      relatedModel: 'ResourceRequest',
      priority: 'medium'
    });
  }

  // Course enrollment notifications
  static async notifyCourseEnrollment(courseId, courseName, userId, userName) {
    return this.createNotification({
      recipient: userId,
      type: 'system',
      title: 'Course enrollment',
      message: `You have successfully enrolled in "${courseName}".`,
      relatedResource: courseId,
      relatedModel: 'Course',
      priority: 'medium'
    });
  }

  // Study group notifications
  static async notifyStudyGroupJoined(groupId, groupTitle, userId, userName, joinerId, joinerName) {
    return this.createNotification({
      recipient: userId,
      sender: joinerId,
      type: 'study_group_joined',
      title: 'New member joined your study group',
      message: `${joinerName} joined your study group "${groupTitle}".`,
      relatedResource: groupId,
      relatedModel: 'StudyGroup',
      priority: 'low'
    });
  }

  static async notifyStudyGroupMessage(groupId, groupTitle, recipientId, senderId, senderName) {
    return this.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'study_group_message',
      title: 'New message in study group',
      message: `${senderName} sent a message in "${groupTitle}".`,
      relatedResource: groupId,
      relatedModel: 'StudyGroup',
      priority: 'medium'
    });
  }

  // Achievement notifications
  static async notifyAchievementEarned(achievementId, achievementTitle, userId, userName) {
    return this.createNotification({
      recipient: userId,
      type: 'achievement_earned',
      title: 'Achievement earned!',
      message: `Congratulations! You earned the "${achievementTitle}" achievement.`,
      relatedResource: achievementId,
      relatedModel: 'Achievement',
      priority: 'high'
    });
  }

  // System notifications
  static async notifySystemUpdate(userId, message, adminId = null) {
    return this.createNotification({
      recipient: userId,
      sender: adminId,
      type: 'system',
      title: 'System Update',
      message: message,
      priority: 'medium'
    });
  }

  static async notifyDeadlineReminder(userId, title, message, relatedResource = null, relatedModel = null) {
    return this.createNotification({
      recipient: userId,
      type: 'deadline_reminder',
      title: title,
      message: message,
      relatedResource,
      relatedModel,
      priority: 'high'
    });
  }

  // Broadcast notifications to all users
  static async broadcastToAllUsers(title, message, adminId = null, type = 'system') {
    const User = require('../models/User');
    const users = await User.find({}, '_id');

    const notifications = users.map(user =>
      this.createNotification({
        recipient: user._id,
        sender: adminId,
        type,
        title,
        message,
        priority: 'medium'
      })
    );

    return Promise.all(notifications);
  }

  // Get user notifications with pagination
  static async getUserNotifications(userId, { page = 1, limit = 20, isRead = null } = {}) {
    const queryObject = { recipient: userId };

    if (isRead !== null) {
      queryObject.isRead = isRead;
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

    return {
      notifications,
      totalNotifications,
      unreadCount,
      numOfPages: Math.ceil(totalNotifications / limit),
      currentPage: Number(page)
    };
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return notification;
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return notification;
  }
}

module.exports = NotificationService;