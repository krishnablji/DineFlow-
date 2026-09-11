const express = require('express');
const router = express.Router();
const {
  createOrder,
  getActiveOrders,
  markOrderReady,
  settleOrder,
  getOrders,
  getOrderById,
} = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/active', getActiveOrders);
router.get('/:id', getOrderById);
router.patch('/:id/ready', markOrderReady);
router.patch('/:id/settle', settleOrder);

module.exports = router;
