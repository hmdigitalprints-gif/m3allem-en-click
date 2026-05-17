import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, Search, Clock, ShoppingBag, 
  MessageSquare, User, LayoutDashboard 
} from 'lucide-react';
import AppNavbar from './AppNavbar';
import MobileNav from '../common/MobileNav';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSwitchView?: (view: any) => void;
}

export default function AppLayout({ children, activeTab = 'home', onTabChange, onSwitchView }: AppLayoutProps) {
  const { t } = useTranslation();

  const mobileNavItems = [
    { id: 'home', label: t('nav_home'), icon: <Home size={20} /> },
    { id: 'find', label: t('nav_find'), icon: <Search size={20} /> },
    { id: 'bookings', label: t('nav_bookings'), icon: <Clock size={20} /> },
    { id: 'store', label: t('nav_store_short'), icon: <ShoppingBag size={20} /> },
    { id: 'messages', label: t('nav_messages'), icon: <MessageSquare size={20} /> },
    { id: 'account', label: t('nav_profile'), icon: <User size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <AppNavbar 
        onSwitchView={onSwitchView} 
        activeTab={activeTab} 
        onTabChange={onTabChange as any} 
      />
      
      <main className="pt-16 md:pt-20 pb-28 md:pb-8">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          {children}
        </div>
      </main>

      <div className="lg:hidden">
        <MobileNav 
          activeTab={activeTab}
          onTabChange={(id) => onTabChange?.(id)}
          navItems={mobileNavItems}
        />
      </div>
    </div>
  );
}
