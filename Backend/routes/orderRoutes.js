const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getAllOrders, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(createOrder)
  .get(getAllOrders);

router.route('/:id/status').patch(updateOrderStatus);
router.route('/:id/cancel').patch(protect, cancelOrder);

router.route('/user/:id').get(protect, getUserOrders);

module.exports = router;
