import React, { useState, useEffect } from 'react';
import { Search, Loader2, Star, CheckCircle, AlertCircle, Zap, MoreVertical, X, ShieldCheck, ShieldAlert, Filter } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function ArtisansView({ onAction }: ViewProps) {
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
    const matchesSearch = a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         a.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPending = !showPendingOnly || !a.is_verified;
    return matchesSearch && matchesPending;
  });

  return (
    <div className="space-y-8 pt-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Artisans Management</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Approve, feature & monitor performance</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowPendingOnly(!showPendingOnly)}
            className={`px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 border shadow-sm ${
              showPendingOnly 
                ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-lg shadow-[#FFD700]/10' 
                : 'bg-[var(--card-surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--border)]'
            }`}
          >
            <Filter size={18} strokeWidth={2.5} />
            {showPendingOnly ? 'Showing Pending' : `Pending Approvals (${artisans.filter(a => !a.is_verified).length})`}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] flex-1 w-full max-w-md focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
          <Search size={18} className="text-[var(--text-muted)]" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search artisans by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]" 
          />
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/[0.01]">
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Artisan</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Category</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Rating</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-center">Featured</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-[#FFD700]" />
                      <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Loading artisans...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredArtisans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No artisans found.
                  </td>
                </tr>
              ) : filteredArtisans.map((artisan) => (
                <tr key={artisan.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] shrink-0 shadow-sm">
                        <img src={artisan.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name || 'A')}&background=random`} alt={artisan.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--text)] tracking-tight leading-tight mb-1">{artisan.name}</span>
                        <span className="text-xs font-bold text-[var(--text-muted)]">{artisan.city || 'Location not set'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 rounded-lg bg-[var(--card-surface)] text-xs font-black text-[var(--text-muted)] border border-[var(--border)] uppercase tracking-wider shadow-sm">
                      {artisan.category_name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[#FFD700]">
                      <Star size={16} className="fill-current" strokeWidth={2} />
                      <span className="text-sm font-black">{Number(artisan.rating || 0).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {artisan.is_verified ? (
                      <span className="inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-emerald-500/20 text-emerald-500 bg-emerald-500/10 items-center gap-1.5 w-fit shadow-sm">
                        <CheckCircle size={14} strokeWidth={2.5} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-orange-500/20 text-orange-500 bg-orange-500/10 items-center gap-1.5 w-fit shadow-sm">
                        <AlertCircle size={14} strokeWidth={2.5} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => {
                        toggleFeatured(artisan.id);
                        onAction?.(`Toggling featured status for ${artisan.name}...`);
                      }}
                      className={`inline-flex p-2.5 rounded-xl transition-all active:scale-95 border shadow-sm ${
                        artisan.is_featured 
                          ? 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20 hover:bg-[#FFD700]/20' 
                          : 'bg-[var(--card-surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--border)]'
                      }`}
                      title={artisan.is_featured ? "Featured" : "Not Featured"}
                    >
                      <Zap size={18} strokeWidth={artisan.is_featured ? 3 : 2} className={artisan.is_featured ? "fill-current" : ""} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <button 
                      onClick={() => setSelectedArtisan(artisan)}
                      className="p-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] border border-transparent hover:bg-[var(--border)] transition-colors opacity-0 group-hover:opacity-100 shadow-sm inline-flex items-center justify-center"
                    >
                      <MoreVertical size={18} strokeWidth={2.5} />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00]" />
              
              <button 
                onClick={() => setSelectedArtisan(null)}
                className="absolute top-6 right-6 p-2 hover:bg-[var(--border)] rounded-xl transition-colors z-20"
              >
                <X size={20} className="text-[var(--text-muted)] hover:text-[var(--text)]" />
              </button>

              <div className="flex flex-col md:flex-row gap-8 relative z-10 pt-2">
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-[var(--border)] shrink-0 relative group shadow-lg">
                  <img 
                    src={selectedArtisan.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedArtisan.name || 'A')}&background=random`} 
                    alt={selectedArtisan.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg" />
                </div>
                
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-3xl font-black text-[var(--text)] tracking-tight">{selectedArtisan.name}</h2>
                    <p className="text-sm font-black text-[#FFD700] uppercase tracking-wider mt-2">{selectedArtisan.category_name || 'Artisan'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">City</p>
                      <p className="text-sm font-bold text-[var(--text)]">{selectedArtisan.city || 'Not specified'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Rating</p>
                      <div className="flex items-center gap-2 text-[#FFD700]">
                        <Star size={16} className="fill-current" strokeWidth={2} />
                        <span className="text-sm font-black">{Number(selectedArtisan.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 mt-8">
                    <button 
                      onClick={() => handleVerify(selectedArtisan.id, selectedArtisan.is_verified)}
                      className={`flex-1 py-4 rounded-lg text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border shadow-sm ${
                        selectedArtisan.is_verified 
                          ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' 
                          : 'bg-[#22C55E]/10 text-emerald-500 border-emerald-500/20 hover:bg-[#22C55E]/20'
                      }`}
                    >
                      {selectedArtisan.is_verified ? <ShieldAlert size={18} strokeWidth={2.5} /> : <ShieldCheck size={18} strokeWidth={2.5} />}
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
