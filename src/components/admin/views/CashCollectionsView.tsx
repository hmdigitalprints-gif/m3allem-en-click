import React, { useState, useEffect } from 'react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';

export default function CashCollectionsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/cash-collections', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setCollections(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching cash collections:', err);
        setLoading(false);
      });
  }, []);

  const totalOwed = collections.reduce((acc, c) => acc + c.commission_owed, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cash Collections</h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Track commissions owed by artisans for cash-on-delivery jobs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Owed" value={`MAD ${totalOwed.toLocaleString()}`} trend="+5.2%" isPositive={false} isDarkMode={isDarkMode} />
        <KpiCard title="Collected (MTD)" value="MAD 8,200" trend="+15.1%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Overdue Artisans" value={collections.length.toString()} trend="-2" isPositive={true} isDarkMode={isDarkMode} />
      </div>

      <div className={`rounded-2xl overflow-hidden ${cardClasses}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-white/5 text-white/40' : 'bg-gray-50 text-gray-500'}`}>
              <tr>
                <th className="px-6 py-4 font-medium">Artisan</th>
                <th className="px-6 py-4 font-medium">Total Cash Handled</th>
                <th className="px-6 py-4 font-medium">Commission Owed</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : collections.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">No cash collections found.</td></tr>
              ) : collections.map((c) => (
                <tr key={c.artisan_id} className={`transition-colors ${hoverClasses}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.artisan_name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center text-[10px] font-bold uppercase">
                          {c.artisan_name.substring(0, 2)}
                        </div>
                      )}
                      <span>{c.artisan_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono">MAD {c.total_cash_handled.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono font-bold text-rose-500">MAD {c.commission_owed.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onAction?.(`Recording payment for ${c.artisan_name}...`)}
                      className="bg-[#FFD700] text-black px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#E6C200] transition-all active:scale-95 shadow-sm"
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
