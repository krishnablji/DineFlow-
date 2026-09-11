const Order = require('../models/Order');
const TableOrderCounter = require('../models/TableOrderCounter');
const MenuItem = require('../models/MenuItem');
const { emitNewOrder, emitOrderReady, emitOrderSettled } = require('../sockets/socketHandler');

// Helper to get today's date string YYYY-MM-DD in local time
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Create a new order from Waiter Tablet
// @route   POST /api/orders
// @access  Private / Waiter / Staff
const createOrder = async (req, res, next) => {
  try {
    const {
      tableNumber,
      items,
      waiterName = 'Floor Staff',
    } = req.body;

    if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must specify a valid table number and at least one item.',
      });
    }

    const tNum = Number(tableNumber);
    const today = getTodayDateString();

    // 1. Atomic sequential counter per table for today
    const counter = await TableOrderCounter.findOneAndUpdate(
      { tableNumber: tNum, date: today },
      { $inc: { seq: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Format: T04-#01
    const orderNumber = `T${String(tNum).padStart(2, '0')}-#${String(counter.seq).padStart(2, '0')}`;

    // 2. Validate items & compute server-side totals
    const processedItems = items.map((item) => {
      const price = Number(item.price) || 0;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      return {
        menuItemId: item.menuItemId || item._id,
        name: item.name,
        price,
        quantity,
        kitchenNote: (item.kitchenNote || '').trim(),
        specialInstructions: (item.kitchenNote || '').trim(),
        itemTotal: price * quantity,
      };
    });

    const subtotal = processedItems.reduce((sum, item) => sum + item.itemTotal, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST standard
    const totalAmount = subtotal + tax;

    const initialTimeline = [
      {
        status: 'placed',
        timestamp: new Date(),
        note: `Order placed for Table #${tNum}`,
        updatedBy: req.user ? req.user.name : waiterName,
      },
    ];

    const order = await Order.create({
      orderNumber,
      tableNumber: tNum,
      waiterId: req.user ? req.user._id : null,
      waiterName: req.user ? req.user.name : waiterName,
      items: processedItems,
      subtotal,
      tax,
      totalAmount,
      paymentStatus: 'pending',
      servingStatus: 'placed',
      timeline: initialTimeline,
    });

    // 3. Broadcast to Kitchen & Manager
    emitNewOrder(order);

    res.status(201).json({
      success: true,
      message: `Order ${orderNumber} placed successfully!`,
      data: order,
    });
  } catch (error) {
    console.error('[createOrder error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating order',
    });
  }
};

// @desc    Get active orders for Kitchen & Waiter displays
// @route   GET /api/orders/active
// @access  Private (Staff)
const getActiveOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      servingStatus: { $in: ['placed', 'prepping', 'ready'] },
    }).sort({ createdAt: 1 }); // FIFO queue

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark order as Ready / Start Delivery (Kitchen single-action)
// @route   PATCH /api/orders/:id/ready
// @access  Private (Kitchen / Manager)
const markOrderReady = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.servingStatus = 'ready';
    order.timeline.push({
      status: 'ready',
      timestamp: new Date(),
      note: 'Kitchen marked order ready for delivery',
      updatedBy: req.user ? req.user.name : 'Kitchen Head',
    });

    await order.save();

    // Broadcast ready alert to all waiter tablets
    emitOrderReady(order);

    res.status(200).json({
      success: true,
      message: `Order ${order.orderNumber} is marked Ready for Delivery!`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Settle / Pay order (Waiter/Manager)
// @route   PATCH /api/orders/:id/settle
// @access  Private (Waiter / Manager)
const settleOrder = async (req, res, next) => {
  try {
    const { paymentMethod = 'cash' } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.servingStatus = 'settled';
    order.paymentStatus = 'paid';
    order.timeline.push({
      status: 'settled',
      timestamp: new Date(),
      note: `Settled via ${paymentMethod}`,
      updatedBy: req.user ? req.user.name : 'Staff',
    });

    await order.save();
    emitOrderSettled(order);

    res.status(200).json({
      success: true,
      message: `Order ${order.orderNumber} settled successfully.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (with optional table or today filter)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    const { tableNumber, todayOnly } = req.query;
    const filter = {};

    if (tableNumber) {
      filter.tableNumber = Number(tableNumber);
    }

    if (todayOnly === 'true') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: startOfToday };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Public / Staff
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getActiveOrders,
  markOrderReady,
  settleOrder,
  getOrders,
  getOrderById,
};
