const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getSingleCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getUserCourses,
  searchCourses,
} = require('../controllers/courseController');

const { authenticateUser } = require('../middleware/authentication');
const { authorizePermissions } = require('../utils');

router.route('/')
  .get(getAllCourses)
  .post(authenticateUser, authorizePermissions('admin'), createCourse);

router.route('/search').get(searchCourses);
router.route('/my-courses').get(authenticateUser, getUserCourses);

router.route('/:id')
  .get(getSingleCourse)
  .patch(authenticateUser, authorizePermissions('admin'), updateCourse)
  .delete(authenticateUser, authorizePermissions('admin'), deleteCourse);

router.route('/:id/enroll').post(authenticateUser, enrollInCourse);
router.route('/:id/unenroll').delete(authenticateUser, unenrollFromCourse);

module.exports = router;