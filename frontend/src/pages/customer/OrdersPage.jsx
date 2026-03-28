import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import { FiPackage, FiChevronRight } from 'react-icons/fi';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(({ data }) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage size={64} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 text-lg mb-4">No orders yet</p>
          <Link to="/shops" className="btn-primary inline-block px-8 py-2.5">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`}
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiPackage className="text-green-600" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">
                  {order.shop?.shopName || 'Order'}
                </p>
                <p className="text-xs text-gray-500">
                  {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} •{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-800 mb-1">₹{order.totalAmount?.toFixed(2)}</p>
                <OrderStatusBadge status={order.orderStatus} />
              </div>
              <FiChevronRight className="text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
