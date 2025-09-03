const express = require('express');
const router = express.Router();
const {
  getAllResources,
  getSingleResource,
  createResource,
  updateResource,
  deleteResource,
  likeResource,
  addComment,
  downloadResource,
  pinResource,
  getRecentResources,
  getPinnedResources,
} = require('../controllers/resourceController');

const { authenticateUser } = require('../middleware/authentication');
const { uploadSingle } = require('../middleware/upload');

router.route('/')
  .get(getAllResources)
  .post(authenticateUser, uploadSingle('resourceFile'), createResource);

router.route('/recent').get(getRecentResources);
router.route('/pinned').get(getPinnedResources);

router.route('/:id')
  .get(getSingleResource)
  .patch(authenticateUser, updateResource)
  .delete(authenticateUser, deleteResource);

router.route('/:id/like').post(authenticateUser, likeResource);
router.route('/:id/comment').post(authenticateUser, addComment);
router.route('/:id/download').get(authenticateUser, downloadResource);
router.route('/:id/pin').patch(authenticateUser, pinResource);

module.exports = router;