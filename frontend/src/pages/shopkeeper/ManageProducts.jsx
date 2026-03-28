import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const EMPTY_FORM = {
  productName: '', description: '', price: '', discountedPrice: '',
  category: '', stock: '', unit: 'piece', isFeatured: false, isAvailable: true, images: []
};

const CATEGORIES = ['Grocery','Vegetables','Dairy','Bakery','Pharmacy','General','Fruits','Beverages'];

const ManageProducts = () => {
  const [products, setProducts]   = useState([]);
  const [shop, setShop]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // ── Load shop + products ───────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data: shopData } = await api.get('/shops/my');
        setShop(shopData.shop);
        const pRes = await api.get(`/products?shop=${shopData.shop._id}&limit=100`);
        setProducts(pRes.data.products || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // ── Image handler ──────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setForm(prev => ({ ...prev, images: [reader.result] }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview('');
    setForm(prev => ({ ...prev, images: [] }));
  };

  // ── Open Add modal ─────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImagePreview('');
    setModal(true);
  };

  // ── Open Edit modal ────────────────────────────────────────────
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      productName:    p.productName,
      description:    p.description,
      price:          p.price,
      discountedPrice: p.discountedPrice || '',
      category:       p.category?._id || p.category,
      stock:          p.stock,
      unit:           p.unit,
      isFeatured:     p.isFeatured,
      isAvailable:    p.isAvailable,
      images:         p.images || [],
    });
    setImagePreview(p.images?.[0] || '');
    setModal(true);
  };

  // ── Save (create or update) ────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:          Number(form.price),
        stock:          Number(form.stock),
        discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : null,
      };
      if (editing) {
        const { data } = await api.put(`/products/${editing._id}`, payload);
        setProducts(prev => prev.map(p => p._id === editing._id ? data.product : p));
        toast.success('Product updated!');
      } else {
        const { data } = await api.post('/products', payload);
        setProducts(prev => [data.product, ...prev]);
        toast.success('Product added!');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Product
        </button>
      </div>

      {/* ── Product Table ── */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p className="mb-4">No products yet. Add your first product!</p>
          <button onClick={openAdd} className="btn-primary px-8 py-2.5">Add Product</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Product image in table */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{p.productName}</p>
                        <p className="text-xs text-gray-400">{p.unit} • {p.category?.name || p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">₹{p.price}</p>
                    {p.discountedPrice && <p className="text-xs text-green-600">Sale: ₹{p.discountedPrice}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stock <= 10 ? 'text-orange-500' : 'text-gray-700'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {p.isAvailable ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 size={15} /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                {editing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">

              {/* ── Product Image Upload ── */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Product preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl">📦</div>
                      <p className="text-xs text-gray-400 mt-0.5">No image</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="btn-outline text-xs py-1.5 px-3 cursor-pointer inline-block">
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="ml-2 text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">JPG, PNG — Max 2MB</p>
                </div>
              </div>

              {/* Product Name */}
              <input
                className="input-field" placeholder="Product Name *" required
                value={form.productName}
                onChange={e => setForm({...form, productName: e.target.value})}
              />

              {/* Description */}
              <textarea
                className="input-field resize-none" rows={2} placeholder="Description"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />

              {/* Price + Sale Price */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input-field" type="number" placeholder="Price (₹) *" required min="0"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                />
                <input
                  className="input-field" type="number" placeholder="Sale Price (₹)" min="0"
                  value={form.discountedPrice}
                  onChange={e => setForm({...form, discountedPrice: e.target.value})}
                />
              </div>

              {/* Stock + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input-field" type="number" placeholder="Stock *" required min="0"
                  value={form.stock}
                  onChange={e => setForm({...form, stock: e.target.value})}
                />
                <select
                  className="input-field"
                  value={form.unit}
                  onChange={e => setForm({...form, unit: e.target.value})}
                >
                  {['piece','kg','gram','litre','ml','dozen','pack'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <select
                className="input-field" required
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              >
                <option value="">-- Select Category *</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox" checked={form.isAvailable}
                    onChange={e => setForm({...form, isAvailable: e.target.checked})}
                  />
                  Available
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox" checked={form.isFeatured}
                    onChange={e => setForm({...form, isFeatured: e.target.checked})}
                  />
                  Featured
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageProducts;