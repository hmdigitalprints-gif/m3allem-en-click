import React from 'react';
import { 
  DollarSign, Users, Hammer, CalendarCheck, ChevronDown, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronLeft, ChevronRight, Activity, TrendingUp, Star
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, ComposedChart
} from 'recharts';

function StatCard({ title, value, trend, isPositive, color, icon: Icon, data, subtitle }: any) {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 flex flex-col justify-between overflow-hidden relative border border-[var(--border)] hover:border-[var(--border)] transition-colors h-[160px] shadow-sm group">
      <div className="flex justify-between items-start z-10 relative mb-2">
        <div className="text-[var(--text-muted)] text-[10px] sm:text-xs font-bold tracking-wider uppercase max-w-[70%] leading-tight">
          {title}
        </div>
        <div className="w-10 h-10 rounded-lg flex flex-shrink-0 items-center justify-center border border-[var(--border)] shadow-inner group-hover:scale-105 transition-transform" style={{ backgroundColor: color + '15', color: color }}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="z-10 relative flex items-end justify-between">
        <div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text)] tracking-tight truncate max-w-[120px]">{value}</div>
          {subtitle && <div className="text-[10px] font-bold text-[var(--text-muted)] mt-1 tracking-wider uppercase">{subtitle}</div>}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border shadow-sm ${isPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          {isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />} 
          <span>{trend}</span>
        </div>
      </div>

      <div className="absolute -bottom-4 left-0 right-0 h-[60px] pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${title.replace(/ /g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="100%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#grad-${title.replace(/ /g, '')})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const sparkData1 = [5, 10, 8, 15, 10, 22, 18, 25, 20, 30].map((v, i) => ({ value: v, index: i }));
const sparkData2 = [8, 5, 12, 8, 15, 12, 10, 15, 12, 22].map((v, i) => ({ value: v, index: i }));
const sparkData3 = [15, 12, 10, 18, 15, 20, 25, 22, 30, 35].map((v, i) => ({ value: v, index: i }));
const sparkData4 = [10, 15, 12, 18, 14, 25, 20, 22, 30, 48].map((v, i) => ({ value: v, index: i }));

const bookingRevenueData = [
  { name: 'Jan', revenue: 15000, bookings: 300 },
  { name: 'Feb', revenue: 22000, bookings: 320 },
  { name: 'Mar', revenue: 18000, bookings: 350 },
  { name: 'Apr', revenue: 30000, bookings: 450 },
  { name: 'May', revenue: 36000, bookings: 550 },
  { name: 'Jun', revenue: 47802, bookings: 650 },
  { name: 'Jul', revenue: 45000, bookings: 580 },
  { name: 'Aug', revenue: 38000, bookings: 500 },
  { name: 'Sep', revenue: 35000, bookings: 480 },
  { name: 'Oct', revenue: 25000, bookings: 420 },
  { name: 'Nov', revenue: 40000, bookings: 550 },
  { name: 'Dec', revenue: 52000, bookings: 680 },
];

const recentBookings = [
  { service: 'Plumbing Repair', client: 'Ahmed M.', artisan: 'Hassan Plombier', id: 'BK-1029', price: '450 MAD', status: 'Completed', sColor: 'text-[#22C55E]', sBg: 'bg-[#22C55E]/10' },
  { service: 'Electrical Wiring', client: 'Sara K.', artisan: 'Youssef Elec', id: 'BK-1030', price: '800 MAD', status: 'In Progress', sColor: 'text-[#FFD700]', sBg: 'bg-[#FFD700]/10' },
  { service: 'Home Painting', client: 'Omar B.', artisan: 'Karim Peinture', id: 'BK-1031', price: '3200 MAD', status: 'Pending', sColor: 'text-blue-400', sBg: 'bg-blue-400/10' },
  { service: 'AC Installation', client: 'Nadia R.', artisan: 'Mounir Clim', id: 'BK-1032', price: '600 MAD', status: 'Completed', sColor: 'text-[#22C55E]', sBg: 'bg-[#22C55E]/10' },
  { service: 'Carpentry Custom', client: 'Yassir T.', artisan: 'Ali Najjar', id: 'BK-1033', price: '1500 MAD', status: 'Cancelled', sColor: 'text-red-400', sBg: 'bg-red-400/10' },
];

const topArtisans = [
  { name: 'Hassan Plombier', category: 'Plumbing', rating: '4.9', jobs: '142 Jobs', revenue: '64K MAD', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop' },
  { name: 'Karim Peinture', category: 'Painting', rating: '4.8', jobs: '98 Jobs', revenue: '120K MAD', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { name: 'Youssef Elec', category: 'Electrical', rating: '4.9', jobs: '156 Jobs', revenue: '85K MAD', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop' },
  { name: 'Mounir Clim', category: 'HVAC', rating: '4.7', jobs: '84 Jobs', revenue: '45K MAD', avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=100&h=100&fit=crop' },
];

export default function DashboardOverview({ stats, isDarkMode, onAction }: any) {
  return (
    <div className="space-y-6 pt-4 pb-20">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Platform Revenue" value="334K MAD" trend="12.5%" isPositive color="#FFD700" icon={DollarSign} data={sparkData1} />
        <StatCard title="Active Artisans" value="1,248" trend="4.2%" isPositive color="#3B82F6" icon={Hammer} data={sparkData2} />
        <StatCard title="Total Users" value="14,092" trend="8.1%" isPositive color="#8B5CF6" icon={Users} data={sparkData3} />
        <StatCard title="Total Bookings" value="24,802" trend="15.3%" isPositive color="#22C55E" icon={CalendarCheck} data={sparkData4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-[var(--text)] text-lg font-black mb-4 tracking-tight">Revenue & Bookings</h3>
              <div className="flex gap-8 items-center">
                <div>
                  <div className="text-[var(--text-muted)] text-xs font-semibold flex items-center gap-2 uppercase tracking-wide"><span className="w-2.5 h-2.5 rounded-sm bg-[#FFD700]"></span> Revenue (MAD)</div>
                  <div className="text-2xl font-black text-[var(--text)] mt-1 flex items-center gap-3">
                    37,802
                    <span className="text-xs text-[#22C55E] flex items-center font-bold px-0"><ArrowUpRight size={14}/> 12%</span>
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] text-xs font-semibold flex items-center gap-2 uppercase tracking-wide"><span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]"></span> Bookings</div>
                  <div className="text-2xl font-black text-[var(--text)] mt-1 flex items-center gap-3">
                    845
                    <span className="text-xs text-[#22C55E] flex items-center font-bold px-0"><ArrowUpRight size={14}/> 8%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[var(--card-surface)] border border-[var(--border)] rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-muted)] cursor-pointer hover:bg-[var(--border)] transition-colors">
              Yearly <ChevronDown size={14} />
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={bookingRevenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={{ backgroundColor: '#18191D', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar yAxisId="right" dataKey="bookings" fill="#3B82F6" opacity={0.8} radius={[4, 4, 0, 0]} maxBarSize={16} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={4} dot={false} activeDot={{ r: 8, fill: '#FFD700', stroke: 'var(--card-bg)', strokeWidth: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Artisans Widget */}
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--border)] flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-[var(--text)] text-base font-black tracking-tight flex items-center gap-2">
              <Star className="text-[#FFD700]" size={18} /> Top Artisans
            </h3>
          </div>
          <div className="space-y-4 flex-1 relative z-10">
            {topArtisans.map((artisan, idx) => (
              <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-white/[0.03] p-2 -mx-2 rounded-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl border border-[var(--border)] overflow-hidden shrink-0 relative">
                    <img src={artisan.avatar} alt={artisan.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[14px] text-[var(--text)] font-bold group-hover:text-[#FFD700] transition-colors">{artisan.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">{artisan.category}</div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-[13px] text-[var(--text)] font-bold">{artisan.revenue}</div>
                  <div className="text-[11px] text-[#22C55E] font-bold flex items-center justify-end gap-1">
                    <Star size={10} fill="currentColor" /> {artisan.rating} ( {artisan.jobs} )
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Subtle gradient for depth */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--card-bg)] to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Recent Bookings & Category Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden flex flex-col relative pb-4 shadow-sm">
          <div className="p-6 pb-2 flex justify-between items-center">
            <h3 className="text-[var(--text)] text-base font-black tracking-tight">Recent Bookings</h3>
          </div>
          <div className="overflow-x-auto w-full px-2">
            <table className="w-full text-start whitespace-nowrap">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Service</th>
                  <th className="px-4 py-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Client</th>
                  <th className="px-4 py-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Artisan</th>
                  <th className="px-4 py-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Price</th>
                  <th className="px-4 py-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-end">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookings.map((bk, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[14px] text-[var(--text)] font-bold group-hover:text-[var(--text)] transition-colors">{bk.service}</span>
                        <span className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">{bk.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[var(--text-muted)] font-medium">{bk.client}</td>
                    <td className="px-4 py-4 text-[13px] text-[var(--text-muted)] font-medium">{bk.artisan}</td>
                    <td className="px-4 py-4 text-[14px] text-[var(--text-muted)] font-bold">{bk.price}</td>
                    <td className="px-4 py-4 text-end">
                      <span className={`inline-flex text-[11px] font-black tracking-wide uppercase px-2.5 py-1 rounded-lg border border-[var(--border)] ${bk.sColor} ${bk.sBg}`}>
                        {bk.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-1 bg-[var(--card-bg)] rounded-xl border border-[var(--border)] p-6 flex flex-col h-[400px] shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#3B82F6]/5 rounded-full blur-[50px] pointer-events-none" />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-[var(--text)] text-base font-black tracking-tight">Category Distribution</h3>
            
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[160px] z-10">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Plumbing', value: 35, color: '#FFD700' },
                      { name: 'Electrical', value: 25, color: '#3B82F6' },
                      { name: 'Cleaning', value: 20, color: '#8B5CF6' },
                      { name: 'Painting', value: 20, color: '#22C55E' }
                    ]}
                    cx="50%" cy="50%"
                    innerRadius="65%" outerRadius="90%"
                    paddingAngle={3}
                    dataKey="value"
                    stroke="rgba(15,17,23,1)"
                    strokeWidth={4}
                  >
                    {[
                      { name: 'Plumbing', value: 35, color: '#FFD700' },
                      { name: 'Electrical', value: 25, color: '#3B82F6' },
                      { name: 'Cleaning', value: 20, color: '#8B5CF6' },
                      { name: 'Painting', value: 20, color: '#22C55E' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                 <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Total</div>
                 <div className="text-3xl font-black text-[var(--text)]">2.4k</div>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-6 text-xs font-bold text-[var(--text-muted)] z-10">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#FFD700]"></span> Plumbing <span className="ml-auto text-[var(--text)]">35%</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]"></span> Electrical <span className="ml-auto text-[var(--text)]">25%</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#8B5CF6]"></span> Cleaning <span className="ml-auto text-[var(--text)]">20%</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]"></span> Painting <span className="ml-auto text-[var(--text)]">20%</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
