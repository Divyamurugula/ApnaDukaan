import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ProductCard = ({ product, onWishlistToggle }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    const result = addToCart(product);
    if (result?.error) toast.error(result.error);
    else toast.success(`${product.productName} added to cart!`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login first');
    try {
      await api.post(`/users/wishlist/${product._id}`);
      toast.success('Wishlist updated!');
      onWishlistToggle && onWishlistToggle(product._id);
    } catch { toast.error('Failed to update wishlist'); }
  };

  const discountPercent = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className="card group block">
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=Product'}
          alt={product.productName}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {discountPercent}% OFF
          </span>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:text-red-500 transition-colors"
        >
          <FiHeart size={14} />
        </button>
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-500 mb-1 truncate">{product.shop?.shopName}</p>
        <h3 className="font-semibold text-gray-800 text-sm truncate mb-1">{product.productName}</h3>

        <div className="flex items-center gap-1 mb-2">
          <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-gray-600">{product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">
              ₹{(product.discountedPrice || product.price).toFixed(2)}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs text-gray-400 line-through ml-1">₹{product.price}</span>
            )}
          </div>
          {product.isAvailable && user?.role === 'customer' && (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <FiShoppingCart size={12} /> Add
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
