import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <FiUser className="text-green-600" size={28} />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize mt-1 inline-block">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input className="input-field pl-9" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input className="input-field pl-9 bg-gray-50" value={user?.email} disabled />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input className="input-field pl-9" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1"><FiMapPin size={14} />Delivery Address</label>
            <div className="space-y-3">
              <input className="input-field" placeholder="Street Address" value={form.address.street}
                onChange={e => setForm({...form, address: {...form.address, street: e.target.value}})} />
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" placeholder="City" value={form.address.city}
                  onChange={e => setForm({...form, address: {...form.address, city: e.target.value}})} />
                <input className="input-field" placeholder="State" value={form.address.state}
                  onChange={e => setForm({...form, address: {...form.address, state: e.target.value}})} />
              </div>
              <input className="input-field" placeholder="Pincode" value={form.address.pincode}
                onChange={e => setForm({...form, address: {...form.address, pincode: e.target.value}})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
            <FiSave size={16} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
