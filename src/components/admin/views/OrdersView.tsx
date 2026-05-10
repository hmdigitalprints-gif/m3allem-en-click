import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, AlertTriangle, DollarSign, Search, MoreVertical, Loader2, Clock, Package } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';
import { useAuth } from '../../../context/AuthContext';

export default function OrdersView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', { credentials: 'include'});
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
  }, [token]);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.artisan_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVolume = orders.reduce((acc, o) => acc + (o.total_price || 0), 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">Orders & Projects</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">Track active service orders, material purchases, and project milestones.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onAction?.('Exporting orders report...')}
            className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
          >
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <KpiCard title="Active Orders" value={orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length.toString()} icon={<ShoppingBag size={20} />} trend="0%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Completed" value={orders.filter(o => o.status === 'completed').length.toString()} icon={<CheckCircle size={20} />} trend="0%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Disputed" value={orders.filter(o => o.status === 'disputed').length.toString()} icon={<AlertTriangle size={20} />} trend="0%" isPositive={false} isDarkMode={isDarkMode} />
        <KpiCard title="Total Volume" value={`MAD ${totalVolume.toLocaleString()}`} icon={<DollarSign size={20} />} trend="0%" isPositive={true} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card p-8 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="flex items-center px-6 py-4 rounded-[20px] bg-[var(--bg)] border border-[var(--border)] flex-1 focus-within:border-[#FFD400]/30 transition-all">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search orders by ID or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full ml-4 text-xs font-bold uppercase tracking-widest placeholder:text-[var(--text-muted)]/50 text-[var(--text)]" 
            />
          </div>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="px-10 py-8 font-black">Order ID</th>
                <th className="px-10 py-8 font-black">Parties</th>
                <th className="px-10 py-8 font-black">Amount</th>
                <th className="px-10 py-8 font-black">Status</th>
                <th className="px-10 py-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={5} className="px-10 py-20 text-center text-[var(--text-muted)]">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-20 text-center text-[var(--text-muted)]">No orders found.</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-[var(--card-bg)]/50 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-[var(--border)]">
                        <Package size={18} className="text-[#FFD400]" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--text)] uppercase tracking-widest">
                        #{order.id.substring(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-xs">
                      <p className="font-bold text-[var(--text)]">{order.client_name}</p>
                      <p className="text-[var(--text-muted)] mt-1">with {order.artisan_name}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-sm font-black italic tracking-tighter text-[var(--text)]">
                      MAD {order.total_price?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                      order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                      order.status === 'disputed' ? 'bg-rose-500/10 text-rose-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {order.status === 'completed' && <CheckCircle size={14} />}
                      {order.status === 'pending' && <Clock size={14} />}
                      {order.status === 'disputed' && <AlertTriangle size={14} />}
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => onAction?.(`Viewing details for order ${order.id}...`)}
                      className="w-10 h-10 rounded-xl bg-[var(--card-bg)] flex items-center justify-center hover:bg-[var(--card-bg)]/80 transition-all text-[var(--text)]"
                    >
                      <MoreVertical size={18} />
                    </button>
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
