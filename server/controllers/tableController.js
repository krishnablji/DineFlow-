const Table = require('../models/Table');
const QRCode = require('qrcode');
const { emitTableStatusUpdate } = require('../sockets/socketHandler');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public
const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find()
      .populate('currentOrderId', 'orderNumber totalAmount servingStatus items')
      .sort({ tableNumber: 1 });

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single table by table number
// @route   GET /api/tables/:tableNumber
// @access  Public
const getTableByNumber = async (req, res, next) => {
  try {
    const table = await Table.findOne({
      tableNumber: Number(req.params.tableNumber),
    }).populate('currentOrderId');

    if (!table) {
      return res.status(404).json({
        success: false,
        message: `Table #${req.params.tableNumber} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new table
// @route   POST /api/tables
// @access  Private (Manager only)
const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, section } = req.body;

    const existing = await Table.findOne({ tableNumber: Number(tableNumber) });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Table #${tableNumber} already exists.`,
      });
    }

    // Generate table QR code data URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const qrData = `${clientUrl}/menu?table=${tableNumber}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const table = await Table.create({
      tableNumber: Number(tableNumber),
      capacity: Number(capacity) || 4,
      section: section || 'Main Dining',
      status: 'available',
      qrCodeUrl,
    });

    emitTableStatusUpdate(table);

    res.status(201).json({
      success: true,
      data: table,
      message: `Table #${table.tableNumber} created successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update table status (available, occupied, reserved)
// @route   PUT /api/tables/:tableNumber/status
// @access  Public / Staff / Manager
const updateTableStatus = async (req, res, next) => {
  try {
    const { tableNumber } = req.params;
    const { status, currentOrderId } = req.body;

    let table = await Table.findOne({ tableNumber: Number(tableNumber) });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: `Table #${tableNumber} not found.`,
      });
    }

    if (status) table.status = status;
    if (currentOrderId !== undefined) table.currentOrderId = currentOrderId;

    await table.save();

    emitTableStatusUpdate(table);

    res.status(200).json({
      success: true,
      data: table,
      message: `Table #${tableNumber} status updated to ${table.status}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate QR code for table
// @route   GET /api/tables/:tableNumber/qr
// @access  Public
const getTableQRCode = async (req, res, next) => {
  try {
    const { tableNumber } = req.params;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const qrData = `${clientUrl}/menu?table=${tableNumber}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    res.status(200).json({
      success: true,
      tableNumber,
      qrUrl: qrData,
      qrCodeImage: qrCodeUrl,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTables,
  getTableByNumber,
  createTable,
  updateTableStatus,
  getTableQRCode,
};
