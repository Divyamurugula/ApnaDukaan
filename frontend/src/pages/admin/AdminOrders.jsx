import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/orders${status ? `?status=${status}` : ''}`)
      .then(({ data }) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Orders</h1>
        <select className="input-field w-44" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending','confirmed','packed','out_for_delivery','delivered','cancelled'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order ID', 'Customer', 'Shop', 'Amount', 'Payment', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-gray-700">{order.customer?.name}</td>
                  <td className="px-4 py-3 text-gray-700">{order.shop?.shopName}</td>
                  <td className="px-4 py-3 font-semibold">₹{order.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-gray-100 text-gray-600 uppercase text-xs">{order.paymentMethod}</span>
                    {order.isPaid && <span className="ml-1 text-green-500 text-xs">✓</span>}
                  </td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.orderStatus} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center text-gray-400 py-10">No orders found.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
