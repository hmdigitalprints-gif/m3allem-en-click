import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, AlertTriangle, DollarSign, Search, MoreVertical, Loader2, Clock, Package, ArrowUpRight } from 'lucide-react';
import { ViewProps } from '../types';

function StatCard({ title, value, color, icon: Icon }: any) {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-6 flex flex-col justify-between overflow-hidden relative border border-[var(--border)] hover:border-[var(--border)] transition-colors h-[140px] shadow-sm group">
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }} />
      <div className="flex justify-between items-start z-10 relative">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-[var(--border)] shadow-inner group-hover:scale-105 transition-transform" style={{ backgroundColor: color + '15', color: color }}>
            <Icon size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[var(--text-muted)] text-xs font-black flex items-center gap-2 mb-1 tracking-wider uppercase">
              {title}
            </div>
            <div className="text-3xl font-black text-[var(--text)] tracking-tight">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersView({ onAction }: ViewProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', { 
        credentials: 'include'
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
  }, []);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.client_name && o.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (o.artisan_name && o.artisan_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalVolume = orders.reduce((acc, o) => acc + (o.total_price || 0), 0);

  return (
    <div className="space-y-8 pt-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Orders & Bookings</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Track active services and milestones</p>
        </div>
        <div className="flex gap-4">
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Active Orders" value={orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length.toString()} color="#3B82F6" icon={ShoppingBag} />
        <StatCard title="Completed" value={orders.filter(o => o.status === 'completed').length.toString()} color="#10B981" icon={CheckCircle} />
        <StatCard title="Disputed" value={orders.filter(o => o.status === 'disputed').length.toString()} color="#EF4444" icon={AlertTriangle} />
        <StatCard title="Total Volume" value={`MAD ${(Number(totalVolume) || 0).toFixed(0)}`} color="#FFD700" icon={DollarSign} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] flex-1 w-full max-w-md focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
          <Search size={18} className="text-[var(--text-muted)]" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search orders by ID or customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]" 
          />
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">All Orders</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Parties</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-[#FFD700]" />
                      <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Loading orders...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--card-surface)] flex items-center justify-center border border-[var(--border)] group-hover:border-[#FFD700]/30 transition-colors text-[var(--text-muted)] group-hover:text-[#FFD700]">
                        <Package size={20} strokeWidth={2} />
                      </div>
                      <span className="text-sm font-bold text-[var(--text)] font-mono uppercase tracking-widest group-hover:text-[#FFD700] transition-colors">
                        #{order.id.substring(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[var(--text)] mb-0.5">{order.client_name || 'Unknown Client'}</span>
                      <span className="text-xs font-medium text-[var(--text-muted)]">with <span className="font-bold text-[var(--text-muted)]">{order.artisan_name || 'Unknown Artisan'}</span></span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-[#FFD700] tracking-tight">
                      <span className="text-xs mr-1">MAD</span>
                      {(Number(order.total_price) || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border items-center justify-center gap-1.5 w-fit shadow-sm ${
                      order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      order.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      order.status === 'disputed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {order.status === 'completed' && <CheckCircle size={14} strokeWidth={2.5} />}
                      {order.status === 'pending' && <Clock size={14} strokeWidth={2.5} />}
                      {order.status === 'disputed' && <AlertTriangle size={14} strokeWidth={2.5} />}
                      {(order.status || 'pending').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    
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
