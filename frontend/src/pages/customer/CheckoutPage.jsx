import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi';

const CheckoutPage = () => {
  const { cartItems, itemsPrice, taxPrice, deliveryCharge, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ✅ Separate items
  const subscriptionItems = cartItems.filter(item => item.type === "subscription");

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address.street || !address.city || !address.pincode) {
      return toast.error('Please fill in all address fields');
    }

    setLoading(true);

    try {
      const orderItems = cartItems.map(i => ({
        productId: i.type === "subscription" ? null : i._id, // ✅ FIX
        productName: i.productName,
        price: i.price,
        quantity: i.qty,
        image: i.images?.[0] || '',
        type: i.type || "normal"
      }));

      // ✅ FIX: Extract valid shopId
      const extractedShopId =
        cartItems.length > 0
          ? (typeof cartItems[0].shop === "object"
              ? cartItems[0].shop?._id
              : cartItems[0].shop)
          : null;

      console.log("SHOP ID:", extractedShopId); // debug

      const { data } = await api.post('/orders', {
        shopId: extractedShopId,
        items: orderItems,
        deliveryAddress: address,
        paymentMethod,
        deliveryCharge,
      });

      if (paymentMethod === 'cod') {
        await api.post('/payments/cod', { orderId: data.order._id });
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${data.order._id}`);
      } else if (paymentMethod === 'paypal') {
        const { data: payData } = await api.post('/payments/paypal/create', {
          orderId: data.order._id
        });
        window.location.href = payData.approvalUrl;
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* Address */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiMapPin className="text-green-600" /> Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <input className="input-field"
                  value={address.street}
                  onChange={e => setAddress({...address, street: e.target.value})}
                  placeholder="Street" required />
              </div>

              <input className="input-field"
                value={address.city}
                onChange={e => setAddress({...address, city: e.target.value})}
                placeholder="City" required />

              <input className="input-field"
                value={address.state}
                onChange={e => setAddress({...address, state: e.target.value})}
                placeholder="State" />

              <input className="input-field"
                value={address.pincode}
                onChange={e => setAddress({...address, pincode: e.target.value})}
                placeholder="Pincode" required />
            </div>
          </div>

          {/* Subscription UI */}
          {subscriptionItems.length > 0 && (
            <div className="card p-5 bg-green-50 border border-green-200">
              <h2 className="font-bold text-green-700 mb-3">Subscription Items</h2>

              {subscriptionItems.map(item => (
                <div key={item._id} className="flex justify-between text-sm mb-2">
                  <span>{item.productName}</span>
                  <span>₹{item.price}</span>
                </div>
              ))}

              <p className="text-xs text-gray-500 mt-2">
                These items will be delivered regularly.
              </p>
            </div>
          )}

          {/* Payment */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-green-600" /> Payment Method
            </h2>

            {['cod','paypal'].map(m => (
              <label key={m}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer
                ${paymentMethod === m ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>

                <input type="radio"
                  value={m}
                  checked={paymentMethod === m}
                  onChange={() => setPaymentMethod(m)}
                  className="sr-only" />

                <span>{m === 'cod' ? '💵' : '💳'}</span>
                <span>{m === 'cod' ? 'Cash on Delivery' : 'PayPal'}</span>

                {paymentMethod === m && <FiCheck className="ml-auto text-green-600" />}
              </label>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="card p-5 h-fit">
          <h2 className="font-bold text-gray-800 text-lg mb-4">Order Summary</h2>

          {cartItems.map(item => (
            <div key={item._id} className="flex justify-between text-sm mb-2">
              <span>{item.productName} ×{item.qty}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}

          <div className="border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span><span>₹{itemsPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span><span>₹{taxPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
            </div>
          </div>

          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-green-700">₹{totalPrice}</span>
          </div>

          <button type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4">
            {loading ? "Placing..." : `Place Order ₹${totalPrice}`}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CheckoutPage;