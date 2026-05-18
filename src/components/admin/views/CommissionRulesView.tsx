import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Save, Hammer, ShoppingBag } from 'lucide-react';
import { ViewProps } from '../types';

interface CommissionRulesViewProps extends ViewProps {
  settings: any;
  updateSettings: any;
}

export default function CommissionRulesView({ 
  settings, 
  updateSettings, 
  onAction 
}: CommissionRulesViewProps) {
  const { t } = useTranslation();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      onAction?.(t('admin_commission_rules_success', 'Commission rules updated successfully!'));
    } catch (error) {
      onAction?.(t('admin_commission_rules_error', 'Failed to update commission rules.'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    if (value === 'NaN') return;
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8 pt-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">{t('admin_commission_rules', 'Commission Rules')}</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">{t('admin_commission_desc', 'Manage platform fees and commission rates.')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#FFD700] text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#FFD700]/10"
          >
            {saving ? <Loader2 size={18} className="animate-spin" strokeWidth={2.5} /> : <Save size={18} strokeWidth={2.5} />}
            {saving ? t('admin_btn_saving', 'Saving...') : t('admin_btn_save_changes', 'Save Changes')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm group hover:border-[#FFD700]/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-bl-full pointer-events-none group-hover:opacity-60 transition-opacity" />
          <h3 className="text-lg font-black text-[var(--text)] tracking-tight mb-8 flex items-center gap-3 relative z-10 w-fit">
            <span className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#FFD700] group-hover:scale-110 group-hover:-rotate-6 transition-transform shadow-inner">
              <Hammer size={20} strokeWidth={2.5} />
            </span>
            {t('admin_artisan_services', 'Artisan Services')}
          </h3>
          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('admin_global_service_comm', 'Global Service Commission (%)')}</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_rate ? parseFloat(localSettings.commission_rate) * 100 : 0} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_rate', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-mono tracking-wider focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner font-bold" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('admin_featured_artisan_comm', 'Featured Artisan Commission (%)')}</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_featured ? parseFloat(localSettings.commission_featured) * 100 : 0} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_featured', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-mono tracking-wider focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner font-bold" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm group hover:border-[#FFD700]/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-bl-full pointer-events-none group-hover:opacity-60 transition-opacity" />
          <h3 className="text-lg font-black text-[var(--text)] tracking-tight mb-8 flex items-center gap-3 relative z-10 w-fit">
            <span className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#3B82F6] group-hover:scale-110 flex items-center justify-center transition-transform shadow-inner">
              <ShoppingBag size={20} strokeWidth={2.5} />
            </span>
            {t('admin_material_sales', 'Material Sales')}
          </h3>
          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('admin_global_material_comm', 'Global Material Commission (%)')}</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_material_rate ? parseFloat(localSettings.commission_material_rate) * 100 : 0} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_material_rate', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-mono tracking-wider focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner font-bold" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('admin_premium_seller_comm', 'Premium Seller Commission (%)')}</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_material_premium ? parseFloat(localSettings.commission_material_premium) * 100 : 0} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_material_premium', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-mono tracking-wider focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner font-bold" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
