import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  Zap, 
  Paintbrush, 
  Sparkles, 
  Wind, 
  HardHat, 
  Hammer,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  ChevronRight
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

const categories = [
  { 
    id: 'cat_1', 
    name: 'Plumbing', 
    icon: <Droplets />, 
    color: 'bg-blue-500/10 text-blue-400',
    description: 'Leak repairs, pipe installations, bathroom fittings, and emergency plumbing services.',
    count: 450
  },
  { 
    id: 'cat_2', 
    name: 'Electricity', 
    icon: <Zap />, 
    color: 'bg-yellow-500/10 text-yellow-400',
    description: 'Wiring, lighting installation, panel upgrades, and electrical safety inspections.',
    count: 380
  },
  { 
    id: 'cat_3', 
    name: 'Painting', 
    icon: <Paintbrush />, 
    color: 'bg-purple-500/10 text-purple-400',
    description: 'Interior and exterior painting, wallpaper removal, and decorative finishes.',
    count: 290
  },
  { 
    id: 'cat_4', 
    name: 'Cleaning', 
    icon: <Sparkles />, 
    color: 'bg-emerald-500/10 text-emerald-400',
    description: 'Deep cleaning, post-construction cleanup, and regular home maintenance.',
    count: 620
  },
  { 
    id: 'cat_5', 
    name: 'AC Repair', 
    icon: <Wind />, 
    color: 'bg-amber-500/10 text-amber-400',
    description: 'AC installation, maintenance, gas refilling, and cooling system repairs.',
    count: 150
  },
  { 
    id: 'cat_6', 
    name: 'Construction', 
    icon: <HardHat />, 
    color: 'bg-orange-500/10 text-orange-400',
    description: 'Masonry, tiling, renovation work, and small-scale construction projects.',
    count: 210
  },
  { 
    id: 'cat_7', 
    name: 'Carpentry', 
    icon: <Hammer />, 
    color: 'bg-amber-500/10 text-amber-400',
    description: 'Furniture repair, custom cabinets, door installations, and woodwork.',
    count: 180
  },
  { 
    id: 'cat_8', 
    name: 'Gardening', 
    icon: <Users />, 
    color: 'bg-green-500/10 text-green-400',
    description: 'Landscaping, lawn maintenance, plant care, and garden design.',
    count: 120
  }
];

export default function Services() {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-full text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-8"
          >
            <ShieldCheck size={14} />
            Verified Professionals
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)]"
          >
            OUR <span className="text-[var(--accent)]">SERVICES.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            Explore our wide range of professional home services. Every artisan is vetted for quality and reliability.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories?.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -10 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] p-10 rounded-[48px] hover:bg-[var(--bg)] transition-all group shadow-xl"
            >
              <div className={`w-20 h-20 bg-[var(--accent)]/10 text-[var(--accent)] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 40 })}
              </div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-3xl font-bold text-[var(--text)]">{cat.name}</h3>
                <span className="text-[var(--accent)] text-sm font-bold bg-[var(--accent)]/10 px-3 py-1 rounded-full">
                  {cat.count}+ Pros
                </span>
              </div>
              <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
                {cat.description}
              </p>
              <Link 
                to={`/find-pro?category=${cat.name}`}
                className="flex items-center justify-between w-full bg-[var(--bg)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] p-6 rounded-2xl font-bold transition-all group/btn border border-[var(--border)]"
              >
                <span>Find {cat.name}</span>
                <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 rounded-[64px] p-12 md:p-24 text-[var(--accent-foreground)] text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">Don't see what you need?</h2>
            <p className="text-xl font-medium mb-12 opacity-80">
              We're constantly expanding our network. Contact us for special requests or custom projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contact"
                className="bg-[var(--bg)] text-[var(--text)] px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-transform active:scale-95 shadow-2xl border border-[var(--border)]"
              >
                Contact Support
              </Link>
              <Link 
                to="/how-it-works"
                className="bg-white/20 backdrop-blur-md border border-black/10 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white/30 transition-all active:scale-95"
              >
                Learn More
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </PublicLayout>
  );
}
