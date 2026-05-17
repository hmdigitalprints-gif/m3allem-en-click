import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, Sparkles, TrendingUp, Users, Calendar, DollarSign, 
  ArrowUpRight, ArrowDownRight, Clock, ChevronRight, Zap, AlertCircle, CheckCircle2,
  MoreHorizontal, Hammer, CreditCard, Bug, BrainCircuit, ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';

function KpiCard({ title, value, trend, isPositive, icon: Icon, description }: any) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 group hover:border-[var(--accent)] transition-all shadow-xl shadow-black/5 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-[var(--bg)] text-[var(--accent)] border border-[var(--border)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black italic px-3 py-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
        <h2 className="text-4xl font-black text-[var(--text)] tracking-tighter italic">{value}</h2>
        <p className="text-[10px] text-[var(--text-muted)] mt-4 font-bold opacity-60 uppercase tracking-widest">{description}</p>
      </div>
      
      <Icon className="absolute -right-8 -bottom-8 w-32 h-32 text-[var(--accent)] opacity-5 rotate-12 group-hover:rotate-6 transition-transform" />
    </div>
  );
}

function MainChart({ stats }: { stats: any }) {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7d');
  
  const chartData = [
    { name: 'Mon', revenue: 0, bookings: 0 },
    { name: 'Tue', revenue: 0, bookings: 0 },
    { name: 'Wed', revenue: 0, bookings: 0 },
    { name: 'Thu', revenue: 0, bookings: 0 },
    { name: 'Fri', revenue: 0, bookings: 0 },
    { name: 'Sat', revenue: 0, bookings: 0 },
    { name: 'Sun', revenue: 0, bookings: 0 },
  ];

  return (
    <div className="hynex-card p-6 md:p-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-1">{t('admin_revenue_overview', 'Revenue Overview')}</h3>
          <p className="text-sm text-[var(--text-muted)]">Performance vs previous period</p>
        </div>
        <div className="flex items-center bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1">
          {['1d', '7d', '30d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeRange === range 
                  ? 'bg-[var(--card-bg)] text-[var(--text)] shadow-sm' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={(val) => `$${val/1000}k`} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--text)' }}
              itemStyle={{ color: 'var(--accent)' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--accent)" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecentActivityTable({ activities }: { activities: any[] }) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] overflow-hidden shadow-xl shadow-black/5">
      <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg)]/50">
        <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
          <Clock size={20} className="text-[var(--accent)]" />
          {t('admin_recent_activity', 'Global Activity Logs')}
        </h3>
        <button className="text-[10px] font-black text-[var(--accent)] hover:underline uppercase tracking-widest">{t('view_full_audit')}</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans">
          <thead>
            <tr className="bg-[var(--bg)]/30 text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
              <th className="px-8 py-4">{t('user')}</th>
              <th className="px-8 py-4">{t('action')}</th>
              <th className="px-8 py-4">{t('status')}</th>
              <th className="px-8 py-4">{t('time')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-[var(--accent)]/5 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border)]">
                        <img src={`https://ui-avatars.com/api/?name=${activity.user}&background=random`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{activity.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-medium">{activity.action}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/20">
                      Success
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs text-[var(--text-muted)] font-bold">{activity.time}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-[var(--text-muted)] italic font-bold">
                  {t('no_recent_activity', 'No activity logs matching today\'s window.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon, label, sub }: { onClick: () => void, icon: React.ReactNode, label: string, sub: string }) {
  return (
    <button 
      onClick={onClick}
      className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 flex flex-col items-start gap-4 hover:border-[var(--accent)] transition-all hover:shadow-xl hover:shadow-[var(--accent)]/5 group text-left"
    >
      <div className="w-12 h-12 rounded-2xl bg-[var(--text)]/5 flex items-center justify-center text-xl transition-transform group-hover:scale-110 group-hover:bg-[var(--accent)]/10">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-sm tracking-tight text-[var(--text)]">{label}</h4>
        <p className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed">{sub}</p>
      </div>
    </button>
  );
}

export default function DashboardOverview({ stats, isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: any) {
  const { t } = useTranslation();
  
  const revenue = stats?.totalRevenue ?? 0;
  const bookings = stats?.totalBookings ?? 0;
  const users = stats?.totalUsers ?? 0;

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight">Overview Dashboard</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Here's what's happening with your platform today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => onAction && onAction('reports')} className="px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
            Download Report
          </button>
          <button onClick={() => onAction && onAction('settings')} className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-sm">
            <Zap size={16} /> Manage Platform
          </button>
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <ActionButton 
          onClick={() => onAction?.('users')}
          icon={<Users size={20} className="text-blue-500" />}
          label="Manage Users"
          sub="Review & Permissions"
        />
        <ActionButton 
          onClick={() => onAction?.('artisans')}
          icon={<Hammer size={20} className="text-amber-500" />}
          label="Artisans"
          sub="Verification queue"
        />
        <ActionButton 
          onClick={() => onAction?.('payments')}
          icon={<CreditCard size={20} className="text-emerald-500" />}
          label="Payouts"
          sub="Global transactions"
        />
        <ActionButton 
          onClick={() => onAction?.('simulation')}
          icon={<Bug size={20} className="text-rose-500" />}
          label="Sim & QA"
          sub="Test roles & data"
        />
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard 
          title={t('admin_total_revenue', 'Total Revenue')} 
          value={revenue === 0 ? '0 MAD' : `${(revenue / 1000).toFixed(1)}k MAD`} 
          trend="+12.5%" 
          isPositive={true}
          icon={DollarSign}
          description="Awaiting live transaction flow"
        />
        <KpiCard 
          title={t('admin_total_bookings', 'Total Bookings')} 
          value={bookings.toLocaleString()} 
          trend="+5.2%" 
          isPositive={true}
          icon={Calendar}
          description="New orders in the last 24h"
        />
        <KpiCard 
          title={t('admin_active_users', 'Active Users')} 
          value={users.toLocaleString()} 
          trend="+8.1%" 
          isPositive={true}
          icon={Users}
          description="Total registered accounts"
        />
        <KpiCard 
          title={t('admin_system_uptime', 'System Uptime')} 
          value="99.9%" 
          trend="0.0%" 
          isPositive={true}
          icon={Activity}
          description="All services operational"
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-12">
        <div className="xl:col-span-2 space-y-8">
          <MainChart stats={stats} />
          <RecentActivityTable activities={[]} />
        </div>
        
        <div className="xl:col-span-1 space-y-8">
           <div className="bg-black text-[var(--accent)] rounded-[32px] p-8 border border-[var(--accent)]/30 relative overflow-hidden group">
              <BrainCircuit className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Insights</span>
                </div>
                <h3 className="text-2xl font-black italic uppercase italic tracking-tighter mb-4">Market Optimization</h3>
                <p className="text-sm font-bold opacity-80 leading-relaxed uppercase">
                  Demand for <span className="text-white">Electricians</span> is up 22% in Casablanca. Recommend balancing supply with targeted artisan onboarding.
                </p>
                <button className="mt-8 bg-[var(--accent)] text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-[var(--accent)]/30">
                  Run Market Analysis
                </button>
              </div>
           </div>

           <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 shadow-xl shadow-black/5">
              <h4 className="text-sm font-black uppercase italic tracking-widest mb-6 flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-500" />
                Security Pulse
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
                  <span className="text-xs font-bold uppercase tracking-tight">Active Sessions</span>
                  <span className="text-xs font-black italic">142</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
                  <span className="text-xs font-bold uppercase tracking-tight">Failed Logins</span>
                  <span className="text-xs font-black italic text-red-500">2</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
                  <span className="text-xs font-bold uppercase tracking-tight">API Health</span>
                  <span className="text-xs font-black italic text-emerald-500">Healthy</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

