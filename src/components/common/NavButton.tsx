import React from 'react';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export default function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all active:scale-95 group whitespace-nowrap ${
        active 
          ? 'bg-[#FFD400] text-black shadow-xl shadow-[#FFD400]/20' 
          : 'text-zinc-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className={`${active ? 'text-black' : 'text-zinc-500 group-hover:text-[#FFD400]'} transition-colors`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}
