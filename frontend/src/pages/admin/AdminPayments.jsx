import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/payments')
      .then(({ data }) => setPayments(data.payments || []))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { completed: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', failed: 'bg-red-100 text-red-600', refunded: 'bg-blue-100 text-blue-700' };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment Records</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Transaction ID', 'User', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map(p => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.transactionId || p._id.slice(-10)}</td>
                <td className="px-4 py-3 text-gray-700">{p.user?.name}</td>
                <td className="px-4 py-3 font-semibold">₹{p.amount?.toFixed(2)}</td>
                <td className="px-4 py-3 uppercase text-xs">
                  <span className="badge bg-gray-100 text-gray-600">{p.paymentMethod}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge capitalize ${statusColor[p.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>{p.paymentStatus}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p className="text-center text-gray-400 py-10">No payments found.</p>}
      </div>
    </div>
  );
};

export default AdminPayments;
