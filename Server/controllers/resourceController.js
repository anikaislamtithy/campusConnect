const Resource = require('../models/Resource');
const Course = require('../models/Course');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const NotificationService = require('../utils/notificationService');

const getAllResources = async (req, res) => {
  const {
    course,
    type,
    search,
    tags,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const queryObject = { isApproved: true };

  if (course) {
    queryObject.course = course;
  }

  if (type && type !== 'all') {
    queryObject.type = type;
  }

  if (tags) {
    const tagArray = tags.split(',');
    queryObject.tags = { $in: tagArray };
  }

  let result = Resource.find(queryObject)
    .populate('course', 'name code')
    .populate('uploadedBy', 'name email')
    .populate('likes', 'name');

  if (search) {
    result = result.find({ $text: { $search: search } });
  }

  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Pinned resources first, then by sort criteria
  result = result.sort({ isPinned: -1, ...sortOptions });

  // Pagination
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(Number(limit));

  const resources = await result;
  const totalResources = await Resource.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    resources,
    totalResources,
    numOfPages: Math.ceil(totalResources / limit),
    currentPage: Number(page),
  });
};

const getSingleResource = async (req, res) => {
  const { id: resourceId } = req.params;

  const resource = await Resource.findById(resourceId)
    .populate('course', 'name code')
    .populate('uploadedBy', 'name email profilePicture')
    .populate('likes', 'name')
    .populate('comments.user', 'name profilePicture');

  if (!resource) {
    throw new CustomError.NotFoundError(`No resource with id : ${resourceId}`);
  }

  res.status(StatusCodes.OK).json({ resource });
};

const createResource = async (req, res) => {
  const { title, description, type, course, tags } = req.body;

  if (!req.file) {
    throw new CustomError.BadRequestError('Please provide a file');
  }

  // Verify course exists
  const courseExists = await Course.findById(course);
  if (!courseExists) {
    throw new CustomError.NotFoundError(`No course with id : ${course}`);
  }

  const resource = await Resource.create({
    title,
    description,
    type,
    course,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    uploadedBy: req.user.userId,
    fileUrl: req.file.path,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    fileType: req.file.mimetype,
  });

  // Update user contribution count
  await User.findByIdAndUpdate(req.user.userId, {
    $inc: { contributionCount: 1 }
  });

  await resource.populate([
    { path: 'course', select: 'name code' },
    { path: 'uploadedBy', select: 'name email' }
  ]);

  // Create notification for resource upload
  try {
    const user = await User.findById(req.user.userId, 'name');
    await NotificationService.notifyResourceUploaded(
      resource._id,
      resource.title,
      req.user.userId,
      user.name
    );
  } catch (error) {
    console.error('Failed to create resource upload notification:', error);
  }

  res.status(StatusCodes.CREATED).json({ resource });
};

const updateResource = async (req, res) => {
  const { id: resourceId } = req.params;
  const { title, description, tags } = req.body;

  const resource = await Resource.findById(resourceId);

  if (!resource) {
    throw new CustomError.NotFoundError(`No resource with id : ${resourceId}`);
  }

  // Check permissions
  if (resource.uploadedBy.toString() !== req.user.userId && req.user.role !== 'admin') {
    throw new CustomError.UnauthorizedError('Not authorized to update this resource');
  }

  resource.title = title || resource.title;
  resource.description = description || resource.description;
  resource.tags = tags ? tags.split(',').map(tag => tag.trim()) : resource.tags;

  await resource.save();

  res.status(StatusCodes.OK).json({ resource });
};

const deleteResource = async (req, res) => {
  const { id: resourceId } = req.params;

  const resource = await Resource.findById(resourceId);

  if (!resource) {
    throw new CustomError.NotFoundError(`No resource with id : ${resourceId}`);
  }

  // Check permissions
  if (resource.uploadedBy.toString() !== req.user.userId && req.user.role !== 'admin') {
    throw new CustomError.UnauthorizedError('Not authorized to delete this resource');
  }

  await Resource.findByIdAndDelete(resourceId);

  // Update user contribution count
  await User.findByIdAndUpdate(resource.uploadedBy, {
    $inc: { contributionCount: -1 }
  });

  res.status(StatusCodes.OK).json({ msg: 'Resource deleted successfully' });
};

