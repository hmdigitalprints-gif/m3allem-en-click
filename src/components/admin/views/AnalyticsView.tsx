import React from 'react';
import { Download } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { ViewProps } from '../types';

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

const COLORS = ['#FFD700', '#10b981', '#3b82f6', '#f59e0b', '#64748b'];

export default function AnalyticsView({ analyticsData, onAction }: ViewProps & { analyticsData?: any }) {
  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Analytics & Reports</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Deep dive into platform performance and growth metrics.</p>
        </div>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-[#FFD700]" />
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-8">Growth Over Time</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.revenueTrends || revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#6b7280', fontFamily: 'JetBrains Mono'}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#6b7280', fontFamily: 'JetBrains Mono'}} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card-surface)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '16px', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#FFD700' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] to-orange-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-8">Category Distribution</h3>
          <div className="h-80 w-full flex items-center justify-center">
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
                    backgroundColor: 'var(--card-surface)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '16px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
