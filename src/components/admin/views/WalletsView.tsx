import React, { useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';

export default function WalletsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/transactions', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setTransactions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching transactions:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wallets Management</h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Monitor user balances, transaction history, and withdrawal requests.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + transactions.map(t => `${t.user_name},${t.type},${t.amount},${t.created_at},${t.status}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "transactions.csv");
              document.body.appendChild(link);
              link.click();
              onAction?.('Transactions exported successfully!');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold border bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text)] flex items-center gap-2 transition-all active:scale-95 hover:bg-[var(--glass-border)]`}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Platform Balance" value="MAD 1,240,500" trend="+12.5%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Pending Withdrawals" value="MAD 45,000" trend="-5.2%" isPositive={false} isDarkMode={isDarkMode} />
        <KpiCard title="Total Transactions (24h)" value={transactions.length.toString()} trend="+8.1%" isPositive={true} isDarkMode={isDarkMode} />
      </div>

      <div className={`rounded-2xl overflow-hidden ${cardClasses}`}>
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-bold text-[var(--text)]">Recent Transactions</h3>
          <div className="flex items-center gap-2">
            <div className={`flex items-center px-3 py-1.5 rounded-lg border bg-[var(--glass-bg)] border-[var(--glass-border)]`}>
              <Search size={14} className={textMutedClasses} />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none ml-2 text-xs w-40 text-[var(--text)]" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs uppercase tracking-wider bg-[var(--glass-bg)] text-[var(--text-muted)]`}>
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-[var(--border)]`}>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-[var(--text-muted)]">Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-[var(--text-muted)]">No transactions found.</td></tr>
              ) : transactions.map((t) => (
                <tr key={t.id} className={`transition-colors ${hoverClasses}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[10px] font-bold uppercase text-[var(--accent)]">
                        {t.user_name?.substring(0, 2)}
                      </div>
                      <span className="text-[var(--text)]">{t.user_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      ['topup', 'release'].includes(t.type) ? 'bg-[var(--success)]/10 text-[var(--success)]' : 
                      ['payment', 'withdrawal'].includes(t.type) ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]' : 
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-mono font-bold ${['topup', 'release'].includes(t.type) ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
                    {['topup', 'release'].includes(t.type) ? '+' : '-'} MAD {t.amount.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 ${textMutedClasses}`}>{new Date(t.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.status === 'completed' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 
                      t.status === 'pending' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' : 
                      'bg-[var(--destructive)]/10 text-[var(--destructive)]'
                    }`}>
                      {t.status}
                    </span>
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
