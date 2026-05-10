import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, X, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

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
  const { t } = useTranslation();
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', icon: 'Package', commission_rate: '0.10' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/admin/categories', { credentials: 'include'});
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

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({
          ...formData,
          commission_rate: parseFloat(formData.commission_rate)
        })
      });

      if (response.ok) {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', icon: 'Package', commission_rate: '0.10' });
        fetchCategories();
        onAction?.(`Category ${editingCategory ? 'updated' : 'added'} successfully`);
      }
    } catch (error) {
      onAction?.('Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { credentials: 'include', 
        method: 'DELETE'});
      if (response.ok) {
        fetchCategories();
        onAction?.('Category deleted successfully');
      }
    } catch (error) {
      onAction?.('Failed to delete category');
    }
  };

  const toggleActive = async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/categories/${id}/toggle-active`, { credentials: 'include', 
        method: 'POST'});
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
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-[var(--text)]">{t('admin_categories_mgmt', 'Categories Management')}</h1>
          <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mt-2">{t('admin_categories_desc', 'Add, edit, or hide service and product categories.')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', icon: 'Package', commission_rate: '0.10' });
              setShowModal(true);
            }}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-[var(--accent)]/10"
          >
            <Plus size={18} /> {t('admin_add_category', 'Add Category')}
          </button>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="px-10 py-8 font-black">{t('admin_cat_name', 'Category Name')}</th>
                <th className="px-10 py-8 font-black">{t('admin_cat_comm', 'Commission Rate')}</th>
                <th className="px-10 py-8 font-black">{t('admin_cat_status', 'Status')}</th>
                <th className="px-10 py-8 font-black text-right">{t('admin_cat_actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                       <Loader2 size={40} className="animate-spin text-[var(--accent)]" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">{t('admin_loading_cats', 'Loading categories...')}</p>
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
                      <span className="text-xs font-bold font-mono text-[var(--text)]">
                        {item.commission_rate !== null ? (item.commission_rate * 100).toFixed(1) : 'Global'}
                      </span>
                      <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">%</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--card-bg)] ${
                      item.is_active ? 'text-[var(--success)]' : 'text-[var(--destructive)]'
                    }`}>
                      {item.is_active ? t('admin_cat_active', 'Active') : t('admin_cat_hidden', 'Hidden')}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button 
                        onClick={() => toggleActive(item.id)}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${item.is_active ? 'text-[var(--accent)] hover:opacity-80' : 'text-[var(--success)] hover:opacity-80'}`}
                      >
                        {item.is_active ? t('admin_btn_hide', 'Hide') : t('admin_btn_restore', 'Restore')}
                      </button>
                      <button 
                        onClick={() => {
                          setEditingCategory(item);
                          setFormData({ 
                            name: item.name, 
                            icon: item.icon || 'Package', 
                            commission_rate: (item.commission_rate || 0.10).toString() 
                          });
                          setShowModal(true);
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text)] transition-all active:scale-95"
                      >
                        {t('admin_btn_edit', 'Edit')}
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(item.id)}
                        className="text-[10px] font-black uppercase tracking-widest text-[var(--destructive)] hover:opacity-80 transition-all active:scale-95"
                      >
                        {t('admin_btn_delete', 'Delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[var(--text)]">{editingCategory ? t('admin_edit_cat', 'Edit Category') : t('admin_add_cat', 'Add Category')}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">{t('admin_lbl_cat_name', 'Category Name')}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="e.g. Plumbing"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">{t('admin_lbl_comm_rate', 'Commission Rate (0.0 - 1.0)')}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="1"
                    required
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="0.10"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-2 italic">{t('admin_lbl_comm_rate_desc', '0.10 means 10% commission on each order.')}</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold hover:bg-[var(--card-bg)] transition-all"
                  >
                    {t('admin_btn_cancel', 'Cancel')}
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {submitting ? t('admin_btn_saving', 'Saving...') : t('admin_btn_save_cat', 'Save Category')}
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
