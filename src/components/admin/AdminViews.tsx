import React, { useState, useEffect } from 'react';
import { Plus, UserCog, X, Save, Loader2, BrainCircuit, Sparkles, AlertCircle, BarChart3, Bug, MapPin, Hammer, Users, Activity, Zap, ShieldCheck, CheckCircle, Download, Search, Star, MoreVertical, ShieldAlert, Filter, Trash2, Settings, ShoppingBag, Building2, Clock, FileText, ArrowUpRight, ArrowRight, Info, ChevronRight, AlertTriangle, Lock, Unlock, Package, DollarSign, TrendingUp, Wallet, Globe, Check, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './../../context/AuthContext';
import { ViewProps } from './types';
import { aiService } from './../../services/aiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import KpiCard from './components/KpiCard';

interface AdminManagementViewProps {
  isDarkMode: boolean;
  cardClasses: string;
  textMutedClasses: string;
  hoverClasses: string;
  onAction?: (msg: string) => void;
}

export function AdminManagementView({ 
  isDarkMode, 
  cardClasses, 
  textMutedClasses, 
  hoverClasses, 
  onAction 
}: AdminManagementViewProps) {
  const { token } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: 'password123' });

  const fetchAdmins = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users?role=admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, role: 'admin' })
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', password: 'password123' });
        fetchAdmins();
        onAction?.('Admin user added successfully');
      } else {
        const data = await res.json();
        onAction?.(data.error || 'Failed to add admin');
      }
    } catch (error) {
      onAction?.('Error adding admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tech-header text-2xl">Admin Management</h1>
          <p className="tech-label opacity-70 mt-1">Manage administrative users and their permission levels.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl tech-label hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2"
        >
          <Plus size={18} /> Add Admin
        </button>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-6 py-4 tech-label">Admin User</th>
                <th className="px-6 py-4 tech-label">Role</th>
                <th className="px-6 py-4 tech-label">Last Login</th>
                <th className="px-6 py-4 tech-label">Status</th>
                <th className="px-6 py-4 tech-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center tech-label opacity-50">Loading...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center tech-label opacity-50">No admins found.</td></tr>
              ) : admins.map((admin) => (
                <tr key={admin.id} className="group hover:bg-[var(--accent)]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {admin.avatar_url ? (
                        <img src={admin.avatar_url} alt={admin.name} className="w-10 h-10 rounded-2xl object-cover border border-[var(--border)]" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center tech-header text-sm not-italic">
                          {admin.name.charAt(0)}
                        </div>
                      )}
                      <span className="tech-header text-sm not-italic text-[var(--text)]">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)] tech-label text-[var(--text-muted)]">
                      {admin.id === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4 tech-label opacity-50">N/A</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] tech-label">Active</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onAction?.(`Managing permissions for ${admin.name}...`)}
                      className="p-2 rounded-xl hover:bg-[var(--accent)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all active:scale-95"
                    >
                      <UserCog size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[var(--text)]">Add New Admin</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="Admin Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="+212 6..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] tech-label hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    {submitting ? 'Adding...' : 'Add Admin'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AiInsightsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [devMode, setDevMode] = useState(false);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    // Enhanced system data for context-aware analysis
    const systemData = {
      apiLatency: "240ms",
      errorRate: "0.5%",
      activeUsers: 45231,
      revenueTrends: "Down 5% in Casablanca for Plumbing services",
      userDropOff: "High at payment step for new users",
      recentLogs: [
        "Payment timeout for user USR-1029 in Marrakech",
        "Slow query on artisans collection (Plumbing category)",
        "Failed login attempt from IP 192.168.1.1 (Artisan type)"
      ],
      userFeedback: [
        "The booking process is a bit confusing for non-tech users",
        "I love the AI price estimate feature!",
        "App crashed when I tried to upload my profile picture in Rabat"
      ],
      context: {
        topCities: ["Casablanca", "Rabat", "Marrakech"],
        topServices: ["Plumbing", "Electrical", "Cleaning"],
        userTypes: ["Client", "Artisan", "Seller"]
      }
    };

    try {
      const result = await aiService.getAdminInsights(systemData, history);
      if (result.businessInsights.revenueLoss === "Error analyzing") {
        throw new Error("AI Insights failed. Please check your Gemini API Key configuration.");
      }
      setInsights(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during the AI audit.");
    } finally {
      setLoading(false);
    }
  };

  const applyFix = (suggestion: any) => {
    setHistory(prev => [...prev, { suggestion, timestamp: new Date().toISOString(), status: 'fixed' }]);
    onAction?.(`Applied fix: ${suggestion.title}`);
    // In a real app, this would trigger a backend update
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-[var(--destructive)] bg-[var(--destructive)]/10 border-[var(--destructive)]/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/20';
      default: return 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/20';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tech-header text-[var(--text)] flex items-center gap-2">
            <BrainCircuit className="text-[var(--accent)]" /> AI System Insights 2.0
          </h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Predictive analysis, business intelligence, and automated decision support.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDevMode(!devMode)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${devMode ? 'bg-[var(--success)]/10 border-[var(--success)]/50 text-[var(--success)]' : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)]'}`}
          >
            Developer Mode: {devMode ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => {
              runAudit();
              onAction?.('Running AI system audit...');
            }}
            disabled={loading}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-[var(--accent)]/20"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Analyzing System...' : 'Run AI System Audit'}
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 text-[var(--destructive)] flex items-start gap-4"
        >
          <AlertCircle className="shrink-0 mt-1" />
          <div>
            <h3 className="font-bold">AI Insights Error</h3>
            <p className="text-sm opacity-90 mt-1">{error}</p>
            <p className="text-xs mt-3 opacity-70">
              Tip: Ensure your Gemini API Key is correctly set in the Secrets panel of your AI Studio settings.
            </p>
          </div>
        </motion.div>
      )}

      {!insights && !loading && !error && (
        <div className={`p-12 text-center rounded-2xl border border-dashed border-[var(--border)] text-[var(--text-muted)]`}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
            <BrainCircuit size={40} />
          </div>
          <h2 className="text-xl tech-header mb-2 text-[var(--text)]">Ready for Audit</h2>
          <p className="max-w-md mx-auto tech-label opacity-70">Click the button above to have Gemini AI analyze your platform's logs, performance metrics, and user feedback.</p>
        </div>
      )}

      {insights && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Top Layer: Health & Business */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Health Score */}
            <div className={`p-8 rounded-3xl flex flex-col items-center justify-center text-center ${cardClasses}`}>
              <h3 className="tech-label mb-6 opacity-50">System Health</h3>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="10" className="text-[var(--text)]/5" />
                  <circle
                    cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="10"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * (insights?.healthScore || 0)) / 100}
                    strokeLinecap="round"
                    className={(insights?.healthScore || 0) > 80 ? 'text-[var(--success)]' : (insights?.healthScore || 0) > 50 ? 'text-[var(--warning)]' : 'text-[var(--destructive)]'}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl tech-value text-[var(--text)]">{insights?.healthScore || 0}%</span>
                </div>
              </div>
            </div>

            {/* Business Insights */}
            <div className={`lg:col-span-3 p-8 rounded-3xl ${cardClasses}`}>
              <div className="flex items-center gap-2 mb-6 text-[var(--accent)]">
                <BarChart3 size={20} />
                <h3 className="text-lg tech-header text-[var(--text)]">Business Intelligence Layer</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--destructive)]/5 border border-[var(--destructive)]/10">
                  <p className="text-[10px] font-black uppercase text-[var(--destructive)] mb-1">Revenue Loss Risk</p>
                  <p className="text-sm text-[var(--text)] opacity-80">{insights?.businessInsights?.revenueLoss}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--warning)]/5 border border-[var(--warning)]/10">
                  <p className="text-[10px] font-black uppercase text-[var(--warning)] mb-1">User Drop-offs</p>
                  <p className="text-sm text-[var(--text)] opacity-80">{insights?.businessInsights?.userDropOffs}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--success)]/5 border border-[var(--success)]/10">
                  <p className="text-[10px] font-black uppercase text-[var(--success)] mb-1">Behavior Issues</p>
                  <p className="text-sm text-[var(--text)] opacity-80">{insights?.businessInsights?.behaviorIssues}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Layer: Issues & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity-Ranked Issues */}
            <div className={`p-8 rounded-3xl ${cardClasses}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-[var(--destructive)]">
                  <Bug size={20} />
                  <h3 className="text-lg tech-header text-[var(--text)]">Smart Prioritization</h3>
                </div>
                <span className="tech-label opacity-50">{insights?.issues?.length} Issues Detected</span>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {insights?.issues?.sort((a: any, b: any) => {
                  const order = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
                  return (order[a.severity as keyof typeof order] || 0) - (order[b.severity as keyof typeof order] || 0);
                }).map((issue: any, i: number) => (
                  <div key={i} className={`p-4 rounded-2xl border ${getSeverityColor(issue.severity)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-[var(--text)]">{issue.title}</h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-current">
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm opacity-80 mb-3 text-[var(--text)]">{issue.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {issue.context?.city && <span className="text-[10px] bg-[var(--text)]/5 px-2 py-0.5 rounded-md flex items-center gap-1 text-[var(--text-muted)]"><MapPin size={10} /> {issue.context.city}</span>}
                      {issue.context?.serviceType && <span className="text-[10px] bg-[var(--text)]/5 px-2 py-0.5 rounded-md flex items-center gap-1 text-[var(--text-muted)]"><Hammer size={10} /> {issue.context.serviceType}</span>}
                      {issue.context?.userType && <span className="text-[10px] bg-[var(--text)]/5 px-2 py-0.5 rounded-md flex items-center gap-1 text-[var(--text-muted)]"><Users size={10} /> {issue.context.userType}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictive Alerts */}
            <div className={`p-8 rounded-3xl ${cardClasses}`}>
              <div className="flex items-center gap-2 mb-6 text-[var(--warning)]">
                <Activity size={20} />
                <h3 className="text-lg tech-header text-[var(--text)]">Predictive Alerts</h3>
              </div>
              <div className="space-y-4">
                {insights?.predictiveAlerts?.map((alert: any, i: number) => (
                  <div key={i} className="p-5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--warning)]" />
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-[var(--text)]">{alert.alert}</h4>
                      <span className="text-[10px] font-black text-[var(--warning)] uppercase">{alert.timeframe}</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">{alert.forecast}</p>
                  </div>
                ))}
                {insights?.predictiveAlerts?.length === 0 && (
                  <div className="text-center py-12 opacity-30">
                    <Sparkles size={40} className="mx-auto mb-4 text-[var(--text-muted)]" />
                    <p className="tech-label">No immediate threats forecasted.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Layer: Suggestions & Simulation */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--success)]">
                <Sparkles size={20} />
                <h3 className="text-lg tech-header text-[var(--text)]">AI Decision Support & Simulation</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights?.suggestions?.map((suggestion: any, i: number) => (
                <div key={i} className={`p-8 rounded-3xl border transition-all ${cardClasses} ${suggestion.riskLevel === 'Advanced' ? 'border-[var(--warning)]/20' : 'border-[var(--success)]/20'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${suggestion.riskLevel === 'Advanced' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' : 'bg-[var(--success)]/10 text-[var(--success)]'}`}>
                        {suggestion.riskLevel === 'Advanced' ? <Zap size={20} /> : <ShieldCheck size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--text)]">{suggestion.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-black uppercase ${suggestion.riskLevel === 'Advanced' ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                            {suggestion.riskLevel} Fix
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] opacity-30">•</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-bold">{suggestion.confidence}% Confidence</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--text)] opacity-70 mb-6 leading-relaxed">{suggestion.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                      <p className="tech-label opacity-50 mb-1">Impact</p>
                      <p className="text-xs font-bold text-[var(--success)]">{suggestion.impact?.performance}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                      <p className="tech-label opacity-50 mb-1">Revenue</p>
                      <p className="text-xs font-bold text-[var(--accent)]">{suggestion.impact?.revenue}</p>
                    </div>
                  </div>

                  {/* Simulation Engine */}
                  <div className="p-4 rounded-2xl bg-[var(--bg)] border border-dashed border-[var(--border)] mb-6">
                    <div className="flex items-center gap-2 mb-2 tech-label opacity-50">
                      <Activity size={12} /> Simulation Result
                    </div>
                    <p className="text-xs text-[var(--text)] italic mb-2 opacity-80">"{suggestion.simulation?.expectedImprovement}"</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--success)]" style={{ width: `${suggestion.confidence}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--success)]">Expected: +{suggestion.confidence/2}%</span>
                    </div>
                  </div>

                  {/* Developer Mode: Technical Solution */}
                  {devMode && suggestion.technicalSolution && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6 p-4 rounded-2xl bg-black/40 border border-[var(--border)] font-mono text-[10px] overflow-x-auto no-scrollbar"
                    >
                      <p className="text-[var(--success)] mb-2">// Technical Solution</p>
                      {suggestion.technicalSolution.code && <pre className="text-[var(--text)] opacity-80">{suggestion.technicalSolution.code}</pre>}
                      {suggestion.technicalSolution.query && <pre className="text-blue-400">{suggestion.technicalSolution.query}</pre>}
                      {suggestion.technicalSolution.optimization && <pre className="text-[var(--warning)]">{suggestion.technicalSolution.optimization}</pre>}
                    </motion.div>
                  )}

                  <button 
                    onClick={() => applyFix(suggestion)}
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${suggestion.riskLevel === 'Advanced' ? 'bg-[var(--warning)] text-black hover:opacity-90' : 'bg-[var(--success)] text-white hover:opacity-90'}`}
                  >
                    Approve & Apply Fix
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Learning System History */}
          {history.length > 0 && (
            <div className={`p-8 rounded-3xl ${cardClasses}`}>
              <div className="flex items-center gap-2 mb-6 opacity-50">
                <CheckCircle size={20} className="text-[var(--success)]" />
                <h3 className="text-lg tech-header text-[var(--text)]">Learning System: Recent Fixes</h3>
              </div>
              <div className="space-y-3">
                {history.slice(-3).reverse().map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--success)]"><CheckCircle size={14} /></span>
                      <span className="font-bold text-[var(--text)]">{item.suggestion.title}</span>
                    </div>
                    <span className="tech-label opacity-40">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

const revenueData = [
  { name: 'Jan', revenue: 45000, escrow: 12000 },
  { name: 'Feb', revenue: 52000, escrow: 15000 },
  { name: 'Mar', revenue: 48000, escrow: 14000 },
  { name: 'Apr', revenue: 61000, escrow: 18000 },
  { name: 'May', revenue: 59000, escrow: 16000 },
  { name: 'Jun', revenue: 75000, escrow: 22000 },
  { name: 'Jul', revenue: 82000, escrow: 25000 },
];

const categoryData = [
  { name: 'Plumbing', value: 35 },
  { name: 'Electrical', value: 25 },
  { name: 'Painting', value: 20 },
  { name: 'Cleaning', value: 15 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#FFD700', '#3b82f6', '#8b5cf6', '#10b981', '#64748b'];

interface AnalyticsViewProps {
  isDarkMode: boolean;
  cardClasses: string;
  textMutedClasses: string;
  analyticsData: any;
  onAction?: (msg: string) => void;
}

export function AnalyticsView({ 
  isDarkMode, 
  cardClasses, 
  textMutedClasses,
  analyticsData,
  onAction 
}: AnalyticsViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl tech-header text-[var(--text)]">Analytics & Reports</h1>
          <p className="tech-label mt-1 opacity-70">Deep dive into platform performance and growth metrics.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onAction?.('Generating analytics report...')}
            className={`px-4 py-2 rounded-lg text-sm font-bold border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'} flex items-center gap-2 transition-all active:scale-95`}
          >
            <Download size={16} /> Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="hynex-card p-8">
          <h3 className="tech-label mb-8">Growth Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.revenueTrends || revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono'}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card-bg)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '16px', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hynex-card p-8">
          <h3 className="tech-label mb-8">Category Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.categoryDistribution || categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {(analyticsData?.categoryDistribution || categoryData)?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card-bg)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '16px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArtisansView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState<any>(null);

  useEffect(() => {
    fetchArtisans();
  }, [token]);

  const fetchArtisans = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/admin/artisans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setArtisans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch artisans:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/artisans/${id}/toggle-featured`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setArtisans(prev => prev.map(a => a.id === id ? { ...a, is_featured: a.is_featured ? 0 : 1 } : a));
      }
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
    }
  };

  const handleVerify = async (id: string, currentStatus: boolean) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/artisans/${id}/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ verified: !currentStatus })
      });
      if (response.ok) {
        fetchArtisans();
        onAction?.(`Artisan ${!currentStatus ? 'verified' : 'unverified'} successfully`);
        if (selectedArtisan?.id === id) setSelectedArtisan(null);
      }
    } catch (error) {
      onAction?.('Failed to update verification status');
    }
  };

  const filteredArtisans = artisans.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         a.category_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPending = !showPendingOnly || !a.is_verified;
    return matchesSearch && matchesPending;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl tech-header text-[var(--text)] uppercase">Artisans Management</h1>
          <p className="tech-label mt-2 opacity-70">Approve, feature, and monitor artisan performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowPendingOnly(!showPendingOnly)}
            className={`px-8 py-4 rounded-2xl tech-label border transition-all active:scale-95 ${
              showPendingOnly 
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' 
                : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--card-bg)]'
            }`}
          >
            {showPendingOnly ? 'Showing Pending' : `Pending Approvals (${artisans.filter(a => !a.is_verified).length})`}
          </button>
        </div>
      </div>

      <div className="hynex-card p-8 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="flex items-center px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex-1 focus-within:border-[var(--accent)]/30 transition-all">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search artisans..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full ml-4 tech-label text-[var(--text)] not-italic" 
            />
          </div>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="tech-label border-b border-[var(--border)]">
                <th className="px-10 py-8 font-black">Artisan</th>
                <th className="px-10 py-8 font-black">Category</th>
                <th className="px-10 py-8 font-black">Rating</th>
                <th className="px-10 py-8 font-black">Status</th>
                <th className="px-10 py-8 font-black">Featured</th>
                <th className="px-10 py-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <Loader2 size={40} className="animate-spin text-[var(--accent)]" />
                      <p className="tech-label">Loading artisans...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredArtisans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <p className="tech-label opacity-50">No artisans found.</p>
                  </td>
                </tr>
              ) : filteredArtisans.map((artisan) => (
                <tr key={artisan.id} className="group hover:bg-[var(--accent)]/5 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[20px] overflow-hidden border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-all shadow-sm">
                        <img src={artisan.avatar_url || `https://picsum.photos/seed/${artisan.id}/100/100`} alt={artisan.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm tech-header text-[var(--text)] uppercase">{artisan.name}</p>
                        <p className="tech-label mt-1 opacity-70">{artisan.city || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-1.5 rounded-full bg-[var(--glass-bg)] tech-label border border-[var(--glass-border)]">
                      {artisan.category_name}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-[var(--accent)]">
                      <Star size={16} className="fill-current" />
                      <span className="text-sm tech-value">{artisan.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {artisan.is_verified ? (
                      <span className="px-4 py-1.5 rounded-full tech-label bg-[var(--success)]/5 text-[var(--success)] border border-[var(--success)]/20 flex items-center gap-2 w-fit">
                        <CheckCircle size={14} /> Verified
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 rounded-full tech-label bg-[var(--warning)]/5 text-[var(--warning)] border border-[var(--warning)]/20 flex items-center gap-2 w-fit">
                        <AlertCircle size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-8">
                    <button 
                      onClick={() => {
                        toggleFeatured(artisan.id);
                        onAction?.(`Toggling featured status for ${artisan.name}...`);
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${artisan.is_featured ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--card-bg)] text-[var(--text-muted)]'}`}
                      title={artisan.is_featured ? "Featured" : "Not Featured"}
                    >
                      <Zap size={18} className={artisan.is_featured ? "fill-current" : ""} />
                    </button>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => setSelectedArtisan(artisan)}
                      className="w-10 h-10 rounded-xl bg-[var(--card-bg)] flex items-center justify-center hover:bg-[var(--card-bg)]/80 transition-all text-[var(--text)]"
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

      {/* Artisan Details Modal */}
      <AnimatePresence>
        {selectedArtisan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-10 shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setSelectedArtisan(null)}
                className="absolute top-8 right-8 p-3 hover:bg-[var(--bg)] rounded-2xl transition-all"
              >
                <X size={24} className="text-[var(--text-muted)]" />
              </button>

              <div className="flex flex-col md:flex-row gap-10">
                <div className="w-40 h-40 rounded-[32px] overflow-hidden border-2 border-[var(--accent)]/20 shrink-0">
                  <img 
                    src={selectedArtisan.avatar_url || `https://picsum.photos/seed/${selectedArtisan.id}/200/200`} 
                    alt={selectedArtisan.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-3xl tech-header uppercase text-[var(--text)]">{selectedArtisan.name}</h2>
                    <p className="tech-label text-[var(--accent)] mt-2">{selectedArtisan.category_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-3xl bg-[var(--bg)] border border-[var(--border)]">
                      <p className="tech-label mb-1 opacity-50">City</p>
                      <p className="text-sm tech-value not-italic text-[var(--text)]">{selectedArtisan.city || 'Not specified'}</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-[var(--bg)] border border-[var(--border)]">
                      <p className="tech-label mb-1 opacity-50">Rating</p>
                      <div className="flex items-center gap-2 text-[var(--accent)]">
                        <Star size={16} className="fill-current" />
                        <span className="text-sm tech-value">{selectedArtisan.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => handleVerify(selectedArtisan.id, selectedArtisan.is_verified)}
                      className={`flex-1 py-5 rounded-[24px] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 ${
                        selectedArtisan.is_verified 
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' 
                          : 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 hover:bg-[var(--success)]/20'
                      }`}
                    >
                      {selectedArtisan.is_verified ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                      {selectedArtisan.is_verified ? 'Revoke Verification' : 'Verify Artisan'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AuditLogsViewProps {
  isDarkMode: boolean;
  cardClasses: string;
  textMutedClasses: string;
  hoverClasses: string;
  onAction?: (msg: string) => void;
}

export function AuditLogsView({ 
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

export function CashCollectionsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtisan, setSelectedArtisan] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');

  const fetchCollections = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cash-collections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cash collections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [token]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArtisan || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/cash-collections/${selectedArtisan.artisan_id}/record-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });
      if (res.ok) {
        setSelectedArtisan(null);
        setAmount('');
        fetchCollections();
        onAction?.(`Payment of MAD ${amount} recorded for ${selectedArtisan.artisan_name}`);
      }
    } catch (error) {
      onAction?.('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const totalOwed = collections.reduce((acc, c) => acc + c.commission_owed, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tech-header text-2xl">Cash Collections</h1>
          <p className="tech-label opacity-70 mt-1">Track commissions owed by artisans for cash-on-delivery jobs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Owed" value={`MAD ${totalOwed.toLocaleString()}`} trend="+5.2%" isPositive={false} isDarkMode={isDarkMode} />
        <KpiCard title="Collected (MTD)" value="MAD 8,200" trend="+15.1%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Overdue Artisans" value={collections.length.toString()} trend="-2" isPositive={true} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-6 py-4 tech-label">Artisan</th>
                <th className="px-6 py-4 tech-label">Total Cash Handled</th>
                <th className="px-6 py-4 tech-label">Commission Owed</th>
                <th className="px-6 py-4 tech-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center tech-label opacity-50">Loading...</td></tr>
              ) : collections.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center tech-label opacity-50">No cash collections found.</td></tr>
              ) : collections.map((c) => (
                <tr key={c.artisan_id} className="group hover:bg-[var(--accent)]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.artisan_name} className="w-10 h-10 rounded-2xl object-cover border border-[var(--border)]" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center tech-header text-sm not-italic">
                          {c.artisan_name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="tech-header text-sm not-italic text-[var(--text)]">{c.artisan_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 tech-value text-sm text-[var(--text)] not-italic">MAD {c.total_cash_handled.toLocaleString()}</td>
                  <td className="px-6 py-4 tech-value text-sm text-[var(--destructive)] not-italic font-bold">MAD {c.commission_owed.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedArtisan(c);
                        setAmount(c.commission_owed.toString());
                      }}
                      className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-xl tech-label hover:opacity-90 transition-all active:scale-95 shadow-sm"
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

      {/* Record Payment Modal */}
      <AnimatePresence>
        {selectedArtisan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[var(--text)]">Record Payment</h3>
                <button onClick={() => setSelectedArtisan(null)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] tech-header text-sm not-italic">
                    {selectedArtisan.artisan_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="tech-header text-sm not-italic text-[var(--text)]">{selectedArtisan.artisan_name}</p>
                    <p className="tech-label opacity-70">Owed: MAD {selectedArtisan.commission_owed.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Payment Amount (MAD)</label>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedArtisan(null)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] tech-label hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {submitting ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CategoriesViewProps {
  isDarkMode: boolean;
  cardClasses: string;
  textMutedClasses: string;
  hoverClasses: string;
  onAction?: (msg: string) => void;
}

export function CategoriesView({ 
  isDarkMode, 
  cardClasses, 
  textMutedClasses, 
  hoverClasses, 
  onAction 
}: CategoriesViewProps) {
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', icon: 'Package', commission_rate: '0.10' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          commission_rate: parseFloat(formData.commission_rate)
        })
      });

      if (response.ok) {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', icon: 'Package', commission_rate: '0.10' });
        fetchCategories();
        onAction?.(`Category ${editingCategory ? 'updated' : 'added'} successfully`);
      }
    } catch (error) {
      onAction?.('Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchCategories();
        onAction?.('Category deleted successfully');
      }
    } catch (error) {
      onAction?.('Failed to delete category');
    }
  };

  const toggleActive = async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/categories/${id}/toggle-active`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: c.is_active ? 0 : 1 } : c));
      }
    } catch (error) {
      console.error('Failed to toggle category status:', error);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-[var(--text)]">Categories Management</h1>
          <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mt-2">Add, edit, or hide service and product categories.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', icon: 'Package', commission_rate: '0.10' });
              setShowModal(true);
            }}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-[var(--accent)]/10"
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="px-10 py-8 font-black">Category Name</th>
                <th className="px-10 py-8 font-black">Commission Rate</th>
                <th className="px-10 py-8 font-black">Status</th>
                <th className="px-10 py-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <Loader2 size={40} className="animate-spin text-[var(--accent)]" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Loading categories...</p>
                    </div>
                  </td>
                </tr>
              ) : categories.map((item, i) => (
                <tr key={i} className="group hover:bg-[var(--card-bg)]/50 transition-all">
                  <td className="px-10 py-8">
                    <p className="text-sm font-black uppercase tracking-tight text-[var(--text)]">{item.name}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-[var(--text)]">
                        {item.commission_rate !== null ? (item.commission_rate * 100).toFixed(1) : 'Global'}
                      </span>
                      <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">%</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--card-bg)] ${
                      item.is_active ? 'text-[var(--success)]' : 'text-[var(--destructive)]'
                    }`}>
                      {item.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button 
                        onClick={() => toggleActive(item.id)}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${item.is_active ? 'text-[var(--accent)] hover:opacity-80' : 'text-[var(--success)] hover:opacity-80'}`}
                      >
                        {item.is_active ? 'Hide' : 'Restore'}
                      </button>
                      <button 
                        onClick={() => {
                          setEditingCategory(item);
                          setFormData({ 
                            name: item.name, 
                            icon: item.icon || 'Package', 
                            commission_rate: (item.commission_rate || 0.10).toString() 
                          });
                          setShowModal(true);
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text)] transition-all active:scale-95"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(item.id)}
                        className="text-[10px] font-black uppercase tracking-widest text-[var(--destructive)] hover:opacity-80 transition-all active:scale-95"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[var(--text)]">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Category Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="e.g. Plumbing"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Commission Rate (0.0 - 1.0)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="1"
                    required
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="0.10"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-2 italic">0.10 means 10% commission on each order.</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {submitting ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CitiesView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCities = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [token]);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/cities', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newCityName })
      });
      if (res.ok) {
        setShowModal(false);
        setNewCityName('');
        fetchCities();
        onAction?.('City added successfully');
      }
    } catch (error) {
      onAction?.('Failed to add city');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCity = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this city?')) return;
    try {
      const res = await fetch(`/api/admin/cities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCities();
        onAction?.('City deleted successfully');
      }
    } catch (error) {
      onAction?.('Failed to delete city');
    }
  };

  const toggleCityStatus = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/cities/${id}/toggle-active`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCities();
      }
    } catch (error) {
      console.error('Failed to toggle city status:', error);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">Cities & Coverage</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">Manage operational cities and service availability zones.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#FFD400] text-black px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#FFD400]/90 transition-all active:scale-95 shadow-xl shadow-[#FFD400]/10"
        >
          <Plus size={18} /> Add City
        </button>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 border-b border-white/5">
                <th className="px-10 py-8 font-black">City Name</th>
                <th className="px-10 py-8 font-black">Active Artisans</th>
                <th className="px-10 py-8 font-black">Active Orders</th>
                <th className="px-10 py-8 font-black">Status</th>
                <th className="px-10 py-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <Loader2 size={40} className="animate-spin text-[#FFD400]" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Loading cities...</p>
                    </div>
                  </td>
                </tr>
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">No cities found.</p>
                  </td>
                </tr>
              ) : cities.map((city) => (
                <tr key={city.id} className="group hover:bg-white/5 transition-all">
                  <td className="px-10 py-8">
                    <p className="text-sm font-black uppercase tracking-tight">{city.name}</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-xs font-mono font-bold">{Math.floor(Math.random() * 500)}</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-xs font-mono font-bold">{Math.floor(Math.random() * 2000)}</p>
                  </td>
                  <td className="px-10 py-8">
                    <button 
                      onClick={() => toggleCityStatus(city.id)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 transition-all hover:opacity-80 ${
                        city.is_active ? 'text-[#22C55E]' : 'text-[#F59E0B]'
                      }`}
                    >
                      {city.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => onAction?.(`Managing settings for ${city.name}...`)}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                        title="City Settings"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCity(city.id)}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-rose-500/20 text-rose-500 transition-all"
                        title="Delete City"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add City Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Add New City</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                  <X size={20} className="text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleAddCity} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">City Name</label>
                  <input 
                    type="text" 
                    required
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-[#FFD400]/50 outline-none transition-all font-bold"
                    placeholder="e.g. Casablanca"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[#FFD400] text-black font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-[#FFD400]/10"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {submitting ? 'Adding...' : 'Add City'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CommissionRulesViewProps {
  settings: any;
  updateSettings: any;
  isDarkMode: boolean;
  textMutedClasses: string;
  onAction?: (msg: string) => void;
}

export function CommissionRulesView({ 
  settings, 
  updateSettings, 
  isDarkMode, 
  textMutedClasses, 
  onAction 
}: CommissionRulesViewProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      alert('Commission rules updated successfully!');
    } catch (error) {
      alert('Failed to update commission rules.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    if (value === 'NaN') return;
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tech-header text-2xl">Commission Rules</h1>
          <p className="tech-label opacity-70 mt-1">Manage platform fees and commission rates.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl tech-label hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="hynex-card p-8 group">
          <h3 className="tech-header text-lg mb-6 flex items-center gap-3 text-[var(--text)]">
            <Hammer size={20} className="text-[var(--accent)] group-hover:rotate-12 transition-transform" />
            Artisan Services
          </h3>
          <div className="space-y-6">
            <div>
              <label className="tech-label opacity-70 mb-2 block">Global Service Commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_rate || '10'} 
                  onChange={(e) => {
                    handleChange('commission_rate', e.target.value);
                  }}
                  className="w-full rounded-2xl py-4 px-5 tech-value text-sm focus:outline-none text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)]/50 transition-all not-italic" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 tech-label opacity-50">%</span>
              </div>
            </div>
            <div>
              <label className="tech-label opacity-70 mb-2 block">Featured Artisan Commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={isNaN(parseFloat(localSettings.commission_featured || '0.15')) ? 15 : parseFloat(localSettings.commission_featured || '0.15') * 100} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_featured', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className="w-full rounded-2xl py-4 px-5 tech-value text-sm focus:outline-none text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)]/50 transition-all not-italic" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 tech-label opacity-50">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hynex-card p-8 group">
          <h3 className="tech-header text-lg mb-6 flex items-center gap-3 text-[var(--text)]">
            <ShoppingBag size={20} className="text-[var(--accent)] group-hover:scale-110 transition-transform" />
            Material Sales
          </h3>
          <div className="space-y-6">
            <div>
              <label className="tech-label opacity-70 mb-2 block">Global Material Commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_material_rate || '5'} 
                  onChange={(e) => {
                    handleChange('commission_material_rate', e.target.value);
                  }}
                  className="w-full rounded-2xl py-4 px-5 tech-value text-sm focus:outline-none text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)]/50 transition-all not-italic" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 tech-label opacity-50">%</span>
              </div>
            </div>
            <div>
              <label className="tech-label opacity-70 mb-2 block">Premium Seller Commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={isNaN(parseFloat(localSettings.commission_material_premium || '0.08')) ? 8 : parseFloat(localSettings.commission_material_premium || '0.08') * 100} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_material_premium', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className="w-full rounded-2xl py-4 px-5 tech-value text-sm focus:outline-none text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)]/50 transition-all not-italic" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 tech-label opacity-50">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompaniesView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchCompanies = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [token]);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', address: '' });
        fetchCompanies();
        onAction?.('Company added successfully');
      }
    } catch (error) {
      onAction?.('Failed to add company');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl tech-header text-[var(--text)]">Companies Management</h1>
          <p className="tech-label mt-2 opacity-70">Manage corporate accounts, verify business documents, and track company performance.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-2xl tech-label hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-[var(--accent)]/10 flex items-center gap-3"
        >
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KpiCard title="Total Companies" value={companies.length.toString()} icon={<Building2 size={20} />} trend="+12%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Verified Businesses" value={companies.filter(c => c.is_verified).length.toString()} icon={<ShieldCheck size={20} />} trend="+5%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Pending Verification" value={companies.filter(c => !c.is_verified).length.toString()} icon={<Clock size={20} />} trend="-8%" isPositive={false} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card p-8 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="flex items-center px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex-1 focus-within:border-[var(--accent)]/30 transition-all">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full ml-4 tech-label text-[var(--text)] not-italic" 
            />
          </div>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="tech-label text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="px-10 py-8 font-black">Company</th>
                <th className="px-10 py-8 font-black">Contact</th>
                <th className="px-10 py-8 font-black">Status</th>
                <th className="px-10 py-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={4} className="px-10 py-20 text-center tech-label opacity-50">Loading companies...</td></tr>
              ) : filteredCompanies.length === 0 ? (
                <tr><td colSpan={4} className="px-10 py-20 text-center tech-label opacity-50">No companies found.</td></tr>
              ) : filteredCompanies.map((company) => (
                <tr key={company.id} className="group hover:bg-[var(--accent)]/5 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--bg)] flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-all">
                        <Building2 size={24} className="text-[var(--accent)]" />
                      </div>
                      <div>
                        <p className="tech-header text-sm text-[var(--text)]">{company.name}</p>
                        <p className="tech-label opacity-50 mt-1">{company.address || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="tech-value text-xs not-italic">
                      <p className="text-[var(--text)]">{company.email}</p>
                      <p className="text-[var(--text-muted)] mt-1">{company.phone}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {company.is_verified ? (
                      <span className="px-4 py-1.5 rounded-full tech-label bg-[var(--success)]/10 text-[var(--success)] flex items-center gap-2 w-fit border border-[var(--success)]/20">
                        <CheckCircle size={14} /> Verified
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 rounded-full tech-label bg-[var(--warning)]/10 text-[var(--warning)] flex items-center gap-2 w-fit border border-[var(--warning)]/20">
                        <AlertCircle size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all text-[var(--text)]">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Company Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl tech-header text-[var(--text)]">Add Company</h3>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-[var(--bg)] rounded-2xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleAddCompany} className="space-y-6">
                <div>
                  <label className="block tech-label opacity-70 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-label not-italic"
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className="block tech-label opacity-70 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-label not-italic"
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <label className="block tech-label opacity-70 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-label not-italic"
                    placeholder="+212 5..."
                  />
                </div>
                <div>
                  <label className="block tech-label opacity-70 mb-2">Address</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-label not-italic"
                    placeholder="Casablanca, Morocco"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-8 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] tech-label text-[var(--text)] hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-8 py-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] tech-label hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    {submitting ? 'Adding...' : 'Add Company'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const donutData = [
  { name: 'Hospital Visits', value: 40, color: 'var(--accent)' },
  { name: 'Medication', value: 35, color: 'var(--success)' },
  { name: 'Lab Tests', value: 25, color: 'var(--warning)' },
];

const limits = [
  { name: 'Hospitals', value: 40, color: 'var(--success)' },
  { name: 'Lab Tests', value: 25, color: 'var(--warning)' },
  { name: 'Medications', value: 35, color: 'var(--accent)' },
  { name: 'Other', value: 20, color: 'var(--text-muted)' },
];

const records = [
  { category: 'Consultation', value: '$120.00', status: 'Paid', color: 'text-[var(--success)]' },
  { category: 'Pharmacy', value: '$265.00', status: 'Claimed', color: 'text-[var(--accent)]' },
  { category: 'Insurance', value: '$1,200.00', status: 'Pending', color: 'text-[var(--warning)]' },
  { category: 'Lab Test', value: '$300.00', status: 'Paid', color: 'text-[var(--success)]' },
];

function RevenueCard({ stats }: { stats: any }) {
  const revenue = stats?.totalRevenue || 0;
  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ];

  return (
    <div className="hynex-card p-10 h-full flex flex-col justify-between min-h-[450px] group">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="tech-label mb-4">Total Revenue</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl tech-value text-[var(--text-muted)]">MAD</span>
            <h2 className="text-5xl tech-header text-[var(--text)] font-mono">{revenue.toLocaleString()}</h2>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex flex-col">
              <span className="text-[8px] tech-label opacity-50">Yearly Average</span>
              <span className="text-xs tech-value">MAD {(revenue / 12).toFixed(2)}</span>
            </div>
            <div className="h-8 w-px bg-[var(--border)]" />
            <div className="flex items-center gap-2 text-[var(--accent)] cursor-pointer hover:opacity-80 transition-opacity">
              <Info size={14} />
              <span className="tech-label text-[var(--accent)]">Details</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="tech-label mb-2">Vs Last Year</p>
          <p className="text-[var(--accent)] tech-value text-2xl">+12.4%</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col mt-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-[var(--accent)] tech-header text-sm">AI Insights</h3>
            <p className="tech-label">Analyzing market trends...</p>
          </div>
          <Sparkles size={16} className="text-[var(--accent)] animate-pulse" />
        </div>
        
        <div className="relative w-full h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--accent)" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorRev)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-full h-full bg-[var(--accent)] rounded-full absolute top-0 left-0 blur-[80px] -z-10"
          />
        </div>
      </div>
    </div>
  );
}

function MetricsCard({ stats }: { stats: any }) {
  return (
    <div className="hynex-card p-10 h-full min-h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <h3 className="tech-label">Platform Metrics</h3>
        <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><MoreVertical size={20} /></button>
      </div>

      <div className="space-y-10 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-5xl tech-header text-[var(--text)] font-mono">{stats?.totalBookings || 0}</h2>
            <p className="tech-label">Total Bookings</p>
            <p className="tech-label mt-4 max-w-[180px] leading-relaxed opacity-70">AI-powered artisan performance insights</p>
          </div>
          <div className="w-24 h-24 rounded-[32px] border border-[var(--border)] bg-[var(--glass-bg)] flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--accent)]/5 group-hover:bg-[var(--accent)]/10 transition-colors" />
            <span className="text-2xl tech-value text-[var(--accent)] relative z-10">18%</span>
            <span className="tech-label relative z-10 opacity-50">Growth</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--glass-bg)] rounded-[24px] p-6 border border-[var(--glass-border)] hover:border-[var(--accent)]/30 transition-colors">
            <h4 className="text-3xl tech-header text-[var(--text)] font-mono">$265</h4>
            <p className="tech-label">Avg Order</p>
          </div>
          <div className="bg-[var(--glass-bg)] rounded-[24px] p-6 border border-[var(--glass-border)] relative group hover:border-[var(--accent)]/30 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-3xl tech-header text-[var(--text)] font-mono">8k</h4>
                <p className="tech-label">Active Users</p>
              </div>
              <span className="tech-value text-[var(--accent)]">24%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center -space-x-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-10 h-10 rounded-xl border-2 border-[var(--bg)] overflow-hidden shadow-lg">
                <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-10 h-10 rounded-xl border-2 border-[var(--bg)] bg-[var(--glass-bg)] flex items-center justify-center text-[var(--text-muted)] text-[10px] font-black shadow-lg">
              +12
            </div>
          </div>
          <button className="p-3 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 transition-all active:scale-95">
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FinanceCard({ stats }: { stats: any }) {
  return (
    <div className="hynex-card p-10 h-full min-h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <h3 className="tech-label">User Base</h3>
        <div className="flex items-center gap-2 tech-label bg-[var(--glass-bg)] px-4 py-2 rounded-xl border border-[var(--glass-border)]">
          <span className="tech-value">{stats?.totalUsers || 0}</span> Total
        </div>
      </div>

      <div className="flex items-center gap-8 mb-10">
        <div className="relative w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                innerRadius={60}
                outerRadius={75}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl tech-value text-[var(--text)]">100%</span>
            <span className="tech-label opacity-50">Artisans</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {donutData.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--glass-bg)]/30 border border-[var(--glass-border)]/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="tech-label opacity-70">{item.name}</span>
              </div>
              <span className="text-xs tech-value text-[var(--text)]">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="tech-label block mb-1">Growth Curve</span>
            <span className="text-lg tech-header text-[var(--text)]">MAD 12,500</span>
          </div>
          <span className="text-xs tech-value text-[var(--success)]">+6.2%</span>
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { x: 0, y: 10 }, { x: 1, y: 25 }, { x: 2, y: 15 }, { x: 3, y: 40 }, { x: 4, y: 30 }, { x: 5, y: 50 }
            ]}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="y" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function TrackingCard() {
  return (
    <div className="hynex-card p-10 h-full min-h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <Activity className="text-[var(--accent)]" size={20} />
          <h3 className="tech-label">Financial Tracking</h3>
        </div>
        <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><MoreVertical size={20} /></button>
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <p className="tech-label opacity-70">Monthly Expenses</p>
          <span className="text-[var(--success)] tech-value">+8%</span>
        </div>
        <div className="flex items-baseline gap-3">
          <h2 className="text-5xl tech-header text-[var(--text)] font-mono">$1,390</h2>
          <span className="text-[var(--text-muted)] text-lg tech-value opacity-50">/ $1,600</span>
          <span className="tech-label ml-auto opacity-50">2 days left</span>
        </div>
      </div>
      <div className="space-y-8 flex-1">
        <div>
          <h4 className="tech-label mb-6 opacity-70">Spending Limits</h4>
          <div className="h-3 w-full bg-[var(--bg)] rounded-full overflow-hidden flex border border-[var(--border)]">
            <div className="h-full bg-[var(--success)]" style={{ width: '40%' }} />
            <div className="h-full bg-[var(--warning)]" style={{ width: '25%' }} />
            <div className="h-full bg-[var(--accent)]" style={{ width: '35%' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-6">
          {limits.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="tech-label opacity-70">{item.name} ({item.value}%)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <div className="bg-[var(--glass-bg)] rounded-3xl p-6 border border-[var(--glass-border)] flex items-center justify-between group cursor-pointer hover:bg-[var(--glass-border)] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="tech-label opacity-50">AI Insights</p>
              <p className="text-xs tech-header text-[var(--text)]">70% Care, 20% Preventive</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[var(--accent)] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

function SearchMetricsTable() {
  return (
    <div className="hynex-card p-10 h-full min-h-[450px] flex flex-col">
      <div className="relative mb-10">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input 
          type="text" 
          placeholder="Search artisan metrics..." 
          className="w-full bg-[var(--bg)] border border-[var(--border)] py-5 pl-14 pr-14 rounded-3xl tech-label focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)] not-italic"
        />
        <button className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          <Filter size={18} />
        </button>
      </div>

      <div className="flex gap-8 mb-8 border-b border-[var(--border)]">
        {['All Records', 'Pending', 'Completed'].map((tab, i) => (
          <button 
            key={tab} 
            className={`tech-label pb-4 border-b-2 transition-all ${i === 0 ? 'border-[var(--accent)] text-[var(--text)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-x-auto no-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="pb-6 tech-label">Category</th>
              <th className="pb-6 tech-label">Value</th>
              <th className="pb-6 tech-label text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {records.map((record, i) => (
              <tr key={i} className="group hover:bg-[var(--accent)]/5 transition-colors">
                <td className="py-6 text-sm tech-header text-[var(--text)] not-italic">{record.category}</td>
                <td className="py-6 text-sm tech-value text-[var(--text)] not-italic">{record.value}</td>
                <td className="py-6 text-right">
                  <span className={`tech-label px-4 py-1.5 rounded-full bg-[var(--bg)] border border-[var(--border)] ${record.color}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AiAssistantChat() {
  return (
    <div className="hynex-card p-10 h-full min-h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-[var(--accent)]" />
          <h3 className="tech-label">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><FileText size={18} /></button>
          <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><ArrowUpRight size={18} /></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
        <p className="tech-label max-w-[220px] leading-relaxed opacity-70">What areas should I prioritize for artisan growth?</p>
        
        <div className="w-full bg-[var(--bg)] rounded-3xl p-8 border border-[var(--border)] text-left relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--accent)]" />
          <div className="flex items-center gap-3 text-[var(--accent)] mb-4">
            <Zap size={16} />
            <span className="tech-label">Growth Strategy</span>
          </div>
          <p className="text-xs tech-header text-[var(--text)] not-italic leading-relaxed">
            Prioritize: High-demand categories, verified artisans. Avoid: Low-rated services, inactive regions.
          </p>
        </div>

        <div className="flex gap-3 w-full overflow-x-auto no-scrollbar py-2">
          {['AI Hub', 'Artisan Finance', 'Market Analysis'].map((tag, i) => (
            <button key={i} className="whitespace-nowrap px-5 py-2.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] tech-label hover:border-[var(--accent)]/50 hover:text-[var(--text)] transition-all">
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] shadow-lg shadow-[var(--accent)]/20">
          <Sparkles size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Ask AI anything..." 
          className="w-full bg-[var(--bg)] border border-[var(--border)] py-6 pl-20 pr-14 rounded-3xl tech-label focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)] not-italic"
        />
        <button className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

export function DashboardOverview({ stats, isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: any) {
  return (
    <div className="grid grid-cols-12 gap-10">
      {/* Row 1 */}
      <div className="col-span-12 lg:col-span-4">
        <RevenueCard stats={stats} />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <MetricsCard stats={stats} />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <FinanceCard stats={stats} />
      </div>

      {/* Row 2 */}
      <div className="col-span-12 lg:col-span-4">
        <TrackingCard />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <SearchMetricsTable />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <AiAssistantChat />
      </div>
    </div>
  );
}

export function DisputesView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDisputes = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/disputes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDisputes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [token]);

  const handleResolve = async (id: string, resolution: string) => {
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/disputes/${id}/resolve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ resolution })
      });
      if (res.ok) {
        setSelectedDispute(null);
        fetchDisputes();
        onAction?.(`Dispute resolved with: ${resolution}`);
      }
    } catch (error) {
      onAction?.('Failed to resolve dispute');
    } finally {
      setSubmitting(false);
    }
  };

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
                      onClick={() => setSelectedDispute(d)}
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

      {/* Review Case Modal */}
      <AnimatePresence>
        {selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[var(--text)]">Review Dispute</h3>
                <button onClick={() => setSelectedDispute(null)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Reason for Dispute</p>
                  <p className="text-sm text-[var(--text)]">{selectedDispute.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Client</p>
                    <p className="text-sm font-bold text-[var(--text)]">{selectedDispute.client_name}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Artisan</p>
                    <p className="text-sm font-bold text-[var(--text)]">{selectedDispute.artisan_name}</p>
                  </div>
                </div>

                {selectedDispute.status !== 'resolved' && (
                  <div className="space-y-4 pt-4">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest text-center">Take Action</p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleResolve(selectedDispute.id, 'refund_client')}
                        disabled={submitting}
                        className="w-full py-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
                        Refund Client
                      </button>
                      <button 
                        onClick={() => handleResolve(selectedDispute.id, 'pay_artisan')}
                        disabled={submitting}
                        className="w-full py-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                        Pay Artisan
                      </button>
                      <button 
                        onClick={() => handleResolve(selectedDispute.id, 'split_payment')}
                        disabled={submitting}
                        className="w-full py-4 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <AlertTriangle size={18} />}
                        Split 50/50
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EscrowView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEscrows = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/escrows', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEscrows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, [token]);

  const filteredEscrows = escrows.filter(e => 
    e.project_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.parties.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFunds = escrows.reduce((acc, e) => acc + (e.amount || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escrow Management</h1>
          <p className="text-sm text-white/40 mt-1">Manage funds held in escrow for active projects and material orders.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onAction?.('Escrow Policies functionality coming soon!')}
            className="bg-[#FFD700] text-black px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all active:scale-95"
          >
            <ShieldCheck size={18} /> Escrow Policies
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Funds in Escrow" value={`MAD ${totalFunds.toLocaleString()}`} icon={<ShieldCheck size={20} />} trend="+5%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Active Escrows" value={escrows.filter(e => e.status !== 'released').length.toString()} icon={<Clock size={20} />} trend="+12%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Disputed Escrows" value={escrows.filter(e => e.status === 'disputed').length.toString()} icon={<AlertTriangle size={20} />} trend="-2%" isPositive={false} isDarkMode={isDarkMode} />
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex items-center px-4 py-2 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} flex-1 max-w-md`}>
          <Search size={18} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Search projects or parties..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm text-[var(--text)]" 
          />
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Active Escrow Transactions</h3>
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
                <th className="px-8 py-4 font-medium">Project / Order</th>
                <th className="px-8 py-4 font-medium">Parties</th>
                <th className="px-8 py-4 font-medium">Amount</th>
                <th className="px-8 py-4 font-medium">Release Date</th>
                <th className="px-8 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">Loading escrows...</td></tr>
              ) : filteredEscrows.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">No escrows found.</td></tr>
              ) : filteredEscrows.map((escrow) => (
                <tr key={escrow.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5 font-bold">{escrow.project_name}</td>
                  <td className="px-8 py-5 text-white/60">{escrow.parties}</td>
                  <td className="px-8 py-5 font-bold text-[#FFD700]">MAD {escrow.amount.toLocaleString()}</td>
                  <td className="px-8 py-5 text-white/40">{new Date(escrow.release_date).toLocaleDateString()}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-2 w-fit ml-auto ${
                      escrow.status === 'locked' ? 'bg-white/5 text-white/60' : 
                      escrow.status === 'pending_release' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {escrow.status === 'locked' ? <Lock size={12} /> : <Unlock size={12} />}
                      {escrow.status.replace('_', ' ')}
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

export function FraudMonitoringView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAlerts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fraud-alerts', {
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

export function MaterialSellersView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', email: '', phone: '' });

  const fetchSellers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/material-sellers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSellers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [token]);

  const handleAddSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/material-sellers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', category: '', email: '', phone: '' });
        fetchSellers();
        onAction?.('Seller added successfully');
      }
    } catch (error) {
      onAction?.('Failed to add seller');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSellers = sellers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Material Sellers</h1>
          <p className="text-sm text-white/40 mt-1">Manage suppliers, inventory categories, and material pricing across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onAction?.('Manage Categories functionality coming soon!')}
            className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all active:scale-95"
          >
            Manage Categories
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#FFD700] text-black px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all active:scale-95"
          >
            <Plus size={18} /> Add Seller
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex items-center px-4 py-2 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} flex-1 max-w-md`}>
          <Search size={18} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Search sellers or categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm text-[var(--text)]" 
          />
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Top Material Suppliers</h3>
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
                <th className="px-8 py-4 font-medium">Supplier</th>
                <th className="px-8 py-4 font-medium">Category</th>
                <th className="px-8 py-4 font-medium">Products</th>
                <th className="px-8 py-4 font-medium">Rating</th>
                <th className="px-8 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">Loading sellers...</td></tr>
              ) : filteredSellers.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">No sellers found.</td></tr>
              ) : filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                        <Package size={18} className="text-[#FFD700]" />
                      </div>
                      <span className="font-bold">{seller.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-white/60">{seller.category}</td>
                  <td className="px-8 py-5">{seller.product_count || 0}</td>
                  <td className="px-8 py-5 text-[#FFD700] flex items-center gap-1">
                    <Star size={14} fill="currentColor" /> {seller.rating || 'N/A'}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      seller.is_verified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {seller.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Seller Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md ${cardClasses} border border-white/10 rounded-3xl p-8 shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Add Material Seller</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                  <X size={20} className="text-white/40" />
                </button>
              </div>

              <form onSubmit={handleAddSeller} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Seller Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFD700]/50 outline-none transition-all"
                    placeholder="Supplier Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFD700]/50 outline-none transition-all"
                  >
                    <option value="" className="bg-zinc-900">Select Category</option>
                    <option value="Construction" className="bg-zinc-900">Construction</option>
                    <option value="Carpentry" className="bg-zinc-900">Carpentry</option>
                    <option value="Masonry" className="bg-zinc-900">Masonry</option>
                    <option value="Finishing" className="bg-zinc-900">Finishing</option>
                    <option value="Plumbing" className="bg-zinc-900">Plumbing</option>
                    <option value="Electrical" className="bg-zinc-900">Electrical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFD700]/50 outline-none transition-all"
                    placeholder="contact@supplier.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFD700]/50 outline-none transition-all"
                    placeholder="+212 5..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 rounded-xl bg-[#FFD700] text-black text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    {submitting ? 'Adding...' : 'Add Seller'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OrdersView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.artisan_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVolume = orders.reduce((acc, o) => acc + (o.total_price || 0), 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">Orders & Projects</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">Track active service orders, material purchases, and project milestones.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onAction?.('Exporting orders report...')}
            className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
          >
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <KpiCard title="Active Orders" value={orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length.toString()} icon={<ShoppingBag size={20} />} trend="+8%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Completed" value={orders.filter(o => o.status === 'completed').length.toString()} icon={<CheckCircle size={20} />} trend="+15%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Disputed" value={orders.filter(o => o.status === 'disputed').length.toString()} icon={<AlertTriangle size={20} />} trend="-2%" isPositive={false} isDarkMode={isDarkMode} />
        <KpiCard title="Total Volume" value={`MAD ${totalVolume.toLocaleString()}`} icon={<DollarSign size={20} />} trend="+22%" isPositive={true} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card p-8 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="flex items-center px-6 py-4 rounded-[20px] bg-[var(--bg)] border border-[var(--border)] flex-1 focus-within:border-[#FFD400]/30 transition-all">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search orders by ID or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full ml-4 text-xs font-bold uppercase tracking-widest placeholder:text-[var(--text-muted)]/50 text-[var(--text)]" 
            />
          </div>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="px-10 py-8 font-black">Order ID</th>
                <th className="px-10 py-8 font-black">Parties</th>
                <th className="px-10 py-8 font-black">Amount</th>
                <th className="px-10 py-8 font-black">Status</th>
                <th className="px-10 py-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={5} className="px-10 py-20 text-center text-[var(--text-muted)]">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-20 text-center text-[var(--text-muted)]">No orders found.</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-[var(--card-bg)]/50 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-[var(--border)]">
                        <Package size={18} className="text-[#FFD400]" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--text)] uppercase tracking-widest">
                        #{order.id.substring(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-xs">
                      <p className="font-bold text-[var(--text)]">{order.client_name}</p>
                      <p className="text-[var(--text-muted)] mt-1">with {order.artisan_name}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-sm font-black italic tracking-tighter text-[var(--text)]">
                      MAD {order.total_price?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                      order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                      order.status === 'disputed' ? 'bg-rose-500/10 text-rose-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {order.status === 'completed' && <CheckCircle size={14} />}
                      {order.status === 'pending' && <Clock size={14} />}
                      {order.status === 'disputed' && <AlertTriangle size={14} />}
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => onAction?.(`Viewing details for order ${order.id}...`)}
                      className="w-10 h-10 rounded-xl bg-[var(--card-bg)] flex items-center justify-center hover:bg-[var(--card-bg)]/80 transition-all text-[var(--text)]"
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

export function PaymentsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const filteredTransactions = transactions.filter(t => 
    t.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = transactions.reduce((acc, t) => acc + (t.fee_amount || 0), 0);
  const totalPayouts = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((acc, t) => acc + (t.amount || 0), 0);
  const pendingPayouts = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments & Wallets</h1>
          <p className="text-sm text-white/40 mt-1">Monitor all financial transactions, platform fees, and user wallet balances.</p>
        </div>
        <button 
          onClick={() => onAction?.('Generating financial report...')}
          className="bg-[#FFD700] text-black px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all active:scale-95"
        >
          <Download size={18} /> Financial Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Platform Revenue" value={`MAD ${totalRevenue.toLocaleString()}`} icon={<TrendingUp size={20} />} trend="+18%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Total Payouts" value={`MAD ${totalPayouts.toLocaleString()}`} icon={<ArrowUpRight size={20} />} trend="+12%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Pending Payouts" value={`MAD ${pendingPayouts.toLocaleString()}`} icon={<Clock size={20} />} trend="-5%" isPositive={false} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Recent Transactions</h3>
          <div className="flex items-center gap-4">
            <div className={`flex items-center px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} max-w-xs`}>
              <Search size={16} className="text-white/40" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full ml-3 text-xs text-[var(--text)]" 
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-white/20 border-b border-white/5">
              <tr>
                <th className="px-8 py-4 font-medium">Transaction ID</th>
                <th className="px-8 py-4 font-medium">User</th>
                <th className="px-8 py-4 font-medium">Amount</th>
                <th className="px-8 py-4 font-medium">Type</th>
                <th className="px-8 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">Loading transactions...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">No transactions found.</td></tr>
              ) : filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5 font-mono text-xs text-white/40">#{txn.id.substring(0, 8)}</td>
                  <td className="px-8 py-5 font-bold">{txn.user_name}</td>
                  <td className={`px-8 py-5 font-bold ${['topup', 'release'].includes(txn.type) ? 'text-[#10B981]' : 'text-rose-500'}`}>
                    {['topup', 'release'].includes(txn.type) ? '+' : '-'} MAD {txn.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-white/60 uppercase text-[10px] font-bold tracking-widest">{txn.type}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      txn.status === 'completed' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                    }`}>
                      {txn.status}
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

interface SettingsViewProps extends ViewProps {
  settings: any;
  updateSettings: (settings: any) => Promise<void>;
}

export function SettingsView({ settings, updateSettings, isDarkMode, cardClasses, textMutedClasses, onAction }: SettingsViewProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    fetch('/api/languages')
      .then(res => res.json())
      .then(data => setLanguages(data.filter((l: any) => l.is_active)));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      alert('System settings updated successfully!');
    } catch (error) {
      alert('Failed to update system settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    if (value === 'NaN') return;
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tech-header text-2xl">System Settings</h1>
          <p className="tech-label opacity-70 mt-1">Configure platform parameters, commissions, and global rules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              handleSave();
              onAction?.('Saving system settings...');
            }}
            disabled={saving}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl tech-label hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="hynex-card p-8">
            <h3 className="tech-header text-lg mb-6 flex items-center gap-3"><Wallet size={20} className="text-[var(--accent)]" /> General Settings</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="tech-label opacity-70 mb-2 block">Platform Name</label>
                  <input 
                    type="text" 
                    value={localSettings.platform_name || ''} 
                    onChange={(e) => handleChange('platform_name', e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] tech-label focus:border-[var(--accent)]/50 outline-none transition-all not-italic" 
                  />
                </div>
                <div>
                  <label className="tech-label opacity-70 mb-2 block">Contact Email</label>
                  <input 
                    type="email" 
                    value={localSettings.contact_email || ''} 
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] tech-label focus:border-[var(--accent)]/50 outline-none transition-all not-italic" 
                  />
                </div>
                <div>
                  <label className="tech-label opacity-70 mb-2 block">Support Phone</label>
                  <input 
                    type="text" 
                    value={localSettings.support_phone || ''} 
                    onChange={(e) => handleChange('support_phone', e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] tech-label focus:border-[var(--accent)]/50 outline-none transition-all not-italic" 
                  />
                </div>
                <div>
                  <label className="tech-label opacity-70 mb-2 block">Default Language</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <select
                      value={localSettings.default_language || 'en'}
                      onChange={(e) => handleChange('default_language', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] tech-label focus:border-[var(--accent)]/50 outline-none transition-all appearance-none not-italic"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hynex-card p-8">
            <h3 className="tech-header text-lg mb-6 flex items-center gap-3"><ShieldCheck size={20} className="text-[var(--accent)]" /> Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
                <div>
                  <p className="tech-header text-sm not-italic text-[var(--text)]">Require 2FA for Admins</p>
                  <p className="tech-label opacity-50">Mandatory two-factor authentication for all admin accounts.</p>
                </div>
                <button 
                  onClick={() => handleChange('require_2fa', localSettings.require_2fa ? '0' : '1')}
                  className={`w-14 h-7 rounded-full relative transition-all ${localSettings.require_2fa === '1' ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${localSettings.require_2fa === '1' ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
                <div>
                  <p className="tech-header text-sm not-italic text-[var(--text)]">Auto-suspend Suspicious Accounts</p>
                  <p className="tech-label opacity-50">Automatically freeze accounts flagged by fraud monitoring.</p>
                </div>
                <button 
                  onClick={() => handleChange('auto_suspend', localSettings.auto_suspend === '1' ? '0' : '1')}
                  className={`w-14 h-7 rounded-full relative transition-all ${localSettings.auto_suspend === '1' ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${localSettings.auto_suspend === '1' ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="hynex-card p-8">
            <h3 className="tech-header text-lg mb-6 flex items-center gap-3"><Settings size={20} className="text-[var(--accent)]" /> System Status</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="tech-label opacity-70">Maintenance Mode</span>
                <span className={`px-3 py-1 rounded-full tech-label ${localSettings.maintenance_mode === '1' ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}>
                  {localSettings.maintenance_mode === '1' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="tech-label opacity-70">API Status</span>
                <span className="px-3 py-1 rounded-full tech-label bg-[var(--success)]/10 text-[var(--success)]">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="tech-label opacity-70">Database Load</span>
                <span className="px-3 py-1 rounded-full tech-label bg-[var(--accent)]/10 text-[var(--accent)]">Normal (24%)</span>
              </div>
              <button 
                onClick={() => {
                  const newState = localSettings.maintenance_mode === '1' ? '0' : '1';
                  handleChange('maintenance_mode', newState);
                  onAction?.(`${newState === '1' ? 'Enabling' : 'Disabling'} maintenance mode...`);
                }}
                className={`w-full py-4 mt-4 border rounded-2xl tech-label transition-all active:scale-95 ${
                  localSettings.maintenance_mode === '1' 
                    ? 'border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success)]/10' 
                    : 'border-[var(--destructive)]/30 text-[var(--destructive)] hover:bg-[var(--destructive)]/10'
                }`}
              >
                {localSettings.maintenance_mode === '1' ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', duration_days: '30', description: '' });

  const fetchPlans = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [token]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration_days: parseInt(formData.duration_days)
        })
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', price: '', duration_days: '30', description: '' });
        fetchPlans();
        onAction?.('Subscription plan created successfully');
      }
    } catch (error) {
      onAction?.('Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Manage premium plans for artisans and companies.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#FFD700] text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
        >
          <Plus size={16} /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="col-span-3 text-center py-12">No plans found.</div>
        ) : plans.map((plan, i) => (
          <div key={plan.id} className={`p-6 rounded-3xl ${cardClasses} relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${i % 3 === 0 ? 'bg-gray-500' : i % 3 === 1 ? 'bg-[#FFD700]' : 'bg-purple-500'}/10 rounded-bl-full -mr-8 -mt-8`} />
            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
            <p className="text-2xl font-black text-[#FFD700] mb-4">MAD {plan.price}/{plan.duration_days === 30 ? 'mo' : plan.duration_days + 'd'}</p>
            <div className="flex items-center gap-2 text-sm opacity-60">
              <Users size={14} />
              <span>{Math.floor(Math.random() * 1000)} Active Users</span>
            </div>
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => onAction?.(`Editing ${plan.name} plan...`)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'} transition-all active:scale-95`}
              >
                Edit Plan
              </button>
              <button 
                onClick={() => onAction?.(`Viewing users for ${plan.name} plan...`)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'} transition-all active:scale-95`}
              >
                View Users
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[var(--text)]">Create Subscription Plan</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Plan Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="e.g. Premium Artisan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Price (MAD)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                      placeholder="299"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Duration (Days)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                      placeholder="30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all h-24 resize-none"
                    placeholder="Plan benefits..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[#FFD700] text-black font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    {submitting ? 'Creating...' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function UsersView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'client', password: 'password123' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.map((u: any) => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email || u.phone || 'No contact',
          role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
          balance: 0,
          status: u.verified ? 'Verified' : 'Pending',
          avatar: u.avatar_url || `https://ui-avatars.com/api/?name=${u.name || 'U'}&background=random`
        })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewUser({ name: '', email: '', phone: '', role: 'client', password: 'password123' });
        fetchUsers();
        onAction?.('User added successfully');
      } else {
        const data = await res.json();
        onAction?.(data.error || 'Failed to add user');
      }
    } catch (error) {
      onAction?.('Error adding user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyUser = async (userId: string, currentStatus: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ verified: currentStatus !== 'Verified' })
      });
      if (res.ok) {
        fetchUsers();
        onAction?.(`User ${currentStatus === 'Verified' ? 'unverified' : 'verified'} successfully`);
      }
    } catch (error) {
      onAction?.('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || u.role === roleFilter.replace(/s$/, '');
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl tech-header text-[var(--text)]">Users Management</h1>
          <p className="tech-label mt-1 opacity-70">Manage all platform users, verify identities, and monitor activity.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl tech-label hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="hynex-card p-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <div className="flex items-center px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex-1 focus-within:border-[var(--accent)]/50 transition-all">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search by name, email, or ID..." 
              className="bg-transparent border-none outline-none w-full ml-3 tech-label text-[var(--text)] not-italic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl px-4 py-3 bg-[var(--bg)] border border-[var(--border)] outline-none focus:border-[var(--accent)]/50 transition-all appearance-none pr-10 relative text-[var(--text)] tech-label not-italic"
          >
            <option>All Roles</option>
            <option>Clients</option>
            <option>Artisans</option>
            <option>Sellers</option>
            <option>Companies</option>
            <option>Admins</option>
          </select>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="tech-label border-b border-[var(--border)]">
              <tr>
                <th className="px-8 py-6 font-black">User Info</th>
                <th className="px-8 py-6 font-black">Role</th>
                <th className="px-8 py-6 font-black">Wallet Balance</th>
                <th className="px-8 py-6 font-black">Status</th>
                <th className="px-8 py-6 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                      <p className="tech-label">Loading users data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center tech-label opacity-50">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-[var(--accent)]/5 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black italic text-[var(--text)]">{user.name}</p>
                        <p className="text-[10px] tech-value text-[var(--text-muted)] opacity-70">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full bg-[var(--glass-bg)] tech-label border border-[var(--glass-border)]">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="tech-value text-[var(--accent)] text-base">MAD {user.balance.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full tech-label border border-[var(--glass-border)] ${
                      user.status === 'Verified' ? 'text-[var(--success)] bg-[var(--success)]/5' : 
                      user.status === 'Pending' ? 'text-[var(--warning)] bg-[var(--warning)]/5' : 'text-[var(--destructive)] bg-[var(--destructive)]/5'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleVerifyUser(user.id, user.status)}
                        className={`p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] transition-all ${user.status === 'Verified' ? 'text-[var(--warning)] hover:bg-[var(--warning)]/10' : 'text-[var(--success)] hover:bg-[var(--success)]/10'}`}
                        title={user.status === 'Verified' ? 'Unverify User' : 'Verify User'}
                      >
                        {user.status === 'Verified' ? <Shield size={18} /> : <Check size={18} />}
                      </button>
                      <button 
                        onClick={() => onAction?.(`Managing permissions for ${user.name}...`)}
                        className="p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all"
                        title="Manage Permissions"
                      >
                        <UserCog size={18} />
                      </button>
                      <button 
                        onClick={() => onAction?.(`Sending alert to ${user.name}...`)}
                        className="p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--destructive)] hover:text-white transition-all"
                        title="Send Alert"
                      >
                        <AlertTriangle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl tech-header text-[var(--text)]">Add New User</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-6">
                <div>
                  <label className="block tech-label mb-2 opacity-70">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-value not-italic"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block tech-label mb-2 opacity-70">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-value not-italic"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block tech-label mb-2 opacity-70">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-value not-italic"
                    placeholder="+212 6..."
                  />
                </div>
                <div>
                  <label className="block tech-label mb-2 opacity-70">User Role</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all appearance-none tech-label"
                  >
                    <option value="client">Client</option>
                    <option value="artisan">Artisan</option>
                    <option value="seller">Seller</option>
                    <option value="company">Company</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    {submitting ? 'Adding...' : 'Add User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WalletsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
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

  const filteredTransactions = transactions.filter(t => 
    t.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none ml-2 text-xs w-40 text-[var(--text)]" 
              />
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
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-[var(--text-muted)]">No transactions found.</td></tr>
              ) : filteredTransactions.map((t) => (
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