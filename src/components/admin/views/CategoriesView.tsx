import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';

interface CategoriesViewProps {
  isDarkMode: boolean;
  cardClasses: string;
  textMutedClasses: string;
  hoverClasses: string;
  onAction?: (msg: string) => void;
}

export default function CategoriesView({ 
  isDarkMode, 
  cardClasses, 
  textMutedClasses, 
  hoverClasses, 
  onAction 
}: CategoriesViewProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleUpdateCommission = async (id: string, rate: number | null) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}`
        },
        body: JSON.stringify({ commission_rate: rate })
      });
      if (response.ok) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, commission_rate: rate } : c));
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}/toggle-active`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}` }
      });
      if (response.ok) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: c.is_active ? 0 : 1 } : c));
      }
    } catch (error) {
      console.error('Failed to toggle category status:', error);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-[var(--text)]">Categories Management</h1>
          <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mt-2">Add, edit, or hide service and product categories.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onAction?.('Opening add category dialog...')}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-[var(--accent)]/10"
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="px-10 py-8 font-black">Category Name</th>
                <th className="px-10 py-8 font-black">Commission Rate</th>
                <th className="px-10 py-8 font-black">Status</th>
                <th className="px-10 py-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <Loader2 size={40} className="animate-spin text-[var(--accent)]" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Loading categories...</p>
                    </div>
                  </td>
                </tr>
              ) : categories.map((item, i) => (
                <tr key={i} className="group hover:bg-[var(--card-bg)]/50 transition-all">
                  <td className="px-10 py-8">
                    <p className="text-sm font-black uppercase tracking-tight text-[var(--text)]">{item.name}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        defaultValue={item.commission_rate !== null ? item.commission_rate * 100 : ''} 
                        placeholder="Global"
                        onBlur={(e) => {
                          const val = e.target.value;
                          handleUpdateCommission(item.id, val === '' ? null : parseFloat(val) / 100);
                        }}
                        className="w-20 bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2 px-4 text-xs font-bold font-mono focus:outline-none focus:border-[var(--accent)]/30 transition-all text-[var(--text)]"
                      />
                      <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">%</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--card-bg)] ${
                      item.is_active ? 'text-[var(--success)]' : 'text-[var(--destructive)]'
                    }`}>
                      {item.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button 
                        onClick={() => toggleActive(item.id)}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${item.is_active ? 'text-[var(--accent)] hover:opacity-80' : 'text-[var(--success)] hover:opacity-80'}`}
                      >
                        {item.is_active ? 'Hide' : 'Restore'}
                      </button>
                      <button 
                        onClick={() => onAction?.(`Editing category ${item.name}...`)}
                        className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text)] transition-all active:scale-95"
                      >
                        Edit
                      </button>
                    </div>
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
