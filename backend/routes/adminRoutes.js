const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleUserStatus, getAllOrders, getAllPayments, verifyShop, getSalesReport } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/orders', getAllOrders);
router.get('/payments', getAllPayments);
router.put('/shops/:id/verify', verifyShop);
router.get('/reports/sales', getSalesReport);

module.exports = router;
