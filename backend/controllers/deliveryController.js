const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// @desc   Get available deliveries for delivery partner
// @route  GET /api/delivery/available
// @access Private (Delivery)
exports.getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliveryPartner: null, deliveryStatus: 'assigned' })
      .populate({ path: 'order', populate: [{ path: 'shop', select: 'shopName location' }, { path: 'customer', select: 'name phone address' }] });
    res.json({ success: true, deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Accept delivery
// @route  PUT /api/delivery/:id/accept
// @access Private (Delivery)
exports.acceptDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    if (delivery.deliveryPartner) {
      return res.status(400).json({ success: false, message: 'Already assigned' });
    }

    // 🔥 GENERATE OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    delivery.deliveryPartner = req.user.id;
    delivery.deliveryStatus = 'picked_up';
    delivery.pickupTime = Date.now();
    delivery.verificationCode = otp;

    await delivery.save();

    // ✅ UPDATE ORDER
    await Order.findByIdAndUpdate(delivery.order, {
      orderStatus: 'out_for_delivery',
      $push: {
        statusHistory: {
          status: 'out_for_delivery',
          note: 'Picked up by delivery partner'
        }
      }
    });

    // 🔥 (TEMP) SEND OTP IN RESPONSE (later send via SMS)
    res.json({ success: true, delivery, otp });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update delivery status
// @route  PUT /api/delivery/:id/status
// @access Private (Delivery)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status, verificationCode } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    if (delivery.deliveryPartner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    // Verify OTP on delivery
    if (status === 'delivered') {
      if (delivery.verificationCode && delivery.verificationCode !== verificationCode)
        return res.status(400).json({ success: false, message: 'Invalid verification code' });
      delivery.verificationStatus = true;
      delivery.deliveryTime = Date.now();

      // Mark order delivered
      await Order.findByIdAndUpdate(delivery.order, {
        orderStatus: 'delivered',
        isDelivered: true,
        deliveredAt: Date.now(),
        $push: { statusHistory: { status: 'delivered', note: 'Delivered successfully' } },
      });

      // Mark COD payment as completed
      await Payment.findOneAndUpdate(
        { order: delivery.order, paymentMethod: 'cod' },
        { paymentStatus: 'completed' }
      );
    }

    if (status === 'picked_up') delivery.pickupTime = Date.now();

    delivery.deliveryStatus = status;
    await delivery.save();

    res.json({ success: true, delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get my deliveries
// @route  GET /api/delivery/my
// @access Private (Delivery)
exports.getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliveryPartner: req.user.id })
      .populate({ path: 'order', populate: { path: 'shop customer', select: 'shopName name phone address' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update delivery location
// @route  PUT /api/delivery/:id/location
// @access Private (Delivery)
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { currentLocation: { lat, lng, updatedAt: Date.now() } },
      { new: true }
    );
    res.json({ success: true, delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
