import React, { useState, useEffect } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface AuditLogsViewProps {
  isDarkMode: boolean;
  cardClasses: string;
  textMutedClasses: string;
  hoverClasses: string;
  onAction?: (msg: string) => void;
}

export default function AuditLogsView({ 
  isDarkMode, 
  cardClasses, 
  textMutedClasses, 
  hoverClasses, 
  onAction 
}: AuditLogsViewProps) {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/audit-logs', { 
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${token}` }
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tech-header text-2xl">Audit Logs</h1>
          <p className="tech-label opacity-70 mt-1">Detailed history of all administrative actions and system events.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center px-4 py-2.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] focus-within:border-[var(--accent)]/50 transition-all">
            <Search size={16} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none ml-3 tech-label text-[var(--text)] w-40 not-italic"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] tech-label text-[var(--text)] outline-none focus:border-[var(--accent)]/50 transition-all"
          >
            <option value="all">All Events</option>
            <option value="critical">Critical Only</option>
            <option value="update">Updates Only</option>
          </select>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-6 py-4 tech-label">Event</th>
                <th className="px-6 py-4 tech-label">User</th>
                <th className="px-6 py-4 tech-label">IP Address</th>
                <th className="px-6 py-4 tech-label">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center tech-label opacity-50">Loading...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center tech-label opacity-50">No logs found.</td></tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-[var(--accent)]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.action.includes('Suspended') || log.action.includes('Failed') || log.action.includes('Deleted') ? 'bg-[var(--destructive)]' : 
                        log.action.includes('Updated') ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]'
                      }`} />
                      <span className="tech-header text-sm not-italic text-[var(--text)]">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 tech-header text-sm not-italic text-[var(--text)]">{log.user_name || 'System'}</td>
                  <td className="px-6 py-4 tech-value text-xs text-[var(--text-muted)] opacity-70">{log.ip_address || 'N/A'}</td>
                  <td className="px-6 py-4 tech-label opacity-50">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
