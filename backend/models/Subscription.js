const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    productName: String,
    price: Number,
    quantity: Number,

    frequency: {
      type: String,
      enum: ['weekly', 'monthly'],
      default: 'monthly'
    },

    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active'
    },

    nextDeliveryDate: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 7); // default weekly
        return date;
      }
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);