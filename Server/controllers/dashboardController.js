const User = require('../models/User');
const Course = require('../models/Course');
const Resource = require('../models/Resource');
const StudyGroup = require('../models/StudyGroup');
const ResourceRequest = require('../models/ResourceRequest');
const { StatusCodes } = require('http-status-codes');

const getDashboardStats = async (req, res) => {
  const { userId, role } = req.user;

  if (role === 'admin') {
    // Admin dashboard stats
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments({ isActive: true });
    const totalResources = await Resource.countDocuments({ isApproved: true });
    const totalStudyGroups = await StudyGroup.countDocuments({ isActive: true });
    const totalRequests = await ResourceRequest.countDocuments();

    // Recent activity
    const recentUsers = await User.find({ role: 'student' })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentResources = await Resource.find({ isApproved: true })
      .populate('uploadedBy', 'name')
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly stats
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      role: 'student'
    });
    const monthlyResources = await Resource.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isApproved: true
    });

    res.status(StatusCodes.OK).json({
      stats: {
        totalUsers,
        totalCourses,
        totalResources,
        totalStudyGroups,
        totalRequests,
        monthlyUsers,
        monthlyResources,
      },
      recentActivity: {
        recentUsers,
        recentResources,
      },
    });
  } else {
    // Student dashboard stats
    const userCourses = await Course.find({
      enrolledStudents: userId,
      isActive: true
    }).countDocuments();

    const userResources = await Resource.countDocuments({
      uploadedBy: userId,
      isApproved: true
    });

    const userStudyGroups = await StudyGroup.countDocuments({
      'currentMembers.user': userId,
      isActive: true
    });

    const userRequests = await ResourceRequest.countDocuments({
      requestedBy: userId
    });

    // Recent activity for user
    const recentResources = await Resource.find({
      uploadedBy: userId,
      isApproved: true
    })
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentStudyGroups = await StudyGroup.find({
      'currentMembers.user': userId,
      isActive: true
    })
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(3);

    // User's bookmarks
    const user = await User.findById(userId)
      .populate({
        path: 'bookmarks.resourceId',
        populate: {
          path: 'course',
          select: 'name code'
        }
      });

    res.status(StatusCodes.OK).json({
      stats: {
        enrolledCourses: userCourses,
        uploadedResources: userResources,
        joinedStudyGroups: userStudyGroups,
        createdRequests: userRequests,
      },
      recentActivity: {
        recentResources,
        recentStudyGroups,
        bookmarks: user.bookmarks.slice(0, 5),
      },
    });
  }
};

const getResourceStats = async (req, res) => {
  const { courseId } = req.query;

  let matchQuery = { isApproved: true };
  if (courseId) {
    matchQuery.course = courseId;
  }

  // Resource type distribution
  const resourcesByType = await Resource.aggregate([
    { $match: matchQuery },
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Most popular resources (by likes)
  const popularResources = await Resource.find(matchQuery)
    .populate('course', 'name code')
    .populate('uploadedBy', 'name')
    .sort({ 'likes.length': -1 })
    .limit(10);

  // Most downloaded resources
  const downloadedResources = await Resource.find(matchQuery)
    .populate('course', 'name code')
    .populate('uploadedBy', 'name')
    .sort({ downloadCount: -1 })
    .limit(10);

  res.status(StatusCodes.OK).json({
    resourcesByType,
    popularResources,
    downloadedResources,
  });
};

const getUserActivity = async (req, res) => {
  const { userId } = req.params;
  const { timeframe = '30' } = req.query; // days

  const daysAgo = new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000);

  const activity = {
    resourcesUploaded: await Resource.countDocuments({
      uploadedBy: userId,
      createdAt: { $gte: daysAgo },
      isApproved: true
    }),
    studyGroupsJoined: await StudyGroup.countDocuments({
      'currentMembers.user': userId,
      'currentMembers.joinedAt': { $gte: daysAgo },
      isActive: true
    }),
    requestsCreated: await ResourceRequest.countDocuments({
      requestedBy: userId,
      createdAt: { $gte: daysAgo }
    }),
  };

  res.status(StatusCodes.OK).json({ activity });
};

module.exports = {
  getDashboardStats,
  getResourceStats,
  getUserActivity,
};