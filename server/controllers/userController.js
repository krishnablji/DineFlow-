const User = require('../models/User');
const { emitStaffVerificationUpdate } = require('../sockets/socketHandler');

// @desc    Get all staff members (waiters & managers)
// @route   GET /api/users/staff
// @access  Private (Manager only)
const getStaffList = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ['waiter', 'manager'] } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending staff verification queue
// @route   GET /api/users/staff/pending
// @access  Private (Manager only)
const getPendingStaff = async (req, res, next) => {
  try {
    const pendingStaff = await User.find({
      role: 'waiter',
      isVerified: false,
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingStaff.length,
      data: pendingStaff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a staff member
// @route   PUT /api/users/staff/:id/verify
// @access  Private (Manager only)
const updateStaffVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified, assignedTables } = req.body;

    let user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
      });
    }

    user.isVerified = isVerified !== undefined ? isVerified : true;
    if (assignedTables && Array.isArray(assignedTables)) {
      user.assignedTables = assignedTables;
    }

    await user.save();

    // Broadcast verification event via socket
    emitStaffVerificationUpdate(user);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        assignedTables: user.assignedTables,
      },
      message: user.isVerified
        ? `Staff member ${user.name} approved successfully!`
        : `Staff member ${user.name} verification revoked.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Remove staff member
// @route   DELETE /api/users/staff/:id
// @access  Private (Manager only)
const deleteStaffMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
      });
    }

    if (user.role === 'manager' && user.email === 'admin@dineflow.com') {
      return res.status(400).json({
        success: false,
        message: 'Primary demo administrator cannot be deleted.',
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Staff member ${user.name} removed.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffList,
  getPendingStaff,
  updateStaffVerification,
  deleteStaffMember,
};
