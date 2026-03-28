import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import ShopCard from '../../components/common/ShopCard';
import ChatBot from '../../components/common/ChatBot';
import Spinner from '../../components/common/Spinner';
import { FiSearch, FiArrowRight, FiShoppingBag, FiTruck, FiShield } from 'react-icons/fi';

const CATEGORIES = [
  { name: 'Grocery',    emoji: '🛒' },
  { name: 'Vegetables', emoji: '🥦' },
  { name: 'Dairy',      emoji: '🥛' },
  { name: 'Bakery',     emoji: '🍞' },
  { name: 'Pharmacy',   emoji: '💊' },
  { name: 'Fruits',     emoji: '🍎' },
  { name: 'Beverages',  emoji: '🧃' },
  { name: 'General',    emoji: '🏪' },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [shops, setShops]       = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/shops'),
        ]);
        setFeatured(pRes.data.products || []);
        setShops(sRes.data.shops?.slice(0, 6) || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) window.location.href = `/shops?keyword=${search}`;
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Your Neighborhood<br />
            <span className="text-yellow-300">Shops, Online</span>
          </h1>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Shop fresh groceries from local stores with AI-powered recommendations and fast doorstep delivery.
          </p>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search shops, products..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
              />
            </div>
            <button type="submit" className="btn-accent px-6 py-3 rounded-xl font-semibold">
              Search
            </button>
          </form>

          {/* AI Chat hint */}
          <p className="mt-6 text-green-200 text-sm flex items-center justify-center gap-2">
            <span>💬</span>
            Try our AI assistant — ask <span className="underline italic">"show fresh vegetables nearby"</span>
          </p>
        </div>
      </section>

      {/* ── Features Strip ── */}
      <section className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-8">
          {[
            { icon: <FiShoppingBag />, text: 'Fresh Local Products' },
            { icon: <FiTruck />,       text: 'Fast Delivery' },
            { icon: <FiShield />,      text: 'Secure Payments' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-green-600 text-lg">{f.icon}</span>
              <span className="font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="section-title">Browse Categories</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              to={`/shops?category=${cat.name}`}
              className="card p-3 text-center hover:border-green-300 border-2 border-transparent hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-1">{cat.emoji}</div>
              <p className="text-xs font-semibold text-gray-700">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Nearby Shops ── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Nearby Shops</h2>
          <Link to="/shops" className="text-green-600 text-sm font-medium flex items-center gap-1 hover:underline">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        {loading ? <Spinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.length > 0
              ? shops.map(shop => <ShopCard key={shop._id} shop={shop} />)
              : <p className="text-gray-400 col-span-3 text-center py-10">No shops available yet.</p>
            }
          </div>
        )}
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Featured Products</h2>
          <Link to="/shops" className="text-green-600 text-sm font-medium flex items-center gap-1 hover:underline">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        {loading ? <Spinner /> : (
          <>
            {featured.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {featured.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-3">🛍️</p>
                <p>No featured products yet.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── AI Chatbot ── always visible floating button ── */}
      <ChatBot />
    </div>
  );
};

export default HomePage;