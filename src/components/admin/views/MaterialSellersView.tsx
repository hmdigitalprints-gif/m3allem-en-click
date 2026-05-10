import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, X, CheckCircle, AlertCircle, Loader2, Star, Package } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

export default function MaterialSellersView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', email: '', phone: '' });

  const fetchSellers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/material-sellers', { credentials: 'include'});
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
  }, [token]);

  const handleAddSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/material-sellers', { credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Material Sellers</h1>
          <p className="text-sm text-white/40 mt-1">Manage suppliers, inventory categories, and material pricing across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onAction?.('Manage Categories functionality coming soon!')}
            className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all active:scale-95"
          >
            Manage Categories
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#FFD700] text-black px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all active:scale-95"
          >
            <Plus size={18} /> Add Seller
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex items-center px-4 py-2 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} flex-1 max-w-md`}>
          <Search size={18} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Search sellers or categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm text-[var(--text)]" 
          />
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Top Material Suppliers</h3>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs text-[#FFD700] hover:underline"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-white/20 border-b border-white/5">
              <tr>
                <th className="px-8 py-4 font-medium">Supplier</th>
                <th className="px-8 py-4 font-medium">Category</th>
                <th className="px-8 py-4 font-medium">Products</th>
                <th className="px-8 py-4 font-medium">Rating</th>
                <th className="px-8 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">Loading sellers...</td></tr>
              ) : filteredSellers.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">No sellers found.</td></tr>
              ) : filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                        <Package size={18} className="text-[#FFD700]" />
                      </div>
                      <span className="font-bold">{seller.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-white/60">{seller.category}</td>
                  <td className="px-8 py-5">{seller.product_count || 0}</td>
                  <td className="px-8 py-5 text-[#FFD700] flex items-center gap-1">
                    <Star size={14} fill="currentColor" /> {seller.rating || 'N/A'}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      seller.is_verified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md ${cardClasses} border border-white/10 rounded-3xl p-8 shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Add Material Seller</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                  <X size={20} className="text-white/40" />
                </button>
              </div>

              <form onSubmit={handleAddSeller} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Seller Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFD700]/50 outline-none transition-all"
                    placeholder="Supplier Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFD700]/50 outline-none transition-all"
                  >
                    <option value="" className="bg-zinc-900">Select Category</option>
                    <option value="Construction" className="bg-zinc-900">Construction</option>
                    <option value="Carpentry" className="bg-zinc-900">Carpentry</option>
                    <option value="Masonry" className="bg-zinc-900">Masonry</option>
                    <option value="Finishing" className="bg-zinc-900">Finishing</option>
                    <option value="Plumbing" className="bg-zinc-900">Plumbing</option>
                    <option value="Electrical" className="bg-zinc-900">Electrical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFD700]/50 outline-none transition-all"
                    placeholder="contact@supplier.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFD700]/50 outline-none transition-all"
                    placeholder="+212 5..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 rounded-xl bg-[#FFD700] text-black text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
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
