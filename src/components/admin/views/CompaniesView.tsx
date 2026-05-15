import React, { useState, useEffect } from 'react';
import { Plus, Building2, ShieldCheck, Clock, Search, MoreVertical, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

export default function CompaniesView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchCompanies = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/companies', { 
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
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
  }, [token]);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/companies', { 
        credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl tech-header text-[var(--text)]">Companies Management</h1>
          <p className="tech-label mt-2 opacity-70">Manage corporate accounts, verify business documents, and track company performance.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-2xl tech-label hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-[var(--accent)]/10 flex items-center gap-3"
        >
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KpiCard title="Total Companies" value={companies.length.toString()} icon={<Building2 size={20} />} trend="+12%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Verified Businesses" value={companies.filter(c => c.is_verified).length.toString()} icon={<ShieldCheck size={20} />} trend="+5%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Pending Verification" value={companies.filter(c => !c.is_verified).length.toString()} icon={<Clock size={20} />} trend="-8%" isPositive={false} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card p-8 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="flex items-center px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex-1 focus-within:border-[var(--accent)]/30 transition-all">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full ml-4 tech-label text-[var(--text)] not-italic" 
            />
          </div>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="tech-label text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="px-10 py-8 font-black">Company</th>
                <th className="px-10 py-8 font-black">Contact</th>
                <th className="px-10 py-8 font-black">Status</th>
                <th className="px-10 py-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={4} className="px-10 py-20 text-center tech-label opacity-50">Loading companies...</td></tr>
              ) : filteredCompanies.length === 0 ? (
                <tr><td colSpan={4} className="px-10 py-20 text-center tech-label opacity-50">No companies found.</td></tr>
              ) : filteredCompanies.map((company) => (
                <tr key={company.id} className="group hover:bg-[var(--accent)]/5 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--bg)] flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-all">
                        <Building2 size={24} className="text-[var(--accent)]" />
                      </div>
                      <div>
                        <p className="tech-header text-sm text-[var(--text)]">{company.name}</p>
                        <p className="tech-label opacity-50 mt-1">{company.address || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="tech-value text-xs not-italic">
                      <p className="text-[var(--text)]">{company.email}</p>
                      <p className="text-[var(--text-muted)] mt-1">{company.phone}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {company.is_verified ? (
                      <span className="px-4 py-1.5 rounded-full tech-label bg-[var(--success)]/10 text-[var(--success)] flex items-center gap-2 w-fit border border-[var(--success)]/20">
                        <CheckCircle size={14} /> Verified
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 rounded-full tech-label bg-[var(--warning)]/10 text-[var(--warning)] flex items-center gap-2 w-fit border border-[var(--warning)]/20">
                        <AlertCircle size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all text-[var(--text)]">
                      <MoreVertical size={18} />
                    </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl tech-header text-[var(--text)]">Add Company</h3>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-[var(--bg)] rounded-2xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleAddCompany} className="space-y-6">
                <div>
                  <label className="block tech-label opacity-70 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-label not-italic"
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className="block tech-label opacity-70 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-label not-italic"
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <label className="block tech-label opacity-70 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-label not-italic"
                    placeholder="+212 5..."
                  />
                </div>
                <div>
                  <label className="block tech-label opacity-70 mb-2">Address</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-label not-italic"
                    placeholder="Casablanca, Morocco"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-8 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] tech-label text-[var(--text)] hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-8 py-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] tech-label hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
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
