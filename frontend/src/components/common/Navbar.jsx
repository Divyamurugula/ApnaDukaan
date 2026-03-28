import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut,
  FiHeart, FiPackage, FiSettings, FiTruck, FiBarChart2
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'shopkeeper') return '/seller/dashboard';
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'delivery') return '/delivery';
    return '/profile';
  };

  // ✅ Active link style
  const navStyle = ({ isActive }) =>
    `px-3 py-1 rounded-full font-medium transition ${
      isActive
        ? 'bg-green-500 text-white'
        : 'text-gray-600 hover:text-green-600 hover:bg-green-100'
    }`;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AD</span>
            </div>
            <span className="font-bold text-xl text-green-700">ApnaDukaan</span>
          </NavLink>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-4">

            <NavLink to="/" className={navStyle}>
              Home
            </NavLink>

            <NavLink to="/shops" className={navStyle}>
              Shops
            </NavLink>

            {(!user || user.role === 'customer') && (
              <NavLink to="/packs" className={navStyle}>
                Packs
              </NavLink>
            )}

            {user?.role === 'customer' && (
              <>
                <NavLink to="/orders" className={navStyle}>
                  Orders
                </NavLink>

                <NavLink to="/wishlist" className={navStyle}>
                  Wishlist
                </NavLink>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* Cart */}
            {(!user || user.role === 'customer') && (
              <NavLink to="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition">
                <FiShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {totalItems}
                  </span>
                )}
              </NavLink>
            )}

            {/* Auth */}
            {!user ? (
              <div className="flex items-center gap-2">
                <NavLink to="/login" className="text-gray-600 hover:text-green-600 font-medium hidden sm:block">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn-primary text-sm py-1.5 px-4 hidden sm:block">
                  Register
                </NavLink>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FiUser className="text-green-700" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>

                    <NavLink
                      to={getDashboardLink()}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {user.role === 'admin' ? <FiBarChart2 /> : user.role === 'delivery' ? <FiTruck /> : <FiSettings />}
                      Dashboard
                    </NavLink>

                    {user.role === 'customer' && (
                      <>
                        <NavLink
                          to="/orders"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiPackage /> My Orders
                        </NavLink>

                        <NavLink
                          to="/wishlist"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiHeart /> Wishlist
                        </NavLink>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">

          <NavLink to="/" onClick={() => setMenuOpen(false)} className={navStyle}>
            Home
          </NavLink>

          <NavLink to="/shops" onClick={() => setMenuOpen(false)} className={navStyle}>
            Shops
          </NavLink>

          {(!user || user.role === 'customer') && (
            <NavLink to="/packs" onClick={() => setMenuOpen(false)} className={navStyle}>
              Packs
            </NavLink>
          )}

          {!user ? (
            <>
              <NavLink to="/login" onClick={() => setMenuOpen(false)} className="text-gray-700">
                Login
              </NavLink>
              <NavLink to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center">
                Register
              </NavLink>
            </>
          ) : (
            <button onClick={handleLogout} className="text-red-600 font-medium text-left">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;