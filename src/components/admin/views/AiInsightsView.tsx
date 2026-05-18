import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Loader2, Sparkles, AlertCircle, BarChart3, Bug, MapPin, Hammer, Users, Activity, Zap, ShieldCheck, CheckCircle } from 'lucide-react';
import { ViewProps } from '../types';
import { aiService } from '../../../services/aiService';

export default function AiInsightsView({ onAction }: ViewProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [devMode, setDevMode] = useState(false);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
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
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-20 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-[#FFD700]/10 rounded-xl border border-[#FFD700]/20">
              <BrainCircuit className="text-[#FFD700]" size={24} strokeWidth={2.5} /> 
            </div>
            AI System Insights 2.0
          </h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-2 uppercase tracking-wider">Predictive analysis, business intelligence, and automated decision support.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDevMode(!devMode)}
            className={`px-5 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-colors border ${devMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-[var(--card-surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] shadow-sm'}`}
          >
            Developer Mode: {devMode ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => {
              runAudit();
              onAction?.('Running AI system audit...');
            }}
            disabled={loading}
            className="bg-[#FFD700] text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#E6C200] transition-colors active:scale-95 disabled:opacity-50 shadow-lg shadow-[#FFD700]/10"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} strokeWidth={2.5} />}
            {loading ? 'Analyzing...' : 'Run AI Audit'}
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-4 shadow-sm"
        >
          <AlertCircle className="shrink-0" size={24} strokeWidth={2.5} />
          <div>
            <h3 className="font-black text-base uppercase tracking-wider">AI Insights Error</h3>
            <p className="text-sm font-medium mt-1 text-red-400 leading-relaxed">{error}</p>
            <div className="mt-4 p-4 rounded-lg bg-red-950/50 border border-red-900/30">
              <p className="text-xs font-bold text-red-300">
                Tip: Ensure your Gemini API Key is correctly set in the Secrets panel of your AI Studio settings.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!insights && !loading && !error && (
        <div className="py-24 px-6 text-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] bg-[var(--card-bg)] shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-24 h-24 mb-6 rounded-xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] relative">
            <div className="absolute inset-0 bg-[#FFD700] blur-[40px] opacity-20 rounded-full" />
            <BrainCircuit size={40} strokeWidth={2.5} className="relative z-10" />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] mb-3 tracking-tight">Ready for System Audit</h2>
          <p className="max-w-md mx-auto text-sm font-medium leading-relaxed text-[var(--text-muted)]">Click the button above to have Gemini AI analyze your platform's logs, performance metrics, and user feedback to uncover hidden issues.</p>
        </div>
      )}

      {insights && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Top Layer: Health & Business */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Health Score */}
            <div className="p-8 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-6">System Health</h3>
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-[var(--text)]/5" />
                  <circle
                    cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * (insights?.healthScore || 0)) / 100}
                    strokeLinecap="round"
                    className={(insights?.healthScore || 0) > 80 ? 'text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : (insights?.healthScore || 0) > 50 ? 'text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black tracking-tighter text-[var(--text)]">{insights?.healthScore || 0}<span className="text-2xl text-[var(--text-muted)] mb-2">%</span></span>
                </div>
              </div>
            </div>

            {/* Business Insights */}
            <div className="md:col-span-3 p-8 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-3 mb-8 text-[#FFD700]">
                <BarChart3 size={24} strokeWidth={2.5} />
                <h3 className="text-lg font-black text-[var(--text)] tracking-tight">Business Intelligence Layer</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex shrink-0" /> Revenue Loss Risk
                  </p>
                  <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">{insights?.businessInsights?.revenueLoss}</p>
                </div>
                <div className="p-6 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#FFD700] mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] flex shrink-0" /> User Drop-offs
                  </p>
                  <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">{insights?.businessInsights?.userDropOffs}</p>
                </div>
                <div className="p-6 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex shrink-0" /> Behavior Issues
                  </p>
                  <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">{insights?.businessInsights?.behaviorIssues}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Layer: Issues & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity-Ranked Issues */}
            <div className="p-8 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3 text-red-500">
                  <Bug size={24} strokeWidth={2.5} />
                  <h3 className="text-lg font-black text-[var(--text)] tracking-tight">Smart Prioritization</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[var(--border)] px-3 py-1.5 rounded-lg text-[var(--text-muted)] border border-[var(--border)]">{insights?.issues?.length} Issues Detected</span>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-hide">
                {insights?.issues?.sort((a: any, b: any) => {
                  const order = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
                  return (order[a.severity as keyof typeof order] || 0) - (order[b.severity as keyof typeof order] || 0);
                }).map((issue: any, i: number) => (
                  <div key={i} className={`p-6 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                    <div className="flex justify-between items-start mb-3 gap-4">
                      <h4 className="font-black text-[var(--text)] text-sm leading-tight max-w-[80%]">{issue.title}</h4>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-[var(--border)] shrink-0">
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm font-medium opacity-90 mb-5 leading-relaxed">{issue.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {issue.context?.city && <span className="text-[10px] bg-black/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold"><MapPin size={12} /> {issue.context.city}</span>}
                      {issue.context?.serviceType && <span className="text-[10px] bg-black/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold"><Hammer size={12} /> {issue.context.serviceType}</span>}
                      {issue.context?.userType && <span className="text-[10px] bg-black/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold"><Users size={12} /> {issue.context.userType}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictive Alerts */}
            <div className="p-8 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center gap-3 mb-8 shrink-0 text-[#FFD700]">
                <Activity size={24} strokeWidth={2.5} />
                <h3 className="text-lg font-black text-[var(--text)] tracking-tight">Predictive Alerts</h3>
              </div>
              <div className="space-y-4 overflow-y-auto flex-1 scrollbar-hide pr-2">
                {insights?.predictiveAlerts?.map((alert: any, i: number) => (
                  <div key={i} className="p-6 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] relative overflow-hidden group shadow-inner">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD700]" />
                    <div className="flex items-start justify-between mb-3 gap-4">
                      <h4 className="font-black text-[var(--text)] text-sm leading-tight max-w-[80%]">{alert.alert}</h4>
                      <span className="text-[10px] font-black text-[#FFD700] uppercase bg-[#FFD700]/10 px-2.5 py-1 rounded-md shrink-0 border border-[#FFD700]/20">{alert.timeframe}</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-muted)] leading-relaxed">{alert.forecast}</p>
                  </div>
                ))}
                {insights?.predictiveAlerts?.length === 0 && (
                  <div className="text-center py-20 opacity-50 flex flex-col items-center">
                    <Sparkles size={48} strokeWidth={1.5} className="mb-4 text-[var(--text-muted)]" />
                    <p className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">No immediate threats forecasted.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Layer: Suggestions & Simulation */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-emerald-500">
                <Sparkles size={24} strokeWidth={2.5} />
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">AI Decision Support</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights?.suggestions?.map((suggestion: any, i: number) => (
                <div key={i} className={`p-8 rounded-xl bg-[var(--card-bg)] border shadow-sm transition-all ${suggestion.riskLevel === 'Advanced' ? 'border-[#FFD700]/30' : 'border-emerald-500/30'}`}>
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 shrink-0 rounded-lg flex items-center justify-center ${suggestion.riskLevel === 'Advanced' ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {suggestion.riskLevel === 'Advanced' ? <Zap size={28} strokeWidth={2.5} /> : <ShieldCheck size={28} strokeWidth={2.5} />}
                      </div>
                      <div>
                        <h4 className="font-black text-[var(--text)] text-lg tracking-tight leading-tight mb-2" style={{ wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{suggestion.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${suggestion.riskLevel === 'Advanced' ? 'text-[#FFD700]' : 'text-emerald-500'}`}>
                            {suggestion.riskLevel} Fix
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-500" />
                          <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">{suggestion.confidence}% Confidence</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-[var(--text-muted)] mb-8 leading-relaxed bg-[var(--card-surface)] p-6 rounded-lg border border-[var(--border)] shadow-inner">{suggestion.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-5 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-2">Impact on Performance</p>
                      <p className="text-sm font-bold text-emerald-500">{suggestion.impact?.performance}</p>
                    </div>
                    <div className="p-5 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-2">Impact on Revenue</p>
                      <p className="text-sm font-bold text-[#FFD700]">{suggestion.impact?.revenue}</p>
                    </div>
                  </div>

                  {/* Simulation Engine */}
                  <div className="p-6 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] mb-8 shadow-inner">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                      <Activity size={16} strokeWidth={2.5} /> Simulation Result
                    </div>
                    <p className="text-sm text-[var(--text-muted)] italic mb-5 font-bold">"{suggestion.simulation?.expectedImprovement}"</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-[var(--border)]">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${suggestion.confidence}%` }} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 shrink-0">Expected: +{suggestion.confidence/2}%</span>
                    </div>
                  </div>

                  {/* Developer Mode: Technical Solution */}
                  {devMode && suggestion.technicalSolution && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-8 p-6 rounded-lg bg-black border border-[var(--border)] font-mono text-xs overflow-x-auto scrollbar-hide shadow-inner"
                    >
                      <p className="text-emerald-500 mb-4 font-bold">// Technical Solution</p>
                      {suggestion.technicalSolution.code && <pre className="text-[var(--text-muted)] mb-4 bg-[var(--border)] p-4 rounded-xl">{suggestion.technicalSolution.code}</pre>}
                      {suggestion.technicalSolution.query && <pre className="text-blue-400 mb-4 bg-[var(--border)] p-4 rounded-xl">{suggestion.technicalSolution.query}</pre>}
                      {suggestion.technicalSolution.optimization && <pre className="text-[#FFD700] bg-[var(--border)] p-4 rounded-xl">{suggestion.technicalSolution.optimization}</pre>}
                    </motion.div>
                  )}

                  <button 
                    onClick={() => applyFix(suggestion)}
                    className={`w-full py-5 rounded-lg font-black uppercase tracking-wider text-sm transition-colors active:scale-95 shadow-sm ${suggestion.riskLevel === 'Advanced' ? 'bg-[#FFD700] text-black hover:bg-[#E6C200]' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}
                  >
                    Approve & Apply Fix
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Learning System History */}
          {history.length > 0 && (
            <div className="p-8 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] shadow-sm mt-8">
              <div className="flex items-center gap-3 mb-8 text-[var(--text-muted)]">
                <CheckCircle size={28} strokeWidth={2.5} className="text-emerald-500" />
                <h3 className="text-xl font-black text-[var(--text)] tracking-tight">Learning System: Recent Fixes</h3>
              </div>
              <div className="space-y-4">
                {history.slice(-3).reverse().map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-500 bg-emerald-500/10 p-2.5 rounded-xl shrink-0"><CheckCircle size={18} strokeWidth={3} /></span>
                      <span className="font-bold text-[var(--text)] text-sm">{item.suggestion.title}</span>
                    </div>
                    <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest bg-black/50 px-3 py-1.5 rounded-lg shrink-0 border border-[var(--border)]">{new Date(item.timestamp).toLocaleTimeString()}</span>
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
