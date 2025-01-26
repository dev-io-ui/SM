const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['buy', 'sell'],
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    orderType: {
      type: String,
      enum: ['market', 'limit'],
      default: 'market',
    },
    limitPrice: {
      type: Number,
      min: 0,
    },
    stopLoss: {
      type: Number,
      min: 0,
    },
    takeProfit: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'failed'],
      default: 'pending',
    },
    executedAt: Date,
    profitLoss: {
      type: Number,
      default: 0,
    },
    fees: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
orderSchema.pre('save', function (next) {
  this.totalAmount = this.quantity * this.price + this.fees;
  next();
});

// Update portfolio after order completion
orderSchema.post('save', async function (doc) {
  if (doc.status === 'completed') {
    try {
      const Portfolio = mongoose.model('Portfolio');
      const portfolio = await Portfolio.findById(doc.portfolio);
      
      if (doc.type === 'buy') {
        portfolio.cash -= doc.totalAmount;
      } else {
        portfolio.cash += doc.totalAmount;
      }
      
      // Update holdings
      const holdingIndex = portfolio.holdings.findIndex(h => h.symbol === doc.symbol);
      if (holdingIndex !== -1) {
        if (doc.type === 'buy') {
          portfolio.holdings[holdingIndex].quantity += doc.quantity;
          portfolio.holdings[holdingIndex].averagePrice = 
            (portfolio.holdings[holdingIndex].averagePrice * (portfolio.holdings[holdingIndex].quantity - doc.quantity) + 
             doc.price * doc.quantity) / portfolio.holdings[holdingIndex].quantity;
        } else {
          portfolio.holdings[holdingIndex].quantity -= doc.quantity;
          if (portfolio.holdings[holdingIndex].quantity <= 0) {
            portfolio.holdings.splice(holdingIndex, 1);
          }
        }
      } else if (doc.type === 'buy') {
        portfolio.holdings.push({
          symbol: doc.symbol,
          quantity: doc.quantity,
          averagePrice: doc.price,
        });
      }

      await portfolio.save();

      // Update achievement stats
      const Achievement = mongoose.model('Achievement');
      const achievement = await Achievement.findOne({ user: doc.user });
      if (achievement) {
        achievement.updateTradingStats({
          type: doc.type,
          profitLoss: doc.profitLoss,
        });
        await achievement.save();
      }
    } catch (error) {
      console.error('Error updating portfolio after order:', error);
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);
