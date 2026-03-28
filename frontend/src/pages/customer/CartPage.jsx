import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQty,
    clearCart,
    itemsPrice,
    taxPrice,
    deliveryCharge,
    totalPrice
  } = useCart();

  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-400 mb-6">
          Add items from a local shop to get started.
        </p>
        <Link
          to="/shops"
          className="btn-primary inline-block px-8 py-3"
        >
          Browse Shops
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Shopping Cart ({cartItems.length} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CART ITEMS */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="card p-4 flex items-center gap-4"
            >

              {/* MAIN IMAGE */}
              <img
                src={
                  item.images?.[0] ||
                  'https://via.placeholder.com/80?text=Item'
                }
                alt={item.productName}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />

              {/* DETAILS */}
              <div className="flex-1 min-w-0">

                <h3 className="font-semibold text-gray-800 text-sm truncate">
                  {item.productName}
                </h3>

                <p className="text-xs text-gray-500">
                  {item.shop?.shopName}
                </p>

                <p className="text-green-700 font-bold mt-1">
                  ₹{(item.discountedPrice || item.price).toFixed(2)}
                </p>

                {/* 🔥 SUBSCRIPTION ITEMS IMAGES */}
                {item.type === "subscription" && item.items && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {item.items.map((subItem) => (
                      <img
                        key={subItem.id}
                        src={subItem.img}
                        alt={subItem.name}
                        className="w-8 h-8 rounded object-cover border"
                      />
                    ))}
                  </div>
                )}

              </div>

              {/* QUANTITY */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item._id, item.qty - 1)}
                  className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100"
                >
                  <FiMinus size={12} />
                </button>

                <span className="w-8 text-center text-sm font-semibold">
                  {item.qty}
                </span>

                <button
                  onClick={() => updateQty(item._id, item.qty + 1)}
                  className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100"
                >
                  <FiPlus size={12} />
                </button>
              </div>

              {/* PRICE */}
              <p className="font-bold text-gray-800 w-16 text-right">
                ₹{(
                  (item.discountedPrice || item.price) * item.qty
                ).toFixed(2)}
              </p>

              {/* REMOVE */}
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-red-400 hover:text-red-600 transition-colors p-1"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}

          {/* CLEAR CART */}
          <button
            onClick={clearCart}
            className="text-red-500 text-sm hover:underline flex items-center gap-1"
          >
            <FiTrash2 size={14} /> Clear cart
          </button>
        </div>

        {/* ORDER SUMMARY */}
        <div className="card p-5 h-fit">
          <h2 className="font-bold text-gray-800 text-lg mb-4">
            Order Summary
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Items Price</span>
              <span>₹{itemsPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Tax (5% GST)</span>
              <span>₹{taxPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span
                className={
                  deliveryCharge === 0
                    ? 'text-green-600 font-medium'
                    : ''
                }
              >
                {deliveryCharge === 0
                  ? 'FREE'
                  : `₹${deliveryCharge}`}
              </span>
            </div>

            {deliveryCharge > 0 && (
              <p className="text-xs text-gray-400">
                Free delivery above ₹500
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-green-700">
              ₹{totalPrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary w-full py-3 mt-4 text-base"
          >
            Proceed to Checkout
          </button>

          <Link
            to="/shops"
            className="block text-center text-sm text-green-600 mt-3 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CartPage;