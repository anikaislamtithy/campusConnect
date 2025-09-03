const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils');
const NotificationService = require('../utils/notificationService');

const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      university,
      year,
      isVerified,
      search,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // ----------------------
    // 1. Build query object
    // ----------------------
    let queryObject = {};

    if (role) queryObject.role = role;
    if (year) queryObject.year = year;
    if (isVerified) {
      queryObject.isVerified = isVerified === "true"; // convert to boolean
    }

    if (university) {
      queryObject.university = { $regex: university, $options: "i" };
    }

    if (search) {
      queryObject.$text = { $search: search };
    }

    // ----------------------
    // 2. Build query
    // ----------------------
    let query = User.find(queryObject)
      .select("-password")
      .populate("achievements");

    // ----------------------
    // 3. Sorting
    // ----------------------
    if (sort === "latest") {
      query = query.sort("-createdAt");
    } else if (sort === "oldest") {
      query = query.sort("createdAt");
    } else if (sort === "a-z") {
      query = query.sort("name");
    } else if (sort === "z-a") {
      query = query.sort("-name");
    }

    // ----------------------
    // 4. Pagination
    // ----------------------
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    query = query.skip(skip).limit(limitNum);

    // ----------------------
    // 5. Execute query
    // ----------------------
    const users = await query;
    const totalUsers = await User.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalUsers / limitNum);

    // ----------------------
    // 6. Send response
    // ----------------------
    res.status(StatusCodes.OK).json({
      totalUsers,
      numOfPages,
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    // console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error", error: error.message });
  }
};



const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id })
    .select('-password')
    .populate('achievements');

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }

  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { email, name, bio="", interests="", major, year } = req.body;

  if (!name) {
    throw new CustomError.BadRequestError('Please provide all values');
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.email = email || user.email;
  user.name = name || user.name;
  user.bio = bio || user.bio;
  user.interests = interests || user.interests;
  user.major = major || user.major;
  user.year = year || user.year;


  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

const getUserProfile = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('-password -verificationToken -passwordToken')
    .populate('achievements');

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${userId}`);
  }

  res.status(StatusCodes.OK).json({ user });
};

const updateProfilePicture = async (req, res) => {
  if (!req.file) {
    throw new CustomError.BadRequestError('Please provide an image');
  }

  const user = await User.findById(req.user.userId);
  user.profilePicture = req.file.path;
  await user.save();

  res.status(StatusCodes.OK).json({
    msg: 'Profile picture updated successfully',
    profilePicture: user.profilePicture
  });
};

const addBookmark = async (req, res) => {
  const { resourceType, resourceId } = req.body;

  if (!resourceType || !resourceId) {
    throw new CustomError.BadRequestError('Please provide resource type and ID');
  }

  const user = await User.findById(req.user.userId);

  // Check if already bookmarked
  const existingBookmark = user.bookmarks.find(
    bookmark => bookmark.resourceId.toString() === resourceId && bookmark.resourceType === resourceType
  );

  if (existingBookmark) {
    throw new CustomError.BadRequestError('Resource already bookmarked');
  }

  user.bookmarks.push({ resourceType, resourceId });
  await user.save();

  // Create notification for bookmark added
  try {
    if (resourceType === 'Resource') {
      const Resource = require('../models/Resource');
      const resource = await Resource.findById(resourceId, 'title');
      if (resource) {
        await NotificationService.notifyBookmarkAdded(
          resourceId,
          resource.title,
          req.user.userId,
          user.name
        );
      }
    }
  } catch (error) {
    console.error('Failed to create bookmark notification:', error);
  }

  res.status(StatusCodes.OK).json({ msg: 'Bookmark added successfully' });
};

const removeBookmark = async (req, res) => {
  const { resourceType, resourceId } = req.body;

  const user = await User.findById(req.user.userId);
  user.bookmarks = user.bookmarks.filter(
    bookmark => !(bookmark.resourceId.toString() === resourceId && bookmark.resourceType === resourceType)
  );

  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Bookmark removed successfully' });
};

const getUserBookmarks = async (req, res) => {
  const user = await User.findById(req.user.userId)
    .populate({
      path: 'bookmarks.resourceId',
      populate: {
        path: 'course uploadedBy',
        select: 'name code title'
      }
    });

  res.status(StatusCodes.OK).json({ bookmarks: user.bookmarks });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  getUserProfile,
  updateProfilePicture,
  addBookmark,
  removeBookmark,
  getUserBookmarks,
};