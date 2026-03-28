const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getFeaturedProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/featured', getFeaturedProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('shopkeeper', 'admin'), createProduct);
router.put('/:id', protect, authorize('shopkeeper', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('shopkeeper', 'admin'), deleteProduct);
router.post('/:id/reviews', protect, authorize('customer'), addReview);

module.exports = router;
