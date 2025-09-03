const mongoose = require('mongoose');

const StudyGroupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide study group title'],
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    maxlength: 1000,
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide course'],
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide creator'],
  },
  maxMembers: {
    type: Number,
    min: 2,
    max: 20,
    default: 5,
  },
  currentMembers: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  meetingType: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'hybrid',
  },
  location: {
    type: String,
    maxlength: 200,
  },
  meetingTime: {
    type: String,
    maxlength: 100,
  },
  tags: [{
    type: String,
    maxlength: 30,
  }],
  status: {
    type: String,
    enum: ['open', 'full', 'closed'],
    default: 'open',
  },
  contactInfo: {
    type: String,
    maxlength: 200,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

StudyGroupSchema.index({ course: 1, status: 1 });
StudyGroupSchema.index({ createdBy: 1 });
StudyGroupSchema.index({ title: 'text', description: 'text', tags: 'text' });
StudyGroupSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StudyGroup', StudyGroupSchema);