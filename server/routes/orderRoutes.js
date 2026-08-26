const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  getActiveTableOrder,
  updateOrderStatus,
  updateOrderPriority,
} = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/table/:tableNumber/active', getActiveTableOrder);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/priority', updateOrderPriority);

module.exports = router;
