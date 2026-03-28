const Shop = require('../models/Shop');
const Product = require('../models/Product');

// @desc   Get all shops (with location filter)
// @route  GET /api/shops
// @access Public
exports.getShops = async (req, res) => {
  try {
    const { city, category, keyword, lat, lng, radius = 10 } = req.query;
    const query = { isActive: true };

    if (city) query['location.city'] = new RegExp(city, 'i');
    if (category) query.category = category;
    if (keyword) query.shopName = new RegExp(keyword, 'i');

    let shops;
    if (lat && lng) {
      shops = await Shop.find({
        ...query,
        'location.coordinates': {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: radius * 1000,
          },
        },
      }).populate('shopkeeper', 'name phone');
    } else {
      shops = await Shop.find(query).populate('shopkeeper', 'name phone').sort({ rating: -1 });
    }

    res.json({ success: true, count: shops.length, shops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single shop
// @route  GET /api/shops/:id
// @access Public
exports.getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('shopkeeper', 'name phone email');
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const products = await Product.find({ shop: shop._id, isAvailable: true })
      .populate('category', 'name')
      .limit(20);

    res.json({ success: true, shop, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create shop
// @route  POST /api/shops
// @access Private (Shopkeeper)
exports.createShop = async (req, res) => {
  try {
    const existingShop = await Shop.findOne({ shopkeeper: req.user.id });
    if (existingShop)
      return res.status(400).json({ success: false, message: 'You already have a shop' });

    const shop = await Shop.create({ ...req.body, shopkeeper: req.user.id });
    res.status(201).json({ success: true, shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update shop
// @route  PUT /api/shops/:id
// @access Private (Shopkeeper)
exports.updateShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    if (shop.shopkeeper.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const updated = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, shop: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get my shop (shopkeeper)
// @route  GET /api/shops/my
// @access Private (Shopkeeper)
exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ shopkeeper: req.user.id });
    if (!shop) return res.status(404).json({ success: false, message: 'No shop found' });
    res.json({ success: true, shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Rate a shop
// @route  POST /api/shops/:id/rate
// @access Private (Customer)
exports.rateShop = async (req, res) => {
  try {
    const { rating } = req.body;
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const newTotal = shop.totalRatings + 1;
    const newRating = (shop.rating * shop.totalRatings + Number(rating)) / newTotal;
    shop.rating = Math.round(newRating * 10) / 10;
    shop.totalRatings = newTotal;
    await shop.save();

    res.json({ success: true, rating: shop.rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
