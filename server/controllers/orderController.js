const Order = require('../models/Order');
const Table = require('../models/Table');
const { emitNewOrder, emitOrderStatusUpdate } = require('../sockets/socketHandler');

// Helper to generate unique order number e.g. DF-2026-8491
const generateOrderNumber = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `DF-${randomNum}`;
};

// @desc    Create a new order (from customer dine-in checkout)
// @route   POST /api/orders
// @access  Public / Customer
const createOrder = async (req, res, next) => {
  try {
    const {
      tableNumber,
      items,
      subtotal,
      tax = 0,
      serviceFee = 0,
      totalAmount,
      customerName = 'Guest Customer',
      customerPhone = '',
      paymentStatus = 'paid',
      paymentMethod = 'razorpay',
      razorpayOrderId = '',
      razorpayPaymentId = '',
      priority = 'normal',
      scheduledTime = 'Immediate',
      estimatedPrepTimeMinutes = 20,
    } = req.body;

    if (!tableNumber || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have a valid table number and at least one item.',
      });
    }

    const orderNumber = generateOrderNumber();
    const customerId = req.user ? req.user._id : null;

    const initialTimeline = [
      {
        status: 'placed',
        timestamp: new Date(),
        note: `Order placed for Table #${tableNumber}`,
        updatedBy: customerName || 'Customer',
      },
    ];

    const order = await Order.create({
      orderNumber,
      tableNumber: Number(tableNumber),
      customerId,
      customerName: req.user ? req.user.name : customerName,
      customerPhone: req.user ? req.user.phone : customerPhone,
      items,
      subtotal: Number(subtotal),
      tax: Number(tax),
      serviceFee: Number(serviceFee),
      totalAmount: Number(totalAmount),
      paymentStatus,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      servingStatus: 'placed',
      priority,
      scheduledTime,
      timeline: initialTimeline,
      estimatedPrepTimeMinutes,
    });

    // Update table status to occupied and link active order
    await Table.findOneAndUpdate(
      { tableNumber: Number(tableNumber) },
      { status: 'occupied', currentOrderId: order._id }
    );

    // Broadcast new order to Kitchen & Manager via Socket.io
    emitNewOrder(order);

    res.status(201).json({
      success: true,
      data: order,
      message: `Order #${order.orderNumber} placed successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders with optional status, table, or priority filters
// @route   GET /api/orders
// @access  Public / Staff / Manager
const getOrders = async (req, res, next) => {
  try {
    const { status, tableNumber, priority, todayOnly, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      if (status.includes(',')) {
        query.servingStatus = { $in: status.split(',') };
      } else {
        query.servingStatus = status;
      }
    }

    if (tableNumber) {
      query.tableNumber = Number(tableNumber);
    }

    if (priority) {
      query.priority = priority;
    }

    if (todayOnly === 'true') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: startOfDay };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('customerId', 'name email phone avatar');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID or orderNumber
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order;

    if (id.startsWith('DF-')) {
      order = await Order.findOne({ orderNumber: id }).populate('customerId', 'name email phone');
    } else {
      order = await Order.findById(id).populate('customerId', 'name email phone');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active order for a table
// @route   GET /api/orders/table/:tableNumber/active
// @access  Public
const getActiveTableOrder = async (req, res, next) => {
  try {
    const { tableNumber } = req.params;

    const order = await Order.findOne({
      tableNumber: Number(tableNumber),
      servingStatus: { $in: ['placed', 'prepping', 'ready'] },
    }).sort({ createdAt: -1 });

    if (!order) {
      return res.status(200).json({
        success: true,
        data: null,
        message: `No active pending order for Table #${tableNumber}.`,
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update serving milestone status (Kanban drag / 1-click advance)
// @route   PUT /api/orders/:id/status
// @access  Public / Staff / Manager
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note, waiterName } = req.body;

    const validStatuses = ['placed', 'prepping', 'ready', 'served', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    let order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    order.servingStatus = status;

    // Add milestone to timeline
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Serving milestone advanced to ${status.toUpperCase()}`,
      updatedBy: waiterName || (req.user ? req.user.name : 'Kitchen Staff'),
    });

    // If served or cancelled, free up table
    if (status === 'served' || status === 'cancelled') {
      await Table.findOneAndUpdate(
        { tableNumber: order.tableNumber },
        { status: 'available', currentOrderId: null }
      );
    }

    await order.save();

    // Broadcast updated order to all parties via Socket.io
    emitOrderStatusUpdate(order);

    res.status(200).json({
      success: true,
      data: order,
      message: `Order #${order.orderNumber} status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order priority (Normal / Urgent / Scheduled)
// @route   PUT /api/orders/:id/priority
// @access  Public / Staff / Manager
const updateOrderPriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { priority },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    emitOrderStatusUpdate(order);

    res.status(200).json({
      success: true,
      data: order,
      message: `Order #${order.orderNumber} priority changed to ${priority}.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getActiveTableOrder,
  updateOrderStatus,
  updateOrderPriority,
};
