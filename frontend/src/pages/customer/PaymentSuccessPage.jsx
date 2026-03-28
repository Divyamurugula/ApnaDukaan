import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';
import { FiCheckCircle } from 'react-icons/fi';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const payerId = searchParams.get('PayerID');

  useEffect(() => {
    if (paymentId && payerId && orderId) {
      api.post('/payments/paypal/execute', { paymentId, payerId, orderId })
        .then(() => clearCart())
        .catch(console.error);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
        <FiCheckCircle size={72} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-6">Your order has been placed and confirmed. Thank you for shopping with ApnaDukaan!</p>
        <div className="flex flex-col gap-3">
          {orderId && (
            <Link to={`/orders/${orderId}`} className="btn-primary py-2.5">View Order Details</Link>
          )}
          <Link to="/" className="btn-outline py-2.5">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
