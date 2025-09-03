const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');
const { BadRequestError } = require('../errors');

// Cloudinary storage for profile pictures
const profilePicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campusconnect/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 300, height: 300, crop: 'fill' }],
  },
});

// Cloudinary storage for resources
const resourceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campusconnect/resources',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto',
  },
});

// File filter for profile pictures
const profilePicFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Please upload an image file'), false);
  }
};

// File filter for resources
const resourceFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('File type not supported'), false);
  }
};

// Multer configurations
const uploadProfilePic = multer({
  storage: profilePicStorage,
  fileFilter: profilePicFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const uploadResource = multer({
  storage: resourceStorage,
  fileFilter: resourceFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Helper function to create upload middleware
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const upload = fieldName === 'profilePicture' ? uploadProfilePic : uploadResource;

    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const maxSize = fieldName === 'profilePicture' ? '5MB' : '50MB';
          throw new BadRequestError(`File size too large. Maximum size is ${maxSize}`);
        }
        if (err.code === 'UNEXPECTED_FIELD') {
          throw new BadRequestError(`Unexpected field. Expected field name: '${fieldName}'`);
        }
        throw new BadRequestError(err.message || 'Error uploading file');
      }
      next();
    });
  };
}

module.exports = {
  uploadSingle,
  uploadProfilePic,
  uploadResource,
};