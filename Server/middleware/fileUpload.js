const { BadRequestError } = require('../errors');

// Middleware to handle multer errors
const handleFileUploadError = (error, req, res, next) => {
  if (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      throw new BadRequestError('File size too large. Maximum size allowed is 5MB for profile pictures and 50MB for resources.');
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      throw new BadRequestError('Unexpected file field. Please check the field name.');
    }

    if (error.message.includes('Only image files')) {
      throw new BadRequestError(error.message);
    }

    if (error.message.includes('File type not supported')) {
      throw new BadRequestError(error.message);
    }

    throw new BadRequestError('File upload error: ' + error.message);
  }

  next();
};

module.exports = {
  handleFileUploadError
};