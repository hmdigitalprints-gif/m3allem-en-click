import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, X, CheckCircle, AlertCircle, Loader2, Star, Package } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function MaterialSellersView({ onAction }: ViewProps) {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', email: '', phone: '' });

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/material-sellers', { 
        credentials: 'include'
      });
      const data = await res.json();
      setSellers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleAddSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/material-sellers', { 
        credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', category: '', email: '', phone: '' });
        fetchSellers();
        onAction?.('Seller added successfully');
      }
    } catch (error) {
      onAction?.('Failed to add seller');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSellers = sellers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Material Sellers</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Manage suppliers, inventory categories, and material pricing across the platform.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#FFD700] text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#E6C200] transition-colors active:scale-95 shadow-lg shadow-[#FFD700]/10"
          >
            <Plus size={18} strokeWidth={3} /> Add Seller
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] flex-1 w-full max-w-md focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
          <Search size={18} className="text-[var(--text-muted)]" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search sellers or categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]" 
          />
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">Top Material Suppliers</h3>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs font-black uppercase tracking-wider text-[#FFD700] hover:text-[#E6C200] transition-colors"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Supplier</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Category</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Products</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Rating</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-end">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
                      Loading sellers...
                    </div>
                  </td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No sellers found.
                  </td>
                </tr>
              ) : filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center shrink-0 group-hover:border-[#FFD700]/30 transition-colors group-hover:text-[#FFD700]">
                        <Package size={24} strokeWidth={2} />
                      </div>
                      <span className="text-sm font-bold text-[var(--text)] tracking-tight">{seller.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{seller.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-[var(--text)]">{seller.product_count || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-[#FFD700] flex items-center gap-1.5">
                      <Star size={16} fill="currentColor" strokeWidth={2} /> {seller.rating || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border items-center justify-center gap-1 w-fit shadow-sm ml-auto ${
                      seller.is_verified ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                    }`}>
                      {seller.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Seller Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00]" />
              
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">Add Material Seller</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--border)] rounded-xl transition-colors">
                  <X size={20} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors" />
                </button>
              </div>

              <form onSubmit={handleAddSeller} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Seller Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="Supplier Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Category</label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner appearance-none pr-10 cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center' }}
                  >
                    <option value="" className="bg-[var(--card-surface)]">Select Category</option>
                    <option value="Construction" className="bg-[var(--card-surface)]">Construction</option>
                    <option value="Carpentry" className="bg-[var(--card-surface)]">Carpentry</option>
                    <option value="Masonry" className="bg-[var(--card-surface)]">Masonry</option>
                    <option value="Finishing" className="bg-[var(--card-surface)]">Finishing</option>
                    <option value="Plumbing" className="bg-[var(--card-surface)]">Plumbing</option>
                    <option value="Electrical" className="bg-[var(--card-surface)]">Electrical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="contact@supplier.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="+212 5..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] font-black uppercase tracking-wider hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-lg bg-[#FFD700] text-black font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#FFD700]/10 text-sm"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
                    {submitting ? 'Adding...' : 'Add Seller'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
