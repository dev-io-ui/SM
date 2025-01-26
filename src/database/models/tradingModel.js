const mongoose = require('mongoose');

const tradingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['market', 'limit'],
    default: 'market'
  },
  limitPrice: {
    type: Number,
    min: [0, 'Limit price cannot be negative']
  },
  stopLoss: {
    type: Number,
    min: [0, 'Stop loss cannot be negative']
  },
  takeProfit: {
    type: Number,
    min: [0, 'Take profit cannot be negative']
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
tradingSchema.pre('save', function(next) {
  this.totalAmount = this.quantity * this.price;
  next();
});

module.exports = mongoose.model('Trading', tradingSchema);
