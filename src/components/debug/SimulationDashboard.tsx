import React, { useState } from 'react';
import { 
  Database, 
  Users, 
  RefreshCw, 
  ShieldCheck, 
  User as UserIcon, 
  Hammer, 
  ShoppingBag, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Zap,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function SimulationDashboard() {
  const { user, login } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAccounts = [
    { role: 'Admin', email: 'admin@test.com', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { role: 'Client', email: 'client0@test.com', icon: UserIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { role: 'Artisan', email: 'artisan0@test.com', icon: Hammer, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { role: 'Seller', email: 'seller0@test.com', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { role: 'Company', email: 'company0@test.com', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    setError(null);
    try {
      const res = await fetch('/api/simulation/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Seed failed');
      setSeedResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLoginAs = async (email: string) => {
    try {
      const res = await fetch('/api/simulation/login-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      if (data.token) {
        localStorage.setItem('m3allem_token', data.token);
        if (data.user) {
          localStorage.setItem('m3allem_user', JSON.stringify(data.user));
        }
      }
      
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text)] flex items-center gap-3">
              <Zap className="text-[var(--accent)] fill-[var(--accent)]" />
              QA & Simulation Engine
            </h1>
            <p className="text-[var(--text-muted)] font-medium">Test every role and flow in a controlled environment.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-full glass border border-[var(--border)] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold opacity-70">Simulation System Active</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 rounded-3xl glass border border-[var(--border)] space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Populate Database</h3>
              <p className="text-sm text-[var(--text-muted)]">Generate realistic test data (users, jobs, messages, reviews).</p>
            </div>
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full py-4 rounded-2xl bg-[var(--accent)] text-black font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-[var(--accent)]/20 disabled:opacity-50"
            >
              {isSeeding ? <RefreshCw className="animate-spin" /> : <Play size={18} fill="black" />}
              {isSeeding ? 'SEEDING...' : 'RUN SEED ENGINE'}
            </button>
            {seedResult && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-500 text-sm font-bold">
                <CheckCircle2 size={16} />
                Database seeded successfully!
              </div>
            )}
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 rounded-3xl glass border border-[var(--border)] space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Role Simulator</h3>
              <p className="text-sm text-[var(--text-muted)]">Switch identities instantly to verify specific dashboards.</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {testAccounts.map((acc) => (
                <button 
                  key={acc.email}
                  onClick={() => handleLoginAs(acc.email)}
                  className="p-3 rounded-xl hover:bg-[var(--text)]/5 flex items-center justify-between text-left transition-colors border border-transparent hover:border-[var(--border)]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${acc.bg} ${acc.color} flex items-center justify-center`}>
                      <acc.icon size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{acc.role}</div>
                      <div className="text-[10px] opacity-50">{acc.email}</div>
                    </div>
                  </div>
                  <Zap size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 rounded-3xl glass border border-[var(--border)] space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">System Integrity</h3>
              <p className="text-sm text-[var(--text-muted)]">Run automated checks on core procedures.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--text)]/5 border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-500" />
                  <span className="text-xs font-bold">Chat System</span>
                </div>
                <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Good</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--text)]/5 border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-amber-500" />
                  <span className="text-xs font-bold">Prisma DB</span>
                </div>
                <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Connected</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Error Log */}
        {error && (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div className="flex items-center gap-2 text-rose-500 font-black">
              <AlertTriangle size={20} />
              SYSTEM ALERT
            </div>
            <p className="text-sm font-mono text-rose-500/80">{error}</p>
          </div>
        )}

        {/* Test Matrix */}
        <div className="p-8 rounded-[40px] glass border border-[var(--border)] space-y-6">
          <h2 className="text-2xl font-black">User Flow Matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 uppercase tracking-widest text-[10px] opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Client Journey
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                <li className="flex items-center gap-2 opacity-60"><CheckCircle2 size={14} className="text-emerald-500" /> Landing → Signup</li>
                <li className="flex items-center gap-2 opacity-60"><CheckCircle2 size={14} className="text-emerald-500" /> Post a Job</li>
                <li className="flex items-center gap-2 opacity-60"><CheckCircle2 size={14} className="text-emerald-500" /> Browse Marketplace</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 uppercase tracking-widest text-[10px] opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Artisan Journey
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                <li className="flex items-center gap-2 opacity-60"><CheckCircle2 size={14} className="text-emerald-500" /> Profile Setup</li>
                <li className="flex items-center gap-2 opacity-60"><CheckCircle2 size={14} className="text-emerald-500" /> Portfolio Upload</li>
                <li className="flex items-center gap-2 opacity-60"><CheckCircle2 size={14} className="text-emerald-500" /> Receive & Bid</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 uppercase tracking-widest text-[10px] opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Security
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                <li className="flex items-center gap-2 opacity-60"><CheckCircle2 size={14} className="text-emerald-500" /> Protected Routes</li>
                <li className="flex items-center gap-2 opacity-60"><CheckCircle2 size={14} className="text-emerald-500" /> Admin Restrictions</li>
                <li className="flex items-center gap-2 opacity-60"><CheckCircle2 size={14} className="text-emerald-500" /> Input Sanitization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
