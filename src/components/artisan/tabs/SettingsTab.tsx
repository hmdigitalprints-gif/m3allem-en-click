import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  ChevronRight, 
  Shield, 
  MapPin, 
  User,
  ShieldCheck,
  BrainCircuit,
  Sparkles
} from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';

interface SettingsTabProps {
  onAction: (msg: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  artisanSettings: any;
  setArtisanSettings: React.Dispatch<React.SetStateAction<any>>;
  handleStatusToggle: () => void;
  handleSaveSettings: () => Promise<void>;
}

export function SettingsTab({
  onAction,
  isDarkMode,
  toggleTheme,
  artisanSettings,
  setArtisanSettings,
  handleStatusToggle,
  handleSaveSettings
}: SettingsTabProps) {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    onAction?.(`Language changed to ${newLang.toUpperCase()}`);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    onAction?.(`Theme changed to ${isDarkMode ? 'LIGHT' : 'DARK'}`);
  };

  const handleSaveArtisanSettings = async () => {
    onAction?.(t('saving_settings', 'Saving settings...'));
    try {
      await handleSaveSettings();
    } catch (err) {
      console.error(err);
      onAction?.('Failed to save settings.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-left">
        <h3 className="text-3xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('artisan_settings_title', 'Configuration')}</h3>
        <p className="text-[var(--text-muted)] mt-1 font-medium">{t('platform_settings_desc', 'Customize your experience and manage your professional presence.')}</p>
      </div>

      {/* Artisan Specific Settings */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-12 glass relative overflow-hidden text-left shadow-2xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tighter mb-1">{t('visibility_availability', 'Availability')}</h3>
            <p className="text-[var(--text-muted)] font-medium text-sm">{t('settings_desc', 'Control how and when clients can find you.')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${artisanSettings.isOnline ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              <div className={`w-2 h-2 rounded-full ${artisanSettings.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {artisanSettings.isOnline ? t('status_online') : t('status_offline')}
            </div>
            <button 
              onClick={handleStatusToggle}
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 shadow-inner ${artisanSettings.isOnline ? 'bg-green-500' : 'bg-[var(--text)]/10'}`}
            >
              <motion.div 
                layout
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
                animate={{ x: artisanSettings.isOnline ? 24 : 0 }}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">{t('years_exp', 'Years of Experience')}</label>
              <div className="relative group">
                <input 
                  type="number" 
                  value={artisanSettings.yearsExperience}
                  onChange={(e) => setArtisanSettings((prev: any) => ({ ...prev, yearsExperience: parseInt(e.target.value) }))}
                  className="w-full bg-[var(--text)]/5 border-2 border-transparent focus:border-[var(--accent)] rounded-[24px] px-6 py-4 font-bold outline-none transition-all group-hover:bg-[var(--text)]/10"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">{t('service_radius', 'Service Radius (km)')}</label>
              <div className="flex items-center gap-6 bg-[var(--text)]/5 p-4 rounded-[24px] border border-transparent hover:border-[var(--text)]/10 transition-all">
                <input 
                  type="range" 
                  min="1" 
                  max="100"
                  value={artisanSettings.serviceRadius}
                  onChange={(e) => setArtisanSettings((prev: any) => ({ ...prev, serviceRadius: parseInt(e.target.value) }))}
                  className="flex-1 accent-[var(--accent)] h-2 bg-[var(--text)]/10 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-black text-xl italic w-16 text-right tabular-nums">{artisanSettings.serviceRadius} km</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">{t('expertise', 'Core Expertise')}</label>
              <input 
                type="text" 
                value={artisanSettings.expertise}
                onChange={(e) => setArtisanSettings((prev: any) => ({ ...prev, expertise: e.target.value }))}
                placeholder="e.g. Master Plumber"
                className="w-full bg-[var(--text)]/5 border-2 border-transparent focus:border-[var(--accent)] rounded-[24px] px-6 py-4 font-bold outline-none transition-all hover:bg-[var(--text)]/10"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">{t('certifications', 'Certifications')}</label>
              <input 
                type="text" 
                value={artisanSettings.certifications}
                onChange={(e) => setArtisanSettings((prev: any) => ({ ...prev, certifications: e.target.value }))}
                placeholder="Comma separated"
                className="w-full bg-[var(--text)]/5 border-2 border-transparent focus:border-[var(--accent)] rounded-[24px] px-6 py-4 font-bold outline-none transition-all hover:bg-[var(--text)]/10"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-[var(--border)] flex justify-end">
          <button 
            onClick={handleSaveArtisanSettings}
            className="bg-[var(--text)] text-[var(--bg)] px-10 py-4 rounded-[24px] font-black uppercase italic tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            {t('save_settings', 'Sync Settings')}
          </button>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden glass text-left shadow-xl">
        <div className="p-8 border-b border-[var(--border)] bg-[var(--text)]/5 flex items-center justify-between">
          <h4 className="text-lg font-black text-[var(--text)] italic uppercase tracking-tight">{t('account_appearance', 'Account & Appearance')}</h4>
          <div className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest rounded-lg">Live updates</div>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {/* Theme Toggle */}
          <div className="p-8 flex items-center justify-between hover:bg-[var(--text)]/5 transition-all group">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div>
                <h5 className="font-bold text-[var(--text)] text-lg mb-1">{t('appearance_mode', 'Appearance Mode')}</h5>
                <p className="text-sm text-[var(--text-muted)] font-medium">{t('appearance_desc', 'Switch between light and dark visual themes.')}</p>
              </div>
            </div>
            <button 
              onClick={handleToggleTheme}
              className="w-20 h-10 bg-[var(--border)] rounded-full relative p-1 transition-all"
            >
              <div 
                className={`w-8 h-8 rounded-full shadow-lg transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-10 bg-[var(--accent)] text-white' : 'translate-x-0 bg-white text-yellow-500'}`}
              >
                {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              </div>
            </button>
          </div>

          {/* Language Toggle */}
          <div className="p-8 flex items-center justify-between hover:bg-[var(--text)]/5 transition-all group">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <div>
                <h5 className="font-bold text-[var(--text)] text-lg mb-1">{t('display_language', 'Display Language')}</h5>
                <p className="text-sm text-[var(--text-muted)] font-medium">{t('language_desc', 'Choose your preferred language for the interface.')}</p>
              </div>
            </div>
            <button 
              onClick={toggleLanguage}
              className="px-6 py-3 bg-[var(--text)]/5 text-[var(--text)] hover:bg-[var(--text)]/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-[var(--border)] flex items-center gap-2"
            >
              <Globe size={14} className="text-[var(--accent)]" />
              {i18n.language.toUpperCase()}
            </button>
          </div>

          {/* Notification Settings */}
          <div className="p-8 flex items-center justify-between hover:bg-[var(--text)]/5 transition-all group cursor-pointer" onClick={() => onAction?.('Opening notification settings...')}>
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Bell size={24} />
              </div>
              <div>
                <h5 className="font-bold text-[var(--text)] text-lg mb-1">{t('notification_prefs', 'Notifications')}</h5>
                <p className="text-sm text-[var(--text-muted)] font-medium font-medium">{t('notifications_desc', 'Manage how you receive alerts and project updates.')}</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-[var(--text-muted)] opacity-50 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden glass text-left">
        <div className="p-8 border-b border-[var(--border)] bg-[var(--text)]/5 flex items-center justify-between">
          <h4 className="text-lg font-black text-[var(--text)] italic uppercase tracking-tight">{t('privacy_security', 'Security & Controls')}</h4>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {[
            { icon: <Shield />, title: t('privacy_settings', 'Privacy & Security'), desc: t('privacy_desc', 'Update your password and 2FA settings.') },
            { icon: <MapPin />, title: t('service_area', 'Service Area'), desc: t('service_area_desc', 'Adjust your working radius and available cities.') },
            { icon: <User />, title: t('profile_visibility', 'Profile Visibility'), desc: t('visibility_desc', 'Manage how your profile appears to potential clients.') }
          ].map((item, idx) => (
            <div key={idx} className="p-8 flex items-center justify-between hover:bg-[var(--text)]/5 transition-all group cursor-pointer" onClick={() => onAction?.(`Opening ${item.title}...`)}>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--text)]/5 flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                  {React.cloneElement(item.icon as React.ReactElement, { size: 24 } as any)}
                </div>
                <div>
                  <h5 className="font-bold text-[var(--text)] text-lg mb-1">{item.title}</h5>
                  <p className="text-sm text-[var(--text-muted)] font-medium">{item.desc}</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-[var(--text-muted)] opacity-50 group-hover:translate-x-2 transition-transform" />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-10 flex flex-col items-center gap-6">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] opacity-40">Artisan Pro Version 2.4.1</p>
        <button 
          onClick={() => onAction?.('Platform policy document...')}
          className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--accent)] underline underline-offset-4 transition-colors"
        >
          {t('terms_privacy_notice', 'Terms of Service & Privacy Policy')}
        </button>
      </div>
    </div>
  );
}
