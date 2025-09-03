const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/userController');

const { authenticateUser } = require('../middleware/authentication');
const { uploadSingle } = require('../middleware/upload');

router.route('/').get(authenticateUser, getAllUsers);

router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);

router.route('/profile/:userId').get(authenticateUser, getUserProfile);
router.route('/profile-picture').patch(
  authenticateUser,
  uploadSingle('profilePicture'),
  updateProfilePicture
);

router.route('/bookmarks').get(authenticateUser, getUserBookmarks);
router.route('/bookmarks/add').post(authenticateUser, addBookmark);
router.route('/bookmarks/remove').delete(authenticateUser, removeBookmark);

router.route('/:id').get(authenticateUser, getSingleUser);

module.exports = router;