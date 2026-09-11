const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMedia,
  getCategories,
  toggleStockAvailability,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getMenuItems);
router.get('/categories/all', getCategories);
router.get('/:id', getMenuItemById);
router.patch('/:id/stock', toggleStockAvailability);

// Manager Protected Routes
router.post('/', protect, authorize('manager'), createMenuItem);
router.put('/:id', protect, authorize('manager'), updateMenuItem);
router.delete('/:id', protect, authorize('manager'), deleteMenuItem);
router.post(
  '/upload',
  protect,
  authorize('manager'),
  upload.single('file'),
  uploadMedia
);

module.exports = router;
