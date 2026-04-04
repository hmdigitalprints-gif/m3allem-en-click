import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import DemoModal from '../components/marketplace/DemoModal';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  ShieldCheck, 
  Zap, 
  Hammer,
  Droplets,
  Paintbrush,
  Sparkles,
  Wind,
  HardHat,
  ChevronRight,
  Play,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import HeroAnimation from '../components/marketplace/HeroAnimation';

interface LandingPageProps {
  onGetStarted: () => void;
  onAction?: (msg: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const categories = [
  { id: 'cat_1', name: 'Plumbing', icon: <Droplets />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Expert leak repairs and pipe installations.' },
  { id: 'cat_2', name: 'Electricity', icon: <Zap />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Safe electrical wiring and fixture repairs.' },
  { id: 'cat_3', name: 'Painting', icon: <Paintbrush />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Professional interior and exterior painting.' },
  { id: 'cat_4', name: 'Cleaning', icon: <Sparkles />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Deep cleaning for homes and offices.' },
  { id: 'cat_5', name: 'AC Repair', icon: <Wind />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Cooling system maintenance and repair.' },
  { id: 'cat_6', name: 'Construction', icon: <HardHat />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Quality building and renovation work.' },
];

const stats = [
  { label: 'Active Artisans', value: '2,500+' },
  { label: 'Services Completed', value: '45k+' },
  { label: 'Customer Rating', value: '4.9/5' },
  { label: 'Cities Covered', value: '12' },
];

export default function LandingPage({ onGetStarted, onAction, isDarkMode, toggleTheme }: LandingPageProps) {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-[var(--accent-foreground)] transition-colors duration-300">
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">

            <span className="text-2xl font-bold tracking-tighter">M3allem <span className="text-[var(--accent)]">En Click</span></span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-[var(--text-muted)]">
            <a href="#features" className="hover:text-[var(--text)] transition-colors">Features</a>
            <a href="#categories" className="hover:text-[var(--text)] transition-colors">Categories</a>
            <Link to="/store" className="hover:text-[var(--text)] transition-colors">Materials Store</Link>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-3 rounded-full glass hover:scale-110 transition-all active:scale-95 shadow-lg flex items-center justify-center"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-blue-500" size={20} />}
            </button>
            <button 
              onClick={() => {
                onAction?.('Opening Sign In...');
                onGetStarted();
              }}
              className="bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-sm flex items-center gap-2"
            >
              <Users size={16} />
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[var(--accent)]/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-[var(--accent)]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--accent)]/30 rounded-full text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-8 shadow-sm">
                <Sparkles size={14} />
                The Future of Home Services
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
                Find the <span className="text-[var(--accent)]">Perfect</span> Pro for Your Home.
              </h1>
              <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-lg mb-12 leading-relaxed">
                Connect with verified artisans in Morocco. From plumbing to painting, get quality work done with just a few clicks.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    onAction?.('Redirecting to registration...');
                    onGetStarted();
                  }}
                  className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-[var(--accent)]/20"
                >
                  Get Started Now
                  <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => {
                    onAction?.('Opening Demo Modal...');
                    setIsDemoOpen(true);
                  }}
                  className="bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <Play size={20} className="fill-[var(--text)]" />
                  Watch Demo
                </button>
              </div>

              <div className="mt-16 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4]?.map(i => (
                    <img 
                      key={i}
                      src={`https://picsum.photos/seed/user${i}/100/100`} 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-[var(--bg)] object-cover"
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[var(--accent)]">
                    {[1, 2, 3, 4, 5]?.map(i => <Star key={i} size={14} className="fill-current" />)}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">Trusted by 50,000+ homeowners</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Main Illustration Container */}
              <div className="relative z-10 p-1.5 rounded-[48px] bg-gradient-to-b from-white/20 via-white/5 to-transparent border border-white/10 backdrop-blur-3xl shadow-[0_0_100px_-20px_rgba(var(--accent-rgb),0.3)] overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--accent-rgb),0.15),transparent)] opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/10 via-transparent to-transparent opacity-30" />
                <div className="relative rounded-[42px] overflow-hidden border border-white/10 bg-[#050505] aspect-video flex items-center justify-center shadow-inner">
                  <HeroAnimation />
                </div>
                
                {/* Decorative UI Elements */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-[var(--accent)]/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[var(--accent)]/5 blur-[120px] rounded-full animate-pulse delay-1000" />
              </div>

              {/* Floating SaaS UI Cards */}
              <motion.div 
                animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-12 z-30 bg-white/10 backdrop-blur-2xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[220px]"
              >
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5">Booking Confirmed</p>
                  <p className="text-xs font-medium text-white/80">Artisan is on the way</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -left-12 z-30 bg-white/10 backdrop-blur-2xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[200px]"
              >
                <div className="w-10 h-10 bg-[var(--accent)]/20 text-[var(--accent)] rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-0.5">Verified Pro</p>
                  <p className="text-xs font-medium text-white/80">Identity & Skills Checked</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-1/2 -right-20 -translate-y-1/2 z-20 bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="w-32 h-2 bg-white/10 rounded-full" />
                <div className="w-20 h-2 bg-white/10 rounded-full" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-[var(--border)] bg-[var(--card-bg)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats?.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-[var(--text-muted)] font-medium uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-8">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4">Popular <span className="text-[var(--accent)]">Services</span></h2>
              <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-md">The most requested professional services at your fingertips.</p>
            </div>
            <Link 
              to="/services"
              onClick={() => onAction?.('Loading all categories...')}
              className="group flex items-center gap-2 text-[var(--accent)] font-bold text-lg"
            >
              View All Categories
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories?.map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                onClick={() => {
                  onAction?.(`Searching for ${cat.name} services...`);
                  navigate(`/find-pro?category=${encodeURIComponent(cat.name)}`);
                }}
                className="relative bg-[var(--card-bg)] border border-[var(--border)] p-10 rounded-[40px] hover:border-[var(--accent)]/30 transition-all cursor-pointer group overflow-hidden"
              >
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={`relative z-10 w-20 h-20 ${cat.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-[var(--accent)]/5`}>
                  {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 36, strokeWidth: 1.5 })}
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-3 tracking-tight">{cat.name}</h3>
                  <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-8">{cat.desc}</p>
                  
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-[var(--accent)] group-hover:translate-x-2 transition-transform">
                    Explore Services <ArrowRight size={18} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-[var(--card-bg)]/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: 'Verified Pros', desc: 'Every artisan undergoes a strict background check.', icon: <ShieldCheck /> },
                  { title: 'Secure Payments', desc: 'Your money is safe with our escrow payment system.', icon: <Zap /> },
                  { title: 'Instant Booking', desc: 'Book a service in seconds, not hours.', icon: <ArrowRight /> },
                  { title: 'Support 24/7', desc: 'Our team is here to help you anytime.', icon: <Users /> },
                ]?.map((feature, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.02 }}
                    className="p-8 bg-[var(--bg)] border border-[var(--border)] rounded-[32px] shadow-sm hover:shadow-xl hover:border-[var(--accent)]/20 transition-all"
                  >
                    <div className="w-14 h-14 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl flex items-center justify-center mb-6">
                      {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 28, strokeWidth: 1.5 })}
                    </div>
                    <h4 className="text-2xl font-bold mb-3 tracking-tight">{feature.title}</h4>
                    <p className="text-[var(--text-muted)] text-base leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-8">
                <Sparkles size={14} />
                Why M3allem En Click
              </div>
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.9]">
                The <span className="text-[var(--accent)]">Standard</span> for Home Services.
              </h2>
              <p className="text-xl md:text-2xl text-[var(--text-muted)] mb-12 leading-relaxed font-medium">
                We've built a platform that prioritizes trust, quality, and speed. No more searching through classifieds.
              </p>
              <div className="space-y-6">
                {['Transparent Pricing', 'Quality Guarantee', 'Easy Communication']?.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-xl font-bold">
                    <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle size={20} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 rounded-[48px] md:rounded-[64px] p-8 sm:p-12 md:p-24 text-[var(--accent-foreground)] text-center relative overflow-hidden shadow-2xl shadow-[var(--accent)]/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-8">Ready to get your work done?</h2>
              <p className="text-lg sm:text-xl font-medium mb-12 opacity-90">
                Join thousands of satisfied customers and professional artisans today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/services"
                  onClick={() => onAction?.('Finding a Pro...')}
                  className="bg-[var(--text)] text-[var(--bg)] px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-transform active:scale-95 shadow-2xl inline-flex items-center justify-center"
                >
                  Find a Pro
                </Link>
                <Link 
                  to="/become-artisan"
                  onClick={() => onAction?.('Redirecting to Artisan registration...')}
                  className="bg-white/20 backdrop-blur-md border border-white/10 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white/30 transition-all active:scale-95 inline-flex items-center justify-center text-white"
                >
                  Join as Artisan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-20 border-t border-[var(--border)] bg-[var(--card-bg)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16 md:mb-20">
            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-lg flex items-center justify-center rotate-12">
                  <Hammer size={16} />
                </div>
                <span className="text-2xl font-bold tracking-tighter">M3allem <span className="text-[var(--accent)]">En Click</span></span>
              </div>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                The most trusted marketplace for professional artisans in Morocco. Quality work, guaranteed.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40">Platform</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/services" className="hover:text-[var(--accent)] transition-colors">Find a Pro</Link></li>
                <li><Link to="/become-artisan" className="hover:text-[var(--accent)] transition-colors">Become an Artisan</Link></li>
                <li><Link to="/how-it-works" className="hover:text-[var(--accent)] transition-colors">Materials Store</Link></li>
                <li><Link to="/pricing" className="hover:text-[var(--accent)] transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40">Company</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/about" className="hover:text-[var(--accent)] transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-[var(--accent)] transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-[var(--accent)] transition-colors">Contact</Link></li>
                <li><Link to="/blog" className="hover:text-[var(--accent)] transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40">Legal</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/privacy" className="hover:text-[var(--accent)] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-[var(--accent)] transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-[var(--accent)] transition-colors">Cookie Policy</Link></li>
                <li><Link to="/?login=true" className="hover:text-[var(--accent)] transition-colors">Admin Panel</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-[var(--border)] text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
            <p>© 2026 M3allem En Click. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors">Twitter</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors">Instagram</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
