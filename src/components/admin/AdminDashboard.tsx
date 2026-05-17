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
import AdminLayout from '../layout/AdminLayout';

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

  const cardClasses = "bg-[var(--card-bg)] border border-[var(--border)] shadow-sm rounded-3xl p-6";
  const textMutedClasses = "text-[var(--text-muted)]";
  const hoverClasses = "hover:bg-[var(--glass-bg)]";

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview stats={stats} isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'users':
        return <UsersView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'artisans':
        return <ArtisansView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'orders':
        return (
          <div className="space-y-8">
            <OrdersView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
            <div className="pt-8 border-t border-[var(--border)]">
              <h3 className="text-xl font-black mb-6 uppercase italic">Disputes & Support</h3>
              <DisputesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-8">
            <PaymentsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <WalletsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
              <CashCollectionsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
            </div>
            <CommissionRulesView settings={settings} updateSettings={updateSettings} isDarkMode={isDarkMode} textMutedClasses={textMutedClasses} onAction={onAction} />
          </div>
        );
      case 'withdrawals':
        return <WithdrawalsView onAction={onAction} />;
      case 'settings':
        return (
          <div className="space-y-12">
            <SettingsView settings={settings} updateSettings={updateSettings} isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <BrandingView settings={settings} updateSettings={updateSettings} isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
              <PaymentSettingsView onAction={onAction} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CategoriesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
              <CitiesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
            </div>
            <div className="pt-8 border-t border-[var(--border)]">
              <h3 className="text-xl font-black mb-6 uppercase italic">Advanced Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AdminLanguageManager />
                <AdminTranslationManager />
              </div>
              <div className="mt-8">
                <AnalyticsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} analyticsData={analyticsData} onAction={onAction} />
              </div>
              <div className="mt-8">
                <AiInsightsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />
              </div>
              <div className="mt-8">
                <SimulationDashboard />
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardOverview stats={stats} isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSwitchView={onSwitchView}
      onLogout={onLogout}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin" />
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      )}
    </AdminLayout>
  );
}
