const express = require('express');
const router = express.Router();
const {
  getTables,
  getTableByNumber,
  createTable,
  updateTableStatus,
  getTableQRCode,
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getTables);
router.get('/:tableNumber', getTableByNumber);
router.get('/:tableNumber/qr', getTableQRCode);
router.put('/:tableNumber/status', updateTableStatus);

// Manager Protected Routes
router.post('/', protect, authorize('manager'), createTable);

module.exports = router;
