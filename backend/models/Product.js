const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, default: null },
    discountPercent: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ['Grocery', 'Vegetables', 'Dairy', 'Bakery', 'Pharmacy', 'General', 'Fruits', 'Beverages'],
      required: true,
    },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    images: [String],
    unit: { type: String, default: 'piece' }, // kg, litre, piece, dozen
    stock: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

productSchema.index({ productName: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
