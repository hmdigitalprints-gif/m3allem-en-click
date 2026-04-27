import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Hammer, ShoppingBag, ShoppingCart, CreditCard, 
  Wallet, ShieldCheck, AlertTriangle, Banknote, Star, MapPin, Tags, 
  Percent, Activity, BarChart3, Settings, UserCog, ScrollText, Bell, 
  Search, Menu, X, ChevronRight, ArrowUpRight, ArrowDownRight, 
  MoreVertical, Filter, Download, Plus, Save, Building2, BrainCircuit, 
  Sparkles, Wind, Bug, Lightbulb, Loader2, CheckCircle, AlertCircle, Zap,
  Clock, FileText, ArrowRight, Info, DollarSign, TrendingUp, ShieldAlert, LogOut, Globe, Languages, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, 
  CartesianGrid, XAxis, YAxis, Tooltip 
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import NotificationBell from '../layout/NotificationBell';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';
import { aiService } from '../../services/aiService';

// Import extracted views
import { AdminManagementView, AiInsightsView, AnalyticsView, ArtisansView, AuditLogsView, CashCollectionsView, CategoriesView, CitiesView, CommissionRulesView, CompaniesView, DashboardOverview, DisputesView, EscrowView, FraudMonitoringView, MaterialSellersView, OrdersView, PaymentsView, SettingsView, SubscriptionsView, UsersView, WalletsView } from "./AdminViews";
import { AdminLanguageManager } from './AdminLanguageManager';
import { AdminTranslationManager } from './AdminTranslationManager';

