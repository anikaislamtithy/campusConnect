const express = require('express');
const router = express.Router();
const {
  getAllStudyGroups,
  getSingleStudyGroup,
  createStudyGroup,
  updateStudyGroup,
  deleteStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  getUserStudyGroups,
  searchStudyGroups,
} = require('../controllers/studyGroupController');

const { authenticateUser } = require('../middleware/authentication');

router.route('/')
  .get(getAllStudyGroups)
  .post(authenticateUser, createStudyGroup);

router.route('/search').get(searchStudyGroups);
router.route('/my-groups').get(authenticateUser, getUserStudyGroups);

router.route('/:id')
  .get(getSingleStudyGroup)
  .patch(authenticateUser, updateStudyGroup)
  .delete(authenticateUser, deleteStudyGroup);

router.route('/:id/join').post(authenticateUser, joinStudyGroup);
router.route('/:id/leave').delete(authenticateUser, leaveStudyGroup);

module.exports = router;