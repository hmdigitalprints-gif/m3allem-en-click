import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User, ShoppingBag, FileText, Calendar, Sparkles, Package, Hammer, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { icon: <Home size={24} />, label: 'Home', path: '/' },
    { icon: <Search size={24} />, label: 'Find', path: '/find-pro' },
    { icon: <ShoppingBag size={24} />, label: 'Store', path: '/store' },
    { icon: <MessageSquare size={24} />, label: 'Messages', path: '/messages' },
    { icon: <User size={24} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-[var(--accent-foreground)] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)] px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-lg flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <Hammer size={16} />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-[var(--text)]">M3allem <span className="text-[var(--accent)]">En Click</span></span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/auto-devis" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors" title="AI Auto Quote">
            <Sparkles size={20} />
          </Link>
          <Link to="/booking" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
            <Calendar size={20} />
          </Link>
          <Link to="/devis" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
            <FileText size={20} />
          </Link>
          <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center overflow-hidden shadow-inner">
            <User size={20} className="text-[var(--accent)]" />
          </div>
          <button 
            onClick={logout}
            className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--card-bg)]/90 backdrop-blur-xl border-t border-[var(--border)] px-6 py-4 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {navItems?.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[var(--accent)] scale-110' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
              >
                <div className={`${isActive ? 'text-[var(--accent)]' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isActive ? 'text-[var(--accent)]' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
