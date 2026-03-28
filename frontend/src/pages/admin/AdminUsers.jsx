import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    api.get(`/admin/users${roleFilter ? `?role=${roleFilter}` : ''}`)
      .then(({ data }) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const toggleStatus = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(`User ${data.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <select className="input-field w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {['customer', 'shopkeeper', 'delivery', 'admin'].map(r => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Name', 'Email', 'Role', 'Status', 'Joined', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="badge bg-blue-100 text-blue-700 capitalize">{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(user._id)} className={`text-xl ${user.isActive ? 'text-green-500 hover:text-red-500' : 'text-gray-300 hover:text-green-500'} transition-colors`}>
                    {user.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
