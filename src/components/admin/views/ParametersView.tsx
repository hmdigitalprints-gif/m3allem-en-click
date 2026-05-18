import React, { useState } from 'react';
import { 
  Settings2, Palette, CreditCard, ShieldCheck, 
  Map, Globe, Activity, FileCode2, ScrollText, GitMerge 
} from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

import SettingsView from './SettingsView';
import BrandingView from './BrandingView';
import PaymentSettingsView from './PaymentSettingsView';
import CommissionRulesView from './CommissionRulesView';
import CategoriesView from './CategoriesView';
import CitiesView from './CitiesView';
import { AdminLanguageManager } from '../AdminLanguageManager';
import { AdminTranslationManager } from '../AdminTranslationManager';
import AnalyticsView from './AnalyticsView';
import AiInsightsView from './AiInsightsView';
import SimulationDashboard from '../../debug/SimulationDashboard';

interface ParametersViewProps extends ViewProps {
  settings: any;
  updateSettings: (settings: any) => Promise<void>;
  analyticsData?: any;
  isDarkMode?: boolean;
  cardClasses?: string;
  textMutedClasses?: string;
  hoverClasses?: string;
}

export default function ParametersView({ 
  settings, 
  updateSettings, 
  isDarkMode, 
  cardClasses, 
  textMutedClasses, 
  hoverClasses, 
  onAction,
  analyticsData
}: ParametersViewProps) {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General System', icon: Settings2 },
    { id: 'branding', label: 'Branding & Logo', icon: Palette },
    { id: 'payments', label: 'Payment Integration', icon: CreditCard },
    { id: 'rules', label: 'Commission Rules', icon: GitMerge },
    { id: 'regional', label: 'Regional Config', icon: Map },
    { id: 'localization', label: 'Localization', icon: Globe },
    { id: 'classification', label: 'Classifications', icon: ScrollText },
    { id: 'analytics', label: 'AI & Analytics', icon: Activity },
    { id: 'dev', label: 'Developer & Debug', icon: FileCode2 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      {/* Sub-navigation Sidebar */}
      <div className="w-full lg:w-64 shrink-0">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 shadow-sm sticky top-28 hidden lg:block">
          <h2 className="text-xl font-black text-[var(--text)] px-4 py-2 mb-2 tracking-tight uppercase">Parameters</h2>
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#FFD700] text-black shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'
                }`}
              >
                <tab.icon size={18} strokeWidth={2.5} />
                <span className="uppercase tracking-wider text-xs">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Horizontal Scroll Nav */}
        <div className="lg:hidden w-full overflow-x-auto pb-4 no-scrollbar">
          <div className="flex gap-2 min-w-max px-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#FFD700] text-black shadow-sm' 
                    : 'text-[var(--text-muted)] bg-[var(--card-bg)] border border-[var(--border)] hover:text-[var(--text)]'
                }`}
              >
                <tab.icon size={16} strokeWidth={2.5} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden min-w-0 pt-4 lg:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeTab === 'general' && (
              <SettingsView settings={settings} updateSettings={updateSettings} onAction={onAction} />
            )}
            
            {activeTab === 'branding' && (
              <BrandingView settings={settings} updateSettings={updateSettings} onAction={onAction} />
            )}
            
            {activeTab === 'payments' && (
              <PaymentSettingsView onAction={onAction} />
            )}

            {activeTab === 'rules' && (
              <CommissionRulesView settings={settings} updateSettings={updateSettings} onAction={onAction} />
            )}

            {activeTab === 'regional' && (
              <div className="space-y-4">
                <CitiesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
              </div>
            )}

            {activeTab === 'localization' && (
              <div className="space-y-8">
                <AdminLanguageManager />
                <AdminTranslationManager />
              </div>
            )}

            {activeTab === 'classification' && (
              <CategoriesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <AnalyticsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} analyticsData={analyticsData} onAction={onAction} />
                <AiInsightsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
              </div>
            )}

            {activeTab === 'dev' && (
              <div className="space-y-4">
                <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm mb-8">
                  <h2 className="text-xl font-black text-[var(--text)] mb-4 uppercase tracking-tight">System Simulation</h2>
                  <p className="text-sm font-semibold text-[var(--text-muted)] mb-6 uppercase tracking-wider">Generate mock data and simulate behavior</p>
                  <SimulationDashboard />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
