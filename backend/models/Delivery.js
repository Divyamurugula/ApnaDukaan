const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deliveryStatus: {
      type: String,
      enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed'],
      default: 'assigned',
    },
    verificationCode: { type: String }, // OTP for delivery verification
    verificationStatus: { type: Boolean, default: false },
    pickupTime: Date,
    deliveryTime: Date,
    estimatedDelivery: Date,
    currentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
