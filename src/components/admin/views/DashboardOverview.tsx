import React from 'react';
import { 
  Activity, Sparkles, Search, Filter, FileText, ArrowUpRight, 
  Zap, ArrowRight, Info, MoreVertical, ChevronRight, ShoppingBag, Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'framer-motion';

const donutData = [
  { name: 'Hospital Visits', value: 40, color: '#FFD700' },
  { name: 'Medication', value: 35, color: '#10B981' },
  { name: 'Lab Tests', value: 25, color: '#F59E0B' },
];

const limits = [
  { name: 'Hospitals', value: 40, color: '#10B981' },
  { name: 'Lab Tests', value: 25, color: '#F59E0B' },
  { name: 'Medications', value: 35, color: '#FFD700' },
  { name: 'Other', value: 20, color: '#FFFFFF' },
];

const records = [
  { category: 'Consultation', value: '$120.00', status: 'Paid', color: 'text-[#10B981]' },
  { category: 'Pharmacy', value: '$265.00', status: 'Claimed', color: 'text-[#FFD700]' },
  { category: 'Insurance', value: '$1,200.00', status: 'Pending', color: 'text-[#F59E0B]' },
  { category: 'Lab Test', value: '$300.00', status: 'Paid', color: 'text-[#10B981]' },
];

function RevenueCard() {
  return (
    <div className="hynex-card p-10 h-full flex flex-col justify-between min-h-[450px] group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4">Total Revenue</p>
          <h2 className="text-5xl font-black tracking-tighter italic mb-4 text-[var(--text)]">$18,540.00</h2>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
            <span className="text-[var(--text-muted)]">Yearly Avg: $15,200.00</span>
            <div className="flex items-center gap-2 text-[var(--accent)] cursor-pointer hover:opacity-80 transition-opacity">
              <Info size={14} />
              <span>Details</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Vs Last Year</p>
          <p className="text-[var(--accent)] font-black text-2xl italic">+12.4%</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-10">
          <h3 className="text-[var(--accent)] font-black text-xl uppercase italic mb-2 tracking-tight">AI Insights</h3>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Analyzing market trends...</p>
        </div>
        
        <div className="relative w-full h-40 flex items-center justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-64 h-64 bg-[var(--accent)] rounded-full absolute blur-[100px]"
          />
          <svg width="240" height="120" viewBox="0 0 240 120" className="relative z-10">
            <motion.path
              d="M0 60 Q 30 10, 60 60 T 120 60 T 180 60 T 240 60"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function MetricsCard() {
  return (
    <div className="hynex-card p-10 h-full min-h-[450px]">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Platform Metrics</h3>
        <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><MoreVertical size={20} /></button>
      </div>

      <div className="space-y-10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-5xl font-black tracking-tighter italic mb-2 text-[var(--text)]">$12,240.00</h2>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total Payouts</p>
            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-4 max-w-[180px] uppercase tracking-widest leading-relaxed">AI-powered artisan performance insights</p>
          </div>
          <div className="w-20 h-20 rounded-[24px] border-4 border-[var(--accent)] flex items-center justify-center relative bg-[var(--accent)]/5">
            <span className="text-lg font-black italic text-[var(--text)]">18%</span>
            <div className="absolute inset-0 rounded-[20px] border-4 border-[var(--glass-border)]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[var(--glass-bg)] rounded-[24px] p-6 border border-[var(--glass-border)]">
            <h4 className="text-3xl font-black tracking-tighter italic mb-1 text-[var(--text)]">$265</h4>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Avg Order</p>
          </div>
          <div className="bg-[var(--glass-bg)] rounded-[24px] p-6 border border-[var(--glass-border)] relative group">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-3xl font-black tracking-tighter italic mb-1 text-[var(--text)]">8k</h4>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Active Users</p>
              </div>
              <span className="text-[10px] font-black text-[var(--accent)] italic">24%</span>
            </div>
            <button className="absolute bottom-4 right-4 w-8 h-8 rounded-xl bg-[var(--glass-bg)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all active:scale-90">
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center -space-x-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[var(--bg)] overflow-hidden">
              <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" className="w-full h-full object-cover" />
            </div>
          ))}
          <button className="w-12 h-12 rounded-2xl border-4 border-[var(--bg)] bg-[var(--glass-bg)] flex items-center justify-center text-[var(--text-muted)] text-xs font-black hover:bg-[var(--glass-border)] transition-colors">
            +12
          </button>
        </div>
      </div>
    </div>
  );
}

