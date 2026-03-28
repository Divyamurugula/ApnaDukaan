import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiEdit2, FiAlertTriangle } from 'react-icons/fi';

const ShopInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [qty, setQty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: shopData } = await api.get('/shops/my');
        setShop(shopData.shop);
        const { data } = await api.get(`/inventory/shop/${shopData.shop._id}`);
        setInventory(data.inventory || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await api.put(`/inventory/${editing._id}`, { quantity: Number(qty), type: 'restock' });
      setInventory(prev => prev.map(i => i._id === editing._id ? { ...i, quantity: Number(qty) } : i));
      toast.success('Inventory updated!');
      setEditing(null);
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory Management</h1>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Product', 'Current Stock', 'Status', 'Last Updated', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inventory.map(item => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={item.product?.images?.[0] || 'https://via.placeholder.com/40'} alt=""
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">{item.product?.productName}</p>
                      <p className="text-xs text-gray-400">₹{item.product?.price}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {editing?._id === item._id ? (
                    <form onSubmit={handleUpdate} className="flex items-center gap-2">
                      <input type="number" min="0" value={qty} onChange={e => setQty(e.target.value)}
                        className="w-20 input-field py-1 text-sm" autoFocus />
                      <button type="submit" disabled={saving} className="btn-primary text-xs py-1 px-2">{saving ? '...' : 'Save'}</button>
                      <button type="button" onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 text-xs">Cancel</button>
                    </form>
                  ) : (
                    <span className={`font-semibold ${item.quantity <= 10 ? 'text-orange-500' : 'text-gray-700'}`}>
                      {item.quantity}
                      {item.quantity <= 10 && <FiAlertTriangle className="inline ml-1 text-orange-500" size={12} />}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${item.quantity === 0 ? 'bg-red-100 text-red-600' : item.quantity <= 10 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-700'}`}>
                    {item.quantity === 0 ? 'Out of Stock' : item.quantity <= 10 ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(item.lastUpdated).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => { setEditing(item); setQty(item.quantity.toString()); }}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <FiEdit2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inventory.length === 0 && (
          <p className="text-center text-gray-400 py-10">No inventory records found.</p>
        )}
      </div>
    </div>
  );
};

export default ShopInventory;
