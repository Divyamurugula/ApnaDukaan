const paypal = require('paypal-rest-sdk');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// @desc   Create PayPal payment
// @route  POST /api/payments/paypal/create
// @access Private
exports.createPayPalPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const paymentData = {
      intent: 'sale',
      payer: { payment_method: 'paypal' },
      redirect_urls: {
        return_url: `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      },
      transactions: [
        {
          amount: { total: order.totalAmount.toString(), currency: 'USD' },
          description: `ApnaDukaan Order #${orderId}`,
        },
      ],
    };

    paypal.payment.create(paymentData, async (error, payment) => {
      if (error) return res.status(500).json({ success: false, message: error.message });

      const approvalUrl = payment.links.find((l) => l.rel === 'approval_url').href;

      await Payment.create({
        order: orderId,
        user: req.user.id,
        paymentMethod: 'paypal',
        amount: order.totalAmount,
        paypalOrderId: payment.id,
        paymentStatus: 'pending',
        gatewayResponse: payment,
      });

      res.json({ success: true, approvalUrl, paymentId: payment.id });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Execute PayPal payment
// @route  POST /api/payments/paypal/execute
// @access Private
exports.executePayPalPayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    paypal.payment.execute(paymentId, { payer_id: payerId }, async (error, payment) => {
      if (error) return res.status(500).json({ success: false, message: error.message });

      if (payment.state === 'approved') {
        // Update payment record
        await Payment.findOneAndUpdate(
          { paypalOrderId: paymentId },
          {
            paymentStatus: 'completed',
            transactionId: payment.transactions[0].related_resources[0].sale.id,
            paypalPayerId: payerId,
            gatewayResponse: payment,
          }
        );

        // Update order
        await Order.findByIdAndUpdate(orderId, {
          isPaid: true,
          paidAt: Date.now(),
          orderStatus: 'confirmed',
          $push: { statusHistory: { status: 'confirmed', note: 'Payment received via PayPal' } },
        });

        return res.json({ success: true, message: 'Payment successful', payment });
      }
      res.status(400).json({ success: false, message: 'Payment not approved' });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   COD payment confirmation
// @route  POST /api/payments/cod
// @access Private
exports.confirmCOD = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await Payment.create({
      order: orderId,
      user: req.user.id,
      paymentMethod: 'cod',
      amount: order.totalAmount,
      paymentStatus: 'pending',
      transactionId: `COD-${orderId}`,
    });

    await Order.findByIdAndUpdate(orderId, {
      orderStatus: 'confirmed',
      $push: { statusHistory: { status: 'confirmed', note: 'COD order confirmed' } },
    });

    res.json({ success: true, message: 'COD order confirmed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get payment by order
// @route  GET /api/payments/order/:orderId
// @access Private
exports.getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId });
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
