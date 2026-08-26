const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'dineflow_super_secret_jwt_key_2026_production',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Determine verification: waiters start unverified (pending approval queue)
    const isVerified = role === 'waiter' ? false : true;

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      phone: phone || '',
      isVerified,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        phone: user.phone,
        assignedTables: user.assignedTables,
      },
      message:
        role === 'waiter'
          ? 'Registration successful! Your staff account is pending manager approval.'
          : 'Registration successful!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        phone: user.phone,
        assignedTables: user.assignedTables,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        phone: user.phone,
        assignedTables: user.assignedTables,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Instant 1-Click Demo Login (Zero Friction for Interviewers & Recruiters)
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res, next) => {
  try {
    const { role = 'customer', tableNumber = 4 } = req.body;

    let targetEmail;
    if (role === 'manager' || role === 'admin') {
      targetEmail = 'admin@dineflow.com';
    } else if (role === 'waiter' || role === 'kitchen') {
      targetEmail = 'waiter@dineflow.com';
    } else {
      targetEmail = 'customer@dineflow.com';
    }

    let user = await User.findOne({ email: targetEmail });

    // Fallback: If seed hasn't run yet, auto-create demo user immediately
    if (!user) {
      const demoNames = {
        'admin@dineflow.com': 'Elena Vance (Manager)',
        'waiter@dineflow.com': 'Alex Waiter (Kitchen Staff)',
        'customer@dineflow.com': `Demo Customer (Table ${tableNumber})`,
      };

      user = await User.create({
        name: demoNames[targetEmail] || 'Demo User',
        email: targetEmail,
        password: 'password123',
        role: role === 'admin' ? 'manager' : role === 'kitchen' ? 'waiter' : role,
        isVerified: true,
        assignedTables: role === 'waiter' ? [1, 2, 3, 4, 5, 6, 7, 8] : [],
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      demoMode: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        phone: user.phone,
        assignedTables: user.assignedTables,
        tableNumber: tableNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  demoLogin,
};
