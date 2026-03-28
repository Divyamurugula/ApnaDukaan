const express = require('express');
const router = express.Router();
const { getAvailableDeliveries, acceptDelivery, updateDeliveryStatus, getMyDeliveries, updateLocation } = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/available', protect, authorize('delivery'), getAvailableDeliveries);
router.get('/my', protect, authorize('delivery'), getMyDeliveries);
router.put('/:id/accept', protect, authorize('delivery'), acceptDelivery);
router.put('/:id/status', protect, authorize('delivery'), updateDeliveryStatus);
router.put('/:id/location', protect, authorize('delivery'), updateLocation);

module.exports = router;
