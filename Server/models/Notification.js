const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide recipient'],
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: [
      'new_resource',
      'resource_approved',
      'resource_liked',
      'resource_commented',
      'study_group_joined',
      'study_group_message',
      'request_fulfilled',
      'request_commented',
      'achievement_earned',
      'deadline_reminder',
      'system'
    ],
    required: [true, 'Please provide notification type'],
  },
  title: {
    type: String,
    required: [true, 'Please provide title'],
    maxlength: 200,
  },
  message: {
    type: String,
    required: [true, 'Please provide message'],
    maxlength: 500,
  },
  relatedResource: {
    type: mongoose.Schema.ObjectId,
    refPath: 'relatedModel',
  },
  relatedModel: {
    type: String,
    enum: ['Resource', 'StudyGroup', 'ResourceRequest', 'Achievement', 'Course'],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  expiresAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', NotificationSchema);