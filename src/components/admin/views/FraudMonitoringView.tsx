import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, MoreVertical, Loader2, AlertTriangle, CheckCircle, X, Shield, PlusCircle, RefreshCw, Ban, UserCheck } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function FraudMonitoringView({ onAction }: ViewProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Simulation Modal State
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simUser, setSimUser] = useState('');
  const [simReason, setSimReason] = useState('Velocity attack: Multiple rapid credit card purchases identified under 5 seconds.');
  const [simRisk, setSimRisk] = useState('high');

  // Suspend Modal State
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendUserId, setSuspendUserId] = useState('');
  const [suspendUserName, setSuspendUserName] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDuration, setSuspendDuration] = useState('7');

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

  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/admin/fraud-alerts/${alertId}/resolve`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        onAction?.('Fraud alert dismissed and flagged as resolved');
        fetchAlerts();
      } else {
        onAction?.('Failed to resolve fraud alert');
      }
    } catch (error) {
      console.error(error);
      onAction?.('Error resolving fraud alert');
    }
  };

  const handleTriggerSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/fraud-alerts/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: simUser || null,
          reason: simReason,
          riskLevel: simRisk
        }),
        credentials: 'include'
      });
      if (res.ok) {
        onAction?.('Synthetic security incident simulated successfully!');
        setShowSimulateModal(false);
        fetchAlerts();
      } else {
        onAction?.('Simulation injection failed');
      }
    } catch (error) {
      console.error(error);
      onAction?.('Error triggering security simulation');
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendUserId) return;
    try {
      const untilDate = suspendDuration === 'permanent' 
        ? null 
        : new Date(Date.now() + parseInt(suspendDuration) * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch(`/api/admin/users/${suspendUserId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: suspendReason, until: untilDate }),
        credentials: 'include'
      });
      
      if (res.ok) {
        onAction?.(`Suspended user account: ${suspendUserName}`);
        setShowSuspendModal(false);
        setSuspendReason('');
        // Resolve associated alerts
        const associatedAlerts = alerts.filter(a => a.userId === suspendUserId);
        for (const alert of associatedAlerts) {
          await fetch(`/api/admin/fraud-alerts/${alert.id}/resolve`, { method: 'POST', credentials: 'include' });
        }
        fetchAlerts();
      } else {
        onAction?.('Failed to suspend user');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openSuspendPanel = (alert: any) => {
    setSuspendUserId(alert.userId || '');
    setSuspendUserName(alert.user_name || 'Flagged Account');
    setSuspendReason(`Suspicious activities flagged: ${alert.reason}`);
    setShowSuspendModal(true);
  };

  const filteredAlerts = alerts.filter(a => {
    const userName = a.user_name || 'System Automated';
    const reasonText = a.reason || '';
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           reasonText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-[#FFD700]" />
            Fraud Detection & Monitoring
          </h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
            Heuristics-based risk assessment and suspicious transactional tracking.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-500/10"
          >
            <PlusCircle size={14} />
            Simulate Seeding Security Alert
          </button>
          
          <button 
            onClick={fetchAlerts} 
            className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--text)] rounded-xl transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Poll Server
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border-l-4 border-l-red-500 border-t border-r border-b border-[var(--border)] relative overflow-hidden shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Critical Alerts</p>
          <p className="text-4xl font-black text-red-500 tracking-tight">{alerts.filter(a => a.risk_level === 'high').length}</p>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-3 uppercase tracking-wider">Requires immediate action</p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border-l-4 border-l-orange-500 border-t border-r border-b border-[var(--border)] relative overflow-hidden shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 animate-bounce">Suspicious Users</p>
          <p className="text-4xl font-black text-orange-500 tracking-tight">{alerts.filter(a => a.risk_level === 'medium').length}</p>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-3 uppercase tracking-wider">Under manual review</p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border-l-4 border-l-[#FFD700] border-t border-r border-b border-[var(--border)] relative overflow-hidden shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Internal Risk Index</p>
          <p className="text-4xl font-black text-[#FFD700] tracking-tight">Medium</p>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-3 uppercase tracking-wider">Automatic isolation</p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border-l-4 border-l-emerald-500 border-t border-r border-b border-[var(--border)] relative overflow-hidden shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Security Rules</p>
          <p className="text-4xl font-black text-emerald-500 tracking-tight">Live</p>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-3 uppercase tracking-wider">Prisma db checks active</p>
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

      {/* Main Alert List */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">Recent Risk Warnings & Threat Logs</h3>
          <span className="text-xs bg-red-500/10 text-red-500 px-3 py-1.5 border border-red-500/20 rounded-lg font-bold">
            Realtime DB Link Active
          </span>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-black/10">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">User Email/ID</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Threat Reason</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Risk Rating</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Incident Date</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-end">Action Responses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
                      Loading live alerts...
                    </div>
                  </td>
                </tr>
              ) : filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No threat alerts in audit queues. Platform operates in standard safe parameters.
                  </td>
                </tr>
              ) : filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[var(--text)] tracking-tight">{alert.user_name || 'Anonymous User'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--text-muted)] max-w-sm block truncate" title={alert.reason}>
                      {alert.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border items-center justify-center gap-1.5 w-fit shadow-sm ${
                      alert.risk_level === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      alert.risk_level === 'medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      <AlertTriangle size={12} strokeWidth={3} />
                      {alert.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--text-muted)]">
                      {new Date(alert.created_at || alert.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {alert.userId && (
                        <button 
                          onClick={() => openSuspendPanel(alert)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-1"
                          title="Suspend Client Account"
                        >
                          <Ban size={12} />
                          Suspend
                        </button>
                      )}
                      <button 
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-1"
                      >
                        <CheckCircle size={12} />
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator Modal */}
      <AnimatePresence>
        {showSimulateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500" />
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-[var(--text)] tracking-tight">Simulate Fraud Incident</h3>
                <button onClick={() => setShowSimulateModal(false)} className="p-2 hover:bg-[var(--border)] rounded-xl transition-colors">
                  <X size={20} className="text-[var(--text-muted)] hover:text-white" />
                </button>
              </div>

              <form onSubmit={handleTriggerSimulation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Subject User ID (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Leave empty for generic system threat alert"
                    value={simUser}
                    onChange={(e) => setSimUser(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm text-[var(--text)] focus:border-[#FFD700] outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Risk Level Evaluation</label>
                  <select 
                    value={simRisk}
                    onChange={(e) => setSimRisk(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm font-bold text-[var(--text)] focus:border-[#FFD700] outline-none cursor-pointer"
                  >
                    <option value="high">High Risk Threat (Immediate Alert)</option>
                    <option value="medium">Medium Risk Warning (Heuristic Deviation)</option>
                    <option value="low">Low Level Audit Observation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Incident Assessment Reason</label>
                  <textarea 
                    rows={3}
                    required
                    value={simReason}
                    onChange={(e) => setSimReason(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm text-[var(--text)] focus:border-[#FFD700] outline-none" 
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowSimulateModal(false)} 
                    className="px-4 py-2 text-xs font-bold uppercase text-[var(--text-muted)] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Trigger Threat Seeding
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Suspend Dialog */}
      <AnimatePresence>
        {showSuspendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative"
            >
              <h3 className="text-xl font-black text-red-500 mb-2">Issue Account Suspension</h3>
              <p className="text-xs text-[var(--text-muted)] mb-6 uppercase tracking-wider font-semibold">
                Suspending user: {suspendUserName}. Suspended accounts are immediately disconnected.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Suspension Length</label>
                  <select 
                    value={suspendDuration}
                    onChange={(e) => setSuspendDuration(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm font-bold text-[var(--text)] focus:border-[#FFD700] outline-none cursor-pointer"
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="permanent">Permanent Account Termination</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Violation explanation reason</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="State reason clearly..."
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm font-semibold text-[var(--text)] focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowSuspendModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase text-[var(--text-muted)] hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSuspendUser}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Confirm Isolation Blockade
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
