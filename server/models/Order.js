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
  spiceLevel: {
    type: String,
    default: 'Medium',
  },
  addons: [
    {
      name: String,
      price: Number,
    },
  ],
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
    enum: ['placed', 'prepping', 'ready', 'served', 'cancelled'],
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
    default: 'System',
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerName: {
      type: String,
      default: 'Guest Customer',
    },
    customerPhone: {
      type: String,
      default: '',
    },
    waiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
    serviceFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cash_on_delivery'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cash', 'card', 'demo_simulator'],
      default: 'razorpay',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    servingStatus: {
      type: String,
      enum: ['placed', 'prepping', 'ready', 'served', 'cancelled'],
      default: 'placed',
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent', 'scheduled'],
      default: 'normal',
    },
    scheduledTime: {
      type: String, // e.g. "Immediate", "19:30", "20:00"
      default: 'Immediate',
    },
    timeline: [OrderTimelineSchema],
    estimatedPrepTimeMinutes: {
      type: Number,
      default: 20,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', OrderSchema);
