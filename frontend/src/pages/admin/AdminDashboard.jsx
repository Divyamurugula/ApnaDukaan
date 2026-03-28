import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import { FiUsers, FiShoppingBag, FiPackage, FiDollarSign } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const statCards = [
    { label: 'Total Users', value: stats?.stats.totalUsers, icon: <FiUsers />, color: 'text-blue-600 bg-blue-50', link: '/admin/users' },
    { label: 'Total Shops', value: stats?.stats.totalShops, icon: <FiShoppingBag />, color: 'text-purple-600 bg-purple-50', link: '/admin/users' },
    { label: 'Total Orders', value: stats?.stats.totalOrders, icon: <FiPackage />, color: 'text-orange-600 bg-orange-50', link: '/admin/orders' },
    { label: 'Total Revenue', value: `₹${stats?.stats.totalRevenue?.toFixed(0)}`, icon: <FiDollarSign />, color: 'text-green-600 bg-green-50', link: '/admin/payments' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <Link key={i} to={s.link} className="card p-4 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4">Orders by Status</h2>
          <div className="space-y-2">
            {stats?.ordersByStatus?.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <OrderStatusBadge status={s._id} />
                <span className="font-bold text-gray-800">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Nav */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/admin/users', label: 'Manage Users', emoji: '👥' },
              { to: '/admin/orders', label: 'View Orders', emoji: '📦' },
              { to: '/admin/payments', label: 'Payments', emoji: '💳' },
              { to: '/admin/reports', label: 'Reports', emoji: '📊' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="card p-3 text-center hover:shadow-md border-2 border-transparent hover:border-green-200">
                <div className="text-2xl mb-1">{link.emoji}</div>
                <p className="text-xs font-medium text-gray-700">{link.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-green-600 text-sm hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order ID', 'Customer', 'Shop', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left pb-2 font-semibold text-gray-600 text-xs uppercase pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.recentOrders?.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="py-2.5 pr-4 text-gray-700">{order.customer?.name}</td>
                  <td className="py-2.5 pr-4 text-gray-700">{order.shop?.shopName}</td>
                  <td className="py-2.5 pr-4 font-semibold">₹{order.totalAmount?.toFixed(0)}</td>
                  <td className="py-2.5 pr-4"><OrderStatusBadge status={order.orderStatus} /></td>
                  <td className="py-2.5 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
