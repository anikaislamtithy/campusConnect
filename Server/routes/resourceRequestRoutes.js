const express = require('express');
const router = express.Router();
const {
  getAllResourceRequests,
  getSingleResourceRequest,
  createResourceRequest,
  updateResourceRequest,
  deleteResourceRequest,
  addComment,
  upvoteRequest,
  fulfillRequest,
  getUserRequests,
  searchRequests,
} = require('../controllers/resourceRequestController');

const { authenticateUser } = require('../middleware/authentication');

router.route('/')
  .get(getAllResourceRequests)
  .post(authenticateUser, createResourceRequest);

router.route('/search').get(searchRequests);
router.route('/my-requests').get(authenticateUser, getUserRequests);

router.route('/:id')
  .get(getSingleResourceRequest)
  .patch(authenticateUser, updateResourceRequest)
  .delete(authenticateUser, deleteResourceRequest);

router.route('/:id/comment').post(authenticateUser, addComment);
router.route('/:id/upvote').post(authenticateUser, upvoteRequest);
router.route('/:id/fulfill').post(authenticateUser, fulfillRequest);

module.exports = router;