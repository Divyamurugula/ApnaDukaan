import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import { FiDownload } from 'react-icons/fi';

const AdminReports = () => {
  const [report, setReport] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchReport = () => {
    setLoading(true);
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    api.get('/admin/reports/sales', { params })
      .then(({ data }) => { setReport(data.report || []); setTopProducts(data.topProducts || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, []);

  const totalRevenue = report.reduce((acc, r) => acc + r.totalRevenue, 0);
  const totalTxns = report.reduce((acc, r) => acc + r.count, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From Date</label>
          <input type="date" className="input-field" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To Date</label>
          <input type="date" className="input-field" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <button onClick={fetchReport} className="btn-primary px-6 py-2">Apply Filter</button>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card p-4">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-green-700">₹{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-3xl font-bold text-blue-700">{totalTxns}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Revenue */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-800 mb-4">Daily Revenue</h2>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {report.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No data available</p> : (
                  report.map((r, i) => {
                    const maxRev = Math.max(...report.map(x => x.totalRevenue));
                    const pct = maxRev > 0 ? (r.totalRevenue / maxRev) * 100 : 0;
                    return (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500 w-24 flex-shrink-0">{r._id}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-semibold text-gray-700 w-24 text-right">₹{r.totalRevenue.toFixed(0)}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-800 mb-4">Top Selling Products</h2>
              <div className="space-y-3">
                {topProducts.slice(0, 8).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-gray-700 font-medium">{p._id}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{p.totalSold} sold</p>
                      <p className="text-xs text-gray-400">₹{p.revenue?.toFixed(0)}</p>
                    </div>
                  </div>
                ))}
                {topProducts.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No data available</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;
