import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, Sparkles, TrendingUp, Users, Calendar, DollarSign, 
  ArrowUpRight, ArrowDownRight, Clock, ChevronRight, Zap, AlertCircle, CheckCircle2,
  MoreHorizontal, Hammer, CreditCard, Bug
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';

function MetricCard({ title, value, trend, isPositive, icon: Icon, description }: any) {
  return (
    <div className="hynex-card p-6 flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-[var(--bg)] text-[var(--accent)] border border-[var(--border)] group-hover:scale-110 transition-transform duration-300">
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${isPositive ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--destructive)]/10 text-[var(--destructive)]'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <h3 className="text-[var(--text-muted)] text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold text-[var(--text)] tracking-tight">{value}</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">{description}</p>
      </div>
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

function RecentActivity() {
  const { t } = useTranslation();
  
  const activities: any[] = [];

  return (
    <div className="hynex-card p-6 md:p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[var(--text)]">{t('admin_recent_activity', 'Recent Activity')}</h3>
        <button className="text-[var(--accent)] text-sm font-medium hover:underline flex items-center gap-1">
          View All <ChevronRight size={14} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4 relative">
              {index !== activities.length - 1 && (
                <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-[var(--border)]" />
              )}
              <div className="relative z-10 shrink-0">
                <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--border)] flex flex-col items-center justify-center overflow-hidden">
                  {activity.user === 'System' ? (
                    <AlertCircle size={16} className="text-[var(--warning)]" />
                  ) : (
                    <img src={`https://ui-avatars.com/api/?name=${activity.user}&background=random`} alt={activity.user} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
              <div className="flex-1 pb-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm text-[var(--text)] font-medium">
                    {activity.user} <span className="text-[var(--text-muted)] font-normal">{activity.action}</span>
                  </p>
                  {activity.amount && (
                    <span className={`text-sm font-medium ${activity.amount.startsWith('+') ? 'text-[var(--success)]' : 'text-[var(--text)]'}`}>
                      {activity.amount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <Clock size={12} /> {activity.time}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
            <Clock size={32} className="opacity-20 mb-3" />
            <p className="text-sm">No recent activity found.</p>
            <p className="text-xs opacity-60">System is ready for new events.</p>
          </div>
        )}
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
        <MetricCard 
          title={t('admin_total_revenue', 'Total Revenue')} 
          value={revenue === 0 ? '$0' : `$${(revenue / 1000).toFixed(1)}k`} 
          trend="0.0%" 
          isPositive={true}
          icon={DollarSign}
          description="Awaiting new payment data"
        />
        <MetricCard 
          title={t('admin_total_bookings', 'Total Bookings')} 
          value={bookings.toLocaleString()} 
          trend="0.0%" 
          isPositive={true}
          icon={Calendar}
          description="Awaiting new booking data"
        />
        <MetricCard 
          title={t('admin_active_users', 'Active Users')} 
          value={users.toLocaleString()} 
          trend="0.0%" 
          isPositive={true}
          icon={Users}
          description="Awaiting new user registrations"
        />
        <MetricCard 
          title={t('admin_conversion_rate', 'Conversion Rate')} 
          value="0.0%" 
          trend="0.0%" 
          isPositive={true}
          icon={TrendingUp}
          description="Awaiting analytical data"
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 min-h-[400px]">
          <MainChart stats={stats} />
        </div>
        <div className="xl:col-span-1 min-h-[400px]">
          <RecentActivity />
        </div>
      </div>

      {/* Bottom Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="hynex-card p-6 border-l-4 border-l-[var(--accent)] hover:shadow-lg transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="font-bold text-[var(--text)] mb-1">AI Growth Insight</h4>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                System is ready. Once users start engaging with the platform, predictive insights and growth strategies will appear here.
              </p>
            </div>
          </div>
        </div>
        
        <div className="hynex-card p-6 border-l-4 border-l-[var(--warning)] hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => onAction && onAction('users')}>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[var(--warning)]/10 text-[var(--warning)] rounded-lg shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-[var(--text)] mb-1">Action Required</h4>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                No pending actions required. You are all caught up. Check back later when new artisans register.
              </p>
            </div>
          </div>
        </div>

        <div className="hynex-card p-6 border-l-4 border-l-[var(--success)] hover:shadow-lg transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[var(--success)]/10 text-[var(--success)] rounded-lg shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-[var(--text)] mb-1">System Status</h4>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                All systems functional and ready to scale. API response times are optimal. Server load is currently at 1% capacity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

