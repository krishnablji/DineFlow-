const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// @desc    Get Manager Dashboard Data (Strictly 2 Panels: Inventory Restock & Daily Sales)
// @route   GET /api/analytics/dashboard
// @access  Public / Staff / Manager
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Fetch Today's Orders
    const todayOrders = await Order.find({
      createdAt: { $gte: startOfToday },
    }).sort({ createdAt: -1 });

    const todayOrdersCount = todayOrders.length;
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 2. Fetch Out-of-Stock Items for Inventory Restock Panel
    const outOfStockItems = await MenuItem.find({ isAvailable: false }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        todayRevenue,
        todayOrdersCount,
        settledOrders: todayOrders,
        outOfStockItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
};