const likeResource = async (req, res) => {
  const { id: resourceId } = req.params;
  const { userId } = req.user;

  const resource = await Resource.findById(resourceId);

  if (!resource) {
    throw new CustomError.NotFoundError(`No resource with id : ${resourceId}`);
  }

  const isLiked = resource.likes.includes(userId);

  if (isLiked) {
    resource.likes = resource.likes.filter(id => id.toString() !== userId);
  } else {
    resource.likes.push(userId);
    
    // Create notification for resource like (only when liking, not unliking)
    if (resource.uploadedBy.toString() !== userId) {
      try {
        const liker = await User.findById(userId, 'name');
        await NotificationService.notifyResourceLiked(
          resource._id,
          resource.title,
          resource.uploadedBy,
          userId,
          liker.name
        );
      } catch (error) {
        console.error('Failed to create resource like notification:', error);
      }
    }
  }

  await resource.save();

  res.status(StatusCodes.OK).json({
    msg: isLiked ? 'Like removed' : 'Resource liked',
    likesCount: resource.likes.length,
    isLiked: !isLiked,
  });
};

const addComment = async (req, res) => {
  const { id: resourceId } = req.params;
  const { text } = req.body;
  const { userId } = req.user;

  if (!text) {
    throw new CustomError.BadRequestError('Please provide comment text');
  }

  const resource = await Resource.findById(resourceId);

  if (!resource) {
    throw new CustomError.NotFoundError(`No resource with id : ${resourceId}`);
  }

  resource.comments.push({
    user: userId,
    text,
  });

  await resource.save();

  await resource.populate('comments.user', 'name profilePicture');

  const newComment = resource.comments[resource.comments.length - 1];

  // Create notification for resource comment (only if commenter is not the resource owner)
  if (resource.uploadedBy.toString() !== userId) {
    try {
      const commenter = await User.findById(userId, 'name');
      await NotificationService.notifyResourceCommented(
        resource._id,
        resource.title,
        resource.uploadedBy,
        userId,
        commenter.name
      );
    } catch (error) {
      console.error('Failed to create resource comment notification:', error);
    }
  }

  res.status(StatusCodes.CREATED).json({ comment: newComment });
};

const downloadResource = async (req, res) => {
  const { id: resourceId } = req.params;

  const resource = await Resource.findById(resourceId);

  if (!resource) {
    throw new CustomError.NotFoundError(`No resource with id : ${resourceId}`);
  }

  // Increment download count
  resource.downloadCount += 1;
  await resource.save();
  console.log(resource.fileUrl)

  res.status(StatusCodes.OK).json({
    downloadUrl: resource.fileUrl,
    fileName: resource.fileName,
    fileSize: resource.fileSize,
    fileType: resource.fileType,
  });
};

const pinResource = async (req, res) => {
  const { id: resourceId } = req.params;

  if (req.user.role !== 'admin') {
    throw new CustomError.UnauthorizedError('Only admins can pin resources');
  }

  const resource = await Resource.findById(resourceId);

  if (!resource) {
    throw new CustomError.NotFoundError(`No resource with id : ${resourceId}`);
  }

  resource.isPinned = !resource.isPinned;
  await resource.save();

  res.status(StatusCodes.OK).json({
    msg: resource.isPinned ? 'Resource pinned' : 'Resource unpinned',
    isPinned: resource.isPinned,
  });
};

const getRecentResources = async (req, res) => {
  const { limit = 10 } = req.query;

  const resources = await Resource.find({ isApproved: true })
    .populate('course', 'name code')
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.status(StatusCodes.OK).json({ resources });
};

const getPinnedResources = async (req, res) => {
  const { course } = req.query;

  const queryObject = { isPinned: true, isApproved: true };

  if (course) {
    queryObject.course = course;
  }

  const resources = await Resource.find(queryObject)
    .populate('course', 'name code')
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({ resources });
};

module.exports = {
  getAllResources,
  getSingleResource,
  createResource,
  updateResource,
  deleteResource,
  likeResource,
  addComment,
  downloadResource,
  pinResource,
  getRecentResources,
  getPinnedResources,
};