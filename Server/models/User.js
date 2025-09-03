const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  bio: {
    type: String,
    maxlength: 500,
    default: '',
  },
  interests: [{
    type: String,
    maxlength: 50,
  }],
  university: {
    type: String,
    required: [true, 'Please provide university'],
    maxlength: 100,
  },
  major: {
    type: String,
    maxlength: 100,
  },
  year: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', 'Graduate', 'PhD'],
  },
  profilePicture: {
    type: String,
    default: '',
  },
  achievements: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Achievement',
  }],
  contributionCount: {
    type: Number,
    default: 0,
  },
  bookmarks: [{
    resourceType: {
      type: String,
      enum: ['Resource', 'StudyGroup'],
    },
    resourceId: {
      type: mongoose.Schema.ObjectId,
      refPath: 'bookmarks.resourceType',
    },
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verified: Date,
  passwordToken: {
    type: String,
  },
  passwordTokenExpirationDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);