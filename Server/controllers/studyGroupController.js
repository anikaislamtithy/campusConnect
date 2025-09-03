const StudyGroup = require('../models/StudyGroup');
const Course = require('../models/Course');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const NotificationService = require('../utils/notificationService');

const getAllStudyGroups = async (req, res) => {
  const {
    course,
    status = 'open',
    meetingType,
    search,
    page = 1,
    limit = 20,
  } = req.query;

  const queryObject = { isActive: true };

  if (course) {
    queryObject.course = course;
  }

  if (status && status !== 'all') {
    queryObject.status = status;
  }

  if (meetingType && meetingType !== 'all') {
    queryObject.meetingType = meetingType;
  }

  let result = StudyGroup.find(queryObject)
    .populate('course', 'name code')
    .populate('createdBy', 'name email')
    .populate('currentMembers.user', 'name email');

  if (search) {
    result = result.find({ $text: { $search: search } });
  }

  // Sort by creation date (newest first)
  result = result.sort({ createdAt: -1 });

  // Pagination
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(Number(limit));

  const studyGroups = await result;
  const totalGroups = await StudyGroup.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    studyGroups,
    totalGroups,
    numOfPages: Math.ceil(totalGroups / limit),
    currentPage: Number(page),
  });
};

const getSingleStudyGroup = async (req, res) => {
  const { id: groupId } = req.params;

  const studyGroup = await StudyGroup.findById(groupId)
    .populate('course', 'name code')
    .populate('createdBy', 'name email profilePicture')
    .populate('currentMembers.user', 'name email profilePicture');

  if (!studyGroup) {
    throw new CustomError.NotFoundError(`No study group with id : ${groupId}`);
  }

  res.status(StatusCodes.OK).json({ studyGroup });
};

const createStudyGroup = async (req, res) => {
  const {
    title,
    description,
    course,
    maxMembers,
    meetingType,
    location,
    meetingTime,
    tags,
    contactInfo,
  } = req.body;

  // Verify course exists
  const courseExists = await Course.findById(course);
  if (!courseExists) {
    throw new CustomError.NotFoundError(`No course with id : ${course}`);
  }

  const studyGroup = await StudyGroup.create({
    title,
    description,
    course,
    createdBy: req.user.userId,
    maxMembers: maxMembers || 5,
    meetingType: meetingType || 'hybrid',
    location,
    meetingTime,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    contactInfo,
    currentMembers: [{
      user: req.user.userId,
      joinedAt: new Date(),
    }],
  });

  await studyGroup.populate([
    { path: 'course', select: 'name code' },
    { path: 'createdBy', select: 'name email' },
    { path: 'currentMembers.user', select: 'name email' }
  ]);

  res.status(StatusCodes.CREATED).json({ studyGroup });
};

const updateStudyGroup = async (req, res) => {
  const { id: groupId } = req.params;
  const {
    title,
    description,
    maxMembers,
    meetingType,
    location,
    meetingTime,
    tags,
    contactInfo,
  } = req.body;

  const studyGroup = await StudyGroup.findById(groupId);

  if (!studyGroup) {
    throw new CustomError.NotFoundError(`No study group with id : ${groupId}`);
  }

  // Check permissions - only creator can update
  if (studyGroup.createdBy.toString() !== req.user.userId) {
    throw new CustomError.UnauthorizedError('Not authorized to update this study group');
  }

  studyGroup.title = title || studyGroup.title;
  studyGroup.description = description || studyGroup.description;
  studyGroup.maxMembers = maxMembers || studyGroup.maxMembers;
  studyGroup.meetingType = meetingType || studyGroup.meetingType;
  studyGroup.location = location || studyGroup.location;
  studyGroup.meetingTime = meetingTime || studyGroup.meetingTime;
  studyGroup.tags = tags ? tags.split(',').map(tag => tag.trim()) : studyGroup.tags;
  studyGroup.contactInfo = contactInfo || studyGroup.contactInfo;

  // Update status based on current members
  if (studyGroup.currentMembers.length >= studyGroup.maxMembers) {
    studyGroup.status = 'full';
  } else {
    studyGroup.status = 'open';
  }

  await studyGroup.save();

  res.status(StatusCodes.OK).json({ studyGroup });
};

