const express = require('express');
const router = express.Router();
const { getShops, getShop, createShop, updateShop, getMyShop, rateShop } = require('../controllers/shopController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getShops);
router.get('/my', protect, authorize('shopkeeper'), getMyShop);
router.get('/:id', getShop);
router.post('/', protect, authorize('shopkeeper', 'admin'), createShop);
router.put('/:id', protect, authorize('shopkeeper', 'admin'), updateShop);
router.post('/:id/rate', protect, authorize('customer'), rateShop);

module.exports = router;
