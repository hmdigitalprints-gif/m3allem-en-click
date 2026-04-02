import React, { useState, useEffect } from 'react';
import { Loader2, Save, Wallet, ShieldCheck, Settings, Globe } from 'lucide-react';
import { ViewProps } from '../types';

interface SettingsViewProps extends ViewProps {
  settings: any;
  updateSettings: (settings: any) => Promise<void>;
}

export default function SettingsView({ settings, updateSettings, isDarkMode, cardClasses, textMutedClasses, onAction }: SettingsViewProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    fetch('/api/languages')
      .then(res => res.json())
      .then(data => setLanguages(data.filter((l: any) => l.is_active)));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      alert('System settings updated successfully!');
    } catch (error) {
      alert('Failed to update system settings.');
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
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Configure platform parameters, commissions, and global rules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              handleSave();
              onAction?.('Saving system settings...');
            }}
            disabled={saving}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-6 rounded-2xl ${cardClasses}`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Wallet size={20} className="text-[var(--accent)]" /> General Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textMutedClasses}`}>Platform Name</label>
                  <input 
                    type="text" 
                    value={localSettings.platform_name || ''} 
                    onChange={(e) => handleChange('platform_name', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-[var(--accent)]/50 ${isDarkMode ? 'bg-[var(--glass-bg)] border-[var(--glass-border)]' : 'bg-white border-gray-300'} text-[var(--text)]`} 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textMutedClasses}`}>Contact Email</label>
                  <input 
                    type="email" 
                    value={localSettings.contact_email || ''} 
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-[var(--accent)]/50 ${isDarkMode ? 'bg-[var(--glass-bg)] border-[var(--glass-border)]' : 'bg-white border-gray-300'} text-[var(--text)]`} 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textMutedClasses}`}>Support Phone</label>
                  <input 
                    type="text" 
                    value={localSettings.support_phone || ''} 
                    onChange={(e) => handleChange('support_phone', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-[var(--accent)]/50 ${isDarkMode ? 'bg-[var(--glass-bg)] border-[var(--glass-border)]' : 'bg-white border-gray-300'} text-[var(--text)]`} 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textMutedClasses}`}>Default Language</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <select
                      value={localSettings.default_language || 'en'}
                      onChange={(e) => handleChange('default_language', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-[var(--accent)]/50 appearance-none ${isDarkMode ? 'bg-[var(--glass-bg)] border-[var(--glass-border)]' : 'bg-white border-gray-300'} text-[var(--text)]`}
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

          <div className={`p-6 rounded-2xl ${cardClasses}`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-[var(--accent)]" /> Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <div>
                  <p className="font-medium text-[var(--text)]">Require 2FA for Admins</p>
                  <p className={`text-xs ${textMutedClasses}`}>Mandatory two-factor authentication for all admin accounts.</p>
                </div>
                <div className="w-12 h-6 bg-[var(--accent)] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-[var(--accent-foreground)] rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <div>
                  <p className="font-medium text-[var(--text)]">Auto-suspend Suspicious Accounts</p>
                  <p className={`text-xs ${textMutedClasses}`}>Automatically freeze accounts flagged by fraud monitoring.</p>
                </div>
                <div className="w-12 h-6 bg-[var(--accent)] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-[var(--accent-foreground)] rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-2xl ${cardClasses}`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Settings size={20} className="text-[var(--accent)]" /> System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textMutedClasses}`}>Maintenance Mode</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-500">Disabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textMutedClasses}`}>API Status</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textMutedClasses}`}>Database Load</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">Normal (24%)</span>
              </div>
              <button 
                onClick={() => onAction?.('Enabling maintenance mode...')}
                className="w-full py-2 mt-4 border border-rose-500/30 text-rose-500 rounded-lg text-sm font-medium hover:bg-rose-500/10 transition-colors active:scale-95"
              >
                Enable Maintenance Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
