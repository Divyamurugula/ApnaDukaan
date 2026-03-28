import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch { return []; }
  });
  const [shopId, setShopId] = useState(() => localStorage.getItem('cartShopId') || null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    localStorage.setItem('cartShopId', shopId || '');
  }, [cartItems, shopId]);

  /*const addToCart = (product, quantity = 1) => {
    // Enforce single-shop cart
    if (shopId && shopId !== product.shop._id && shopId !== product.shop) {
      return { error: 'You can only order from one shop at a time. Clear cart first.' };
    }
    setShopId(product.shop._id || product.shop);
    setCartItems(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) {
        return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + quantity } : i);
      }
      return [...prev, { ...product, qty: quantity }];
    });
    return { success: true };
  };

  const addToCart = (item) => {
  if (!item || !item._id) {
    console.error("Invalid item", item);
    return;
  }

  setCartItems((prev) => {
    const exists = prev.find((i) => i._id === item._id);

    if (exists) {
      return prev.map((i) =>
        i._id === item._id
          ? { ...i, qty: i.qty + item.qty }
          : i
      );
    }

    return [...prev, item];
  });
};*/
const addToCart = (item) => {
  if (!item || !item._id) {
    console.error("Invalid item", item);
    return;
  }

  const safeItem = {
    ...item,
    price: Number(item.price ?? 0),
    discountedPrice: Number(item.discountedPrice ?? item.price ?? 0),
    qty: Number(item.qty ?? 1),
  };

  setCartItems((prev) => {
    const exists = prev.find((i) => i._id === safeItem._id);

    if (exists) {
      return prev.map((i) =>
        i._id === safeItem._id
          ? { ...i, qty: i.qty + safeItem.qty }
          : i
      );
    }

    return [...prev, safeItem];
  });
};

  const removeFromCart = (productId) => {
    setCartItems(prev => {
      const updated = prev.filter(i => i._id !== productId);
      if (updated.length === 0) setShopId(null);
      return updated;
    });
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);
    setCartItems(prev => prev.map(i => i._id === productId ? { ...i, qty } : i));
  };

  const clearCart = () => {
    setCartItems([]);
    setShopId(null);
  };

  //const itemsPrice = cartItems.reduce((acc, i) => acc + (i.discountedPrice || i.price) * i.qty, 0);
  const itemsPrice = cartItems.reduce((acc, i) => {
  const price = Number(i.discountedPrice ?? i.price ?? 0);
  const qty = Number(i.qty ?? 1);
  return acc + price * qty;
}, 0);
  /*const taxPrice   = Math.round(itemsPrice * 0.05);
  const deliveryCharge = itemsPrice > 500 ? 0 : 30;
  const totalPrice = itemsPrice + taxPrice + deliveryCharge;*/
  const totalItems = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
  const deliveryCharge = itemsPrice > 500 ? 0 : 30;
  const totalPrice = Number((itemsPrice + taxPrice + deliveryCharge).toFixed(2));

  return (
    <CartContext.Provider value={{
      cartItems, shopId,
      addToCart, removeFromCart, updateQty, clearCart,
      itemsPrice, taxPrice, deliveryCharge, totalPrice, totalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
