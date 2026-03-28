const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  productName: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: String,

  // ✅ ADD THIS (IMPORTANT)
  type: {
    type: String,
    enum: ['normal', 'subscription'],
    default: 'normal'
  }
});

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: false },

    items: [orderItemSchema],

    // ✅ ADD THIS (IMPORTANT)
    hasSubscription: {
      type: Boolean,
      default: false
    },

    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },

    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true, default: 0 },
    deliveryCharge: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },

    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: ['paypal', 'upi', 'card', 'cod'],
      required: true,
    },

    isPaid: { type: Boolean, default: false },
    paidAt: Date,

    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,

    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);