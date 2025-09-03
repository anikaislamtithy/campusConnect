const ResourceRequest = require('../models/ResourceRequest');
const Course = require('../models/Course');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const NotificationService = require('../utils/notificationService');

const getAllResourceRequests = async (req, res) => {
  const {
    course,
    status = 'open',
    resourceType,
    priority,
    search,
    page = 1,
    limit = 20,
  } = req.query;

  const queryObject = {};

  if (course) {
    queryObject.course = course;
  }

  if (status && status !== 'all') {
    queryObject.status = status;
  }

  if (resourceType && resourceType !== 'all') {
    queryObject.resourceType = resourceType;
  }

  if (priority && priority !== 'all') {
    queryObject.priority = priority;
  }

  let result = ResourceRequest.find(queryObject)
    .populate('course', 'name code')
    .populate('requestedBy', 'name email')
    .populate('fulfilledBy', 'name email')
    .populate('fulfilledResource', 'title fileUrl')
    .populate('comments.user', 'name email');

  if (search) {
    result = result.find({ $text: { $search: search } });
  }

  // Sort by priority and creation date
  result = result.sort({ priority: 1, createdAt: -1 });

  // Pagination
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(Number(limit));

  const requests = await result;
  const totalRequests = await ResourceRequest.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    requests,
    totalRequests,
    numOfPages: Math.ceil(totalRequests / limit),
    currentPage: Number(page),
  });
};

const getSingleResourceRequest = async (req, res) => {
  const { id: requestId } = req.params;

  const request = await ResourceRequest.findById(requestId)
    .populate('course', 'name code')
    .populate('requestedBy', 'name email profilePicture')
    .populate('fulfilledBy', 'name email')
    .populate('fulfilledResource', 'title fileUrl fileName')
    .populate('comments.user', 'name email profilePicture')
    .populate('upvotes', 'name');

  if (!request) {
    throw new CustomError.NotFoundError(`No resource request with id : ${requestId}`);
  }

  res.status(StatusCodes.OK).json({ request });
};

const createResourceRequest = async (req, res) => {
  const {
    title,
    description,
    course,
    resourceType,
    priority,
    deadline,
    tags,
  } = req.body;

  // Verify course exists
  const courseExists = await Course.findById(course);
  if (!courseExists) {
    throw new CustomError.NotFoundError(`No course with id : ${course}`);
  }

  const request = await ResourceRequest.create({
    title,
    description,
    course,
    requestedBy: req.user.userId,
    resourceType,
    priority: priority || 'medium',
    deadline: deadline ? new Date(deadline) : undefined,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
  });

  await request.populate([
    { path: 'course', select: 'name code' },
    { path: 'requestedBy', select: 'name email' }
  ]);

  // Create notification for request created
  try {
    await NotificationService.notifyRequestCreated(
      request._id,
      request.title,
      req.user.userId,
      request.requestedBy.name
    );
  } catch (error) {
    console.error('Failed to create request notification:', error);
  }

  res.status(StatusCodes.CREATED).json({ request });
};

const updateResourceRequest = async (req, res) => {
  const { id: requestId } = req.params;
  const {
    title,
    description,
    priority,
    deadline,
    tags,
    status,
  } = req.body;

  const request = await ResourceRequest.findById(requestId);

  if (!request) {
    throw new CustomError.NotFoundError(`No resource request with id : ${requestId}`);
  }

  // Check permissions - only requester can update (except status which can be updated by fulfiller)
  if (request.requestedBy.toString() !== req.user.userId && req.user.role !== 'admin') {
    throw new CustomError.UnauthorizedError('Not authorized to update this request');
  }

  request.title = title || request.title;
  request.description = description || request.description;
  request.priority = priority || request.priority;
  request.deadline = deadline ? new Date(deadline) : request.deadline;
  request.tags = tags ? tags.split(',').map(tag => tag.trim()) : request.tags;

  if (status && ['open', 'in-progress', 'fulfilled', 'closed'].includes(status)) {
    request.status = status;
  }

  await request.save();

  res.status(StatusCodes.OK).json({ request });
};

