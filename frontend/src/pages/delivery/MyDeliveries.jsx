import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiTruck, FiCheckCircle, FiMapPin } from 'react-icons/fi';

const STATUS_ACTIONS = {
  assigned:   [{ label: 'Picked Up from Shop', next: 'picked_up', cls: 'btn-primary' }],
  picked_up:  [{ label: 'Mark In Transit', next: 'in_transit', cls: 'btn-primary' }],
  in_transit: [{ label: 'Mark Delivered', next: 'delivered', cls: 'btn-primary', needsCode: true }],
};

const MyDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyCode, setVerifyCode] = useState({});

  useEffect(() => {
    api.get('/delivery/my')
      .then(({ data }) => setDeliveries(data.deliveries || []))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status, code) => {
    try {
      await api.put(`/delivery/${id}/status`, { status, verificationCode: code });
      setDeliveries(prev => prev.map(d => d._id === id ? { ...d, deliveryStatus: status } : d));
      toast.success(`Status updated to ${status.replace(/_/g, ' ')}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FiTruck className="text-green-600" /> My Deliveries
      </h1>

      {deliveries.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FiTruck size={64} className="mx-auto text-gray-200 mb-4" />
          <p>No deliveries assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map(delivery => {
            const order = delivery.order;
            const actions = STATUS_ACTIONS[delivery.deliveryStatus] || [];
            return (
              <div key={delivery._id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">Order #{order?._id?.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">₹{order?.totalAmount?.toFixed(2)}</p>
                  </div>
                  <span className={`badge capitalize text-xs ${
                    delivery.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                    delivery.deliveryStatus === 'failed' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {delivery.deliveryStatus?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <FiMapPin size={11} />
                    <span>{order?.shop?.shopName} — {order?.shop?.location?.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiMapPin size={11} />
                    <span>{order?.customer?.name} — {order?.customer?.address?.city}</span>
                  </div>
                </div>

                {delivery.pickupTime && (
                  <p className="text-xs text-gray-400 mb-3">
                    Picked up: {new Date(delivery.pickupTime).toLocaleString('en-IN')}
                  </p>
                )}

                {actions.map(action => (
                  <div key={action.next}>
                    {action.needsCode && (
                      <input
                        placeholder="Enter delivery OTP from customer"
                        className="input-field mb-2 text-sm"
                        value={verifyCode[delivery._id] || ''}
                        onChange={e => setVerifyCode(prev => ({ ...prev, [delivery._id]: e.target.value }))}
                      />
                    )}
                    <button
                      onClick={() => updateStatus(delivery._id, action.next, verifyCode[delivery._id])}
                      className={`${action.cls} w-full py-2.5 flex items-center justify-center gap-2 text-sm`}
                    >
                      <FiCheckCircle size={15} /> {action.label}
                    </button>
                  </div>
                ))}

                {delivery.deliveryStatus === 'delivered' && (
                  <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                    <FiCheckCircle /> Delivered on {delivery.deliveryTime ? new Date(delivery.deliveryTime).toLocaleString('en-IN') : '—'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDeliveries;
