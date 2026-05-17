import React, { useState, useEffect } from 'react';
import { Loader2, Save, Wallet, ShieldCheck, Settings, Globe, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { ViewProps } from '../types';

import { useAuth } from '../../../context/AuthContext';

interface SettingsViewProps extends ViewProps {
  settings: any;
  updateSettings: (settings: any) => Promise<void>;
}

export default function SettingsView({ settings, updateSettings, isDarkMode, cardClasses, textMutedClasses, onAction }: SettingsViewProps) {
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tech-header text-2xl">System Settings</h1>
          <p className="tech-label opacity-70 mt-1">Configure platform parameters, commissions, and global rules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              handleSave();
              onAction?.('Saving system settings...');
            }}
            disabled={saving}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl tech-label hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="hynex-card p-8">
            <h3 className="tech-header text-lg mb-6 flex items-center gap-3"><Wallet size={20} className="text-[var(--accent)]" /> General Settings</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="tech-label opacity-70 mb-2 block">Platform Name</label>
                  <input 
                    type="text" 
                    value={localSettings.platform_name || ''} 
                    onChange={(e) => handleChange('platform_name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm font-medium focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-transparent outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="tech-label opacity-70 mb-2 block">Contact Email</label>
                  <input 
                    type="email" 
                    value={localSettings.contact_email || ''} 
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm font-medium focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-transparent outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="tech-label opacity-70 mb-2 block">Support Phone</label>
                  <input 
                    type="text" 
                    value={localSettings.support_phone || ''} 
                    onChange={(e) => handleChange('support_phone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm font-medium focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-transparent outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="tech-label opacity-70 mb-2 block">Default Language</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <select
                      value={localSettings.default_language || 'en'}
                      onChange={(e) => handleChange('default_language', e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm font-medium focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hynex-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="tech-header text-lg flex items-center gap-3">
                <ImageIcon size={20} className="text-[var(--accent)]" /> Landing Page Media
              </h3>
              <button onClick={addSlide} className="text-[var(--accent)] hover:opacity-80 flex items-center gap-2 text-sm tech-label">
                <Plus size={16} /> Add Slide
              </button>
            </div>
            <div className="space-y-4">
              <p className="tech-label opacity-70 text-sm mb-4">Manage the array of images that appear in the hero slider on the front page.</p>
              {heroSlides.map((slide, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--bg)] border border-[var(--border)] shrink-0">
                    {slide ? <img src={slide} alt={`Slide ${index+1}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs opacity-50">Empty</div>}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Image URL..."
                      value={slide} 
                      onChange={(e) => updateSlide(index, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm font-medium focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-transparent outline-none transition-all" 
                    />
                  </div>
                  <button onClick={() => removeSlide(index)} className="p-3 text-[var(--text-muted)] hover:text-[var(--destructive)] bg-[var(--bg)] border border-[var(--border)] rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="hynex-card p-8">
            <h3 className="tech-header text-lg mb-6 flex items-center gap-3"><Wallet size={20} className="text-[var(--accent)]" /> Landing Page Sections</h3>
            <div className="space-y-4">
              {[
                { key: 'show_stats_section', label: 'Stats Section (Numbers & Metrics)' },
                { key: 'show_categories_section', label: 'Categories Section (Services)' },
                { key: 'show_features_section', label: 'Features Section (Bento Grid)' },
                { key: 'show_faq_section', label: 'FAQ Section (Questions)' },
              ].map(sec => (
                <div key={sec.key} className="flex items-center justify-between p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
                  <div>
                    <p className="tech-header text-sm not-italic text-[var(--text)]">{sec.label}</p>
                    <p className="tech-label opacity-50">Toggle visibility on the public landing page.</p>
                  </div>
                  <button 
                    onClick={() => handleChange(sec.key, localSettings[sec.key] === '0' ? '1' : '0')}
                    className={`w-14 h-7 rounded-full relative transition-all ${(localSettings[sec.key] ?? '1') === '1' ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${(localSettings[sec.key] ?? '1') === '1' ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="hynex-card p-8">
            <h3 className="tech-header text-lg mb-6 flex items-center gap-3"><ShieldCheck size={20} className="text-[var(--accent)]" /> Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
                <div>
                  <p className="tech-header text-sm not-italic text-[var(--text)]">Require 2FA for Admins</p>
                  <p className="tech-label opacity-50">Mandatory two-factor authentication for all admin accounts.</p>
                </div>
                <button 
                  onClick={() => handleChange('require_2fa', localSettings.require_2fa ? '0' : '1')}
                  className={`w-14 h-7 rounded-full relative transition-all ${localSettings.require_2fa === '1' ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${localSettings.require_2fa === '1' ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
                <div>
                  <p className="tech-header text-sm not-italic text-[var(--text)]">Auto-suspend Suspicious Accounts</p>
                  <p className="tech-label opacity-50">Automatically freeze accounts flagged by fraud monitoring.</p>
                </div>
                <button 
                  onClick={() => handleChange('auto_suspend', localSettings.auto_suspend === '1' ? '0' : '1')}
                  className={`w-14 h-7 rounded-full relative transition-all ${localSettings.auto_suspend === '1' ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${localSettings.auto_suspend === '1' ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="hynex-card p-8">
            <h3 className="tech-header text-lg mb-6 flex items-center gap-3"><Settings size={20} className="text-[var(--accent)]" /> System Status</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="tech-label opacity-70">Maintenance Mode</span>
                <span className={`px-3 py-1 rounded-full tech-label ${localSettings.maintenance_mode === '1' ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}>
                  {localSettings.maintenance_mode === '1' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="tech-label opacity-70">API Status</span>
                <span className="px-3 py-1 rounded-full tech-label bg-[var(--success)]/10 text-[var(--success)]">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="tech-label opacity-70">Database Load</span>
                <span className="px-3 py-1 rounded-full tech-label bg-[var(--accent)]/10 text-[var(--accent)]">Normal (24%)</span>
              </div>
              <button 
                onClick={() => {
                  const newState = localSettings.maintenance_mode === '1' ? '0' : '1';
                  handleChange('maintenance_mode', newState);
                  onAction?.(`${newState === '1' ? 'Enabling' : 'Disabling'} maintenance mode...`);
                }}
                className={`w-full py-4 mt-4 border rounded-2xl tech-label transition-all active:scale-95 ${
                  localSettings.maintenance_mode === '1' 
                    ? 'border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success)]/10' 
                    : 'border-[var(--destructive)]/30 text-[var(--destructive)] hover:bg-[var(--destructive)]/10'
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
