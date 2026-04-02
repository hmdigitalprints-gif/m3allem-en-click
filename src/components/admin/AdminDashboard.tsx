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
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import NotificationBell from '../layout/NotificationBell';
import { aiService } from '../../services/aiService';

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
import AiInsightsView from './views/AiInsightsView';
import AnalyticsView from './views/AnalyticsView';
import AdminManagementView from './views/AdminManagementView';
import AuditLogsView from './views/AuditLogsView';
import CommissionRulesView from './views/CommissionRulesView';
import CategoriesView from './views/CategoriesView';
import { AdminLanguageManager } from './AdminLanguageManager';
import { AdminTranslationManager } from './AdminTranslationManager';

export default function AdminDashboard({ onSwitchView, onLogout, onAction, isDarkMode, toggleTheme }: { 
  onSwitchView: () => void, 
  onLogout: () => void,
  onAction?: (msg: string) => void,
  isDarkMode: boolean,
  toggleTheme: () => void
}) {
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
        const token = localStorage.getItem('m3allem_token');
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
        }

        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          setAnalyticsData(aData);
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
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} />, section: 'MAIN' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} />, section: 'MAIN' },
    { id: 'users', label: 'Users', icon: <Users size={18} />, section: 'MANAGEMENT' },
    { id: 'artisans', label: 'Artisans', icon: <Hammer size={18} />, section: 'MANAGEMENT' },
    { id: 'companies', label: 'Companies', icon: <Building2 size={18} />, section: 'MANAGEMENT' },
    { id: 'material-sellers', label: 'Sellers', icon: <ShoppingBag size={18} />, section: 'MANAGEMENT' },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} />, section: 'OPERATIONS' },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={18} />, section: 'FINANCE' },
    { id: 'health-wallet', label: 'Wallets', icon: <Wallet size={18} />, section: 'FINANCE' },
    { id: 'cash-collections', label: 'Cash Collections', icon: <Banknote size={18} />, section: 'FINANCE' },
    { id: 'disputes', label: 'Disputes', icon: <AlertTriangle size={18} />, section: 'OPERATIONS' },
    { id: 'categories', label: 'Categories', icon: <Tags size={18} />, section: 'SYSTEM' },
    { id: 'cities', label: 'Cities', icon: <MapPin size={18} />, section: 'SYSTEM' },
    { id: 'commission-rules', label: 'Commission', icon: <Percent size={18} />, section: 'SYSTEM' },
    { id: 'subscriptions', label: 'Subscriptions', icon: <Zap size={18} />, section: 'SYSTEM' },
    { id: 'ai-insights', label: 'AI Insights', icon: <BrainCircuit size={18} />, section: 'FEATURES' },
    { id: 'languages', label: 'Languages', icon: <Globe size={18} />, section: 'TOOLS' },
    { id: 'translations', label: 'Translations', icon: <Languages size={18} />, section: 'TOOLS' },
    { id: 'audit-logs', label: 'Audit Logs', icon: <ScrollText size={18} />, section: 'TOOLS' },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, section: 'TOOLS' },
  ];

  const sections = ['MAIN', 'MANAGEMENT', 'OPERATIONS', 'FINANCE', 'SYSTEM', 'FEATURES', 'TOOLS'];

  const themeClasses = "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]";
    
  const cardClasses = "bg-[var(--card-bg)] border border-[var(--border)] shadow-sm";

  const textMutedClasses = "text-[var(--text-muted)]";
  const hoverClasses = "hover:bg-[var(--glass-bg)]";

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
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
            <h2 className="text-2xl font-bold mb-2 capitalize text-[var(--text)]">{activeTab.replace('-', ' ')}</h2>
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl flex items-center justify-center font-black italic shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]">
              <Sparkles size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">admin contrôle</span>
          </div>
          <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <ChevronRight size={20} className="rotate-180" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-2 space-y-8">
          {sections.map(section => (
            <div key={section} className="space-y-2">
              <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] px-4">{section}</h3>
              <div className="space-y-1">
                {(navItems as any[]).filter(item => item.section === section).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`hynex-sidebar-item w-full ${activeTab === item.id ? 'active' : ''}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6">
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-6 relative overflow-hidden group mb-4">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[var(--accent)]/10 rounded-full blur-2xl group-hover:bg-[var(--accent)]/20 transition-all" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] mb-4">
                <Zap size={20} />
              </div>
              <h4 className="font-bold text-sm mb-1">Upgrade to Pro</h4>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mb-4">Get insights on coverage and eligibility with AI. Simplify decisions.</p>
              <div className="flex items-center gap-3">
                <button className="bg-[var(--accent)] text-[var(--accent-foreground)] text-[10px] font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all active:scale-95">Upgrade</button>
                <button className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Learn More</button>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-all active:scale-95 font-bold"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-[var(--border)] flex items-center justify-between px-10 shrink-0 bg-[var(--bg)]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-8 flex-1">
            {activeTab !== 'overview' && (
              <button 
                onClick={() => setActiveTab('overview')}
                className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-lg flex items-center justify-center"
                title="Back to Overview"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                <Activity size={18} />
                <span>Reports</span>
              </button>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Clock size={18} />
                <span>12:37 PM, Wed</span>
              </div>
            </div>
            <div className="relative flex items-center w-full max-w-xl group">
              <Search size={18} className="absolute left-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
              <input 
                type="text" 
                placeholder="Search for any health metrics..." 
                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] py-3 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:border-[var(--accent)]/50 focus:bg-[var(--glass-bg)]/80 transition-all text-[var(--text)]"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-all active:scale-95"
            >
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--border)]">
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=FFD700&color=000`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={onLogout}
                className="w-10 h-10 rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)] flex items-center justify-center hover:bg-[var(--destructive)] hover:text-white transition-all active:scale-95"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
