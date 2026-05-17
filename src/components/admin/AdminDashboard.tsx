import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Hammer, ShoppingBag, ShoppingCart, CreditCard, 
  Wallet, ShieldCheck, AlertTriangle, Banknote, Star, MapPin, Tags, 
  Percent, Activity, BarChart3, Settings, UserCog, ScrollText, Bell, 
  Search, Menu, X, ChevronRight, ArrowUpRight, ArrowDownRight, 
  MoreVertical, Filter, Download, Plus, Save, Building2, BrainCircuit, 
  Sparkles, Wind, Bug, Lightbulb, Loader2, CheckCircle, AlertCircle, Zap,
  Clock, FileText, ArrowRight, Info, DollarSign, TrendingUp, ShieldAlert, LogOut, Globe, Languages, ArrowLeft, Home as HomeIcon,
  Lock
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
import { aiService } from '../../services/aiService';
import NavButton from '../common/NavButton';
import MobileNav from '../common/MobileNav';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';

// Import extracted views
import DashboardOverview from './views/DashboardOverview';
import WalletsView from './views/WalletsView';
import DisputesView from './views/DisputesView';
import CashCollectionsView from './views/CashCollectionsView';
import SubscriptionsView from './views/SubscriptionsView';
import CitiesView from './views/CitiesView';
import UsersView from './views/UsersView';
import CompaniesView from './views/CompaniesView';
import MaterialSellersView from './views/MaterialSellersView';
import OrdersView from './views/OrdersView';
import PaymentsView from './views/PaymentsView';
import EscrowView from './views/EscrowView';
import FraudMonitoringView from './views/FraudMonitoringView';
import ArtisansView from './views/ArtisansView';
import SettingsView from './views/SettingsView';
import PaymentSettingsView from './views/PaymentSettingsView';
import WithdrawalsView from './views/WithdrawalsView';
import AiInsightsView from './views/AiInsightsView';
import AnalyticsView from './views/AnalyticsView';
import AdminManagementView from './views/AdminManagementView';
import AuditLogsView from './views/AuditLogsView';
import CommissionRulesView from './views/CommissionRulesView';
import CategoriesView from './views/CategoriesView';
import BrandingView from './views/BrandingView';
import SimulationDashboard from '../debug/SimulationDashboard';
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
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const options = { 
          credentials: 'include' as const
        };
        const [statsRes, analyticsRes] = await Promise.all([
          fetch('/api/admin/stats', options),
          fetch('/api/admin/analytics', options)
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
  }, []);

  const navItems = [
    { id: 'home-redirect', label: t('nav_home', 'Home'), icon: <HomeIcon size={18} />, section: 'MAIN', onClick: onSwitchView },
    { id: 'overview', label: t('nav_overview', 'Overview'), icon: <LayoutDashboard size={18} />, section: 'MAIN' },
    { id: 'analytics', label: t('nav_analytics', 'Analytics'), icon: <BarChart3 size={18} />, section: 'MAIN' },
    { id: 'users', label: t('nav_users', 'Users'), icon: <Users size={18} />, section: 'MANAGEMENT' },
    { id: 'artisans', label: t('nav_artisans', 'Artisans'), icon: <Hammer size={18} />, section: 'MANAGEMENT' },
    { id: 'companies', label: t('nav_companies', 'Companies'), icon: <Building2 size={18} />, section: 'MANAGEMENT' },
    { id: 'material-sellers', label: t('nav_sellers', 'Sellers'), icon: <ShoppingBag size={18} />, section: 'MANAGEMENT' },
    { id: 'orders', label: t('nav_orders', 'Orders'), icon: <ShoppingCart size={18} />, section: 'OPERATIONS' },
    { id: 'payments', label: t('nav_payments', 'Payments'), icon: <CreditCard size={18} />, section: 'FINANCE' },
    { id: 'health-wallet', label: t('nav_wallets', 'Wallets'), icon: <Wallet size={18} />, section: 'FINANCE' },
    { id: 'withdrawals', label: t('nav_withdrawals', 'Withdrawals'), icon: <ArrowDownRight size={18} />, section: 'FINANCE' },
    { id: 'cash-collections', label: t('nav_cash_collections', 'Cash Collections'), icon: <Banknote size={18} />, section: 'FINANCE' },
    { id: 'payment-settings', label: t('nav_payment_settings', 'Payment Settings'), icon: <Lock size={18} />, section: 'FINANCE' },
    { id: 'disputes', label: t('nav_disputes', 'Disputes'), icon: <AlertTriangle size={18} />, section: 'OPERATIONS' },
    { id: 'categories', label: t('nav_categories', 'Categories'), icon: <Tags size={18} />, section: 'SYSTEM' },
    { id: 'cities', label: t('nav_cities', 'Cities'), icon: <MapPin size={18} />, section: 'SYSTEM' },
    { id: 'commission-rules', label: t('nav_commission', 'Commission'), icon: <Percent size={18} />, section: 'SYSTEM' },
    { id: 'subscriptions', label: t('nav_subscriptions', 'Subscriptions'), icon: <Zap size={18} />, section: 'SYSTEM' },
    { id: 'branding', label: 'Branding', icon: <Sparkles size={18} />, section: 'SYSTEM' },
    { id: 'ai-insights', label: t('nav_ai_insights', 'AI Insights'), icon: <BrainCircuit size={18} />, section: 'FEATURES' },
    { id: 'languages', label: t('nav_languages', 'Languages'), icon: <Globe size={18} />, section: 'TOOLS' },
    { id: 'translations', label: t('nav_translations', 'Translations'), icon: <Languages size={18} />, section: 'TOOLS' },
    { id: 'audit-logs', label: t('nav_audit_logs', 'Audit Logs'), icon: <ScrollText size={18} />, section: 'TOOLS' },
    { id: 'simulation', label: 'Simulation & QA', icon: <Bug size={18} />, section: 'TOOLS' },
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
      case 'payment-settings':
        return <PaymentSettingsView onAction={onAction} />;
      case 'withdrawals':
        return <WithdrawalsView onAction={onAction} />;
      case 'subscriptions':
        return <SubscriptionsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'branding':
        return <BrandingView settings={settings} updateSettings={updateSettings} isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'cities':
        return <CitiesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'analytics':
        return <AnalyticsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} analyticsData={analyticsData} onAction={onAction} />;
      case 'admin-management':
        return <AdminManagementView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'audit-logs':
        return <AuditLogsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'simulation':
        return <SimulationDashboard />;
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
    <div className="flex h-full overflow-hidden bg-[var(--bg)] text-[var(--text)] font-sans transition-colors duration-300">
      {/* Sidebar (Desktop & Mobile) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-[var(--border)] bg-[var(--card-bg)] transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between">
          <button 
            onClick={onSwitchView}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <div className="w-10 h-10 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl flex items-center justify-center font-black italic shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] group-hover:scale-110 transition-transform">
              <Sparkles size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter italic">{t('admin_control', 'Admin Control')}</span>
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-xl hover:bg-[var(--glass-bg)]"
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
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        setActiveTab(item.id);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`hynex-sidebar-item w-full ${activeTab === item.id ? 'active' : ''}`}
                  >
                    <span className={activeTab === item.id ? '' : 'text-[var(--text-muted)]'}>
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
            <span>{t('profile_btn_logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
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
                <span>{t('admin_reports', 'Reports')}</span>
              </button>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div className="flex items-center gap-3 tech-label">
                <Clock size={14} />
                <span className="tech-value">12:37 PM</span>
                <span className="opacity-50">/</span>
                <span>{t('admin_wed', 'Wed')}</span>
              </div>
            </div>
            <div className="relative hidden md:flex items-center w-full max-w-md group">
              <Search size={16} className="absolute left-3 text-[var(--text-muted)] group-focus-within:text-[var(--text)] transition-colors" />
              <input 
                type="text" 
                placeholder={t('admin_search', 'Search...')} 
                className="w-full bg-[var(--bg)] border border-[var(--border)] py-2 pl-9 pr-12 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border)] hover:bg-[var(--card-bg)] focus:bg-[var(--card-bg)] transition-all text-[var(--text)] shadow-sm"
              />
              <div className="absolute right-3 flex items-center gap-1">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded opacity-70">⌘</kbd>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded opacity-70">K</kbd>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={onSwitchView}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[var(--text-muted)] hover:bg-[var(--text)]/5 transition-all"
            >
              <HomeIcon size={18} />
              <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:block">{t('nav_home', 'Home')}</span>
            </button>
            <LanguageSwitcher />
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)] transition-all active:scale-95"
            >
              <Bell size={18} />
            </button>
            <div className="w-px h-6 bg-[var(--border)] hidden md:block"></div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-[var(--border)]">
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=FFD700&color=000`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={onLogout}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full text-[var(--text-muted)] flex items-center justify-center hover:bg-[var(--destructive)] hover:text-white transition-all active:scale-95"
                title={t('profile_btn_logout', 'Logout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-8 min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav 
        activeTab={activeTab}
        onTabChange={(id) => {
          if (id === 'home-redirect') {
            onSwitchView();
          } else {
            setActiveTab(id);
          }
        }}
        hiddenClassName=""
        navItems={[
          { id: 'home-redirect', label: 'Home', icon: <HomeIcon size={18} /> },
          { id: 'overview', label: 'Dash', icon: <LayoutDashboard size={18} /> },
          { id: 'users', label: 'Users', icon: <Users size={18} /> },
          { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
          { id: 'analytics', label: 'Data', icon: <BarChart3 size={18} /> }
        ]}
      />
    </div>
  );
}
