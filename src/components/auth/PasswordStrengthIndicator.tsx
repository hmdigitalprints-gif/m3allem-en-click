import React from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 8 && /[0-9]/.test(pass)) strength += 1;
    if (pass.length >= 10 && /[^A-Za-z0-9]/.test(pass)) strength += 1;
    if (pass.length >= 12 && /[A-Z]/.test(pass) && /[a-z]/.test(pass)) strength += 1;
    return Math.min(strength, 4);
  };

  const strength = getStrength(password);
  
  const getLabel = (s: number) => {
    switch (s) {
      case 0: return '';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const getColor = (s: number) => {
    switch (s) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-emerald-500';
      default: return 'bg-white/10';
    }
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Strength</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${
          strength === 1 ? 'text-red-500' : 
          strength === 2 ? 'text-orange-500' : 
          strength === 3 ? 'text-yellow-500' : 
          'text-emerald-500'
        }`}>
          {getLabel(strength)}
        </span>
      </div>
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4]?.map((i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              backgroundColor: i <= strength ? (
                strength === 1 ? '#ef4444' : 
                strength === 2 ? '#f97316' : 
                strength === 3 ? '#eab308' : 
                '#10b981'
              ) : 'rgba(255, 255, 255, 0.1)'
            }}
            className="flex-1 rounded-full transition-colors duration-300"
          />
        ))}
      </div>
    </div>
  );
};
