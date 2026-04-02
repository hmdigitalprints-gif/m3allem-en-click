import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ViewProps } from '../types';

export default function DisputesView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/disputes', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setDisputes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching disputes:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disputes & Resolutions</h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Handle conflicts between customers and service providers.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onAction?.('Reviewing high priority disputes...')}
            className="bg-[var(--destructive)] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--destructive)]/20"
          >
            <AlertTriangle size={16} /> High Priority ({disputes.filter(d => d.status === 'open').length})
          </button>
        </div>
      </div>

      <div className={`rounded-2xl overflow-hidden ${cardClasses}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs uppercase tracking-wider bg-[var(--glass-bg)] text-[var(--text-muted)]`}>
              <tr>
                <th className="px-6 py-4 font-medium">Dispute ID</th>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Parties</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-[var(--border)]`}>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-[var(--text-muted)]">Loading...</td></tr>
              ) : disputes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-[var(--text-muted)]">No disputes found.</td></tr>
              ) : disputes.map((d) => (
                <tr key={d.id} className={`transition-colors ${hoverClasses}`}>
                  <td className="px-6 py-4 font-mono text-xs text-[var(--text)]">{d.id.substring(0, 8)}</td>
                  <td className="px-6 py-4 font-mono text-xs text-[var(--text)]">{d.order_id.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <p className="font-bold text-[var(--text)]">{d.client_name}</p>
                      <p className={textMutedClasses}>vs {d.artisan_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-xs truncate text-[var(--text)]">{d.reason}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      d.status === 'open' ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]' : 
                      d.status === 'in_review' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' : 
                      'bg-[var(--success)]/10 text-[var(--success)]'
                    }`}>
                      {d.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onAction?.(`Reviewing dispute ${d.id}...`)}
                      className="text-[var(--accent)] text-xs font-bold hover:underline transition-all active:scale-95"
                    >
                      Review Case
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
