import React, { useState, useEffect } from 'react';
import { Plus, Building2, ShieldCheck, Clock, Search, MoreVertical, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompaniesView({ onAction }: ViewProps) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/companies', { 
        credentials: 'include'
      });
      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/companies', { 
        credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', address: '' });
        fetchCompanies();
        onAction?.('Company added successfully');
      }
    } catch (error) {
      onAction?.('Failed to add company');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Companies Management</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Manage corporate accounts, verify business documents, and track company performance.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#FFD700] text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#E6C200] transition-colors active:scale-95 shadow-lg shadow-[#FFD700]/10"
        >
          <Plus size={18} strokeWidth={3} /> Add Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Companies" value={companies.length.toString()} icon={<Building2 size={24} strokeWidth={2.5} />} trend="+12%" isPositive={true} isDarkMode={true} />
        <KpiCard title="Verified Businesses" value={companies.filter(c => c.is_verified).length.toString()} icon={<ShieldCheck size={24} strokeWidth={2.5} />} trend="+5%" isPositive={true} isDarkMode={true} />
        <KpiCard title="Pending" value={companies.filter(c => !c.is_verified).length.toString()} icon={<Clock size={24} strokeWidth={2.5} />} trend="-8%" isPositive={false} isDarkMode={true} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] flex-1 w-full focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
          <Search size={18} className="text-[var(--text-muted)]" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search companies by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]" 
          />
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/[0.01]">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Company</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Contact</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
                      <p className="text-sm font-bold text-[var(--text-muted)] tracking-wider uppercase">Loading companies...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No companies found.
                  </td>
                </tr>
              ) : filteredCompanies.map((company) => (
                <tr key={company.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center shrink-0 group-hover:border-[#FFD700]/30 transition-colors group-hover:text-[#FFD700]">
                        <Building2 size={24} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text)] tracking-tight">{company.name}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{company.address || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-[var(--text)] tracking-tight">{company.email}</p>
                      <p className="text-xs font-mono font-medium text-[var(--text-muted)] tracking-wider mt-0.5">{company.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {company.is_verified ? (
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 gap-1.5 shadow-sm">
                        <CheckCircle size={14} strokeWidth={3} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 gap-1.5 shadow-sm">
                        <AlertCircle size={14} strokeWidth={3} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-end">
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Company Modal */}
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
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">Add Company</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--border)] rounded-xl transition-colors">
                  <X size={20} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors" />
                </button>
              </div>

              <form onSubmit={handleAddCompany} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Company Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="contact@company.com"
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
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Address</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="Casablanca, Morocco"
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
                    {submitting ? 'Adding...' : 'Add Company'}
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
