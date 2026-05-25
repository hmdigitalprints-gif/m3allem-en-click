import React, { useState, useEffect } from 'react';
import { Download, Search, Wallet, ArrowDownLeft, Clock, Loader2, Activity, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { ViewProps } from '../types';

function StatCard({ title, value, color, icon: Icon, trend, isPositive, subtitle }: any) {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 flex flex-col justify-between overflow-hidden relative border border-[var(--border)] hover:border-[var(--border)] transition-colors h-[160px] shadow-sm group">
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }} />
      <div className="flex justify-between items-start z-10 relative mb-2">
        <div className="text-[var(--text-muted)] text-[10px] sm:text-xs font-bold tracking-wider uppercase max-w-[70%] leading-tight">
          {title}
        </div>
        <div className="w-10 h-10 rounded-lg flex flex-shrink-0 items-center justify-center border border-[var(--border)] shadow-inner group-hover:scale-105 transition-transform" style={{ backgroundColor: color + '15', color: color }}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div className="z-10 relative flex items-end justify-between">
        <div>
          <div className="text-3xl font-black text-[var(--text)] tracking-tight truncate">{value}</div>
          {subtitle && <div className="text-[10px] font-bold text-[var(--text-muted)] mt-1 tracking-wider uppercase">{subtitle}</div>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border shadow-sm ${isPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
            {isPositive ? <ArrowDownLeft size={14} strokeWidth={3} className="rotate-180" /> : <ArrowDownLeft size={14} strokeWidth={3} />} 
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WalletsView({ onAction }: ViewProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any[]>([]);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/transactions', { 
      credentials: 'include'
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

  const runDiagnostic = async () => {
    setShowDiagnostic(true);
    setDiagnosticLoading(true);
    try {
      const res = await fetch('/api/admin/wallet-diagnostics', { credentials: 'include' });
      const data = await res.json();
      setDiagnosticData(data);
    } catch (err) {
      console.error(err);
      onAction?.('Failed to run diagnostic');
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    (t.user_name && t.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.type && t.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.status && t.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Diagnostic Modal */}
      {showDiagnostic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] w-full max-w-4xl rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                  <Activity size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text)]">Wallet Diagnostic Report</h3>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Sync integrity check</p>
                </div>
              </div>
              <button onClick={() => setShowDiagnostic(false)} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-2 bg-[var(--card-surface)] rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {diagnosticLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 size={32} className="animate-spin text-purple-500" />
                  <p className="text-sm font-bold text-[var(--text-muted)] tracking-wider uppercase">Running Diagnostic...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[var(--card-surface)] p-4 rounded-xl border border-[var(--border)]">
                      <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Wallets Checked</div>
                      <div className="text-2xl font-black">{diagnosticData.length}</div>
                    </div>
                    <div className="bg-[var(--card-surface)] p-4 rounded-xl border border-[var(--border)]">
                      <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Synchronized</div>
                      <div className="text-2xl font-black text-emerald-500">{diagnosticData.filter(d => d.is_synchronized).length}</div>
                    </div>
                    <div className="bg-[var(--card-surface)] p-4 rounded-xl border border-[var(--border)]">
                      <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Discrepancies Found</div>
                      <div className="text-2xl font-black text-red-500">{diagnosticData.filter(d => !d.is_synchronized).length}</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-black/20">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-right">Actual Bal.</th>
                          <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-right">Calc Bal.</th>
                          <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-right">Diff</th>
                          <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-right">Actual Lock</th>
                          <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-right">Calc Lock</th>
                          <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {diagnosticData.map((d: any) => (
                          <tr key={d.wallet_id} className="hover:bg-white/5">
                            <td className="px-4 py-3 font-medium text-sm text-[var(--text)]">{d.user_name}</td>
                            <td className="px-4 py-3 text-sm text-right">{d.actual_balance.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right">{d.calculated_balance.toFixed(2)}</td>
                            <td className={`px-4 py-3 text-sm font-bold text-right ${d.balance_discrepancy === 0 ? 'text-[var(--text-muted)]' : 'text-red-500'}`}>{d.balance_discrepancy.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right">{d.actual_locked.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right">{d.calculated_locked.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              {d.is_synchronized ? (
                                <CheckCircle size={16} className="text-emerald-500 inline-block" />
                              ) : (
                                <AlertTriangle size={16} className="text-red-500 inline-block" />
                              )}
                            </td>
                          </tr>
                        ))}
                        {diagnosticData.length === 0 && (
                          <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">No wallets found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Wallets Management</h2>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Monitor user balances & withdrawal requests</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={runDiagnostic}
            className="bg-[var(--card-surface)] border border-purple-500/30 text-purple-500 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-purple-500/10 transition-colors active:scale-95 flex items-center gap-2 shadow-sm"
          >
            <Activity size={16} strokeWidth={2.5} /> Diagnostic
          </button>
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
            className="bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors active:scale-95 flex items-center gap-2 shadow-sm"
          >
            <Download size={16} strokeWidth={2.5} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Platform Balance" value={`MAD ${Number(transactions.reduce((acc, t) => acc + (t.type === 'topup' ? (t.amount || 0) : 0), 0)).toFixed(0)}`} color="#FFD700" icon={Wallet} />
        <StatCard title="Pending Withdrawals" value={`MAD ${Number(transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, t) => acc + (t.amount || 0), 0)).toFixed(0)}`} color="#EF4444" icon={Clock} />
        <StatCard title="Transactions (24h)" value={transactions.length.toString()} color="#3B82F6" icon={ArrowDownLeft} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] flex-1 w-full max-w-md focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
          <Search size={18} className="text-[var(--text-muted)]" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search by user or type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]" 
          />
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm flex flex-col">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Type</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-end">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-[#FFD700]" />
                      <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No transactions found.
                  </td>
                </tr>
              ) : filteredTransactions.map((t) => (
                <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--card-surface)] flex items-center justify-center text-[#FFD700] text-sm font-black uppercase border border-[var(--border)] group-hover:border-[#FFD700]/30 transition-colors shadow-sm">
                        {t.user_name?.substring(0, 2) || 'NA'}
                      </div>
                      <span className="text-sm font-bold text-[var(--text)] tracking-tight">{t.user_name || 'Unknown User'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border items-center justify-center gap-1.5 w-fit shadow-sm ${
                      ['topup', 'release'].includes(t.type) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      ['payment', 'withdrawal'].includes(t.type) ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {t.type || 'Unknown'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-black tracking-tight text-sm ${['topup', 'release'].includes(t.type) ? 'text-emerald-500' : 'text-red-500'}`}>
                    {['topup', 'release'].includes(t.type) ? '+' : '-'} {(Number(t.amount) || 0).toFixed(2)} MAD
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[var(--text-muted)]">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-end">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border items-center justify-center gap-1.5 w-fit shadow-sm ml-auto ${
                      t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      t.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'
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
