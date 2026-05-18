import React, { useState, useEffect } from 'react';
import { Filter, Search, X, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ViewProps } from '../types';

export default function AuditLogsView({ onAction }: ViewProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetch('/api/admin/audit-logs', { 
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching audit logs:', err);
        setLoading(false);
      });
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (log.user_name && log.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'critical') return matchesSearch && (log.action.includes('Suspended') || log.action.includes('Failed') || log.action.includes('Deleted'));
    if (filterType === 'update') return matchesSearch && log.action.includes('Updated');
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Audit Logs</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Detailed history of all administrative actions and system events.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
            <Search size={18} className="text-[var(--text-muted)]" strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none ml-3 text-sm font-bold text-[var(--text)] w-48 placeholder:text-[var(--text-muted)]"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-5 py-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] text-sm font-bold text-[var(--text)] outline-none focus:border-[#FFD700]/50 transition-colors shadow-inner appearance-none pr-10 relative cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
          >
            <option value="all">All Events</option>
            <option value="critical">Critical Only</option>
            <option value="update">Updates Only</option>
          </select>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/[0.01]">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Event</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">User</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">IP Address</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
                      <p className="text-sm font-bold text-[var(--text-muted)] tracking-wider uppercase">Loading logs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-[var(--text-muted)]">
                      <ShieldAlert className="w-12 h-12 stroke-[1.5]" />
                      <p className="text-sm font-bold tracking-wider uppercase">No logs found.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${
                        log.action.includes('Suspended') || log.action.includes('Failed') || log.action.includes('Deleted') ? 'bg-red-500 shadow-red-500/50' : 
                        log.action.includes('Updated') ? 'bg-[#FFD700] shadow-[#FFD700]/50' : 'bg-emerald-500 shadow-emerald-500/50'
                      }`} />
                      <span className="text-sm font-bold text-[var(--text)] tracking-tight">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--text-muted)] bg-[var(--border)] border border-[var(--border)]">
                      {log.user_name || 'System'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-[var(--text-muted)] tracking-wider bg-black/50 px-2 py-1 rounded border border-[var(--border)]">{log.ip_address || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--text-muted)]">{new Date(log.created_at).toLocaleString()}</span>
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
