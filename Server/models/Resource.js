const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide resource title'],
    maxlength: 200,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  type: {
    type: String,
    enum: ['notes', 'slides', 'quiz', 'practice', 'syllabus', 'assignment', 'other'],
    required: [true, 'Please provide resource type'],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide course'],
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide uploader'],
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide file URL'],
  },
  fileName: {
    type: String,
    required: [true, 'Please provide file name'],
  },
  fileSize: {
    type: Number,
  },
  fileType: {
    type: String,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    maxlength: 30,
  }],
  downloadCount: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isApproved: {
    type: Boolean,
    default: true,
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

ResourceSchema.index({ course: 1, type: 1 });
ResourceSchema.index({ uploadedBy: 1 });
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
ResourceSchema.index({ createdAt: -1 });
ResourceSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Resource', ResourceSchema);