import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import ShopCard from '../../components/common/ShopCard';
import Spinner from '../../components/common/Spinner';
import { FiSearch, FiFilter } from 'react-icons/fi';

const CATEGORIES = ['all','grocery','vegetables','dairy','bakery','pharmacy','general','other'];

const ShopsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');

  const fetchShops = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (category && category !== 'all') params.category = category;
      const { data } = await api.get('/shops', { params });
      setShops(data.shops || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchShops(); }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ keyword, category });
    fetchShops();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Local Shops</h1>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Search shops..."
              className="input-field pl-9"
            />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
        </form>

        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" size={16} />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="input-field w-40"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          <p className="text-sm text-gray-500 mb-4">{shops.length} shops found</p>
          {shops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map(shop => <ShopCard key={shop._id} shop={shop} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🏪</p>
              <p className="text-gray-500 text-lg">No shops found. Try a different search.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShopsPage;
