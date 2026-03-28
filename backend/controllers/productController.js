const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Shop = require('../models/Shop');

// @desc   Get all products (with filters)
// @route  GET /api/products
// @access Public
exports.getProducts = async (req, res) => {
  try {
    const { keyword, category, shop, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const query = {};

    if (keyword) query.$text = { $search: keyword };
    if (category) query.category = category;
    if (shop) query.shop = shop;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    query.isAvailable = true;

    const sortOptions = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
    };

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      //.populate('category', 'name')
      .populate('shop', 'shopName location rating')
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single product
// @route  GET /api/products/:id
// @access Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      //.populate('category', 'name')
      .populate('shop', 'shopName location rating phone isOpen')
      .populate('reviews.user', 'name avatar');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create product
// @route  POST /api/products
// @access Private (Shopkeeper)
exports.createProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ shopkeeper: req.user.id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const product = await Product.create({ ...req.body, shop: shop._id });

    // Create inventory record
    await Inventory.create({ product: product._id, shop: shop._id, quantity: req.body.stock || 0 });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update product
// @route  PUT /api/products/:id
// @access Private (Shopkeeper)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.shop.shopkeeper.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Sync inventory quantity
    if (req.body.stock !== undefined) {
      await Inventory.findOneAndUpdate(
        { product: product._id },
        { quantity: req.body.stock, lastUpdated: Date.now() }
      );
    }

    res.json({ success: true, product: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete product
// @route  DELETE /api/products/:id
// @access Private (Shopkeeper)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.shop.shopkeeper.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await product.deleteOne();
    await Inventory.findOneAndDelete({ product: product._id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Add review
// @route  POST /api/products/:id/reviews
// @access Private (Customer)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id
    );
    if (alreadyReviewed)
      return res.status(400).json({ success: false, message: 'Already reviewed' });

    product.reviews.push({ user: req.user.id, rating, comment });
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    await product.save();

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get featured / nearby products
// @route  GET /api/products/featured
// @access Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isAvailable: true })
      .populate('shop', 'shopName')
      //.populate('category', 'name')
      .limit(12);
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
