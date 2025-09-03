const { Achievement, UserAchievement } = require('../models/Achievement');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const NotificationService = require('../utils/notificationService');

const getAllAchievements = async (req, res) => {
  const achievements = await Achievement.find({ isActive: true })
    .sort({ rarity: 1, points: 1 });

  res.status(StatusCodes.OK).json({ achievements });
};

const getUserAchievements = async (req, res) => {
  const { userId } = req.params;

  const userAchievements = await UserAchievement.find({ user: userId })
    .populate('achievement')
    .sort({ earnedAt: -1 });

  res.status(StatusCodes.OK).json({ achievements: userAchievements });
};

const getCurrentUserAchievements = async (req, res) => {
  const { userId } = req.user;

  const userAchievements = await UserAchievement.find({ user: userId })
    .populate('achievement')
    .sort({ earnedAt: -1 });

  const totalPoints = userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0);

  res.status(StatusCodes.OK).json({
    achievements: userAchievements,
    totalPoints,
    totalAchievements: userAchievements.length,
  });
};

const checkAndAwardAchievements = async (userId, type, count = 1) => {
  try {
    // Get all achievements of the specified type
    const achievements = await Achievement.find({ type, isActive: true });

    // Get user's current achievements
    const userAchievements = await UserAchievement.find({ user: userId })
      .populate('achievement');

    const earnedAchievementIds = userAchievements.map(ua => ua.achievement._id.toString());

    for (const achievement of achievements) {
      // Skip if user already has this achievement
      if (earnedAchievementIds.includes(achievement._id.toString())) {
        continue;
      }

      // Check if user meets the criteria
      if (count >= achievement.criteria.count) {
        // Award the achievement
        await UserAchievement.create({
          user: userId,
          achievement: achievement._id,
          progress: count,
        });

        // Update user's achievements array
        const user = await User.findByIdAndUpdate(userId, {
          $push: { achievements: achievement._id }
        }, { new: true });

        // Create notification for achievement earned
        try {
          await NotificationService.notifyAchievementEarned(
            achievement._id,
            achievement.name,
            userId,
            user.name
          );
        } catch (error) {
          console.error('Failed to create achievement notification:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};

const createAchievement = async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new CustomError.UnauthorizedError('Only admins can create achievements');
  }

  const achievement = await Achievement.create(req.body);
  res.status(StatusCodes.CREATED).json({ achievement });
};

const updateAchievement = async (req, res) => {
  const { id: achievementId } = req.params;

  if (req.user.role !== 'admin') {
    throw new CustomError.UnauthorizedError('Only admins can update achievements');
  }

  const achievement = await Achievement.findByIdAndUpdate(
    achievementId,
    req.body,
    { new: true, runValidators: true }
  );

  if (!achievement) {
    throw new CustomError.NotFoundError(`No achievement with id : ${achievementId}`);
  }

  res.status(StatusCodes.OK).json({ achievement });
};

const deleteAchievement = async (req, res) => {
  const { id: achievementId } = req.params;

  if (req.user.role !== 'admin') {
    throw new CustomError.UnauthorizedError('Only admins can delete achievements');
  }

  const achievement = await Achievement.findById(achievementId);

  if (!achievement) {
    throw new CustomError.NotFoundError(`No achievement with id : ${achievementId}`);
  }

  // Soft delete
  achievement.isActive = false;
  await achievement.save();

  res.status(StatusCodes.OK).json({ msg: 'Achievement deleted successfully' });
};

module.exports = {
  getAllAchievements,
  getUserAchievements,
  getCurrentUserAchievements,
  checkAndAwardAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};