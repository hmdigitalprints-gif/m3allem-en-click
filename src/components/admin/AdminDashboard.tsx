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
import ParametersView from './views/ParametersView';
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

  const cardClasses = "bg-[var(--card-bg)] border border-[var(--border)] shadow-sm rounded-xl p-6";
  const textMutedClasses = "text-[var(--text-muted)]";
  const hoverClasses = "hover:bg-[var(--glass-bg)]";

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview stats={stats} isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'subscriptions':
        return <SubscriptionsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'users':
        return <UsersView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'artisans':
        return <ArtisansView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'companies':
        return <CompaniesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'sellers':
        return <MaterialSellersView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'orders':
        return <OrdersView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'disputes':
        return <DisputesView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'payments':
        return <PaymentsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'wallets':
        return <WalletsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'cash_collections':
        return <CashCollectionsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'withdrawals':
        return <WithdrawalsView onAction={onAction} />;
      case 'escrow':
        return <EscrowView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'fraud':
        return <FraudMonitoringView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'settings':
        return (
          <ParametersView 
            settings={settings} 
            updateSettings={updateSettings} 
            isDarkMode={isDarkMode} 
            cardClasses={cardClasses} 
            textMutedClasses={textMutedClasses} 
            hoverClasses={hoverClasses} 
            onAction={onAction}
            analyticsData={analyticsData}
          />
        );
      case 'team':
        return <AdminManagementView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
      case 'audit':
        return <AuditLogsView isDarkMode={isDarkMode} cardClasses={cardClasses} textMutedClasses={textMutedClasses} hoverClasses={hoverClasses} onAction={onAction} />;
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
