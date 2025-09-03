const mongoose = require('mongoose');

const ResourceRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide request title'],
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
  requestedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide requester'],
  },
  resourceType: {
    type: String,
    enum: ['notes', 'slides', 'quiz', 'practice', 'syllabus', 'assignment', 'other'],
    required: [true, 'Please provide resource type'],
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  deadline: {
    type: Date,
  },
  tags: [{
    type: String,
    maxlength: 30,
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'fulfilled', 'closed'],
    default: 'open',
  },
  fulfilledBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  fulfilledResource: {
    type: mongoose.Schema.ObjectId,
    ref: 'Resource',
  },
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
  upvotes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

ResourceRequestSchema.index({ course: 1, status: 1 });
ResourceRequestSchema.index({ requestedBy: 1 });
ResourceRequestSchema.index({ title: 'text', description: 'text', tags: 'text' });
ResourceRequestSchema.index({ createdAt: -1 });
ResourceRequestSchema.index({ priority: 1, deadline: 1 });

module.exports = mongoose.model('ResourceRequest', ResourceRequestSchema);