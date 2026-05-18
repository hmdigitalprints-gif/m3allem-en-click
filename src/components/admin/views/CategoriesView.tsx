import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, X, Save, Trash2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { ViewProps } from '../types';

export default function CategoriesView({ onAction }: ViewProps) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', icon: 'Package', commission_rate: '0.10' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', { 
        credentials: 'include'
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
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
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { 
        credentials: 'include', 
        method: 'DELETE'
      });
      if (response.ok) {
        fetchCategories();
        onAction?.('Category deleted successfully');
      }
    } catch (error) {
      onAction?.('Failed to delete category');
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}/toggle-active`, { 
        credentials: 'include', 
        method: 'POST'
      });
      if (response.ok) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: c.is_active ? 0 : 1 } : c));
      }
    } catch (error) {
      console.error('Failed to toggle category status:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">{t('admin_categories_mgmt', 'Categories Management')}</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">{t('admin_categories_desc', 'Add, edit, or hide service and product categories.')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', icon: 'Package', commission_rate: '0.10' });
              setShowModal(true);
            }}
            className="bg-[#FFD700] text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors active:scale-95 flex items-center gap-2 shadow-lg shadow-[#FFD700]/10"
          >
            <Plus size={18} strokeWidth={3} /> {t('admin_add_category', 'Add Category')}
          </button>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/[0.01]">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('admin_cat_name', 'Category Name')}</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('admin_cat_comm', 'Commission Rate')}</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('admin_cat_status', 'Status')}</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-end">{t('admin_cat_actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
                      <p className="text-sm font-bold text-[var(--text-muted)] tracking-wider uppercase">{t('admin_loading_cats', 'Loading categories...')}</p>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No categories found.
                  </td>
                </tr>
              ) : categories.map((item, i) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#FFD700] flex items-center justify-center shrink-0 group-hover:border-[#FFD700]/30 transition-colors">
                        <Package size={20} strokeWidth={2} />
                      </div>
                      <p className="text-sm font-bold text-[var(--text)] uppercase tracking-tight">{item.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-sm font-mono font-bold text-[var(--text)] tracking-wider">
                        {item.commission_rate !== null ? (item.commission_rate * 100).toFixed(1) : 'Global'}
                        <span className="text-xs text-[var(--text-muted)] ml-1">%</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-[var(--border)] ${
                      item.is_active ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[var(--border)] text-[var(--text-muted)]'
                    }`}>
                      {item.is_active ? t('admin_cat_active', 'Active') : t('admin_cat_hidden', 'Hidden')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleActive(item.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-transparent shadow-sm ${item.is_active ? 'hover:bg-[#FFD700]/10 text-[#FFD700]' : 'hover:bg-emerald-500/10 text-emerald-500'}`}
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
                        className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors border border-transparent"
                      >
                        {t('admin_btn_edit', 'Edit')}
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(item.id)}
                        className="p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors border border-transparent"
                        title="Delete Category"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00]" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">{editingCategory ? t('admin_edit_cat', 'Edit Category') : t('admin_add_cat', 'Add Category')}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--border)] rounded-xl transition-colors">
                  <X size={20} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('admin_lbl_cat_name', 'Category Name')}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="e.g. Plumbing"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('admin_lbl_comm_rate', 'Commission Rate (0.0 - 1.0)')}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="1"
                    required
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="0.10"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-2 font-medium">{t('admin_lbl_comm_rate_desc', '0.10 means 10% commission on each order.')}</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] font-black uppercase tracking-wider hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors text-sm"
                  >
                    {t('admin_btn_cancel', 'Cancel')}
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-lg bg-[#FFD700] text-black font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#FFD700]/10 text-sm"
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
