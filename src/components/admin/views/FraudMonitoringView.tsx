import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, MoreVertical, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

export default function FraudMonitoringView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAlerts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fraud-alerts', { 
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
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
  }, [token]);

  const filteredAlerts = alerts.filter(a => 
    a.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fraud Monitoring</h1>
          <p className="text-sm text-white/40 mt-1">AI-powered fraud detection and risk assessment for all platform activities.</p>
        </div>
        <button 
          onClick={() => onAction?.('Reviewing high risk alerts...')}
          className="bg-rose-500 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-rose-600 transition-all active:scale-95"
        >
          <ShieldAlert size={18} /> High Risk Alerts
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="hynex-card p-6 border-l-4 border-rose-500">
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Critical Alerts</p>
          <p className="text-3xl font-bold text-rose-500">{alerts.filter(a => a.risk_level === 'high').length}</p>
          <p className="text-[10px] text-white/20 mt-2">Requires immediate action</p>
        </div>
        <div className="hynex-card p-6 border-l-4 border-[#F59E0B]">
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Suspicious Users</p>
          <p className="text-3xl font-bold text-[#F59E0B]">{alerts.filter(a => a.risk_level === 'medium').length}</p>
          <p className="text-[10px] text-white/20 mt-2">Under manual review</p>
        </div>
        <div className="hynex-card p-6 border-l-4 border-[#FFD700]">
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Risk Score Avg</p>
          <p className="text-3xl font-bold text-[#FFD700]">14%</p>
          <p className="text-[10px] text-white/20 mt-2">Platform-wide average</p>
        </div>
        <div className="hynex-card p-6 border-l-4 border-[#10B981]">
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Verified Safe</p>
          <p className="text-3xl font-bold text-[#10B981]">98.2%</p>
          <p className="text-[10px] text-white/20 mt-2">Transactions verified</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex items-center px-4 py-2 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} flex-1 max-w-md`}>
          <Search size={18} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Search alerts by user or reason..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm text-[var(--text)]" 
          />
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Recent Risk Alerts</h3>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs text-[#FFD700] hover:underline"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-white/20 border-b border-white/5">
              <tr>
                <th className="px-8 py-4 font-medium">User</th>
                <th className="px-8 py-4 font-medium">Reason</th>
                <th className="px-8 py-4 font-medium">Risk Level</th>
                <th className="px-8 py-4 font-medium">Date</th>
                <th className="px-8 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">Loading alerts...</td></tr>
              ) : filteredAlerts.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">No alerts found.</td></tr>
              ) : filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5 font-bold">{alert.user_name}</td>
                  <td className="px-8 py-5 text-white/60">{alert.reason}</td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-2 w-fit ${
                      alert.risk_level === 'high' ? 'bg-rose-500/10 text-rose-500' : 
                      alert.risk_level === 'medium' ? 'bg-amber-500/10 text-amber-500' : 
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {alert.risk_level === 'high' ? <ShieldAlert size={12} /> : <AlertTriangle size={12} />}
                      {alert.risk_level}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-white/40">{new Date(alert.created_at).toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => onAction?.(`Taking action on alert for ${alert.user_name}...`)}
                      className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                    >
                      <MoreVertical size={18} />
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
