const { body, param, query, validationResult } = require('express-validator');
const { BadRequestError } = require('../errors');

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new BadRequestError(errorMessages.join(', '));
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bio must not exceed 200 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must not exceed 100 characters'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('interests.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each interest must not exceed 50 characters'),
  body('themePreference')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme preference must be either light or dark'),
  handleValidationErrors
];

// Resource validation rules
const validateResourceUpload = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('course')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Course must be between 1 and 100 characters'),
  body('type')
    .isIn(['Notes', 'Slides', 'Quiz', 'Practice'])
    .withMessage('Type must be one of: Notes, Slides, Quiz, Practice'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Tags must be an array or valid JSON array string'),
  handleValidationErrors
];

// Middleware to parse tags if they come as JSON string
const parseTagsMiddleware = (req, res, next) => {
  if (req.body.tags && typeof req.body.tags === 'string') {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (error) {
      req.body.tags = [];
    }
  }
  next();
};

const validateResourceQuery = [
  query('course')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Course filter must be between 1 and 500 characters'),
  query('type')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const types = value.split(',').map(t => t.trim());
      const validTypes = ['Notes', 'Slides', 'Quiz', 'Practice'];
      return types.every(type => validTypes.includes(type));
    })
    .withMessage('Type filter must contain only: Notes, Slides, Quiz, Practice'),
  query('tags')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Tags filter must be between 1 and 200 characters'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'title', 'downloadCount', 'fileSize'])
    .withMessage('Sort field must be one of: createdAt, title, downloadCount, fileSize'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  handleValidationErrors
];

// Study Group validation rules
const validateStudyGroup = [
  body('course')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Course must be between 1 and 100 characters'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Title must be between 1 and 150 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  body('contactInfo')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Contact info must not exceed 200 characters'),
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 20 })
    .withMessage('Max members must be between 2 and 20'),
  handleValidationErrors
];

// Resource Request validation rules
const validateResourceRequest = [
  body('course')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Course must be between 1 and 100 characters'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Title must be between 1 and 150 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Urgency must be one of: low, medium, high'),
  handleValidationErrors
];

const validateComment = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Comment must be between 1 and 300 characters'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateResourceUpload,
  validateResourceQuery,
  validateStudyGroup,
  validateResourceRequest,
  validateComment,
  validateObjectId,
  parseTagsMiddleware
};