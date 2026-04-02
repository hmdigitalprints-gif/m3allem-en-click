import React, { useState, useEffect } from 'react';
import { Search, Loader2, Star, CheckCircle, AlertCircle, Zap, MoreVertical } from 'lucide-react';
import { ViewProps } from '../types';

export default function ArtisansView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArtisans();
  }, []);

  const fetchArtisans = async () => {
    try {
      const response = await fetch('/api/admin/artisans', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}` }
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
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}` }
      });
      if (response.ok) {
        setArtisans(prev => prev.map(a => a.id === id ? { ...a, is_featured: a.is_featured ? 0 : 1 } : a));
      }
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
    }
  };

  const filteredArtisans = artisans.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-[var(--text)]">Artisans Management</h1>
          <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mt-2">Approve, feature, and monitor artisan performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onAction?.('Viewing pending artisan approvals...')}
            className="px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--card-bg)]/80 transition-all text-[var(--text-muted)]"
          >
            Pending Approvals ({artisans.filter(a => !a.is_verified).length})
          </button>
        </div>
      </div>

      <div className="hynex-card p-8 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="flex items-center px-6 py-4 rounded-[20px] bg-[var(--bg)] border border-[var(--border)] flex-1 focus-within:border-[var(--accent)]/30 transition-all">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search artisans..." 
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
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Loading artisans...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredArtisans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">No artisans found.</p>
                  </td>
                </tr>
              ) : filteredArtisans.map((artisan) => (
                <tr key={artisan.id} className="group hover:bg-[var(--card-bg)]/50 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[20px] overflow-hidden border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-all">
                        <img src={artisan.avatar_url || `https://picsum.photos/seed/${artisan.id}/100/100`} alt={artisan.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight text-[var(--text)]">{artisan.name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">{artisan.city || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-1.5 rounded-full bg-[var(--card-bg)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      {artisan.category_name}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-[var(--accent)]">
                      <Star size={16} className="fill-current" />
                      <span className="text-sm font-black tracking-tighter italic">{artisan.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {artisan.is_verified ? (
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--card-bg)] text-[var(--success)] flex items-center gap-2 w-fit">
                        <CheckCircle size={14} /> Verified
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--card-bg)] text-[var(--warning)] flex items-center gap-2 w-fit">
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
                      onClick={() => onAction?.(`Viewing details for ${artisan.name}...`)}
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
