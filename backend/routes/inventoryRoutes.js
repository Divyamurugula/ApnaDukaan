const express = require('express');
const router = express.Router();
const { getShopInventory, updateInventory, getLowStockAlerts } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/shop/:shopId', protect, authorize('shopkeeper', 'admin'), getShopInventory);
router.get('/low-stock/:shopId', protect, authorize('shopkeeper', 'admin'), getLowStockAlerts);
router.put('/:id', protect, authorize('shopkeeper', 'admin'), updateInventory);

module.exports = router;
