import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';

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
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-logs', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}` }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Detailed history of all administrative actions and system events.</p>
        </div>
        <button 
          onClick={() => onAction?.('Filter logs functionality coming soon!')}
          className={`px-4 py-2 rounded-lg text-sm font-bold border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'} flex items-center gap-2 active:scale-95`}
        >
          <Filter size={16} /> Filter Logs
        </button>
      </div>

      <div className={`rounded-2xl overflow-hidden ${cardClasses}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-white/5 text-white/40' : 'bg-gray-50 text-gray-500'}`}>
              <tr>
                <th className="px-6 py-4 font-medium">Event</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">No logs found.</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className={`transition-colors ${hoverClasses}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        log.action.includes('Suspended') || log.action.includes('Failed') ? 'bg-rose-500' : 
                        log.action.includes('Updated') ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <span className="font-medium">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{log.user_name || 'System'}</td>
                  <td className={`px-6 py-4 font-mono text-xs ${textMutedClasses}`}>{log.ip_address || 'N/A'}</td>
                  <td className={`px-6 py-4 ${textMutedClasses}`}>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
