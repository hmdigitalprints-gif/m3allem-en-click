import React, { useState, useEffect } from 'react';
import { Loader2, Save, Wallet, ShieldCheck, Settings, Globe, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { ViewProps } from '../types';

import { useAuth } from '../../../context/AuthContext';

interface SettingsViewProps extends ViewProps {
  settings: any;
  updateSettings: (settings: any) => Promise<void>;
}

export default function SettingsView({ settings, updateSettings, onAction }: SettingsViewProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<string[]>(() => {
    try {
      return settings.hero_slides ? JSON.parse(settings.hero_slides) : [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=2000&q=80"
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setLocalSettings(settings);
    if (settings.hero_slides) {
      try {
        setHeroSlides(JSON.parse(settings.hero_slides));
      } catch (e) {
        // ignore
      }
    }
  }, [settings]);

  useEffect(() => {
    fetch('/api/languages', { 
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setLanguages(data.filter((l: any) => l.is_active)));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...localSettings, hero_slides: JSON.stringify(heroSlides) };
      await updateSettings(payload);
      onAction?.('System settings updated successfully!');
    } catch (error) {
      onAction?.('Failed to update system settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    if (value === 'NaN') return;
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateSlide = (index: number, value: string) => {
    const newSlides = [...heroSlides];
    newSlides[index] = value;
    setHeroSlides(newSlides);
  };

  const addSlide = () => setHeroSlides([...heroSlides, '']);
  const removeSlide = (index: number) => {
    const newSlides = [...heroSlides];
    newSlides.splice(index, 1);
    setHeroSlides(newSlides);
  };

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">System Settings</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Configure platform parameters and global rules</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              handleSave();
              onAction?.('Saving system settings...');
            }}
            disabled={saving}
            className="bg-[#FFD700] text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#FFD700]/10"
          >
            {saving ? <Loader2 size={18} className="animate-spin" strokeWidth={2.5} /> : <Save size={18} strokeWidth={2.5} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* General Settings */}
          <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm relative overflow-hidden group hover:border-[#FFD700]/30 transition-colors">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-white/5 to-transparent rounded-bl-[100px] pointer-events-none group-hover:opacity-60 transition-opacity" />
            <h3 className="text-lg font-black text-[var(--text)] tracking-tight mb-8 flex items-center gap-3 relative z-10 w-fit">
              <span className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#FFD700] shadow-inner">
                <Settings size={20} className="animate-[spin_10s_linear_infinite]" strokeWidth={2.5} />
              </span>
              General Settings
            </h3>
            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Platform Name</label>
                  <input 
                    type="text" 
                    value={localSettings.platform_name || ''} 
                    onChange={(e) => handleChange('platform_name', e.target.value)}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Contact Email</label>
                  <input 
                    type="email" 
                    value={localSettings.contact_email || ''} 
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Support Phone</label>
                  <input 
                    type="text" 
                    value={localSettings.support_phone || ''} 
                    onChange={(e) => handleChange('support_phone', e.target.value)}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Default Language</label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={2.5} />
                    <select
                      value={localSettings.default_language || 'en'}
                      onChange={(e) => handleChange('default_language', e.target.value)}
                      className="w-full pl-12 pr-10 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-bold uppercase tracking-wider text-sm focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center' }}
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code} className="bg-[var(--card-surface)]">{lang.name} ({lang.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm group hover:border-[#FFD700]/30 transition-colors">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-[var(--text)] tracking-tight flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#FFD700] shadow-inner">
                  <ImageIcon size={20} strokeWidth={2.5} />
                </span>
                Landing Page Media
              </h3>
              <button 
                onClick={addSlide} 
                className="px-4 py-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-sm"
              >
                <Plus size={16} strokeWidth={2.5} /> Add Slide
              </button>
            </div>
            <div className="space-y-6">
              <p className="text-sm font-medium text-[var(--text-muted)] mb-6 bg-[var(--card-surface)] p-4 rounded-lg border border-[var(--border)] shadow-inner">Manage the array of images that appear in the hero slider on the front page.</p>
              {heroSlides.map((slide, index) => (
                <div key={index} className="flex gap-4 items-center bg-[var(--card-surface)] p-4 rounded-lg border border-[var(--border)] shadow-inner">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black border border-[var(--border)] shrink-0 flex items-center justify-center relative group/img shadow-sm">
                    {slide ? <img src={slide} alt={`Slide ${index+1}`} className="w-full h-full object-cover" /> : <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Empty</div>}
                    {slide && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <ImageIcon size={20} className="text-[var(--text)]" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Https:// image path..."
                      value={slide} 
                      onChange={(e) => updateSlide(index, e.target.value)}
                      className="w-full px-5 py-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] text-sm focus:border-[var(--border)] outline-none transition-colors shadow-inner font-medium" 
                    />
                  </div>
                  <button onClick={() => removeSlide(index)} className="p-3 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0 shadow-sm border border-transparent">
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm group hover:border-[#FFD700]/30 transition-colors">
            <h3 className="text-lg font-black text-[var(--text)] tracking-tight mb-8 flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#FFD700] shadow-inner">
                <Wallet size={20} strokeWidth={2.5} />
              </span>
              Landing Page Sections
            </h3>
            <div className="grid gap-4">
              {[
                { key: 'show_stats_section', label: 'Stats Section (Numbers & Metrics)' },
                { key: 'show_categories_section', label: 'Categories Section (Services)' },
                { key: 'show_features_section', label: 'Features Section (Bento Grid)' },
                { key: 'show_faq_section', label: 'FAQ Section (Questions)' },
              ].map(sec => (
                <div key={sec.key} className="flex items-center justify-between p-5 rounded-lg border border-[var(--border)] bg-[var(--card-surface)] hover:bg-white/[0.02] transition-colors cursor-pointer group/item shadow-inner" onClick={() => handleChange(sec.key, localSettings[sec.key] === '0' ? '1' : '0')}>
                  <div>
                    <p className="text-sm font-bold text-[var(--text)] group-hover/item:text-[#FFD700] transition-colors">{sec.label}</p>
                    <p className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Toggle visibility on the public landing page</p>
                  </div>
                  <button 
                    className={`shrink-0 w-12 h-6 rounded-full relative transition-colors shadow-inner ${(localSettings[sec.key] ?? '1') === '1' ? 'bg-[#FFD700]' : 'bg-[var(--border)]'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${(localSettings[sec.key] ?? '1') === '1' ? 'translate-x-7 bg-black' : 'translate-x-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm group hover:border-emerald-500/30 transition-colors">
            <h3 className="text-lg font-black text-[var(--text)] tracking-tight mb-8 flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-emerald-500 shadow-inner">
                <ShieldCheck size={20} strokeWidth={2.5} />
              </span>
              Security Settings
            </h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-5 rounded-lg border border-[var(--border)] bg-[var(--card-surface)] hover:bg-white/[0.02] transition-colors cursor-pointer group/item shadow-inner" onClick={() => handleChange('require_2fa', localSettings.require_2fa ? '0' : '1')}>
                <div>
                  <p className="text-sm font-bold text-[var(--text)] group-hover/item:text-emerald-500 transition-colors">Require 2FA for Admins</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Mandatory two-factor authentication for all admin accounts</p>
                </div>
                <button 
                  className={`shrink-0 w-12 h-6 rounded-full relative transition-colors shadow-inner ${localSettings.require_2fa === '1' ? 'bg-emerald-500' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${localSettings.require_2fa === '1' ? 'translate-x-7 bg-black' : 'translate-x-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-5 rounded-lg border border-[var(--border)] bg-[var(--card-surface)] hover:bg-white/[0.02] transition-colors cursor-pointer group/item shadow-inner" onClick={() => handleChange('auto_suspend', localSettings.auto_suspend === '1' ? '0' : '1')}>
                <div>
                  <p className="text-sm font-bold text-[var(--text)] group-hover/item:text-orange-500 transition-colors">Auto-suspend Suspicious Accounts</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Automatically freeze accounts flagged by fraud monitoring</p>
                </div>
                <button 
                  className={`shrink-0 w-12 h-6 rounded-full relative transition-colors shadow-inner ${localSettings.auto_suspend === '1' ? 'bg-orange-500' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${localSettings.auto_suspend === '1' ? 'translate-x-7 bg-black' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm sticky top-28 group hover:border-[#FFD700]/30 transition-colors">
            <h3 className="text-lg font-black text-[var(--text)] tracking-tight mb-8 flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#FFD700] shadow-inner">
                <Settings size={20} strokeWidth={2.5} />
              </span>
              System Status
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Maintenance Mode</span>
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${localSettings.maintenance_mode === '1' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-[var(--border)] text-[var(--text-muted)] border-[var(--border)]'}`}>
                  {localSettings.maintenance_mode === '1' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between p-5 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">API Status</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Operational
                </span>
              </div>
              <div className="flex items-center justify-between p-5 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Database Load</span>
                <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 shadow-sm">
                  Normal (24%)
                </span>
              </div>
              <button 
                onClick={() => {
                  const newState = localSettings.maintenance_mode === '1' ? '0' : '1';
                  handleChange('maintenance_mode', newState);
                  onAction?.(`${newState === '1' ? 'Enabling' : 'Disabling'} maintenance mode...`);
                }}
                className={`w-full py-4 mt-8 rounded-lg text-sm font-black uppercase tracking-wider transition-all active:scale-95 border shadow-sm ${
                  localSettings.maintenance_mode === '1' 
                    ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 bg-[var(--card-surface)]' 
                    : 'border-red-500/30 text-red-500 hover:bg-red-500/10 bg-[var(--card-surface)]'
                }`}
              >
                {localSettings.maintenance_mode === '1' ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
