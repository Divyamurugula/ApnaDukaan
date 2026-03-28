import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name}!`);
      if (user.role === 'shopkeeper') navigate('/seller/dashboard');
      else if (user.role === 'delivery') navigate('/delivery');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">AD</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join ApnaDukaan today</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
          {[
            { value: 'customer', label: '🛒 Customer' },
            { value: 'shopkeeper', label: '🏪 Seller' },
            { value: 'delivery', label: '🚴 Delivery' },
          ].map(r => (
            <button key={r.value} type="button"
              onClick={() => setForm({ ...form, role: r.value })}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                form.role === r.value ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" required placeholder="Full Name"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field pl-9" />
          </div>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="email" required placeholder="Email Address"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="input-field pl-9" />
          </div>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="tel" placeholder="Phone Number (optional)"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="input-field pl-9" />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="password" required placeholder="Password (min 6 chars)"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="input-field pl-9" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
