const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Delivery = require('../models/Delivery');
const Subscription = require('../models/Subscription');
// @desc   Place new order
// @route  POST /api/orders
// @access Private (Customer)
exports.placeOrder = async (req, res) => {
  try {
    const { shopId, items, deliveryAddress, paymentMethod, deliveryCharge = 30 } = req.body;

    let itemsPrice = 0;
    const orderItems = [];
    let hasSubscription = false;

    // 🔥 BUILD ORDER ITEMS
    for (const item of items) {

      // ✅ SUBSCRIPTION ITEMS
      if (item.type === 'subscription') {
        hasSubscription = true;

        orderItems.push({
          product: null,
          productName: item.productName || 'Subscription Pack',
          price: item.price || 0,
          quantity: item.quantity,
          image: item.image || '',
          type: 'subscription'
        });

        itemsPrice += (item.price || 0) * item.quantity;
        continue;
      }

      // ✅ NORMAL PRODUCT
      const product = await Product.findById(item.productId);

      if (!product || !product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not available`
        });
      }

      const inventory = await Inventory.findOne({ product: product._id });

      if (!inventory || inventory.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.productName}`
        });
      }

      const price = product.discountedPrice || product.price;

      itemsPrice += price * item.quantity;

      orderItems.push({
        product: product._id,
        productName: product.productName,
        price,
        quantity: item.quantity,
        image: product.images[0] || '',
        type: 'normal'
      });
    }

    const taxPrice = Math.round(itemsPrice * 0.05);
    const totalAmount = itemsPrice + taxPrice + deliveryCharge;

    // ✅ CREATE ORDER FIRST (IMPORTANT)
    const order = await Order.create({
      customer: req.user.id,
      shop: shopId && typeof shopId === "string" ? shopId : null,
      items: orderItems,
      deliveryAddress,
      itemsPrice,
      taxPrice,
      deliveryCharge,
      totalAmount,
      paymentMethod,
      hasSubscription,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    // 🔥 CREATE DELIVERY (FIX)
    await Delivery.create({
      order: order._id,
      deliveryStatus: 'assigned',
      deliveryPartner: null
    });

    // ✅ CREATE SUBSCRIPTIONS
    if (hasSubscription) {
      for (const item of orderItems) {
        if (item.type === 'subscription') {
          await Subscription.create({
            user: req.user.id,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            frequency: 'monthly'
          });
        }
      }
    }

    // ✅ UPDATE STOCK
    for (const item of items) {
      if (item.type === 'subscription') continue;

      await Inventory.findOneAndUpdate(
        { product: item.productId },
        {
          $inc: { quantity: -item.quantity },
          $push: {
            history: {
              type: 'sale',
              quantity: -item.quantity,
              note: `Order ${order._id}`
            }
          },
          lastUpdated: Date.now(),
        }
      );

      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // ✅ RESPONSE
    res.status(201).json({ success: true, order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get my orders
// @route  GET /api/orders/my
// @access Private (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('shop', 'shopName')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single order
// @route  GET /api/orders/:id
// @access Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('shop', 'shopName phone location')
      .populate('items.product', 'productName images');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Authorization check
    const isOwner = order.customer._id.toString() === req.user.id;
    const isShopkeeper =
      req.user.role === 'shopkeeper' || req.user.role === 'admin' || req.user.role === 'delivery';
    if (!isOwner && !isShopkeeper)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const delivery = await Delivery.findOne({ order: order._id }).populate(
      'deliveryPartner',
      'name phone'
    );
    res.json({ success: true, order, delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get shop orders
// @route  GET /api/orders/shop
// @access Private (Shopkeeper)
exports.getShopOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { shop: req.query.shopId };
    if (status) query.orderStatus = status;

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update order status (shopkeeper/delivery/admin)
// @route  PUT /api/orders/:id/status
// @access Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = status;
    order.statusHistory.push({ status, note: note || '' });

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    await order.save();

    // Create delivery record when order is confirmed
    if (status === 'confirmed') {
      await Delivery.create({ order: order._id, deliveryStatus: 'assigned' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Cancel order
// @route  PUT /api/orders/:id/cancel
// @access Private (Customer)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.customer.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    if (!['pending', 'confirmed'].includes(order.orderStatus))
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });

    order.orderStatus = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        {
          $inc: { quantity: item.quantity },
          $push: { history: { type: 'adjustment', quantity: item.quantity, note: 'Order cancelled' } },
        }
      );
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    res.json({ success: true, message: 'Order cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
