import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import { FiRefreshCw, FiPlus, FiPackage } from 'react-icons/fi';

const ShopDashboard = () => {
  const [shop, setShop]       = useState(null);
  const [orders, setOrders]   = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data: shopData } = await api.get('/shops/my');
      setShop(shopData.shop);

      const [ordRes, stockRes, prodRes] = await Promise.all([
        api.get(`/orders/shop?shopId=${shopData.shop._id}&limit=10`),
        api.get(`/inventory/low-stock/${shopData.shop._id}`),
        api.get(`/products?shop=${shopData.shop._id}&limit=100`),
      ]);
      setOrders(ordRes.data.orders   || []);
      setLowStock(stockRes.data.items || []);
      setProducts(prodRes.data.products || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <Spinner />;

  // ── Stats ──────────────────────────────────────────────────────
  const today        = new Date().toDateString();
  const todayOrders  = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayRevenue = todayOrders.filter(o => o.isPaid).reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // Mock yesterday revenue for % change (replace with real API if needed)
  const yesterdayRevenue = todayRevenue > 0 ? todayRevenue * 0.9 : 0;
  const revenueChange    = yesterdayRevenue > 0
    ? (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1)
    : 0;

  // No shop yet
  if (!shop) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Shop Found</h2>
        <p className="text-gray-400 mb-6">Set up your shop to start selling.</p>
        <Link to="/seller/profile" className="btn-primary inline-block px-8 py-2.5">
          Create Your Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Nav Bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-orange-500 text-xl">🏪</span>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">ApnaDukaan</p>
              <p className="text-xs text-gray-400">Seller Dashboard</p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            {[
              { label: 'Overview',  to: '/seller/dashboard' },
              { label: 'Inventory', to: '/seller/inventory' },
              { label: 'Orders',    to: '/seller/orders' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Add Product Button */}
          <Link
            to="/seller/products"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <FiPlus size={16} /> Add Product
          </Link>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Refresh Button ── */}
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 text-sm font-medium px-4 py-2 rounded-xl mb-6 bg-white transition-colors"
        >
          <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          {/* Today's Revenue */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Today's Revenue</p>
            <p className="text-2xl font-bold text-gray-800">
              ₹ {todayRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-xs mt-1">
              <span className={`font-semibold ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {revenueChange >= 0 ? '+' : ''}{revenueChange}%
              </span>
              <span className="text-gray-400 ml-1">vs Yesterday</span>
            </p>
          </div>

          {/* Orders Today */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Orders today</p>
            <p className="text-2xl font-bold text-gray-800">{todayOrders.length}</p>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Total products</p>
            <p className="text-2xl font-bold text-gray-800">{products.length}</p>
          </div>

          {/* New Customers (unique customers today) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">New Customers</p>
            <p className="text-2xl font-bold text-gray-800">
              {new Set(todayOrders.map(o => o.customer?._id)).size}
            </p>
          </div>

        </div>

        {/* ── Recent Orders + Low Stock ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">Recent Orders</h2>
              <Link to="/seller/orders" className="text-orange-500 text-xs font-medium hover:underline">
                View all
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FiPackage size={40} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {orders.slice(0, 6).map(order => {
                  const timeAgo = getTimeAgo(order.createdAt);
                  return (
                    <div
                      key={order._id}
                      onClick={() => navigate('/seller/orders')}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-sm text-gray-800">
                          {order.customer?.name || 'Customer'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          ORD-{order._id.slice(-5).toUpperCase()} &nbsp;•&nbsp;
                          {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-sm text-gray-800">
                            ₹{order.totalAmount?.toFixed(0)}
                          </p>
                          <p className="text-xs text-gray-400">{timeAgo}</p>
                        </div>
                        <StatusPill status={order.orderStatus} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">Low stock alert</h2>
            </div>

            {lowStock.length === 0 ? (
              <div className="text-center py-10 px-4 text-gray-400">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-sm">All stock levels healthy</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-50">
                  {lowStock.slice(0, 4).map(item => (
                    <div key={item._id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-gray-800 leading-tight">
                          {item.product?.productName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          ({item.quantity} left)
                        </p>
                      </div>
                      <Link
                        to="/seller/inventory"
                        className="text-xs font-semibold border border-orange-300 text-orange-500 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ml-2"
                      >
                        Restock
                      </Link>
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                <div className="p-4">
                  <Link
                    to="/seller/inventory"
                    className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold text-center py-2.5 rounded-xl transition-colors"
                  >
                    View All
                  </Link>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// ── Helper: Status Pill ───────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const map = {
    pending:          { label: 'Processing', color: 'bg-orange-100 text-orange-600' },
    confirmed:        { label: 'Confirmed',  color: 'bg-blue-100 text-blue-600' },
    packed:           { label: 'Packed',     color: 'bg-purple-100 text-purple-600' },
    out_for_delivery: { label: 'On the way', color: 'bg-cyan-100 text-cyan-600' },
    delivered:        { label: 'Delivered',  color: 'bg-green-100 text-green-600' },
    cancelled:        { label: 'Cancelled',  color: 'bg-red-100 text-red-500' },
  };
  const cfg = map[status] || { label: status, color: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

// ── Helper: Time ago ──────────────────────────────────────────────────────────
const getTimeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

export default ShopDashboard;