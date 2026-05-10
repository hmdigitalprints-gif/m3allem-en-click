import React from 'react';
import { motion } from 'framer-motion';
import { 
  Hammer, 
  Wrench, 
  Smartphone, 
  Laptop, 
  CreditCard, 
  Bell, 
  Search, 
  Play,
  Zap,
  Paintbrush,
  CheckCircle2,
  ShieldCheck,
  Star,
  Volume2,
  Settings,
  Maximize
} from 'lucide-react';

export default function MarketplaceIllustration() {
  return (
    <div className="relative w-full aspect-[16/10] bg-[#0A0A0A] rounded-[48px] overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl">
      {/* Background Grid & Ambient Glow */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
        backgroundSize: '40px 40px' 
      }} />
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -left-1/4 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(var(--accent-rgb),0.3),transparent_70%)] blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.03, 0.08, 0.03],
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.2),transparent_70%)] blur-[100px]" 
        />
      </div>

      {/* Demo/Video Frame Background (The "Highlighted Area") */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-8 rounded-[40px] border border-white/10 bg-white/[0.01] backdrop-blur-[2px] flex items-center justify-center overflow-hidden group/video"
      >
        {/* Play Button Overlay */}
        <div className="relative z-10 w-28 h-28 rounded-full bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/20 group cursor-pointer hover:bg-[var(--accent)]/20 transition-all duration-500">
          <div className="absolute inset-0 rounded-full bg-[var(--accent)]/20 animate-ping opacity-20" />
          <div className="absolute inset-2 rounded-full border border-[var(--accent)]/30 border-dashed animate-[spin_10s_linear_infinite]" />
          <Play size={48} className="text-[var(--accent)] fill-[var(--accent)] ml-1 transition-transform group-hover:scale-110" />
        </div>

        {/* Video Controls Bar */}
        <div className="absolute bottom-6 left-8 right-8 flex flex-col gap-4 z-20">
          {/* Progress Bar */}
          <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden group/progress cursor-pointer">
            <motion.div 
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="h-full bg-[var(--accent)] relative"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </motion.div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <Play size={16} className="text-white/60 fill-white/60" />
                <Volume2 size={16} className="text-white/60" />
              </div>
              <span className="text-[10px] font-mono text-white/40 tracking-widest">04:20 / 12:00</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-2 py-1 rounded-md bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Live</span>
              </div>
              <Settings size={16} className="text-white/60" />
              <Maximize size={16} className="text-white/60" />
            </div>
          </div>
        </div>
        
        {/* Abstract Video Content Shapes */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[var(--accent)]/10 rounded-full"
          />
          <motion.div 
            animate={{ 
              rotate: -360,
              scale: [1.2, 1, 1.2],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"
          />
        </div>
      </motion.div>

      {/* Left Side: Artisans */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2 flex flex-col gap-16 z-20">
        {/* Artisan 1: Builder/Repair */}
        <motion.div 
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          {/* Character Silhouette (Geometric) */}
          <div className="relative w-28 h-36">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30" />
            <div className="absolute top-13 left-0 w-28 h-24 rounded-2xl bg-blue-500/10 border border-blue-500/20" />
            <div className="absolute top-16 left-5 w-18 h-4 bg-blue-500/30 rounded-full" />
            {/* Tool */}
            <motion.div 
              animate={{ rotate: [0, -20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -right-6 top-14 w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg"
            >
              <Hammer size={24} className="text-blue-400" />
            </motion.div>
          </div>
          <div className="mt-6 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl">
            <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Master Builder</p>
          </div>
        </motion.div>

        {/* Artisan 2: Painter */}
        <motion.div 
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative translate-x-10"
        >
          <div className="relative w-28 h-36">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30" />
            <div className="absolute top-13 left-0 w-28 h-24 rounded-2xl bg-purple-500/10 border border-purple-500/20" />
            {/* Tool */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -right-6 top-14 w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg"
            >
              <Paintbrush size={24} className="text-purple-400" />
            </motion.div>
          </div>
          <div className="mt-6 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl">
            <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest">Interior Artist</p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Platform Users */}
      <div className="absolute right-16 top-1/2 -translate-y-1/2 flex flex-col gap-16 z-20">
        {/* User 1: Mobile User */}
        <motion.div 
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="relative w-28 h-36">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
            <div className="absolute top-13 left-0 w-28 h-24 rounded-2xl bg-emerald-500/10 border border-emerald-500/20" />
            {/* Interaction */}
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -left-6 top-14 w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg"
            >
              <Smartphone size={24} className="text-emerald-400" />
            </motion.div>
          </div>
          <div className="mt-6 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl text-right">
            <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Quick Booking</p>
          </div>
        </motion.div>

        {/* User 2: Laptop User */}
        <motion.div 
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative -translate-x-10"
        >
          <div className="relative w-28 h-36">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30" />
            <div className="absolute top-13 left-0 w-28 h-24 rounded-2xl bg-indigo-500/10 border border-indigo-500/20" />
            {/* Interaction */}
            <motion.div 
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -left-6 top-14 w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg"
            >
              <Laptop size={24} className="text-indigo-400" />
            </motion.div>
          </div>
          <div className="mt-6 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl text-right">
            <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Service Management</p>
          </div>
        </motion.div>
      </div>

      {/* Central Platform Dashboard (The Connector) */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, type: 'spring', damping: 15 }}
        className="relative z-30 w-80 h-[480px] bg-[#111] rounded-[56px] border-[14px] border-[#222] shadow-[0_0_120px_rgba(0,0,0,0.6)] flex flex-col p-10 gap-8"
      >
        {/* Phone Speaker/Camera */}
        <div className="w-20 h-2 bg-[#222] rounded-full mx-auto mb-2" />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
            <Search size={20} className="text-[var(--accent)]" />
          </div>
          <div className="flex -space-x-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#111] bg-white/10 overflow-hidden">
                <img src={`https://picsum.photos/seed/artisan${i}/60/60`} alt="" className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Search Bar Placeholder */}
        <div className="w-full h-12 bg-white/5 rounded-2xl border border-white/5 flex items-center px-5 gap-4">
          <div className="w-2/3 h-2.5 bg-white/10 rounded-full" />
        </div>

        {/* Artisan Profile Card Preview */}
        <div className="bg-white/5 rounded-[32px] p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Wrench size={22} className="text-blue-400" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="w-24 h-2.5 bg-white/20 rounded-full" />
              <div className="w-16 h-2 bg-white/10 rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-white/60">4.9</span>
            </div>
            <div className="text-xs font-bold text-[var(--accent)]">$45/hr</div>
          </div>
        </div>

        {/* Action Button */}
        <button className="mt-auto w-full py-5 bg-[var(--accent)] text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.02] transition-transform">
          Confirm Booking
        </button>
      </motion.div>

      {/* Connecting Flow Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              x: i < 4 ? [-300, 300] : [300, -300],
              y: [Math.random() * 500 - 250, Math.random() * 500 - 250]
            }}
            transition={{ 
              duration: 4 + Math.random() * 3, 
              repeat: Infinity, 
              delay: i * 0.8 
            }}
            className="absolute top-1/2 left-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent"
          />
        ))}
      </div>

      {/* Trust & Category Icons (Floating) */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-1/4 z-10 flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full"
      >
        <ShieldCheck size={14} className="text-emerald-400" />
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Secure Platform</span>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-1/4 z-10 flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full"
      >
        <CreditCard size={14} className="text-blue-400" />
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Instant Payout</span>
      </motion.div>

      {/* Success Notification Popup */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute top-12 right-12 z-40 flex items-center gap-3 bg-emerald-500 text-black px-4 py-2 rounded-2xl shadow-xl"
      >
        <CheckCircle2 size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Job Completed</span>
      </motion.div>
    </div>
  );
}
