import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import toast from 'react-hot-toast';

const STATUS_ACTIONS = {
  pending:          [{ label: 'Confirm Order', next: 'confirmed', cls: 'btn-primary' }, { label: 'Reject', next: 'cancelled', cls: 'text-red-600 border border-red-200 rounded-lg px-3 py-1.5 text-sm hover:bg-red-50' }],
  confirmed:        [{ label: 'Mark Packed', next: 'packed', cls: 'btn-primary' }],
  packed:           [{ label: 'Out for Delivery', next: 'out_for_delivery', cls: 'btn-primary' }],
  out_for_delivery: [],
  delivered:        [],
  cancelled:        [],
};

const ShopOrders = () => {
  const [orders, setOrders] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: shopData } = await api.get('/shops/my');
        setShop(shopData.shop);
        const { data } = await api.get(`/orders/shop?shopId=${shopData.shop._id}&limit=100`);
        setOrders(data.orders || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
      toast.success(`Order ${status}`);
    } catch { toast.error('Update failed'); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Orders</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s.replace(/_/g, ' ')}
            {s === 'all' && ` (${orders.length})`}
            {s !== 'all' && ` (${orders.filter(o => o.orderStatus === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No orders in this category</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order._id} className="card p-5">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <p className="font-bold text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{order.customer?.name} • {order.customer?.phone}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-800">₹{order.totalAmount?.toFixed(2)}</p>
                  <OrderStatusBadge status={order.orderStatus} />
                  <p className="text-xs text-gray-400 mt-1">{order.paymentMethod?.toUpperCase()} • {order.isPaid ? '✓ Paid' : 'Unpaid'}</p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.productName} ×{item.quantity}</span>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <p className="text-xs text-gray-500 mb-3">
                📍 {order.deliveryAddress?.street}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
              </p>

              {/* Actions */}
              {STATUS_ACTIONS[order.orderStatus]?.length > 0 && (
                <div className="flex gap-2">
                  {STATUS_ACTIONS[order.orderStatus].map(action => (
                    <button key={action.next} onClick={() => updateStatus(order._id, action.next)}
                      className={`text-sm px-4 py-1.5 ${action.cls}`}>
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopOrders;
