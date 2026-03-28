import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import Spinner from '../../components/common/Spinner';
import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/wishlist')
      .then(({ data }) => setWishlist(data.wishlist || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (productId) => {
    setWishlist(prev => prev.filter(p => p._id !== productId));
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FiHeart className="text-red-500" /> My Wishlist
        <span className="text-sm font-normal text-gray-400 ml-2">({wishlist.length} items)</span>
      </h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart size={64} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 text-lg mb-4">Your wishlist is empty</p>
          <Link to="/shops" className="btn-primary inline-block px-8 py-2.5">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wishlist.map(product => (
            <ProductCard key={product._id} product={product} onWishlistToggle={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
