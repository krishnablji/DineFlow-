const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');

// @desc    Get Sales & Revenue Dashboard Analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Manager only)
const getDashboardAnalytics = async (req, res, next) => {
  try {
    // 1. Overall Revenue and Order counts
    const allOrders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrdersCount = allOrders.length;
    const averageOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : 0;

    // 2. Today's Revenue and Served Orders
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= startOfToday);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const todayOrdersCount = todayOrders.length;

    // 3. Active Tables & Status Breakdown
    const tables = await Table.find();
    const tableStats = {
      total: tables.length,
      available: tables.filter((t) => t.status === 'available').length,
      occupied: tables.filter((t) => t.status === 'occupied').length,
      reserved: tables.filter((t) => t.status === 'reserved').length,
    };

    // 4. Peak Table Turnover Hours (0-23 hours distribution)
    const hourlyOrders = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      orders: 0,
      revenue: 0,
    }));

    allOrders.forEach((order) => {
      const orderHour = new Date(order.createdAt).getHours();
      hourlyOrders[orderHour].orders += 1;
      hourlyOrders[orderHour].revenue += order.totalAmount || 0;
    });

    // 5. Top 5 Best-Selling Dishes
    const dishSalesMap = {};
    allOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const name = item.name;
          if (!dishSalesMap[name]) {
            dishSalesMap[name] = {
              name,
              quantity: 0,
              revenue: 0,
            };
          }
          dishSalesMap[name].quantity += item.quantity || 1;
          dishSalesMap[name].revenue += item.itemTotal || (item.price * item.quantity);
        });
      }
    });

    const topDishes = Object.values(dishSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 6. Category Revenue Distribution
    const categoryDistribution = {
      Starters: 0,
      Mains: 0,
      Desserts: 0,
      Beverages: 0,
    };

    allOrders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item) => {
          // Estimate distribution or use itemTotal
          const amount = item.itemTotal || item.price || 0;
          if (item.name.toLowerCase().includes('starter') || item.name.toLowerCase().includes('truffle') || item.name.toLowerCase().includes('bruschetta') || item.name.toLowerCase().includes('soup')) {
            categoryDistribution.Starters += amount;
          } else if (item.name.toLowerCase().includes('cake') || item.name.toLowerCase().includes('tiramisu') || item.name.toLowerCase().includes('souffle') || item.name.toLowerCase().includes('dessert')) {
            categoryDistribution.Desserts += amount;
          } else if (item.name.toLowerCase().includes('spritz') || item.name.toLowerCase().includes('mojito') || item.name.toLowerCase().includes('wine') || item.name.toLowerCase().includes('beverage') || item.name.toLowerCase().includes('tea') || item.name.toLowerCase().includes('espresso')) {
            categoryDistribution.Beverages += amount;
          } else {
            categoryDistribution.Mains += amount;
          }
        });
      }
    });

    // 7. Recent 8 orders for quick activity stream
    const recentActivity = await Order.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select('orderNumber tableNumber customerName totalAmount servingStatus priority createdAt');

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrdersCount,
          averageOrderValue: Number(averageOrderValue),
          todayRevenue,
          todayOrdersCount,
        },
        tableStats,
        hourlyOrders,
        topDishes,
        categoryDistribution,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
};