const deleteStudyGroup = async (req, res) => {
  const { id: groupId } = req.params;

  const studyGroup = await StudyGroup.findById(groupId);

  if (!studyGroup) {
    throw new CustomError.NotFoundError(`No study group with id : ${groupId}`);
  }

  // Check permissions - only creator or admin can delete
  if (studyGroup.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
    throw new CustomError.UnauthorizedError('Not authorized to delete this study group');
  }

  // Soft delete - mark as inactive
  studyGroup.isActive = false;
  await studyGroup.save();

  res.status(StatusCodes.OK).json({ msg: 'Study group deleted successfully' });
};

const joinStudyGroup = async (req, res) => {
  const { id: groupId } = req.params;
  const { userId } = req.user;

  const studyGroup = await StudyGroup.findById(groupId);

  if (!studyGroup) {
    throw new CustomError.NotFoundError(`No study group with id : ${groupId}`);
  }

  if (!studyGroup.isActive) {
    throw new CustomError.BadRequestError('Study group is not active');
  }

  if (studyGroup.status === 'full') {
    throw new CustomError.BadRequestError('Study group is full');
  }

  if (studyGroup.status === 'closed') {
    throw new CustomError.BadRequestError('Study group is closed');
  }

  // Check if already a member
  const isMember = studyGroup.currentMembers.some(
    member => member.user.toString() === userId
  );

  if (isMember) {
    throw new CustomError.BadRequestError('Already a member of this study group');
  }

  // Add user to group
  studyGroup.currentMembers.push({
    user: userId,
    joinedAt: new Date(),
  });

  // Update status if group is now full
  if (studyGroup.currentMembers.length >= studyGroup.maxMembers) {
    studyGroup.status = 'full';
  }

  await studyGroup.save();

  // Create notification for study group join
  try {
    const User = require('../models/User');
    const user = await User.findById(userId, 'name');
    if (user) {
      await NotificationService.notifyStudyGroupJoined(
        studyGroup._id,
        studyGroup.title,
        userId,
        user.name
      );
    }
  } catch (error) {
    console.error('Failed to create study group join notification:', error);
  }

  res.status(StatusCodes.OK).json({ msg: 'Successfully joined study group' });
};

const leaveStudyGroup = async (req, res) => {
  const { id: groupId } = req.params;
  const { userId } = req.user;

  const studyGroup = await StudyGroup.findById(groupId);

  if (!studyGroup) {
    throw new CustomError.NotFoundError(`No study group with id : ${groupId}`);
  }

  // Check if user is a member
  const memberIndex = studyGroup.currentMembers.findIndex(
    member => member.user.toString() === userId
  );

  if (memberIndex === -1) {
    throw new CustomError.BadRequestError('Not a member of this study group');
  }

  // Remove user from group
  studyGroup.currentMembers.splice(memberIndex, 1);

  // If creator leaves and there are other members, transfer ownership to first member
  if (studyGroup.createdBy.toString() === userId && studyGroup.currentMembers.length > 0) {
    studyGroup.createdBy = studyGroup.currentMembers[0].user;
  }

  // If no members left, mark as inactive
  if (studyGroup.currentMembers.length === 0) {
    studyGroup.isActive = false;
    studyGroup.status = 'closed';
  } else {
    // Update status if group is no longer full
    if (studyGroup.status === 'full') {
      studyGroup.status = 'open';
    }
  }

  await studyGroup.save();

  res.status(StatusCodes.OK).json({ msg: 'Successfully left study group' });
};

const getUserStudyGroups = async (req, res) => {
  const { userId } = req.user;

  const studyGroups = await StudyGroup.find({
    'currentMembers.user': userId,
    isActive: true,
  })
    .populate('course', 'name code')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({ studyGroups });
};

const searchStudyGroups = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    throw new CustomError.BadRequestError('Please provide search query');
  }

  const studyGroups = await StudyGroup.find({
    $text: { $search: q },
    isActive: true,
  })
    .populate('course', 'name code')
    .populate('createdBy', 'name')
    .limit(10);

  res.status(StatusCodes.OK).json({ studyGroups });
};

module.exports = {
  getAllStudyGroups,
  getSingleStudyGroup,
  createStudyGroup,
  updateStudyGroup,
  deleteStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  getUserStudyGroups,
  searchStudyGroups,
};