import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  TrendingUp, 
  Wallet,
  Clock,
  Smartphone,
  Hammer
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

export default function BecomeArtisan() {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-full text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-8">
              <TrendingUp size={14} />
              Grow Your Business
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8 text-[var(--text)]">
              BECOME A <br />
              <span className="text-[var(--accent)]">PRO.</span>
            </h1>
            <p className="text-xl text-[var(--text-muted)] max-w-lg mb-12 leading-relaxed">
              Join Morocco's largest network of verified professionals. Get more clients, manage your bookings, and build your reputation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="bg-[var(--accent)] text-[var(--accent-foreground)] px-10 py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 hover:bg-[var(--accent)]/90 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/20"
              >
                Apply Now
                <ArrowRight size={20} />
              </button>
              <Link 
                to="/how-it-works"
                className="bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] px-10 py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-[var(--text)]"
              >
                How it Works
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-gradient-to-br from-white/10 to-transparent p-4 rounded-[48px] border border-[var(--border)] backdrop-blur-3xl">
              <img 
                src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800" 
                className="rounded-[40px] shadow-2xl"
                alt="Professional artisan"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Floating Stats */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-8 z-20 bg-[var(--card-bg)] p-6 rounded-3xl shadow-2xl text-[var(--text)] max-w-[200px] border border-[var(--border)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100/10 text-emerald-500 rounded-xl flex items-center justify-center">
                  <Wallet size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">Earnings</span>
              </div>
              <p className="text-sm font-bold leading-tight">Earn up to 15,000 MAD / month</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { 
              title: 'More Clients', 
              desc: 'Get access to thousands of homeowners looking for your specific skills.', 
              icon: <Users /> 
            },
            { 
              title: 'Flexible Schedule', 
              desc: 'You choose when and where you want to work. Be your own boss.', 
              icon: <Clock /> 
            },
            { 
              title: 'Secure Payments', 
              desc: 'No more chasing clients for money. Get paid instantly through the app.', 
              icon: <ShieldCheck /> 
            },
            { 
              title: 'Build Reputation', 
              desc: 'Collect verified reviews and become the top-rated pro in your city.', 
              icon: <Star /> 
            },
            { 
              title: 'Mobile Tools', 
              desc: 'Manage bookings, chat with clients, and track earnings on the go.', 
              icon: <Smartphone /> 
            },
            { 
              title: 'Professional Growth', 
              desc: 'Access training, certification programs, and exclusive tool discounts.', 
              icon: <TrendingUp /> 
            }
          ]?.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] p-10 rounded-[40px] hover:bg-[var(--bg)] transition-all shadow-xl"
            >
              <div className="w-16 h-16 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center mb-8">
                {React.cloneElement(benefit.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">{benefit.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {benefit.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Steps Section */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[64px] p-12 md:p-24 mb-32 shadow-2xl">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-center text-[var(--text)]">How to <span className="text-[var(--accent)]">Join.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-[var(--border)] z-0" />
            
            {[
              { step: '01', title: 'Create Profile', desc: 'Sign up and tell us about your skills, experience, and location.' },
              { step: '02', title: 'Get Verified', desc: 'Upload your ID and certifications. We verify every pro for trust.' },
              { step: '03', title: 'Start Earning', desc: 'Receive booking requests and start growing your business.' }
            ]?.map((item, i) => (
              <div key={i} className="relative z-10 text-center">
                <div className="w-24 h-24 bg-[var(--bg)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold text-[var(--accent)] shadow-xl">
                  {item.step}
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[var(--text)]">{item.title}</h4>
                <p className="text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-center text-[var(--text)]">Frequently Asked <span className="text-[var(--accent)]">Questions.</span></h2>
          <div className="space-y-6">
            {[
              { q: 'Is there a registration fee?', a: 'No, joining M3allem En Click is completely free. We only take a small commission on successful bookings.' },
              { q: 'How do I get paid?', a: 'Payments are processed through our secure system and transferred directly to your bank account or wallet.' },
              { q: 'What documents do I need?', a: 'You will need a valid National ID (CIN) and any professional certifications or licenses you have.' },
              { q: 'Can I work part-time?', a: 'Yes! You have full control over your availability. You can work as much or as little as you want.' }
            ]?.map((faq, i) => (
              <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] p-8 rounded-3xl shadow-xl">
                <h4 className="text-lg font-bold mb-3 text-[var(--text)]">{faq.q}</h4>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}
