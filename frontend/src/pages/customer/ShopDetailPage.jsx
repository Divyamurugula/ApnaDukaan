import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import Spinner from '../../components/common/Spinner';
import { FiStar, FiMapPin, FiClock, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ShopDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    api.get(`/shops/${id}`)
      .then(({ data }) => { setShop(data.shop); setProducts(data.products); })
      .catch(() => toast.error('Shop not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRate = async (r) => {
    if (!user || user.role !== 'customer') return toast.error('Please login as customer to rate');
    try {
      const { data } = await api.post(`/shops/${id}/rate`, { rating: r });
      setUserRating(r);
      setShop(prev => ({ ...prev, rating: data.rating }));
      toast.success('Rating submitted!');
    } catch { toast.error('Failed to rate'); }
  };

  if (loading) return <Spinner />;
  if (!shop) return <div className="text-center py-20 text-gray-500">Shop not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Shop Header */}
      <div className="card p-6 mb-8">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-green-50 flex-shrink-0">
            {shop.logo ? (
              <img src={shop.logo} alt={shop.shopName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-100">
                <span className="text-green-700 font-bold text-3xl">{shop.shopName[0]}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{shop.shopName}</h1>
                <p className="text-gray-500 capitalize text-sm">{shop.category}</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${shop.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {shop.isOpen ? '🟢 Open' : '🔴 Closed'}
              </span>
            </div>
            {shop.description && <p className="text-gray-600 text-sm mt-2">{shop.description}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiStar className="text-yellow-400 fill-yellow-400" />{shop.rating?.toFixed(1)} ({shop.totalRatings} ratings)</span>
              <span className="flex items-center gap-1"><FiMapPin />{shop.location?.street}, {shop.location?.city}</span>
              <span className="flex items-center gap-1"><FiClock />{shop.openingHours?.open} – {shop.openingHours?.close}</span>
              {shop.phone && <span className="flex items-center gap-1"><FiPhone />{shop.phone}</span>}
            </div>
          </div>
        </div>

        {/* Rate this shop */}
        {user?.role === 'customer' && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Rate this shop:</span>
            {[1,2,3,4,5].map(r => (
              <button key={r} onClick={() => handleRate(r)}
                className={`text-2xl transition-transform hover:scale-110 ${r <= userRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products */}
      <h2 className="section-title">Products from {shop.shopName}</h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">No products listed yet.</div>
      )}
    </div>
  );
};

export default ShopDetailPage;
