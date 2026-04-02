import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Hammer, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreSection } from '../App';

export default function MaterialsMarketplacePage() {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (msg: string) => {
    showToast(msg);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[#FFD700] selection:text-black relative transition-colors duration-300">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[var(--card-bg)] border border-[var(--border)] px-6 py-4 rounded-2xl shadow-2xl"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="text-emerald-400" size={24} />
            ) : (
              <div className="w-2 h-2 rounded-full bg-blue-400" />
            )}
            <span className="font-medium text-[var(--text)]">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-[#FFD700] text-black rounded-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Hammer size={20} />
            </div>
            <span className="text-xl font-bold tracking-tighter">M3allem <span className="text-[#FFD700]">En Click</span></span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-muted)]">
            <Link to="/#features" className="hover:text-[var(--text)] transition-colors">Features</Link>
            <Link to="/#categories" className="hover:text-[var(--text)] transition-colors">Categories</Link>
            <Link to="/store" className="text-[#FFD700] transition-colors">Materials Store</Link>
          </div>

          <Link 
            to="/"
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="pt-20 max-w-7xl mx-auto">
        <StoreSection onAction={handleAction} />
      </div>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#FFD700] text-black rounded-lg flex items-center justify-center rotate-12">
                  <Hammer size={16} />
                </div>
                <span className="text-lg font-bold tracking-tighter">M3allem <span className="text-[#FFD700]">En Click</span></span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                The most trusted marketplace for professional artisans in Morocco. Quality work, guaranteed.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40">Platform</h5>
              <ul className="space-y-4 text-sm text-white/60">
                <li><Link to="/services" className="hover:text-[#FFD700] transition-colors">Find a Pro</Link></li>
                <li><Link to="/become-artisan" className="hover:text-[#FFD700] transition-colors">Become an Artisan</Link></li>
                <li><Link to="/how-it-works" className="hover:text-[#FFD700] transition-colors">Materials Store</Link></li>
                <li><Link to="/pricing" className="hover:text-[#FFD700] transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40">Company</h5>
              <ul className="space-y-4 text-sm text-white/60">
                <li><Link to="/about" className="hover:text-[#FFD700] transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-[#FFD700] transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-[#FFD700] transition-colors">Contact</Link></li>
                <li><Link to="/blog" className="hover:text-[#FFD700] transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40">Legal</h5>
              <ul className="space-y-4 text-sm text-white/60">
                <li><Link to="/privacy" className="hover:text-[#FFD700] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-[#FFD700] transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-[#FFD700] transition-colors">Cookie Policy</Link></li>
                <li><Link to="/?login=true" className="hover:text-[#FFD700] transition-colors">Admin Panel</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-white/5 text-white/20 text-xs font-bold uppercase tracking-widest">
            <p>© 2026 M3allem En Click. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
