import React, { useState, useEffect } from 'react';
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
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      alert('Commission rules updated successfully!');
    } catch (error) {
      alert('Failed to update commission rules.');
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
          <h1 className="text-2xl font-bold tracking-tight">Commission Rules</h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Manage platform fees and commission rates.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl border transition-all hover:shadow-lg ${isDarkMode ? 'bg-[var(--glass-bg)] border-[var(--glass-border)]' : 'bg-white border-gray-200'}`}>
          <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--text)]">
            <Hammer size={18} className="text-[var(--accent)]" />
            Artisan Services
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Global Service Commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_rate || '10'} 
                  onChange={(e) => {
                    handleChange('commission_rate', e.target.value);
                  }}
                  className={`w-full rounded-lg py-2 px-3 text-sm focus:outline-none text-[var(--text)] ${isDarkMode ? 'bg-[var(--bg)] border border-[var(--glass-border)] focus:border-[var(--accent)]/50' : 'bg-gray-50 border border-gray-300 focus:border-[var(--accent)]'}`} 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Featured Artisan Commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={isNaN(parseFloat(localSettings.commission_featured || '0.15')) ? 15 : parseFloat(localSettings.commission_featured || '0.15') * 100} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_featured', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className={`w-full rounded-lg py-2 px-3 text-sm focus:outline-none text-[var(--text)] ${isDarkMode ? 'bg-[var(--bg)] border border-[var(--glass-border)] focus:border-[var(--accent)]/50' : 'bg-gray-50 border border-gray-300 focus:border-[var(--accent)]'}`} 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border transition-all hover:shadow-lg ${isDarkMode ? 'bg-[var(--glass-bg)] border-[var(--glass-border)]' : 'bg-white border-gray-200'}`}>
          <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--text)]">
            <ShoppingBag size={18} className="text-[var(--accent)]" />
            Material Sales
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Global Material Commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.commission_material_rate || '5'} 
                  onChange={(e) => {
                    handleChange('commission_material_rate', e.target.value);
                  }}
                  className={`w-full rounded-lg py-2 px-3 text-sm focus:outline-none text-[var(--text)] ${isDarkMode ? 'bg-[var(--bg)] border border-[var(--glass-border)] focus:border-[var(--accent)]/50' : 'bg-gray-50 border border-gray-300 focus:border-[var(--accent)]'}`} 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Premium Seller Commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={isNaN(parseFloat(localSettings.commission_material_premium || '0.08')) ? 8 : parseFloat(localSettings.commission_material_premium || '0.08') * 100} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleChange('commission_material_premium', isNaN(val) ? '0' : (val / 100).toString());
                  }}
                  className={`w-full rounded-lg py-2 px-3 text-sm focus:outline-none text-[var(--text)] ${isDarkMode ? 'bg-[var(--bg)] border border-[var(--glass-border)] focus:border-[var(--accent)]/50' : 'bg-gray-50 border border-gray-300 focus:border-[var(--accent)]'}`} 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