const deleteResourceRequest = async (req, res) => {
  const { id: requestId } = req.params;

  const request = await ResourceRequest.findById(requestId);

  if (!request) {
    throw new CustomError.NotFoundError(`No resource request with id : ${requestId}`);
  }

  // Check permissions - only requester or admin can delete
  if (request.requestedBy.toString() !== req.user.userId && req.user.role !== 'admin') {
    throw new CustomError.UnauthorizedError('Not authorized to delete this request');
  }

  await ResourceRequest.findByIdAndDelete(requestId);

  res.status(StatusCodes.OK).json({ msg: 'Resource request deleted successfully' });
};

const addComment = async (req, res) => {
  const { id: requestId } = req.params;
  const { text } = req.body;
  const { userId } = req.user;

  if (!text) {
    throw new CustomError.BadRequestError('Please provide comment text');
  }

  const request = await ResourceRequest.findById(requestId);

  if (!request) {
    throw new CustomError.NotFoundError(`No resource request with id : ${requestId}`);
  }

  request.comments.push({
    user: userId,
    text,
  });

  await request.save();

  await request.populate('comments.user', 'name email profilePicture');

  const newComment = request.comments[request.comments.length - 1];

  // Create notification for request comment (only if commenter is not the requester)
  try {
    if (request.requestedBy.toString() !== userId) {
      await request.populate('requestedBy', 'name');
      await NotificationService.notifyRequestCommented(
        request._id,
        request.title,
        userId,
        newComment.user.name,
        request.requestedBy._id
      );
    }
  } catch (error) {
    console.error('Failed to create request comment notification:', error);
  }

  res.status(StatusCodes.CREATED).json({ comment: newComment });
};

const upvoteRequest = async (req, res) => {
  const { id: requestId } = req.params;
  const { userId } = req.user;

  const request = await ResourceRequest.findById(requestId);

  if (!request) {
    throw new CustomError.NotFoundError(`No resource request with id : ${requestId}`);
  }

  const hasUpvoted = request.upvotes.includes(userId);

  if (hasUpvoted) {
    request.upvotes = request.upvotes.filter(id => id.toString() !== userId);
  } else {
    request.upvotes.push(userId);
  }

  await request.save();

  res.status(StatusCodes.OK).json({
    msg: hasUpvoted ? 'Upvote removed' : 'Request upvoted',
    upvotesCount: request.upvotes.length,
    hasUpvoted: !hasUpvoted,
  });
};

const fulfillRequest = async (req, res) => {
  const { id: requestId } = req.params;
  const { resourceId } = req.body;

  if (!resourceId) {
    throw new CustomError.BadRequestError('Please provide resource ID');
  }

  const request = await ResourceRequest.findById(requestId);

  if (!request) {
    throw new CustomError.NotFoundError(`No resource request with id : ${requestId}`);
  }

  if (request.status === 'fulfilled') {
    throw new CustomError.BadRequestError('Request already fulfilled');
  }

  request.status = 'fulfilled';
  request.fulfilledBy = req.user.userId;
  request.fulfilledResource = resourceId;

  await request.save();

  // Create notification for request fulfilled
  try {
    await request.populate([
      { path: 'requestedBy', select: 'name' },
      { path: 'fulfilledBy', select: 'name' }
    ]);
    await NotificationService.notifyRequestFulfilled(
      request._id,
      request.title,
      req.user.userId,
      request.fulfilledBy.name,
      request.requestedBy._id
    );
  } catch (error) {
    console.error('Failed to create request fulfillment notification:', error);
  }

  res.status(StatusCodes.OK).json({
    msg: 'Request fulfilled successfully',
    request
  });
};

const getUserRequests = async (req, res) => {
  const { userId } = req.user;

  const requests = await ResourceRequest.find({ requestedBy: userId })
    .populate('course', 'name code')
    .populate('fulfilledBy', 'name email')
    .populate('fulfilledResource', 'title fileUrl')
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({ requests });
};

const searchRequests = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    throw new CustomError.BadRequestError('Please provide search query');
  }

  const requests = await ResourceRequest.find({
    $text: { $search: q },
    status: { $in: ['open', 'in-progress'] },
  })
    .populate('course', 'name code')
    .populate('requestedBy', 'name')
    .limit(10);

  res.status(StatusCodes.OK).json({ requests });
};

module.exports = {
  getAllResourceRequests,
  getSingleResourceRequest,
  createResourceRequest,
  updateResourceRequest,
  deleteResourceRequest,
  addComment,
  upvoteRequest,
  fulfillRequest,
  getUserRequests,
  searchRequests,
};