export default function AdminDashboard({ onSwitchView, onLogout, onAction, isDarkMode, toggleTheme }: { 
  onSwitchView: () => void, 
  onLogout: () => void,
  onAction?: (msg: string) => void,
  isDarkMode: boolean,
  toggleTheme: () => void
}) {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin/analytics', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else {
          const errData = await statsRes.json().catch(() => ({}));
          console.error('Stats fetch failed:', statsRes.status, errData);
          onAction?.(`Stats error: ${errData.error || statsRes.statusText}`);
        }

        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          setAnalyticsData(aData);
        } else {
          const errData = await analyticsRes.json().catch(() => ({}));
          console.error('Analytics fetch failed:', analyticsRes.status, errData);
          onAction?.(`Analytics error: ${errData.error || analyticsRes.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const navItems = [
    { id: 'overview', label: t('nav_overview', 'Overview'), icon: <LayoutDashboard size={18} />, section: 'MAIN' },
    { id: 'analytics', label: t('nav_analytics', 'Analytics'), icon: <BarChart3 size={18} />, section: 'MAIN' },
    { id: 'users', label: t('nav_users', 'Users'), icon: <Users size={18} />, section: 'MANAGEMENT' },
    { id: 'artisans', label: t('nav_artisans', 'Artisans'), icon: <Hammer size={18} />, section: 'MANAGEMENT' },
    { id: 'companies', label: t('nav_companies', 'Companies'), icon: <Building2 size={18} />, section: 'MANAGEMENT' },
    { id: 'material-sellers', label: t('nav_sellers', 'Sellers'), icon: <ShoppingBag size={18} />, section: 'MANAGEMENT' },
    { id: 'orders', label: t('nav_orders', 'Orders'), icon: <ShoppingCart size={18} />, section: 'OPERATIONS' },
    { id: 'payments', label: t('nav_payments', 'Payments'), icon: <CreditCard size={18} />, section: 'FINANCE' },
    { id: 'health-wallet', label: t('nav_wallets', 'Wallets'), icon: <Wallet size={18} />, section: 'FINANCE' },
    { id: 'cash-collections', label: t('nav_cash_collections', 'Cash Collections'), icon: <Banknote size={18} />, section: 'FINANCE' },
    { id: 'disputes', label: t('nav_disputes', 'Disputes'), icon: <AlertTriangle size={18} />, section: 'OPERATIONS' },
    { id: 'categories', label: t('nav_categories', 'Categories'), icon: <Tags size={18} />, section: 'SYSTEM' },
    { id: 'cities', label: t('nav_cities', 'Cities'), icon: <MapPin size={18} />, section: 'SYSTEM' },
    { id: 'commission-rules', label: t('nav_commission', 'Commission'), icon: <Percent size={18} />, section: 'SYSTEM' },
    { id: 'subscriptions', label: t('nav_subscriptions', 'Subscriptions'), icon: <Zap size={18} />, section: 'SYSTEM' },
    { id: 'ai-insights', label: t('nav_ai_insights', 'AI Insights'), icon: <BrainCircuit size={18} />, section: 'FEATURES' },
    { id: 'languages', label: t('nav_languages', 'Languages'), icon: <Globe size={18} />, section: 'TOOLS' },
    { id: 'translations', label: t('nav_translations', 'Translations'), icon: <Languages size={18} />, section: 'TOOLS' },
    { id: 'audit-logs', label: t('nav_audit_logs', 'Audit Logs'), icon: <ScrollText size={18} />, section: 'TOOLS' },
    { id: 'settings', label: t('nav_settings', 'Settings'), icon: <Settings size={18} />, section: 'TOOLS' },
  ];

  const sections = ['MAIN', 'MANAGEMENT', 'OPERATIONS', 'FINANCE', 'SYSTEM', 'FEATURES', 'TOOLS'];

  const sectionTitles: Record<string, string> = {
    'MAIN': t('section_main', 'MAIN'),
    'MANAGEMENT': t('section_management', 'MANAGEMENT'),
    'OPERATIONS': t('section_operations', 'OPERATIONS'),
    'FINANCE': t('section_finance', 'FINANCE'),
    'SYSTEM': t('section_system', 'SYSTEM'),
    'FEATURES': t('section_features', 'FEATURES'),
    'TOOLS': t('section_tools', 'TOOLS')
  };

  const themeClasses = "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]";
    
  const cardClasses = "bg-[var(--card-bg)] border border-[var(--border)] shadow-sm";

  const textMutedClasses = "text-[var(--text-muted)]";
  const hoverClasses = "hover:bg-[var(--glass-bg)]";

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview stats={stats} isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'users':
        return <UsersView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'companies':
        return <CompaniesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'material-sellers':
        return <MaterialSellersView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'artisans':
        return <ArtisansView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'orders':
        return <OrdersView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'payments':
        return <PaymentsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'escrow':
        return <EscrowView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'fraud-monitoring':
        return <FraudMonitoringView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'health-wallet':
      case 'transactions':
        return <WalletsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'disputes':
        return <DisputesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'cash-collections':
        return <CashCollectionsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'subscriptions':
        return <SubscriptionsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'cities':
        return <CitiesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'analytics':
        return <AnalyticsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} analyticsData={analyticsData} onAction={onAction} />;
      case 'admin-management':
        return <AdminManagementView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'audit-logs':
        return <AuditLogsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'ai-insights':
        return <AiInsightsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'settings':
        return <SettingsView settings={settings} updateSettings={updateSettings} isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'commission-rules':
        return <CommissionRulesView settings={settings} updateSettings={updateSettings} isDarkMode={isDarkMode} textMutedClasses={textMutedClasses} onAction={onAction} />;
      case 'categories':
        return <CategoriesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'languages':
        return <AdminLanguageManager />;
      case 'translations':
        return <AdminTranslationManager />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-[var(--text-muted)]">
            <div className="w-20 h-20 rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border)] flex items-center justify-center mb-6">
              <Settings size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2 capitalize text-[var(--text)]">{t('nav_' + activeTab.replace('-', '_'), activeTab.replace('-', ' '))}</h2>
            <p>This module is currently being updated to the new Hynex design.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-[var(--border)] bg-[var(--card-bg)]">
        <div className="p-8 flex items-center justify-between">
          <button 
            onClick={onSwitchView}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <div className="w-10 h-10 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl flex items-center justify-center font-black italic shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] group-hover:scale-110 transition-transform">
              <Sparkles size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter italic">admin contrôle</span>
          </button>
          <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <ChevronRight size={20} className="rotate-180" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-2 space-y-8">
          {sections.map(section => (
            <div key={section} className="space-y-2">
              <h3 className="tech-label px-4 opacity-50">{sectionTitles[section]}</h3>
              <div className="space-y-1">
                {(navItems as any[]).filter(item => item.section === section).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`hynex-sidebar-item w-full font-black uppercase tracking-widest text-[10px] ${activeTab === item.id ? 'active' : ''}`}
                  >
                    <span className={activeTab === item.id ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-all active:scale-95 font-bold"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 flex flex-col border-r border-[var(--border)] bg-[var(--card-bg)] z-50 md:hidden"
            >
              <div className="p-6 flex items-center justify-between">
                <button 
                  onClick={onSwitchView}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                >
                  <div className="w-10 h-10 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl flex items-center justify-center font-black italic shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] group-hover:scale-110 transition-transform">
                    <Sparkles size={20} />
                  </div>
                  <span className="font-black text-xl tracking-tighter italic">admin</span>
                </button>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-xl hover:bg-[var(--glass-bg)]"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-2 space-y-8">
                {sections.map(section => (
                  <div key={section} className="space-y-2">
                    <h3 className="tech-label px-4 opacity-50">{sectionTitles[section]}</h3>
                    <div className="space-y-1">
                      {(navItems as any[]).filter(item => item.section === section).map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`hynex-sidebar-item w-full font-black uppercase tracking-widest text-[10px] ${activeTab === item.id ? 'active' : ''}`}
                        >
                          <span className={activeTab === item.id ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}>
                            {item.icon}
                          </span>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-all active:scale-95 font-bold"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden max-w-[100vw]">
        {/* Top Header */}
        <header className="h-16 md:h-20 border-b border-[var(--border)] flex items-center justify-between px-4 md:px-10 shrink-0 bg-[var(--bg)]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2 md:gap-8 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-[var(--text)] hover:bg-[var(--glass-bg)] transition-colors"
            >
              <Menu size={24} />
            </button>
            
            {activeTab !== 'overview' && (
              <button 
                onClick={() => setActiveTab('overview')}
                className="p-1.5 md:p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-lg flex items-center justify-center"
                title="Back to Overview"
              >
                <ArrowLeft size={18} className="md:w-5 md:h-5" />
              </button>
            )}
            <div className="hidden lg:flex items-center gap-6">
              <button className="flex items-center gap-2 tech-label hover:text-[var(--text)] transition-colors">
                <Activity size={14} />
                <span>Reports</span>
              </button>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div className="flex items-center gap-3 tech-label">
                <Clock size={14} />
                <span className="tech-value">12:37 PM</span>
                <span className="opacity-50">/</span>
                <span>Wed</span>
              </div>
            </div>
            <div className="relative hidden md:flex items-center w-full max-w-md group">
              <Search size={18} className="absolute left-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] py-2.5 md:py-3 pl-10 md:pl-12 pr-4 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-[var(--accent)]/50 focus:bg-[var(--glass-bg)]/80 transition-all text-[var(--text)]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            <LanguageSwitcher />
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-all active:scale-95"
            >
              <Bell size={18} className="md:w-5 md:h-5" />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden border border-[var(--border)]">
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=FFD700&color=000`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={onLogout}
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)] flex items-center justify-center hover:bg-[var(--destructive)] hover:text-white transition-all active:scale-95"
                title="Logout"
              >
                <LogOut size={16} className="md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {renderContent()}
          </div>
        </div>

        {/* Upgrade Modal */}
        <AnimatePresence>
          {showUpgradeModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowUpgradeModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={`relative w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl ${cardClasses}`}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                      <Zap size={24} />
                    </div>
                    <button onClick={() => setShowUpgradeModal(false)} className="p-2 hover:bg-[var(--glass-bg)] rounded-xl transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <h3 className="text-2xl tech-header mb-2">Upgrade to Pro</h3>
                  <p className="tech-label opacity-70 mb-8">Unlock the full power of Hynex Admin with advanced AI insights and priority features.</p>

                  <div className="space-y-4 mb-8">
                    {[
                      { icon: <BrainCircuit size={18} />, title: 'AI Market Analysis', desc: 'Predictive trends for your region' },
                      { icon: <Activity size={18} />, title: 'Advanced Analytics', desc: 'Deep dive into artisan performance' },
                      { icon: <ShieldCheck size={18} />, title: 'Priority Support', desc: '24/7 dedicated account manager' }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                        <div className="text-[var(--accent)]">{feature.icon}</div>
                        <div>
                          <h4 className="tech-header text-sm">{feature.title}</h4>
                          <p className="tech-label opacity-50">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        setIsUpgrading(true);
                        setTimeout(() => {
                          setIsUpgrading(false);
                          setShowUpgradeModal(false);
                          onAction?.('Successfully upgraded to Pro! Welcome to the future of admin.');
                        }, 2000);
                      }}
                      disabled={isUpgrading}
                      className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Confirm Upgrade - MAD 999/mo'
                      )}
                    </button>
                    <button 
                      onClick={() => setShowUpgradeModal(false)}
                      className="w-full py-4 rounded-2xl font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {showLearnMoreModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLearnMoreModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={`relative w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl ${cardClasses}`}
              >
                <div className="p-10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-3xl tech-header uppercase">PRO FEATURES</h3>
                    <button onClick={() => setShowLearnMoreModal(false)} className="p-2 hover:bg-[var(--glass-bg)] rounded-xl transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-10">
                    {[
                      { title: 'AI Insights', desc: 'Real-time market analysis and demand forecasting using Gemini Pro.' },
                      { title: 'Fraud Detection', desc: 'Advanced ML algorithms to detect and prevent suspicious activities.' },
                      { icon: <Zap />, title: 'Automation', desc: 'Automate commission payouts and artisan verifications.' },
                      { title: 'Custom Reports', desc: 'Build and export custom data visualizations for your stakeholders.' }
                    ].map((feature, i) => (
                      <div key={i} className="p-6 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] group hover:border-[var(--accent)]/50 transition-all">
                        <h4 className="tech-header text-lg mb-2 text-[var(--accent)]">{feature.title}</h4>
                        <p className="tech-label opacity-70 leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      setShowLearnMoreModal(false);
                      setShowUpgradeModal(true);
                    }}
                    className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-5 rounded-[24px] font-black uppercase tracking-[0.2em] italic hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-[var(--accent)]/20"
                  >
                    Get Started Now
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
