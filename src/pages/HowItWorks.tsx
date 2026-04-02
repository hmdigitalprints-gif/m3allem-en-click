import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  ShieldCheck, 
  Wallet, 
  Star, 
  ArrowRight, 
  CheckCircle,
  Smartphone,
  MessageSquare,
  Clock
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

export default function HowItWorks() {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)]"
          >
            HOW IT <span className="text-[var(--accent)]">WORKS.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            M3allem En Click makes it easy to find, book, and pay for professional home services in Morocco. Here's how our platform works for you.
          </motion.p>
        </div>

        {/* For Homeowners Section */}
        <div className="mb-40">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-center text-[var(--text)]">For <span className="text-[var(--accent)]">Homeowners.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-[var(--border)] z-0" />
            
            {[
              { 
                step: '01', 
                title: 'Search & Filter', 
                desc: 'Browse through verified artisans by category, location, and rating.', 
                icon: <Search /> 
              },
              { 
                step: '02', 
                title: 'Book & Schedule', 
                desc: 'Select a professional and book a time that works for you.', 
                icon: <Calendar /> 
              },
              { 
                step: '03', 
                title: 'Get Work Done', 
                desc: 'The artisan arrives and completes the job to your satisfaction.', 
                icon: <CheckCircle /> 
              },
              { 
                step: '04', 
                title: 'Pay & Review', 
                desc: 'Pay securely through the app and leave a review for the artisan.', 
                icon: <Wallet /> 
              }
            ]?.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 text-center"
              >
                <div className="w-24 h-24 bg-[var(--card-bg)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold text-[var(--accent)] group hover:border-[var(--accent)]/50 transition-colors shadow-xl">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[var(--text)]">{item.title}</h4>
                <p className="text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* For Artisans Section */}
        <div className="mb-40">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-center text-[var(--text)]">For <span className="text-[var(--accent)]">Artisans.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-[var(--border)] z-0" />
            
            {[
              { 
                step: '01', 
                title: 'Create Profile', 
                desc: 'Set up your professional profile and showcase your skills.', 
                icon: <Smartphone /> 
              },
              { 
                step: '02', 
                title: 'Get Verified', 
                desc: 'Complete our verification process to build trust with clients.', 
                icon: <ShieldCheck /> 
              },
              { 
                step: '03', 
                title: 'Accept Bookings', 
                desc: 'Receive and manage booking requests directly on your phone.', 
                icon: <MessageSquare /> 
              },
              { 
                step: '04', 
                title: 'Grow Business', 
                desc: 'Build your reputation and increase your earnings over time.', 
                icon: <Star /> 
              }
            ]?.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 text-center"
              >
                <div className="w-24 h-24 bg-[var(--card-bg)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold text-[var(--accent)] group hover:border-[var(--accent)]/50 transition-colors shadow-xl">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[var(--text)]">{item.title}</h4>
                <p className="text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust & Safety Section */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[64px] p-12 md:p-24 mb-32 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-tight text-[var(--text)]">
                Trust & <span className="text-[var(--accent)]">Safety</span> is our Priority.
              </h2>
              <p className="text-xl text-[var(--text-muted)] mb-12 leading-relaxed">
                We've built several layers of protection to ensure every interaction on M3allem En Click is safe and reliable.
              </p>
              <ul className="space-y-6">
                {[
                  { title: 'Identity Verification', desc: 'Every artisan must provide a valid ID and certifications.' },
                  { title: 'Secure Escrow', desc: 'Payments are held securely until the work is completed.' },
                  { title: 'Verified Reviews', desc: 'Only customers who have booked can leave reviews.' },
                  { title: 'Mediation Support', desc: 'Our team is here to help resolve any disputes.' }
                ]?.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle className="text-[var(--accent)] shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="text-xl font-bold mb-1 text-[var(--text)]">{item.title}</h4>
                      <p className="text-[var(--text-muted)] text-sm">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-white/10 to-transparent p-4 rounded-[48px] border border-[var(--border)] backdrop-blur-3xl">
                <img 
                  src="https://images.unsplash.com/photo-1573161158365-597e00b7276d?auto=format&fit=crop&q=80&w=800" 
                  className="rounded-[40px] shadow-2xl"
                  alt="Security and trust"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-[var(--text)]">Ready to <span className="text-[var(--accent)]">Start?</span></h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/services"
              className="bg-[var(--accent)] text-[var(--accent-foreground)] px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-transform active:scale-95 shadow-2xl"
            >
              Find a Pro
            </Link>
            <Link 
              to="/become-artisan"
              className="bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] px-12 py-5 rounded-2xl font-bold text-xl transition-all active:scale-95 text-[var(--text)]"
            >
              Join as Artisan
            </Link>
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}
