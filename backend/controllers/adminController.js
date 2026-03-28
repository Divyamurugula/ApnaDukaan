const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');

// @desc   Dashboard stats
// @route  GET /api/admin/stats
// @access Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalShops, totalOrders, payments] = await Promise.all([
      User.countDocuments(),
      Shop.countDocuments(),
      Order.countDocuments(),
      Payment.find({ paymentStatus: 'completed' }),
    ]);

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    const recentOrders = await Order.find()
      .populate('customer', 'name')
      .populate('shop', 'shopName')
      .sort({ createdAt: -1 })
      .limit(10);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    // Monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Payment.aggregate([
      { $match: { paymentStatus: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalShops, totalOrders, totalRevenue },
      recentOrders,
      ordersByStatus,
      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all users
// @route  GET /api/admin/users
// @access Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Toggle user status
// @route  PUT /api/admin/users/:id/toggle
// @access Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all orders
// @route  GET /api/admin/orders
// @access Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('shop', 'shopName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all payments
// @route  GET /api/admin/payments
// @access Private (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { paymentStatus: status } : {};
    const payments = await Payment.find(query)
      .populate('order', 'totalAmount orderStatus')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Payment.countDocuments(query);
    res.json({ success: true, payments, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Verify / reject shop
// @route  PUT /api/admin/shops/:id/verify
// @access Private (Admin)
exports.verifyShop = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const shop = await Shop.findByIdAndUpdate(req.params.id, { isVerified }, { new: true });
    res.json({ success: true, shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Generate sales report
// @route  GET /api/admin/reports/sales
// @access Private (Admin)
exports.getSalesReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = { paymentStatus: 'completed' };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const report = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productName', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    res.json({ success: true, report, topProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
