const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const idx = user.wishlist.indexOf(req.params.productId);
    if (idx === -1) user.wishlist.push(req.params.productId);
    else user.wishlist.splice(idx, 1);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      populate: { path: 'shop category', select: 'shopName name' }
    });
    res.json({ success: true, wishlist: user.wishlist });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
