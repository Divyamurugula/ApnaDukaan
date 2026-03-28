import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  FiBell, FiStar, FiUser, FiPackage,
  FiMapPin, FiPhone, FiCheckCircle,
} from 'react-icons/fi';

// ── Time ago helper ───────────────────────────────────────────────────────────
const getTimeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1)  return 'Just now';
  if (diff < 60) return `${diff} min away`;
  return `${Math.floor(diff / 60)} hr ago`;
};

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [available,  setAvailable]  = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [verifyCode, setVerifyCode] = useState({});
  const [active,     setActive]     = useState(null); // currently active delivery
  const [otp, setOtp] = useState("");
  const loadData = async () => {
    setLoading(true);
    try {
      const [availRes, myRes] = await Promise.all([
        api.get('/delivery/available'),
        api.get('/delivery/my'),
      ]);
      const avail = availRes.data.deliveries || [];
      const mine  = myRes.data.deliveries   || [];
      setAvailable(avail);
      setMyDeliveries(mine);

      // Find active delivery (picked_up or in_transit)
      const activeOne = mine.find(d =>
        ['assigned', 'picked_up', 'in_transit'].includes(d.deliveryStatus)
      );
      setActive(activeOne || null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // ── Stats ──────────────────────────────────────────────────────
  const today          = new Date().toDateString();
  const completedAll   = myDeliveries.filter(d => d.deliveryStatus === 'delivered');
  const todayDeliveries = completedAll.filter(
    d => new Date(d.deliveryTime || d.updatedAt).toDateString() === today
  );
  const todayEarnings  = todayDeliveries.length * 60;  // ₹60 per delivery
  const weekEarnings   = completedAll.slice(0, 50).length * 60; // last 50

  // ── Accept delivery ────────────────────────────────────────────
  const acceptDelivery = async (id) => {
    try {
      await api.put(`/delivery/${id}/accept`);
      toast.success('Delivery accepted!');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // ── Update status ──────────────────────────────────────────────
 const updateStatus = async (id, status) => {
  try {

    // 🔥 ADD THIS CHECK
    if (status === 'delivered' && !verifyCode[id]) {
      toast.error("Please enter OTP");
      return;
    }

    await api.put(`/delivery/${id}/status`, {
      status,
      verificationCode: verifyCode[id],
    });

    toast.success(`Marked as ${status.replace(/_/g, ' ')}`);
    loadData();

  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed');
  }
};

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Header ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🛵</span>
            </div>
            <div>
              <p className="font-bold text-gray-800 leading-tight">ApnaDukaan</p>
              <p className="text-xs text-gray-400">Delivery partner</p>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {/* Bell */}
            <div className="relative">
              <FiBell size={20} className="text-gray-500" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
            </div>

            {/* Rating badge */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
              <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold text-gray-700">4.8</span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <FiUser size={15} className="text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
            <p className="font-bold text-gray-800 text-lg">₹ {todayEarnings}</p>
            <p className="text-xs text-gray-400 mt-0.5">Today's Earnings</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
            <p className="font-bold text-gray-800 text-lg">₹ {weekEarnings}</p>
            <p className="text-xs text-gray-400 mt-0.5">This week</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
            <p className="font-bold text-gray-800 text-lg">{completedAll.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Completed</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-1 mb-0.5">
              <FiStar size={14} className="text-green-500" />
              <p className="font-bold text-gray-800 text-lg">4.8</p>
            </div>
            <p className="text-xs text-gray-400">Rating</p>
          </div>
        </div>

        {/* ── Active Delivery Banner ── */}
        {active && (
          <div className="bg-orange-500 rounded-2xl px-5 py-4 mb-5 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-base">🛵</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Active Delivery</p>
              <p className="text-orange-100 text-xs mt-0.5">
                ORD-{active.order?._id?.slice(-5).toUpperCase()} &nbsp;•&nbsp;
                {getTimeAgo(active.updatedAt || active.createdAt)}
              </p>
            </div>
          </div>
        )}

        {/* ── Active Delivery Card ── */}
        {active && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            {/* Order ID + Customer */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                  <FiPackage className="text-orange-500" size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    ORD-{active.order?._id?.slice(-5).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {active.order?.customer?.name || 'Customer'}
                  </p>
                </div>
              </div>

              {/* Earnings */}
              <div className="text-right">
                <p className="text-xs text-gray-400">Earnings</p>
                <p className="font-bold text-orange-500 text-lg">₹ 60</p>
              </div>
            </div>

            {/* Pickup */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-7 h-7 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-3 h-3 border-2 border-orange-500 rounded-full" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pickup</p>
                <p className="text-sm font-semibold text-gray-800">
                  {active.order?.shop?.shopName || 'Shop'}
                </p>
              </div>
            </div>

            {/* Delivery */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiMapPin size={13} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Delivery</p>
                <p className="text-sm font-semibold text-gray-800">
                  {active.order?.deliveryAddress?.street}, {active.order?.deliveryAddress?.city}
                </p>
              </div>
            </div>

            {/* Items count */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <span className="text-base">📦</span>
              <p className="text-xs text-gray-500">
                {active.order?.items?.length} item{active.order?.items?.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* OTP input for delivery */}
              {active.deliveryStatus === 'in_transit' && (
                <input
                  placeholder="Enter OTP from customer"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={verifyCode[active._id] || ''}
                  onChange={e => setVerifyCode(prev => ({ ...prev, [active._id]: e.target.value }))}
                />
              )}

              {/* Primary action button */}
              {active.deliveryStatus === 'assigned' && (
                <button
                  onClick={() => updateStatus(active._id, 'picked_up')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <FiCheckCircle size={16} /> Verify &amp; Picked Up
                </button>
              )}
              {active.deliveryStatus === 'picked_up' && (
                <button
                  onClick={() => updateStatus(active._id, 'in_transit')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <FiCheckCircle size={16} /> Mark In Transit
                </button>
              )}
              {active.deliveryStatus === 'in_transit' && (
                <button
                  onClick={() => updateStatus(active._id, 'delivered')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <FiCheckCircle size={16} /> Mark Delivered
                </button>
              )}

              {/* Call Customer — fixed: was missing opening <a tag */}
              {active.order?.customer?.phone && (
                <a
                  href={`tel:${active.order.customer.phone}`}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  <FiPhone size={15} /> Call Customer
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Available Deliveries ── */}
        {available.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-gray-800 mb-3">
              Available Deliveries ({available.length})
            </h2>
            <div className="space-y-3">
              {available.map(delivery => {
                const order = delivery.order;
                return (
                  <div key={delivery._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-sm text-gray-800">
                          ORD-{order?._id?.slice(-5).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">{order?.customer?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Earnings</p>
                        <p className="font-bold text-orange-500">₹ 60</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-3 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 border-2 border-orange-400 rounded-full flex-shrink-0" />
                        <span>{order?.shop?.shopName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMapPin size={10} className="text-green-500 flex-shrink-0" />
                        <span>
                          {order?.deliveryAddress?.street}, {order?.deliveryAddress?.city}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => acceptDelivery(delivery._id)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                    >
                      Accept Delivery
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── No deliveries state ── */}
        {available.length === 0 && !active && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🛵</div>
            <p className="font-medium text-gray-600">No deliveries available</p>
            <p className="text-sm mt-1">Check back soon for new orders!</p>
            <Link
              to="/delivery/my"
              className="inline-block mt-4 text-orange-500 text-sm font-medium hover:underline"
            >
              View completed deliveries →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default DeliveryDashboard;
