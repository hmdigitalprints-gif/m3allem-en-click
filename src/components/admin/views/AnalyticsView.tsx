import React from 'react';
import { Download } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

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

export default function AnalyticsView({ 
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
