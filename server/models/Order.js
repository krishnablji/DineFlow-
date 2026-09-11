const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  kitchenNote: {
    type: String,
    default: '',
  },
  specialInstructions: {
    type: String,
    default: '',
  },
  itemTotal: {
    type: Number,
    required: true,
  },
});

const OrderTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['placed', 'prepping', 'ready', 'served', 'settled', 'cancelled'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: String,
    default: 'Staff',
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true, // Formatted as T04-#01
    },
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
    },
    waiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    waiterName: {
      type: String,
      default: 'Floor Staff',
    },
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cash', 'card', 'upi'],
      default: 'pending',
    },
    servingStatus: {
      type: String,
      enum: ['placed', 'prepping', 'ready', 'served', 'settled', 'cancelled'],
      default: 'placed',
    },
    timeline: [OrderTimelineSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', OrderSchema);
