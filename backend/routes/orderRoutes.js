const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrder, getShopOrders, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), placeOrder);
router.get('/my', protect, authorize('customer'), getMyOrders);
router.get('/shop', protect, authorize('shopkeeper', 'admin'), getShopOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('shopkeeper', 'admin', 'delivery'), updateOrderStatus);
router.put('/:id/cancel', protect, authorize('customer'), cancelOrder);

module.exports = router;
