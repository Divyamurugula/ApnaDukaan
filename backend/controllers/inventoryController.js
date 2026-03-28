const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

// @desc   Get shop inventory
// @route  GET /api/inventory/shop/:shopId
// @access Private (Shopkeeper)
exports.getShopInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ shop: req.params.shopId })
      .populate('product', 'productName price images isAvailable');
    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update inventory quantity
// @route  PUT /api/inventory/:id
// @access Private (Shopkeeper)
exports.updateInventory = async (req, res) => {
  try {
    const { quantity, type = 'restock', note } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });

    inventory.quantity = quantity;
    inventory.lastUpdated = Date.now();
    inventory.history.push({ type, quantity, note });
    await inventory.save();

    // Sync product stock
    await Product.findByIdAndUpdate(inventory.product, {
      stock: quantity,
      isAvailable: quantity > 0,
    });

    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get low-stock alerts
// @route  GET /api/inventory/low-stock/:shopId
// @access Private (Shopkeeper)
exports.getLowStockAlerts = async (req, res) => {
  try {
    const lowStock = await Inventory.find({
      shop: req.params.shopId,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    }).populate('product', 'productName images price');
    res.json({ success: true, count: lowStock.length, items: lowStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
