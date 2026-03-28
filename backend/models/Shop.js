const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true, trim: true },
    shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['grocery', 'vegetables', 'dairy', 'bakery', 'general', 'pharmacy', 'other'],
      default: 'general',
    },
    location: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        type: { type: String, enum: 'Point' },
        coordinates: { type: [Number], default: undefined}// [lng, lat]
      },
    },
    phone: String,
    email: String,
    logo: { type: String, default: '' },
    images: [String],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    openingHours: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

shopSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Shop', shopSchema);
