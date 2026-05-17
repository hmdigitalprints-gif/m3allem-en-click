import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Upload, Plus, Loader2 } from 'lucide-react';

interface AddServiceModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  newService: { title: string; description: string; price: string; imageUrl: string; categoryId: string };
  setNewService: (service: any) => void;
  categories: any[];
  submitting: boolean;
}

export function AddServiceModal({
  show,
  onClose,
  onSubmit,
  newService,
  setNewService,
  categories,
  submitting
}: AddServiceModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] w-full max-w-3xl overflow-hidden shadow-2xl relative z-10 glass">
            <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--text)]/5">
              <h3 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('new_service_offering', 'Launch New Service Offering')}</h3>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-[var(--text)]/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="p-10 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 block">{t('service_title', 'Service Title')}</label>
                  <input required value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} type="text" className="w-full bg-[var(--text)]/5 border-2 border-[var(--border)] rounded-2xl p-4 text-[var(--text)] font-bold focus:border-[var(--accent)] outline-none transition-all" placeholder="e.g. Master Electrical Installation" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 block">{t('service_description', 'Professional Description')}</label>
                  <textarea required value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="w-full bg-[var(--text)]/5 border-2 border-[var(--border)] rounded-2xl p-4 text-[var(--text)] font-semibold focus:border-[var(--accent)] outline-none transition-all h-32" placeholder="Highlight your expertise and what's included in this service..." />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 block">{t('service_category', 'Category')}</label>
                  <select required value={newService.categoryId} onChange={e => setNewService({...newService, categoryId: e.target.value})} className="w-full bg-[var(--text)]/5 border-2 border-[var(--border)] rounded-2xl p-4 text-[var(--text)] font-bold focus:border-[var(--accent)] outline-none transition-all appearance-none cursor-pointer">
                    <option value="" className="bg-[var(--card-bg)]">{t('select_category', 'Select Category')}</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-[var(--card-bg)]">{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 block">{t('base_price', 'Base Price (MAD)')}</label>
                  <div className="relative">
                    <input required value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} type="number" step="0.01" className="w-full bg-[var(--text)]/5 border-2 border-[var(--border)] rounded-2xl p-4 pl-12 text-[var(--text)] font-black focus:border-[var(--accent)] outline-none transition-all" placeholder="0.00" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[var(--text-muted)]">MAD</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 block">{t('hero_image_url', 'Hero Image URL')}</label>
                  <div className="relative">
                    <input required value={newService.imageUrl} onChange={e => setNewService({...newService, imageUrl: e.target.value})} type="url" className="w-full bg-[var(--text)]/5 border-2 border-[var(--border)] rounded-2xl p-4 pl-12 text-[var(--text)] font-bold focus:border-[var(--accent)] outline-none transition-all" placeholder="https://images.unsplash.com/..." />
                    <Upload size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6 border-t border-[var(--border)]">
                <button type="button" onClick={onClose} className="flex-1 py-5 bg-[var(--text)]/5 hover:bg-[var(--text)]/10 text-[var(--text)] rounded-3xl font-black uppercase tracking-widest text-xs transition-all">{t('cancel', 'Cancel')}</button>
                <button type="submit" disabled={submitting} className="flex-[2] py-5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30 flex items-center justify-center gap-3">
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  {t('publish_service', 'Publish Service Offering')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
