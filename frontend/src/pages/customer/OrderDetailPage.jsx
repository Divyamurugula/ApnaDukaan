import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import { FiPackage, FiMapPin, FiClock, FiTruck } from 'react-icons/fi';

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => { setOrder(data.order); setDelivery(data.delivery); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found.</div>;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          <p className="text-sm text-gray-500 mt-1">#{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      {/* Tracking Progress */}
      {order.orderStatus !== 'cancelled' && (
        <div className="card p-5 mb-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiTruck className="text-green-600" />Track Order</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-1 bg-gray-100 z-0" />
            <div className="absolute left-0 top-4 h-1 bg-green-500 z-0 transition-all duration-500"
              style={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }} />
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  i <= currentStep ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  {i < currentStep ? '✓' : <span className="text-xs">{i + 1}</span>}
                </div>
                <span className="text-xs text-center text-gray-500 hidden sm:block capitalize">
                  {step.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiPackage className="text-green-600" />Items Ordered</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img
                src={item.image || 'https://via.placeholder.com/60?text=Item'}
                alt={item.productName}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">{item.productName}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
              </div>
              <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500"><span>Items</span><span>₹{order.itemsPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Tax</span><span>₹{order.taxPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span></div>
          <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-100">
            <span>Total</span><span className="text-green-700">₹{order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiMapPin className="text-green-600" />Delivery Address</h2>
        <p className="text-sm text-gray-700">
          {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
        </p>
      </div>

      {/* Status History */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiClock className="text-green-600" />Order Timeline</h2>
        <div className="relative pl-5 border-l-2 border-green-100 space-y-4">
          {order.statusHistory?.map((h, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[21px] w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              <p className="font-medium text-sm capitalize text-gray-800">{h.status?.replace(/_/g, ' ')}</p>
              {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
              <p className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      <Link to="/orders" className="mt-6 inline-block text-green-600 text-sm hover:underline">← Back to Orders</Link>
    </div>
  );
};

export default OrderDetailPage;
