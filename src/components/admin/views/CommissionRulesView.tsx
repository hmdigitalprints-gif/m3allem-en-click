import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Save, Hammer, ShoppingBag } from 'lucide-react';

interface CommissionRulesViewProps {
  settings: any;
  updateSettings: any;
  isDarkMode: boolean;
  textMutedClasses: string;
  onAction?: (msg: string) => void;
}

export default function CommissionRulesView({ 
  settings, 
  updateSettings, 
  isDarkMode, 
  textMutedClasses, 
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tech-header text-2xl">{t('admin_commission_rules', 'Commission Rules')}</h1>
          <p className="tech-label opacity-70 mt-1">{t('admin_commission_desc', 'Manage platform fees and commission rates.')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl tech-label hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? t('admin_btn_saving', 'Saving...') : t('admin_btn_save_changes', 'Save Changes')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="hynex-card p-8 group">
          <h3 className="tech-header text-lg mb-6 flex items-center gap-3 text-[var(--text)]">
            <Hammer size={20} className="text-[var(--accent)] group-hover:rotate-12 transition-transform" />
            {t('admin_artisan_services', 'Artisan Services')}
          </h3>
          <div className="space-y-6">
            <div>
              <label className="tech-label opacity-70 mb-2 block">{t('admin_global_service_comm', 'Global Service Commission (%)')}</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_rate ? parseFloat(localSettings.commission_rate) * 100 : 0} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_rate', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className="w-full rounded-2xl py-4 px-5 tech-value text-sm focus:outline-none text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)]/50 transition-all not-italic" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 tech-label opacity-50">%</span>
              </div>
            </div>
            <div>
              <label className="tech-label opacity-70 mb-2 block">{t('admin_featured_artisan_comm', 'Featured Artisan Commission (%)')}</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_featured ? parseFloat(localSettings.commission_featured) * 100 : 0} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_featured', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className="w-full rounded-2xl py-4 px-5 tech-value text-sm focus:outline-none text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)]/50 transition-all not-italic" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 tech-label opacity-50">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hynex-card p-8 group">
          <h3 className="tech-header text-lg mb-6 flex items-center gap-3 text-[var(--text)]">
            <ShoppingBag size={20} className="text-[var(--accent)] group-hover:scale-110 transition-transform" />
            {t('admin_material_sales', 'Material Sales')}
          </h3>
          <div className="space-y-6">
            <div>
              <label className="tech-label opacity-70 mb-2 block">{t('admin_global_material_comm', 'Global Material Commission (%)')}</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_material_rate ? parseFloat(localSettings.commission_material_rate) * 100 : 0} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_material_rate', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className="w-full rounded-2xl py-4 px-5 tech-value text-sm focus:outline-none text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)]/50 transition-all not-italic" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 tech-label opacity-50">%</span>
              </div>
            </div>
            <div>
              <label className="tech-label opacity-70 mb-2 block">{t('admin_premium_seller_comm', 'Premium Seller Commission (%)')}</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_material_premium ? parseFloat(localSettings.commission_material_premium) * 100 : 0} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_material_premium', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className="w-full rounded-2xl py-4 px-5 tech-value text-sm focus:outline-none text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)]/50 transition-all not-italic" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 tech-label opacity-50">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
