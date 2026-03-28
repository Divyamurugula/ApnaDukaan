import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Spinner from './components/common/Spinner';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import ShopsPage from './pages/customer/ShopsPage';
import ShopDetailPage from './pages/customer/ShopDetailPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import ProfilePage from './pages/customer/ProfilePage';
import WishlistPage from './pages/customer/WishlistPage';
import PaymentSuccessPage from './pages/customer/PaymentSuccessPage';
import PacksPage from "./pages/customer/PacksPage";
import CustomizePackPage from "./pages/customer/CustomizePackPage";
// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Shopkeeper
import ShopDashboard from './pages/shopkeeper/ShopDashboard';
import ManageProducts from './pages/shopkeeper/ManageProducts';
import ShopOrders from './pages/shopkeeper/ShopOrders';
import ShopInventory from './pages/shopkeeper/ShopInventory';
import ShopProfile from './pages/shopkeeper/ShopProfile';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReports from './pages/admin/AdminReports';

// Delivery
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import MyDeliveries from './pages/delivery/MyDeliveries';

// Protected Route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      {/*<Route path="/" element={<HomePage />} />*/}
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />
      <Route path="/shops" element={<ShopsPage />} />
      <Route path="/shops/:id" element={<ShopDetailPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />

      {/* Customer */}
      <Route path="/cart" element={<ProtectedRoute roles={['customer']}><CartPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute roles={['customer']}><CheckoutPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute roles={['customer']}><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute roles={['customer']}><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute roles={['customer']}><ProfilePage /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute roles={['customer']}><WishlistPage /></ProtectedRoute>} />
      <Route path="/payment/success" element={<ProtectedRoute roles={['customer']}><PaymentSuccessPage /></ProtectedRoute>} />
      <Route path="/packs" element={<PacksPage />} />
      <Route
  path="/customize"
  element={
    <ProtectedRoute roles={['customer']}>
      <CustomizePackPage />
    </ProtectedRoute>
  }
/>
      {/* Shopkeeper */}
      <Route path="/seller/dashboard" element={<ProtectedRoute roles={['shopkeeper']}><ShopDashboard /></ProtectedRoute>} />
      <Route path="/seller/products" element={<ProtectedRoute roles={['shopkeeper']}><ManageProducts /></ProtectedRoute>} />
      <Route path="/seller/orders" element={<ProtectedRoute roles={['shopkeeper']}><ShopOrders /></ProtectedRoute>} />
      <Route path="/seller/inventory" element={<ProtectedRoute roles={['shopkeeper']}><ShopInventory /></ProtectedRoute>} />
      <Route path="/seller/profile" element={<ProtectedRoute roles={['shopkeeper']}><ShopProfile /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />

      {/* Delivery */}
      <Route path="/delivery" element={<ProtectedRoute roles={['delivery']}><DeliveryDashboard /></ProtectedRoute>} />
      <Route path="/delivery/my" element={<ProtectedRoute roles={['delivery']}><MyDeliveries /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </div>
      </CartProvider>
    </AuthProvider>
  </Router>
);

export default App;
