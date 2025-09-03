const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide achievement name'],
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    maxlength: 500,
  },
  icon: {
    type: String,
    default: '🏆',
  },
  type: {
    type: String,
    enum: ['upload', 'download', 'like', 'comment', 'study_group', 'request', 'special'],
    required: [true, 'Please provide achievement type'],
  },
  criteria: {
    count: {
      type: Number,
      default: 1,
    },
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'all-time'],
      default: 'all-time',
    },
  },
  points: {
    type: Number,
    default: 10,
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const UserAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  achievement: {
    type: mongoose.Schema.ObjectId,
    ref: 'Achievement',
    required: true,
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
  progress: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

UserAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

module.exports = {
  Achievement: mongoose.model('Achievement', AchievementSchema),
  UserAchievement: mongoose.model('UserAchievement', UserAchievementSchema),
};