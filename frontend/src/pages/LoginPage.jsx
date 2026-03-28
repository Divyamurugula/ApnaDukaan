import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  /*const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Trim email (important)
      const user = await login(form.email.trim(), form.password);

      console.log("LOGGED USER:", user); // 🔍 debug

      toast.success(`Welcome back, ${user.name}!`);

      // ✅ Safe role handling
      const role = user?.role?.toLowerCase();

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'shopkeeper') {
        navigate('/seller/dashboard');
      } else if (role === 'delivery') {
        navigate('/delivery');
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };*/
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const user = await login(form.email.trim(), form.password);

    console.log("FULL USER OBJECT:", user);
    console.log("ROLE:", user?.role);

    alert("Login success. Check console.");

    // TEMP: force navigation
    navigate("/admin");

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    toast.error(err.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">AD</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to your ApnaDukaan account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="input-field pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-base mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-green-600 font-medium hover:underline"
          >
            Register here
          </Link>
        </p>

        {/* Demo Accounts */}
        <div className="mt-6 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
          <p className="font-semibold text-gray-700 mb-1">
            Demo Accounts:
          </p>
          <p>Customer: customer@demo.com / demo123</p>
          <p>Seller: seller@demo.com / demo123</p>
          <p>Admin: admin@demo.com / demo123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;