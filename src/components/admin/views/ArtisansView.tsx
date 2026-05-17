import React, { useState, useEffect } from 'react';
import { Search, Loader2, Star, CheckCircle, AlertCircle, Zap, MoreVertical, X, ShieldCheck, ShieldAlert } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

export default function ArtisansView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState<any>(null);

  useEffect(() => {
    fetchArtisans();
  }, []);

  const fetchArtisans = async () => {
    try {
      const response = await fetch('/api/admin/artisans', { 
        credentials: 'include'
      });
      const data = await response.json();
      setArtisans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch artisans:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/artisans/${id}/toggle-featured`, { 
        credentials: 'include', 
        method: 'POST'
      });
      if (response.ok) {
        setArtisans(prev => prev.map(a => a.id === id ? { ...a, is_featured: a.is_featured ? 0 : 1 } : a));
      }
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
    }
  };

  const handleVerify = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/artisans/${id}/verify`, { 
        credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
          },
        body: JSON.stringify({ verified: !currentStatus })
      });
      if (response.ok) {
        fetchArtisans();
        onAction?.(`Artisan ${!currentStatus ? 'verified' : 'unverified'} successfully`);
        if (selectedArtisan?.id === id) setSelectedArtisan(null);
      }
    } catch (error) {
      onAction?.('Failed to update verification status');
    }
  };

  const filteredArtisans = artisans.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         a.category_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPending = !showPendingOnly || !a.is_verified;
    return matchesSearch && matchesPending;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl tech-header text-[var(--text)] uppercase">Artisans Management</h1>
          <p className="tech-label mt-2 opacity-70">Approve, feature, and monitor artisan performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowPendingOnly(!showPendingOnly)}
            className={`px-8 py-4 rounded-2xl tech-label border transition-all active:scale-95 ${
              showPendingOnly 
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' 
                : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--card-bg)]'
            }`}
          >
            {showPendingOnly ? 'Showing Pending' : `Pending Approvals (${artisans.filter(a => !a.is_verified).length})`}
          </button>
        </div>
      </div>

      <div className="hynex-card p-8 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="flex items-center px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex-1 focus-within:border-[var(--accent)]/30 transition-all">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search artisans..." 
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
              <tr className="tech-label border-b border-[var(--border)]">
                <th className="px-10 py-8 font-black">Artisan</th>
                <th className="px-10 py-8 font-black">Category</th>
                <th className="px-10 py-8 font-black">Rating</th>
                <th className="px-10 py-8 font-black">Status</th>
                <th className="px-10 py-8 font-black">Featured</th>
                <th className="px-10 py-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <Loader2 size={40} className="animate-spin text-[var(--accent)]" />
                      <p className="tech-label">Loading artisans...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredArtisans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <p className="tech-label opacity-50">No artisans found.</p>
                  </td>
                </tr>
              ) : filteredArtisans.map((artisan) => (
                <tr key={artisan.id} className="group hover:bg-[var(--accent)]/5 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[20px] overflow-hidden border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-all shadow-sm">
                        <img src={artisan.avatar_url || `https://picsum.photos/seed/${artisan.id}/100/100`} alt={artisan.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm tech-header text-[var(--text)] uppercase">{artisan.name}</p>
                        <p className="tech-label mt-1 opacity-70">{artisan.city || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-1.5 rounded-full bg-[var(--glass-bg)] tech-label border border-[var(--glass-border)]">
                      {artisan.category_name}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-[var(--accent)]">
                      <Star size={16} className="fill-current" />
                      <span className="text-sm tech-value">{Number(artisan.rating || 0).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {artisan.is_verified ? (
                      <span className="px-4 py-1.5 rounded-full tech-label bg-[var(--success)]/5 text-[var(--success)] border border-[var(--success)]/20 flex items-center gap-2 w-fit">
                        <CheckCircle size={14} /> Verified
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 rounded-full tech-label bg-[var(--warning)]/5 text-[var(--warning)] border border-[var(--warning)]/20 flex items-center gap-2 w-fit">
                        <AlertCircle size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-8">
                    <button 
                      onClick={() => {
                        toggleFeatured(artisan.id);
                        onAction?.(`Toggling featured status for ${artisan.name}...`);
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${artisan.is_featured ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--card-bg)] text-[var(--text-muted)]'}`}
                      title={artisan.is_featured ? "Featured" : "Not Featured"}
                    >
                      <Zap size={18} className={artisan.is_featured ? "fill-current" : ""} />
                    </button>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => setSelectedArtisan(artisan)}
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

      {/* Artisan Details Modal */}
      <AnimatePresence>
        {selectedArtisan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-10 shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setSelectedArtisan(null)}
                className="absolute top-8 right-8 p-3 hover:bg-[var(--bg)] rounded-2xl transition-all"
              >
                <X size={24} className="text-[var(--text-muted)]" />
              </button>

              <div className="flex flex-col md:flex-row gap-10">
                <div className="w-40 h-40 rounded-[32px] overflow-hidden border-2 border-[var(--accent)]/20 shrink-0">
                  <img 
                    src={selectedArtisan.avatar_url || `https://picsum.photos/seed/${selectedArtisan.id}/200/200`} 
                    alt={selectedArtisan.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-3xl tech-header uppercase text-[var(--text)]">{selectedArtisan.name}</h2>
                    <p className="tech-label text-[var(--accent)] mt-2">{selectedArtisan.category_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-3xl bg-[var(--bg)] border border-[var(--border)]">
                      <p className="tech-label mb-1 opacity-50">City</p>
                      <p className="text-sm tech-value not-italic text-[var(--text)]">{selectedArtisan.city || 'Not specified'}</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-[var(--bg)] border border-[var(--border)]">
                      <p className="tech-label mb-1 opacity-50">Rating</p>
                      <div className="flex items-center gap-2 text-[var(--accent)]">
                        <Star size={16} className="fill-current" />
                        <span className="text-sm tech-value">{Number(selectedArtisan.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => handleVerify(selectedArtisan.id, selectedArtisan.is_verified)}
                      className={`flex-1 py-5 rounded-[24px] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 ${
                        selectedArtisan.is_verified 
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' 
                          : 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 hover:bg-[var(--success)]/20'
                      }`}
                    >
                      {selectedArtisan.is_verified ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                      {selectedArtisan.is_verified ? 'Revoke Verification' : 'Verify Artisan'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
