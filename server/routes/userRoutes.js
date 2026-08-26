const express = require('express');
const router = express.Router();
const {
  getStaffList,
  getPendingStaff,
  updateStaffVerification,
  deleteStaffMember,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('manager'));

router.get('/staff', getStaffList);
router.get('/staff/pending', getPendingStaff);
router.put('/staff/:id/verify', updateStaffVerification);
router.delete('/staff/:id', deleteStaffMember);

module.exports = router;
