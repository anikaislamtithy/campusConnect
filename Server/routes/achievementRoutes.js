const express = require('express');
const router = express.Router();
const {
  getAllAchievements,
  getUserAchievements,
  getCurrentUserAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} = require('../controllers/achievementController');

const { authenticateUser } = require('../middleware/authentication');

router.route('/')
  .get(getAllAchievements)
  .post(authenticateUser, createAchievement);

router.route('/my-achievements').get(authenticateUser, getCurrentUserAchievements);
router.route('/user/:userId').get(authenticateUser, getUserAchievements);

router.route('/:id')
  .patch(authenticateUser, updateAchievement)
  .delete(authenticateUser, deleteAchievement);

module.exports = router;