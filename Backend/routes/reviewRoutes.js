const express = require('express');
const router = express.Router();
const { createReview, getProductReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createReview);

router.route('/:productId').get(getProductReviews);
router.route('/:id').delete(protect, deleteReview);

module.exports = router;
