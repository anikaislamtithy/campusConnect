const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getResourceStats,
  getUserActivity,
} = require('../controllers/dashboardController');

const { authenticateUser } = require('../middleware/authentication');

router.route('/stats').get(authenticateUser, getDashboardStats);
router.route('/resource-stats').get(authenticateUser, getResourceStats);
router.route('/user-activity/:userId').get(authenticateUser, getUserActivity);

module.exports = router;