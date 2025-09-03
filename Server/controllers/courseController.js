const Course = require('../models/Course');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const NotificationService = require('../utils/notificationService');

const getAllCourses = async (req, res) => {
  const { university, department, search, page = 1, limit = 20 } = req.query;

  const queryObject = { isActive: true };

  if (university) {
    queryObject.university = { $regex: university, $options: 'i' };
  }

  if (department) {
    queryObject.department = { $regex: department, $options: 'i' };
  }

  let result = Course.find(queryObject);

  if (search) {
    result = result.find({ $text: { $search: search } });
  }

  // Pagination
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(Number(limit));

  // Sort by name
  result = result.sort('name');

  const courses = await result;
  const totalCourses = await Course.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    courses,
    totalCourses,
    numOfPages: Math.ceil(totalCourses / limit),
    currentPage: Number(page),
  });
};

const getSingleCourse = async (req, res) => {
  const { id: courseId } = req.params;

  const course = await Course.findOne({ _id: courseId, isActive: true })
    .populate('enrolledStudents', 'name email');

  if (!course) {
    throw new CustomError.NotFoundError(`No course with id : ${courseId}`);
  }

  res.status(StatusCodes.OK).json({ course });
};

const createCourse = async (req, res) => {
  const {
    name,
    code,
    description,
    university,
    department,
    semester,
    year,
    instructor,
    credits,
  } = req.body;

  // Check if course code already exists for this university
  const existingCourse = await Course.findOne({ code, university });
  if (existingCourse) {
    throw new CustomError.BadRequestError(
      'Course code already exists for this university'
    );
  }

  const course = await Course.create({
    name,
    code,
    description,
    university,
    department,
    semester,
    year,
    instructor,
    credits,
  });

  res.status(StatusCodes.CREATED).json({ course });
};

const updateCourse = async (req, res) => {
  const { id: courseId } = req.params;

  const course = await Course.findOneAndUpdate(
    { _id: courseId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!course) {
    throw new CustomError.NotFoundError(`No course with id : ${courseId}`);
  }

  res.status(StatusCodes.OK).json({ course });
};

const deleteCourse = async (req, res) => {
  const { id: courseId } = req.params;

  const course = await Course.findOne({ _id: courseId });

  if (!course) {
    throw new CustomError.NotFoundError(`No course with id : ${courseId}`);
  }

  // Soft delete - mark as inactive
  course.isActive = false;
  await course.save();

  res.status(StatusCodes.OK).json({ msg: 'Course deleted successfully' });
};

const enrollInCourse = async (req, res) => {
  const { id: courseId } = req.params;
  const { userId } = req.user;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new CustomError.NotFoundError(`No course with id : ${courseId}`);
  }

  // Check if already enrolled
  if (course.enrolledStudents.includes(userId)) {
    throw new CustomError.BadRequestError('Already enrolled in this course');
  }

  course.enrolledStudents.push(userId);
  await course.save();

  // Create notification for course enrollment
  try {
    const User = require('../models/User');
    const user = await User.findById(userId, 'name');
    if (user) {
      await NotificationService.notifyCourseEnrolled(
        course._id,
        course.name,
        userId,
        user.name
      );
    }
  } catch (error) {
    console.error('Failed to create course enrollment notification:', error);
  }

  res.status(StatusCodes.OK).json({ msg: 'Successfully enrolled in course' });
};

const unenrollFromCourse = async (req, res) => {
  const { id: courseId } = req.params;
  const { userId } = req.user;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new CustomError.NotFoundError(`No course with id : ${courseId}`);
  }

  course.enrolledStudents = course.enrolledStudents.filter(
    studentId => studentId.toString() !== userId
  );

  await course.save();

  res.status(StatusCodes.OK).json({ msg: 'Successfully unenrolled from course' });
};

const getUserCourses = async (req, res) => {
  const { userId } = req.user;

  const courses = await Course.find({
    enrolledStudents: userId,
    isActive: true,
  }).sort('name');

  res.status(StatusCodes.OK).json({ courses });
};

const searchCourses = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    throw new CustomError.BadRequestError('Please provide search query');
  }

  const courses = await Course.find({
    $text: { $search: q },
    isActive: true,
  }).limit(10);

  res.status(StatusCodes.OK).json({ courses });
};

module.exports = {
  getAllCourses,
  getSingleCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getUserCourses,
  searchCourses,
};