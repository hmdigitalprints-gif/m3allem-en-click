import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, MoreVertical, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { ViewProps } from '../types';

export default function FraudMonitoringView({ onAction }: ViewProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fraud-alerts', { 
        credentials: 'include'
      });
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(a => 
    a.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Fraud Monitoring</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">AI-powered fraud detection and risk assessment for all platform activities.</p>
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border-l-4 border-l-red-500 border-t border-r border-b border-[var(--border)] relative overflow-hidden shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Critical Alerts</p>
          <p className="text-4xl font-black text-red-500 tracking-tight">{alerts.filter(a => a.risk_level === 'high').length}</p>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-3 uppercase tracking-wider">Requires immediate action</p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border-l-4 border-l-orange-500 border-t border-r border-b border-[var(--border)] relative overflow-hidden shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Suspicious Users</p>
          <p className="text-4xl font-black text-orange-500 tracking-tight">{alerts.filter(a => a.risk_level === 'medium').length}</p>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-3 uppercase tracking-wider">Under manual review</p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border-l-4 border-l-[#FFD700] border-t border-r border-b border-[var(--border)] relative overflow-hidden shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Risk Score Avg</p>
          <p className="text-4xl font-black text-[#FFD700] tracking-tight">14%</p>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-3 uppercase tracking-wider">Platform-wide average</p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border-l-4 border-l-emerald-500 border-t border-r border-b border-[var(--border)] relative overflow-hidden shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Verified Safe</p>
          <p className="text-4xl font-black text-emerald-500 tracking-tight">98.2%</p>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-3 uppercase tracking-wider">Transactions verified</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] flex-1 w-full max-w-md focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
          <Search size={18} className="text-[var(--text-muted)]" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search alerts by user or reason..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]" 
          />
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">Recent Risk Alerts</h3>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs font-black uppercase tracking-wider text-[#FFD700] hover:text-[#E6C200] transition-colors"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">User</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Reason</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Risk Level</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Date</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
                      Loading alerts...
                    </div>
                  </td>
                </tr>
              ) : filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No alerts found.
                  </td>
                </tr>
              ) : filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[var(--text)] tracking-tight">{alert.user_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--text-muted)] max-w-xs block truncate">{alert.reason}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border items-center justify-center gap-1.5 w-fit shadow-sm ${
                      alert.risk_level === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      alert.risk_level === 'medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {alert.risk_level === 'high' ? <ShieldAlert size={14} strokeWidth={3} /> : <AlertTriangle size={14} strokeWidth={3} />}
                      {alert.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--text-muted)]">{new Date(alert.created_at).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    
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
