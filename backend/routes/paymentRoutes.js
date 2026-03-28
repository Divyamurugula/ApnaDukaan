const express = require('express');
const router = express.Router();
const { createPayPalPayment, executePayPalPayment, confirmCOD, getPaymentByOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/paypal/create', protect, createPayPalPayment);
router.post('/paypal/execute', protect, executePayPalPayment);
router.post('/cod', protect, confirmCOD);
router.get('/order/:orderId', protect, getPaymentByOrder);

module.exports = router;
