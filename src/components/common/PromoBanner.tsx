import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-black px-4 py-2 relative z-[100] shadow-md border-b border-yellow-600/20"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 pr-8 relative">
          <Sparkles size={16} className="animate-pulse flex-shrink-0" />
          <p className="text-sm font-bold tracking-tight text-center md:text-left text-balance">
            Limited Time Offer: <span className="font-black uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded ml-1">0% Commission</span> on all services!
          </p>
          <Sparkles size={16} className="animate-pulse flex-shrink-0" />
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
