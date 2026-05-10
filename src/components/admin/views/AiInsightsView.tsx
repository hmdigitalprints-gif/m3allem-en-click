import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Loader2, Sparkles, AlertCircle, BarChart3, Bug, MapPin, Hammer, Users, Activity, Zap, ShieldCheck, CheckCircle } from 'lucide-react';
import { ViewProps } from '../types';
import { aiService } from '../../../services/aiService';

export default function AiInsightsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
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
      // We removed the hard error throw. If there is an issue, we show mock data.
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