function FinanceCard() {
  return (
    <div className="hynex-card p-10 h-full min-h-[450px]">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Financial Health</h3>
        <button className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] bg-[var(--glass-bg)] px-4 py-2 rounded-xl border border-[var(--glass-border)] uppercase tracking-widest hover:bg-[var(--glass-border)] transition-all">
          Monthly <ChevronRight size={14} className="rotate-90" />
        </button>
      </div>

      <div className="flex items-center gap-10 mb-10">
        <div className="relative w-36 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                innerRadius={50}
                outerRadius={65}
                paddingAngle={10}
                dataKey="value"
                stroke="none"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black italic text-[var(--text)]">100%</span>
            <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total</span>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          {donutData.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{item.name}</span>
              </div>
              <span className="text-xs font-black italic text-[var(--text)]">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-28 w-full mt-auto">
        <div className="flex justify-between items-end mb-4">
          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Growth Curve</span>
          <span className="text-xs font-black text-[var(--success)] italic">$12,500 / +6.2%</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[
            { x: 0, y: 10 }, { x: 1, y: 25 }, { x: 2, y: 15 }, { x: 3, y: 40 }, { x: 4, y: 30 }, { x: 5, y: 50 }
          ]}>
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="y" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TrackingCard() {
  return (
    <div className="hynex-card p-10 h-full min-h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Financial Tracking</h3>
        <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><MoreVertical size={20} /></button>
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Monthly Expenses</p>
          <span className="text-[var(--success)] text-xs font-black italic">+8%</span>
        </div>
        <div className="flex items-baseline gap-3">
          <h2 className="text-5xl font-black tracking-tighter italic text-[var(--text)]">$1,390</h2>
          <span className="text-[var(--text-muted)] text-lg font-bold italic">/ $1,600</span>
          <span className="text-[10px] font-black text-[var(--text-muted)] ml-auto uppercase tracking-widest">2 days left</span>
        </div>
      </div>

      <div className="space-y-8 flex-1">
        <div>
          <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6">Spending Limits</h4>
          <div className="h-3 w-full bg-[var(--glass-bg)] rounded-full overflow-hidden flex">
            <div className="h-full bg-[var(--success)]" style={{ width: '40%' }} />
            <div className="h-full bg-[var(--warning)]" style={{ width: '25%' }} />
            <div className="h-full bg-[var(--accent)]" style={{ width: '35%' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-6">
          {limits.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{item.name} ({item.value}%)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <div className="bg-[var(--glass-bg)] rounded-[24px] p-6 border border-[var(--glass-border)] flex items-center justify-between group cursor-pointer hover:bg-[var(--glass-border)] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">AI Insights</p>
              <p className="text-xs font-black uppercase tracking-tight text-[var(--text)]">70% Care, 20% Preventive</p>
            </div>
          </div>
          <Sparkles size={20} className="text-[var(--accent)] group-hover:scale-125 transition-transform" />
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
          className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] py-4 pl-14 pr-14 rounded-[20px] text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[var(--accent)]/30 transition-all text-[var(--text)]"
        />
        <button className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          <Filter size={18} />
        </button>
      </div>

      <div className="flex gap-8 mb-8 border-b border-[var(--glass-border)]">
        {['All Records', 'Pending', 'Completed'].map((tab, i) => (
          <button 
            key={tab} 
            className={`text-[10px] font-black uppercase tracking-[0.2em] pb-4 border-b-2 transition-all ${i === 0 ? 'border-[var(--accent)] text-[var(--text)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] border-b border-[var(--glass-border)]">
              <th className="pb-6 font-black">Category</th>
              <th className="pb-6 font-black">Value</th>
              <th className="pb-6 font-black text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glass-border)]">
            {records.map((record, i) => (
              <tr key={i} className="group hover:bg-[var(--glass-bg)] transition-colors">
                <td className="py-6 text-xs font-black uppercase tracking-tight text-[var(--text)]">{record.category}</td>
                <td className="py-6 text-xs font-mono font-bold text-[var(--text)]">{record.value}</td>
                <td className="py-6 text-right">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-[var(--glass-bg)] ${record.color}`}>
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
          <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><FileText size={18} /></button>
          <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><ArrowUpRight size={18} /></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest max-w-[220px] leading-relaxed">What areas should I prioritize for artisan growth?</p>
        
        <div className="w-full bg-[var(--glass-bg)] rounded-[24px] p-8 border border-[var(--glass-border)] text-left relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--accent)]" />
          <div className="flex items-center gap-3 text-[var(--accent)] mb-4">
            <Zap size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Growth Strategy</span>
          </div>
          <p className="text-[11px] font-bold text-[var(--text-muted)] leading-relaxed uppercase tracking-tight">
            Prioritize: High-demand categories, verified artisans. Avoid: Low-rated services, inactive regions.
          </p>
        </div>

        <div className="flex gap-3 w-full overflow-x-auto no-scrollbar py-2">
          {['AI Hub', 'Artisan Finance', 'Market Analysis'].map((tag, i) => (
            <button key={i} className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hover:bg-[var(--glass-border)] hover:text-[var(--text)] transition-all">
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] shadow-lg shadow-[var(--accent)]/20">
          <Sparkles size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Ask AI anything..." 
          className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] py-5 pl-18 pr-14 rounded-[20px] text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[var(--accent)]/30 transition-all text-[var(--text)]"
        />
        <button className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default function DashboardOverview({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: any) {
  return (
    <div className="grid grid-cols-12 gap-10">
      {/* Row 1 */}
      <div className="col-span-12 lg:col-span-4">
        <RevenueCard />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <MetricsCard />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <FinanceCard />
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
