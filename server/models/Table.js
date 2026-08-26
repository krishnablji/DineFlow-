const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      unique: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      default: 4,
    },
    section: {
      type: String,
      enum: ['Main Dining', 'Patio Terrace', 'Rooftop Lounge', 'Private Booth'],
      default: 'Main Dining',
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved'],
      default: 'available',
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Table', TableSchema);
