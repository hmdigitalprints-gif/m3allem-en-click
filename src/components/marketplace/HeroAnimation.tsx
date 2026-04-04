import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, 
  Zap, 
  Paintbrush, 
  Hammer, 
  Wrench, 
  Smartphone, 
  ShieldCheck, 
  Star, 
  CheckCircle2,
  AlertCircle,
  Home,
  User,
  HardHat,
  MapPin,
  Clock,
  ThumbsUp,
  Lightbulb,
  LightbulbOff
} from 'lucide-react';

const SCENE_DURATION = 1500; // 1.5 seconds per scene for a 15s total loop

// Minimal Character Components
const Homeowner = ({ mood = 'neutral', action = 'none' }: { mood?: 'neutral' | 'worried' | 'happy', action?: 'none' | 'phone' }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <motion.div className="relative flex flex-col items-center">
      {/* Head */}
      <div className="w-14 h-14 rounded-full border-2 border-white/20 bg-[#1A1A1A] relative overflow-hidden">
        {/* Hair */}
        <div className="absolute top-0 inset-x-0 h-4 bg-[#2A2A2A] rounded-t-full" />
        {/* Eyes */}
        <motion.div 
          animate={mood === 'worried' ? { y: [0, -1, 0] } : {}}
          className="absolute top-5 inset-x-0 flex justify-center gap-4"
        >
          <motion.div 
            animate={{ scaleY: isBlinking ? 0.1 : 1 }}
            className="w-1.5 h-1.5 rounded-full bg-white/60 origin-center" 
          />
          <motion.div 
            animate={{ scaleY: isBlinking ? 0.1 : 1 }}
            className="w-1.5 h-1.5 rounded-full bg-white/60 origin-center" 
          />
        </motion.div>
        {/* Mouth */}
        <AnimatePresence mode="wait">
          {mood === 'worried' && (
            <motion.div 
              key="worried"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3 h-1 bg-white/20 rounded-full" 
            />
          )}
          {mood === 'happy' && (
            <motion.div 
              key="happy"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-3 border-b-2 border-[var(--accent)] rounded-full" 
            />
          )}
          {mood === 'neutral' && (
            <div key="neutral" className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white/10 rounded-full" />
          )}
        </AnimatePresence>
      </div>
      {/* Body */}
      <div className="w-18 h-24 bg-[#1A1A1A] border-2 border-white/10 rounded-t-[32px] mt-1 relative">
        {/* Shirt Detail */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-white/5" />
        {action === 'phone' && (
          <motion.div 
            initial={{ rotate: 45, y: 20, opacity: 0 }}
            animate={{ rotate: -15, y: 0, opacity: 1 }}
            className="absolute -left-6 top-6"
          >
            <div className="w-7 h-12 bg-[#2A2A2A] border border-white/20 rounded-lg flex items-center justify-center shadow-xl">
              <div className="w-5 h-9 bg-[var(--accent)]/20 rounded-md overflow-hidden relative">
                <motion.div 
                  animate={{ y: [-10, 10] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const Artisan = ({ action = 'none' }: { action?: 'none' | 'work' | 'travel' }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <motion.div className="relative flex flex-col items-center">
      {/* Hard Hat */}
      <div className="w-16 h-8 bg-[var(--accent)] rounded-t-full relative z-20 shadow-lg shadow-[var(--accent)]/20">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full" />
      </div>
      {/* Head */}
      <div className="w-14 h-14 rounded-full border-2 border-white/20 bg-[#1A1A1A] -mt-2 relative z-10">
        <div className="absolute top-6 inset-x-0 flex justify-center gap-4">
          <motion.div 
            animate={{ scaleY: isBlinking ? 0.1 : 1 }}
            className="w-1.5 h-1.5 rounded-full bg-white/60 origin-center" 
          />
          <motion.div 
            animate={{ scaleY: isBlinking ? 0.1 : 1 }}
            className="w-1.5 h-1.5 rounded-full bg-white/60 origin-center" 
          />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-3 border-b-2 border-white/20 rounded-full" />
      </div>
      {/* Body - Overalls */}
      <div className="w-20 h-26 bg-[#1A1A1A] border-2 border-white/10 rounded-t-[32px] mt-1 relative overflow-hidden">
        {/* Overall Straps */}
        <div className="absolute top-0 left-3 w-3 h-full bg-blue-500/10 border-x border-white/5" />
        <div className="absolute top-0 right-3 w-3 h-full bg-blue-500/10 border-x border-white/5" />
        {/* Tool Belt */}
        <div className="absolute bottom-4 inset-x-0 h-4 bg-[#2A2A2A] border-y border-white/10 flex items-center justify-around px-2">
          <div className="w-2 h-2 bg-white/10 rounded-sm" />
          <div className="w-2 h-2 bg-white/10 rounded-sm" />
          <div className="w-2 h-2 bg-white/10 rounded-sm" />
        </div>
        {action === 'work' && (
          <motion.div 
            animate={{ rotate: [0, 25, 0], x: [0, 5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-6 top-6 text-[var(--accent)] drop-shadow-[0_0_8px_rgba(255,212,0,0.3)]"
          >
            <Wrench size={28} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const Sink = ({ state = 'leaking' }: { state?: 'leaking' | 'fixed' }) => (
  <div className="relative">
    {/* Sink Basin */}
    <div className="w-40 h-24 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
      <div className="absolute bottom-0 inset-x-0 h-4 bg-white/5" />
      {/* Tap */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-12 bg-[#2A2A2A] rounded-t-full border-x border-t border-white/10">
        <div className="absolute top-2 -right-4 w-6 h-2 bg-[#2A2A2A] rounded-full" />
      </div>
    </div>
    {/* Pipe */}
    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-6 h-12 bg-[#2A2A2A] border-x border-white/10 rounded-b-xl">
      <div className="absolute top-4 inset-x-0 h-2 bg-white/5" />
    </div>
    {/* Water Effect */}
    <AnimatePresence>
      {state === 'leaking' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2"
        >
          <motion.div 
            animate={{ y: [0, 20], opacity: [1, 0], scale: [1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeIn" }}
          >
            <Droplets size={24} className="text-blue-400/60" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Environment = () => (
  <div className="absolute inset-0 pointer-events-none">
    {/* Window */}
    <div className="absolute top-12 right-12 w-32 h-40 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 flex">
        <div className="flex-1 border-r border-white/5" />
        <div className="flex-1" />
      </div>
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 border-b border-white/5" />
        <div className="flex-1" />
      </div>
      {/* Moon/Sun in window */}
      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/5 blur-sm" />
      
      {/* Light Rays from Window */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              x: [-20, 20],
            }}
            transition={{ 
              duration: 5 + i, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-0 left-0 w-1 h-[200%] bg-white/5 blur-xl origin-top rotate-[35deg]"
            style={{ left: `${20 + i * 30}%` }}
          />
        ))}
      </div>
    </div>
    {/* Plant */}
    <div className="absolute bottom-12 left-12 flex flex-col items-center">
      <div className="flex gap-1 mb-[-4px]">
        <motion.div animate={{ rotate: [-5, 5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-2 h-8 bg-emerald-500/10 rounded-full origin-bottom" />
        <motion.div animate={{ rotate: [5, -5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-2 h-10 bg-emerald-500/20 rounded-full origin-bottom" />
        <motion.div animate={{ rotate: [-3, 3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="w-2 h-6 bg-emerald-500/10 rounded-full origin-bottom" />
      </div>
      <div className="w-10 h-8 bg-[#1A1A1A] border border-white/10 rounded-b-lg rounded-t-sm" />
    </div>
  </div>
);

export default function HeroAnimation() {
  const [scene, setScene] = useState(0);
  const totalScenes = 10;

  useEffect(() => {
    const interval = setInterval(() => {
      setScene((prev) => (prev + 1) % totalScenes);
    }, SCENE_DURATION);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.05, filter: 'blur(10px)' }
  };

  return (
    <div className="relative w-full aspect-video bg-[#0B0B0B] rounded-[48px] overflow-hidden flex items-center justify-center border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
      {/* Background Grid - Premium SaaS style */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
        backgroundSize: '40px 40px' 
      }} />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              opacity: Math.random() * 0.2 + 0.1,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, '-20%', '120%'],
              x: [null, (Math.random() - 0.5) * 50 + '%']
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * -20
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        ))}
      </div>

      <Environment />

      <AnimatePresence mode="wait">
        {/* Scene 1: The Problem */}
        {scene === 0 && (
          <motion.div key="s0" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-16">
            <div className="relative flex items-end gap-16">
              <Homeowner mood="worried" />
              <div className="relative">
                <Sink state="leaking" />
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-12 -right-4"
                >
                  <AlertCircle className="text-rose-500 w-8 h-8 animate-pulse" />
                </motion.div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/40 font-sans text-[10px] uppercase tracking-[0.5em] font-black">01. Issue Detected</p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: SCENE_DURATION / 1000 }} className="w-full h-full bg-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 2: Smartphone Action */}
        {scene === 1 && (
          <motion.div key="s1" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-16">
            <Homeowner action="phone" mood="worried" />
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/40 font-sans text-[10px] uppercase tracking-[0.5em] font-black">02. Taking Action</p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: SCENE_DURATION / 1000 }} className="w-full h-full bg-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 3: Platform UI */}
        {scene === 2 && (
          <motion.div key="s2" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-16">
            <div className="w-56 h-96 bg-[#1A1A1A] rounded-[48px] border-[6px] border-[#2A2A2A] p-6 flex flex-col gap-6 relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
              <div className="w-12 h-1 bg-[#2A2A2A] rounded-full mx-auto mb-2" />
              <div className="space-y-3">
                <div className="w-full h-2 bg-white/5 rounded-full" />
                <div className="w-3/4 h-2 bg-white/5 rounded-full" />
              </div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                className="mt-6 p-4 bg-gradient-to-br from-[var(--accent)] to-[#E6C200] rounded-[24px] flex flex-col items-center gap-2 shadow-lg shadow-[var(--accent)]/20"
              >
                <span className="text-[11px] font-black text-black uppercase tracking-tighter">M3allem En Click</span>
              </motion.div>
              <div className="mt-auto grid grid-cols-3 gap-3 pb-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/5" />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/40 font-sans text-[10px] uppercase tracking-[0.5em] font-black">03. Opening Platform</p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: SCENE_DURATION / 1000 }} className="w-full h-full bg-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 4: Service Categories */}
        {scene === 3 && (
          <motion.div key="s3" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="relative w-96 h-96 flex items-center justify-center">
            <Smartphone size={120} className="text-white/5" strokeWidth={0.5} />
            {[
              { Icon: Wrench, label: 'Plumber', x: -120, y: -120, color: 'text-blue-400', bg: 'bg-blue-400/5' },
              { Icon: Zap, label: 'Electrician', x: 120, y: -120, color: 'text-yellow-400', bg: 'bg-yellow-400/5' },
              { Icon: Paintbrush, label: 'Painter', x: -120, y: 120, color: 'text-purple-400', bg: 'bg-purple-400/5' },
              { Icon: Hammer, label: 'Handyman', x: 120, y: 120, color: 'text-orange-400', bg: 'bg-orange-400/5' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ scale: 1, x: item.x, y: item.y }}
                transition={{ delay: i * 0.1, type: 'spring', damping: 15 }}
                className={`absolute w-28 h-28 ${item.bg} backdrop-blur-2xl border border-white/10 rounded-[40px] flex flex-col items-center justify-center gap-3 shadow-2xl`}
              >
                <item.Icon size={36} className={item.color} strokeWidth={1.5} />
                <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">{item.label}</span>
              </motion.div>
            ))}
            <div className="absolute -bottom-12 flex flex-col items-center gap-2">
              <p className="text-white/40 font-sans text-[10px] uppercase tracking-[0.5em] font-black">04. Choose Service</p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: SCENE_DURATION / 1000 }} className="w-full h-full bg-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 5: The Tap */}
        {scene === 4 && (
          <motion.div key="s4" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-16">
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-[var(--accent)]/20 to-transparent rounded-[40px] flex items-center justify-center border border-[var(--accent)]/30 relative z-10"
              >
                <Wrench size={56} className="text-[var(--accent)] drop-shadow-[0_0_15px_rgba(255,212,0,0.5)]" />
              </motion.div>
              <motion.div 
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-[var(--accent)]/30 rounded-[40px]"
              />
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="text-emerald-400 w-6 h-6" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/40 font-sans text-[10px] uppercase tracking-[0.5em] font-black">05. Instant Match</p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: SCENE_DURATION / 1000 }} className="w-full h-full bg-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 6: Artisan Arrival */}
        {scene === 5 && (
          <motion.div key="s5" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-16">
            <div className="relative flex items-center gap-24">
              <motion.div 
                animate={{ x: [-100, 150] }} 
                transition={{ duration: SCENE_DURATION / 1000, ease: "linear" }}
                className="relative"
              >
                <Artisan action="travel" />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.2 }} className="w-4 h-1 bg-white/10 rounded-full" />
                </div>
              </motion.div>
              <div className="flex flex-col gap-3 opacity-10">
                <div className="w-16 h-1.5 bg-white rounded-full" />
                <div className="w-12 h-1.5 bg-white rounded-full" />
                <div className="w-20 h-1.5 bg-white rounded-full" />
              </div>
              <Home size={80} className="text-white/5" strokeWidth={1} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/40 font-sans text-[10px] uppercase tracking-[0.5em] font-black">06. Pro on the Way</p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: SCENE_DURATION / 1000 }} className="w-full h-full bg-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 7: The Repair */}
        {scene === 6 && (
          <motion.div key="s6" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-16">
            <div className="relative flex items-end gap-16">
              <Artisan action="work" />
              <Sink state="leaking" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/40 font-sans text-[10px] uppercase tracking-[0.5em] font-black">07. Expert Repair</p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: SCENE_DURATION / 1000 }} className="w-full h-full bg-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 8: Satisfaction */}
        {scene === 7 && (
          <motion.div key="s7" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-16">
            <div className="relative flex items-end gap-16">
              <Homeowner mood="happy" />
              <div className="relative">
                <Sink state="fixed" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2"
                >
                  <div className="bg-emerald-500/20 p-3 rounded-full border border-emerald-500/30">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                </motion.div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/40 font-sans text-[10px] uppercase tracking-[0.5em] font-black">08. Job Completed</p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: SCENE_DURATION / 1000 }} className="w-full h-full bg-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 9: Verified Badge */}
        {scene === 8 && (
          <motion.div key="s8" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ x: -30, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] flex items-center gap-6 shadow-2xl"
              >
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-[24px] flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">Verified Artisan</p>
                  <p className="text-[11px] text-white/40 font-bold">Identity & Skills Verified</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ x: 30, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                transition={{ delay: 0.2 }}
                className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] flex items-center gap-6 shadow-2xl"
              >
                <div className="w-16 h-16 bg-[var(--accent)]/20 text-[var(--accent)] rounded-[24px] flex items-center justify-center border border-[var(--accent)]/20">
                  <Star size={32} fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">4.9 Rating</p>
                  <p className="text-[11px] text-white/40 font-bold">Based on 10k+ Reviews</p>
                </div>
              </motion.div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/40 font-sans text-[10px] uppercase tracking-[0.5em] font-black">09. Trusted Quality</p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: SCENE_DURATION / 1000 }} className="w-full h-full bg-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 10: Loop Transition */}
        {scene === 9 && (
          <motion.div key="s9" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-12">
            <div className="relative">
              <div className="w-32 h-32 bg-[var(--accent)]/5 rounded-full flex items-center justify-center border border-white/5">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <Clock size={64} className="text-[var(--accent)]/40" strokeWidth={1} />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-[var(--accent)] origin-top -translate-x-1/2"
                  />
                </motion.div>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-[var(--accent)]/10 rounded-full blur-2xl"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/40 font-sans text-[10px] uppercase tracking-[0.5em] font-black">10. Ready for Next</p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: SCENE_DURATION / 1000 }} className="w-full h-full bg-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
