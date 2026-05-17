import React from 'react';
import AppLayout from './AppLayout';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  title: string;
  subtitle?: string;
  onSwitchView?: (view: any) => void;
}

export default function DashboardLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  title, 
  subtitle,
  onSwitchView
}: DashboardLayoutProps) {
  return (
    <AppLayout activeTab={activeTab} onTabChange={onTabChange} onSwitchView={onSwitchView}>
      <div className="flex flex-col gap-8">
        <header>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">{title}</h1>
            {subtitle && (
              <p className="text-[var(--text-muted)] font-medium mt-1">{subtitle}</p>
            )}
          </motion.div>
        </header>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-8">
            {children}
          </div>
          
          <aside className="hidden lg:flex flex-col gap-6">
            {/* Sidebar widgets would go here in the higher level component */}
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
