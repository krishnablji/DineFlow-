const mongoose = require('mongoose');

const TableOrderCounterSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

// Unique compound index so each table has exactly one counter per day
TableOrderCounterSchema.index({ tableNumber: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TableOrderCounter', TableOrderCounterSchema);
