const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide course name'],
    maxlength: 100,
  },
  code: {
    type: String,
    required: [true, 'Please provide course code'],
    unique: true,
    maxlength: 20,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  university: {
    type: String,
    required: [true, 'Please provide university'],
    maxlength: 100,
  },
  department: {
    type: String,
    required: [true, 'Please provide department'],
    maxlength: 100,
  },
  semester: {
    type: String,
    maxlength: 20,
  },
  year: {
    type: Number,
    min: 2020,
    max: 2030,
  },
  instructor: {
    type: String,
    maxlength: 100,
  },
  credits: {
    type: Number,
    min: 1,
    max: 6,
  },
  enrolledStudents: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

CourseSchema.index({ code: 1, university: 1 });
CourseSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Course', CourseSchema);