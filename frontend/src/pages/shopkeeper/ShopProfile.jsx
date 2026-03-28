import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import { FiSave } from 'react-icons/fi';

const ShopProfile = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [form, setForm] = useState({
    shopName: '', description: '', category: 'general', phone: '',
    logo: '',
    location: { street: '', city: '', state: '', pincode: '' },
    openingHours: { open: '09:00', close: '21:00' }, isOpen: true,
  });

  useEffect(() => {
    api.get('/shops/my')
      .then(({ data }) => {
        setShop(data.shop);
        setLogoPreview(data.shop.logo || '');
        setForm({
          shopName: data.shop.shopName || '',
          description: data.shop.description || '',
          category: data.shop.category || 'general',
          phone: data.shop.phone || '',
          logo: data.shop.logo || '',
          location: data.shop.location || { street: '', city: '', state: '', pincode: '' },
          openingHours: data.shop.openingHours || { open: '09:00', close: '21:00' },
          isOpen: data.shop.isOpen ?? true,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Image handler ──────────────────────────────────────────────
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setForm(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview('');
    setForm(prev => ({ ...prev, logo: '' }));
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (shop) {
        const { data } = await api.put(`/shops/${shop._id}`, form);
        setShop(data.shop);
        toast.success('Shop updated!');
      } else {
        const { data } = await api.post('/shops', form);
        setShop(data.shop);
        toast.success('Shop created!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const set    = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const setLoc = (key, val) => setForm(prev => ({ ...prev, location: { ...prev.location, [key]: val } }));
  const setHours = (key, val) => setForm(prev => ({ ...prev, openingHours: { ...prev.openingHours, [key]: val } }));

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {shop ? 'Shop Settings' : 'Create Your Shop'}
      </h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">

        {/* ── Shop Logo Upload ── */}
        <div className="flex flex-col items-center gap-3 pb-5 border-b border-gray-100">
          <div className="w-28 h-28 rounded-2xl overflow-hidden bg-green-50 border-2 border-dashed border-green-300 flex items-center justify-center">
            {logoPreview ? (
              <img src={logoPreview} alt="Shop logo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-2">
                <div className="text-4xl">🏪</div>
                <p className="text-xs text-gray-400 mt-1">No logo</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="btn-outline text-sm py-1.5 px-4 cursor-pointer">
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </label>
            {logoPreview && (
              <button
                type="button"
                onClick={removeLogo}
                className="text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">JPG, PNG — Max 2MB</p>
        </div>

        {/* ── Shop Name ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
          <input
            className="input-field" required
            placeholder="My Grocery Store"
            value={form.shopName}
            onChange={e => set('shopName', e.target.value)}
          />
        </div>

        {/* ── Description ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="input-field resize-none" rows={3}
            placeholder="Tell customers about your shop..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>

        {/* ── Category + Phone ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
              {['grocery','vegetables','dairy','bakery','general','pharmacy','other'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              className="input-field"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
            />
          </div>
        </div>

        {/* ── Location ── */}
        <fieldset className="border border-gray-200 rounded-xl p-4">
          <legend className="text-sm font-semibold text-gray-700 px-2">Location</legend>
          <div className="space-y-3 mt-2">
            <input className="input-field" placeholder="Street Address"
              value={form.location.street} onChange={e => setLoc('street', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="City"
                value={form.location.city} onChange={e => setLoc('city', e.target.value)} />
              <input className="input-field" placeholder="State"
                value={form.location.state} onChange={e => setLoc('state', e.target.value)} />
            </div>
            <input className="input-field" placeholder="Pincode"
              value={form.location.pincode} onChange={e => setLoc('pincode', e.target.value)} />
          </div>
        </fieldset>

        {/* ── Opening Hours ── */}
        <fieldset className="border border-gray-200 rounded-xl p-4">
          <legend className="text-sm font-semibold text-gray-700 px-2">Opening Hours</legend>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Opens At</label>
              <input type="time" className="input-field"
                value={form.openingHours.open} onChange={e => setHours('open', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Closes At</label>
              <input type="time" className="input-field"
                value={form.openingHours.close} onChange={e => setHours('close', e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={form.isOpen}
              onChange={e => set('isOpen', e.target.checked)} />
            <span className="text-sm text-gray-700">Shop is currently open</span>
          </label>
        </fieldset>

        {/* ── Submit ── */}
        <button type="submit" disabled={saving}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          <FiSave />
          {saving ? 'Saving...' : shop ? 'Update Shop' : 'Create Shop'}
        </button>

      </form>
    </div>
  );
};

export default ShopProfile;