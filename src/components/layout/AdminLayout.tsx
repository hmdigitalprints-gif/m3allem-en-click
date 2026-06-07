import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Hammer,
  ShoppingCart,
  CreditCard,
  ArrowDownRight,
  Settings,
  Menu,
  X,
  LogOut,
  Sparkles,
  Bell,
  Search,
  MessageSquare,
  ChevronDown,
  Activity,
  ShieldCheck,
  Box,
  LogIn,
  ChevronRight,
  Sun,
  Moon,
  Home,
  Building2,
  ShoppingBag,
  ShieldAlert,
  UserCog,
  ScrollText,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onSwitchView: () => void;
  onLogout: () => void;
}

export default function AdminLayout({
  children,
  activeTab,
  onTabChange,
  onSwitchView,
  onLogout,
}: AdminLayoutProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Grouped Navigation
  const navigationGroups = [
    {
      label: "Overview",
      items: [
        { id: "overview", label: t("nav_overview"), icon: <LayoutDashboard size={18} /> },
        { id: "geographic", label: "Geo-Analytics Map", icon: <Globe size={18} /> },
        { id: "subscriptions", label: "Subscriptions", icon: <ScrollText size={18} /> },
      ],
    },
    {
      label: "Marketplace",
      items: [
        { id: "users", label: t("nav_users"), icon: <Users size={18} /> },
        { id: "artisans", label: t("nav_artisans"), icon: <Hammer size={18} /> },
        { id: "companies", label: "Companies", icon: <Building2 size={18} /> },
        { id: "sellers", label: "Material Sellers", icon: <ShoppingBag size={18} /> },
        { id: "orders", label: t("nav_orders"), icon: <ShoppingCart size={18} /> },
        { id: "disputes", label: "Disputes", icon: <ShieldCheck size={18} /> },
      ],
    },
    {
      label: "Finance",
      items: [
        { id: "payments", label: t("nav_payments"), icon: <CreditCard size={18} /> },
        { id: "wallets", label: "Wallets", icon: <CreditCard size={18} /> },
        { id: "withdrawals", label: t("nav_withdrawals"), icon: <ArrowDownRight size={18} /> },
        { id: "cash_collections", label: "Cash Collections", icon: <Activity size={18} /> },
        { id: "escrow", label: "Escrow Rules", icon: <ShieldCheck size={18} /> },
      ],
    },
    {
      label: "Moderation & Safety",
      items: [
        { id: "reports", label: "User Reports", icon: <ShieldAlert size={18} /> },
        { id: "moderation", label: "Content Queue", icon: <Box size={18} /> },
        { id: "fraud", label: "Fraud Monitoring", icon: <ShieldAlert size={18} /> },
        { id: "kyc_review", label: "KYC Verification", icon: <ShieldCheck size={18} /> },
      ],
    },
    {
      label: "System",
      items: [
        { id: "settings", label: t("nav_settings"), icon: <Settings size={18} /> },
        { id: "team", label: "Admin Team", icon: <UserCog size={18} /> },
        { id: "audit", label: "Audit Logs", icon: <ScrollText size={18} /> },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text-muted)] font-sans selection:bg-[#FFD700] selection:text-black">
      {/* Sidebar background gradient element */}
      <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-b from-[#FFD700]/5 to-transparent pointer-events-none z-0" />

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-[var(--card-bg)] border-r border-[var(--border)] shadow-2xl
        transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Logo Area */}
        <div className="h-20 px-6 flex items-center justify-between relative z-10 border-b border-[var(--border)]">
          <button
            onClick={onSwitchView}
            className="flex items-center gap-3 text-[var(--text)] group outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center shadow-lg shadow-[#FFD700]/20 group-hover:shadow-[#FFD700]/40 transition-all duration-300">
              <Sparkles size={18} className="text-black" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                M3allem
              </span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
                Workspace
              </span>
            </div>
          </button>
          <button
            className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar relative z-10">
          <div className="space-y-8">
            {navigationGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-2">
                <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 ml-1">
                  {group.label}
                </h4>
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                          ${
                            isActive
                              ? "bg-[var(--border)] text-[var(--text)] shadow-sm"
                              : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            flex items-center justify-center transition-colors
                            ${isActive ? "text-[#FFD700]" : "text-[var(--text-muted)] group-hover:text-[var(--text-muted)]"}
                          `}
                          >
                            {item.icon}
                          </div>
                          {item.label}
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.8)]"
                          />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Nav */}
        <div className="p-4 border-t border-[var(--border)] relative z-10 bg-[var(--card-bg)]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-[var(--text)] hover:bg-red-500/20 transition-all group"
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-semibold">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Abstract background elements in main content */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Header */}
        <header className="h-20 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text)] p-2 border border-[var(--border)] rounded-lg hover:bg-[var(--border)] transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--border)] rounded-full px-4 py-2.5 w-64 lg:w-96 transition-all focus-within:border-[#FFD700]/30 focus-within:ring-1 focus-within:ring-[#FFD700]/30 shadow-inner">
              <Search size={18} className="text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent border-none outline-none text-sm text-[var(--text)] ml-3 w-full placeholder-gray-500 focus:ring-0"
              />
              <div className="flex items-center justify-center p-1 bg-[var(--border)] rounded text-[10px] text-[var(--text-muted)] font-medium">
                ⌘K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Quick Actions */}
            <div className="flex items-center gap-2 border-r border-[var(--border)] pr-4 md:pr-6">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all outline-none"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("notification-toast");
                  if (el) {
                    el.style.display = "block";
                    setTimeout(() => (el.style.display = "none"), 2000);
                  }
                }}
                className="p-2.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all relative group outline-none"
                title="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FFD700] rounded-full border-2 border-[var(--bg)] shadow-[0_0_8px_rgba(255,215,0,0.6)]"></span>
              </button>
              <button
                className="hidden sm:block p-2.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all outline-none"
                onClick={onSwitchView}
                title="Switch to Customer View"
              >
                <Home size={20} />
              </button>
            </div>

            {/* Profile */}
            <div
              onClick={() => onLogout()}
              className="flex items-center gap-3 cursor-pointer group hover:bg-[var(--border)] rounded-full pr-4 pl-1 py-1 transition-colors"
              title="Profile / Log Out"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--border)] group-hover:border-[#FFD700]/50 transition-colors bg-[var(--card-bg)] flex items-center justify-center shadow-lg">
                {(user as any)?.profileImage || (user as any)?.avatar ? (
                  <img
                    src={(user as any)?.profileImage || (user as any)?.avatar}
                    alt={user?.name || "Admin"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin")}&background=FFD700&color=000&bold=true`}
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="hidden sm:flex flex-col">
                <p className="text-sm font-semibold text-[var(--text)] group-hover:text-[#FFD700] transition-colors">
                  {user?.name || "System Admin"}
                </p>
                <p className="text-[11px] text-[#FFD700] font-medium tracking-wide">
                  Superuser
                </p>
              </div>
              <ChevronDown
                size={14}
                className="text-[var(--text-muted)] hidden sm:block ml-1 group-hover:text-[var(--text-muted)]"
              />
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10 scroll-smooth">
          <div className="max-w-[1600px] mx-auto min-h-full flex flex-col">
            {/* Page Header spacing */}
            <div className="mb-8 hidden lg:flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-[var(--text)] capitalize tracking-tight flex items-center gap-3">
                  {activeTab === "overview" ? "Dashboard" : activeTab}
                  {activeTab === "overview" && (
                    <span className="px-2 py-0.5 rounded-md bg-[var(--border)] text-xs font-semibold text-[var(--text-muted)] border border-[var(--border)] uppercase tracking-wider backdrop-blur-sm">
                      Live
                    </span>
                  )}
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Manage your platform and analyze performance metrics
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-[var(--border)] border border-[var(--border)] text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                  <Activity size={16} className="text-[#22C55E]" /> Server
                  Optimal
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="flex-1 pb-12">{children}</div>
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-[var(--bg)]/80 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <div
        id="notification-toast"
        className="fixed bottom-4 right-4 bg-[var(--card-bg)] text-[var(--text)] border border-[var(--border)] shadow-xl px-6 py-4 rounded-xl font-bold hidden z-[100] animate-in slide-in-from-bottom"
      >
        No pending notifications.
      </div>

      {/* Global Dashboard Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Premium Light Layout Overrides */
        :root:not(.dark) {
          --bg: #F8FAFC;
          --card-bg: #FFFFFF;
          --card-surface: #F1F5F9;
          --border: rgba(0, 0, 0, 0.08);
          --accent: #FFD700;
          --text: #0F172A;
          --text-muted: #64748B;
          --glass-bg: rgba(255,255,255,0.7);
        }

        /* Premium Dark Layout Overrides */
        .dark {
          --bg: #000000;
          --card-bg: #0A0A0A;
          --card-surface: #121212;
          --border: rgba(255, 255, 255, 0.08);
          --accent: #FFD700;
          --text: #F3F4F6;
          --text-muted: #8E9299;
          --glass-bg: rgba(255,255,255,0.03);
        }
        
        body {
          background-color: var(--bg);
          color: var(--text);
        }

        /* Dashboard Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.5);
        }
      `,
        }}
      />
    </div>
  );
}
