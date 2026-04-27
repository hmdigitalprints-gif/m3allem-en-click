import React from 'react';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  Wind, 
  Zap, 
  Paintbrush, 
  Hammer, 
  Wind as WindIcon,
  HardHat,
  Smartphone,
  Smartphone as SmartHomeIcon,
  Sparkles,
  Wind as Wind2,
  User, Calendar, MapPin, ShieldCheck, Star
} from 'lucide-react';

interface ActivityItemProps {
  title: string;
  time: string;
  desc: string;
}

export function ActivityItem({ title, time, desc }: ActivityItemProps) {
  return (
    <div className="flex gap-4">
      <div className="w-1 h-10 bg-[var(--accent)]/20 rounded-full mt-1 relative">
        <div className="absolute top-0 left-0 w-full h-4 bg-[var(--accent)] rounded-full" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-[var(--text)]">{title}</p>
          <span className="text-[10px] text-[var(--text-muted)] uppercase opacity-50">{time}</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export const CategoryIcon = ({ name, size = 20, className = "" }: { name?: string, size?: number, className?: string }) => {
  const iconProps: any = { className: `transition-transform group-hover:scale-110 ${className}` };
  if (!className || className === "") {
    iconProps.size = size;
  }
  
  if (!name) return <Hammer {...iconProps} />;
  
  switch (name.toLowerCase()) {
    case 'plumbing': return <Droplets {...iconProps} />;
    case 'electrical': return <Zap {...iconProps} />;
    case 'painting': return <Paintbrush {...iconProps} />;
    case 'cleaning': return <Sparkles {...iconProps} />;
    case 'hvac': return <Wind {...iconProps} />;
    case 'carpentry': return <Hammer {...iconProps} />;
    case 'construction': return <HardHat {...iconProps} />;
    case 'smart home': return <Smartphone {...iconProps} />;
    default: return <Hammer {...iconProps} />;
  }
};



interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-full transition-all active:scale-95 group whitespace-nowrap min-w-[60px] md:min-w-0 ${
        active 
          ? 'bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 font-bold' 
          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)]'
      }`}
    >
      <div className={`${active ? 'text-black' : 'text-[var(--text-muted)] group-hover:text-[var(--accent)]'} transition-colors mt-1 md:mt-0`}>
        {icon}
      </div>
      <span className={`text-[10px] md:text-sm md:font-bold md:tracking-[0.05em] transition-all ${active ? 'text-black font-semibold' : ''}`}>{label}</span>
    </button>
  );
}


interface OrderRowProps {
  id: string;
  client: string;
  artisan: string;
  service: string;
  status: string;
  amount: string;
}

export function OrderRow({ id, client, artisan, service, status, amount }: OrderRowProps) {
  const statusColors: any = {
    'Completed': 'bg-emerald-500/10 text-emerald-500',
    'Ongoing': 'bg-blue-500/10 text-blue-500',
    'Pending': 'bg-amber-500/10 text-amber-500',
    'Cancelled': 'bg-rose-500/10 text-rose-500'
  };

  return (
    <tr className="hover:bg-[var(--accent)]/5 transition-colors group">
      <td className="px-6 py-4 text-sm font-mono text-[var(--text-muted)] opacity-50">{id}</td>
      <td className="px-6 py-4 text-sm font-medium text-[var(--text)]">{client}</td>
      <td className="px-6 py-4 text-sm font-medium text-[var(--text)]">{artisan}</td>
      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{service}</td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-bold text-right text-[var(--accent)]">{amount}</td>
    </tr>
  );
}


interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ReactNode;
}

export function StatCard({ title, value, trend, icon }: StatCardProps) {
  return (
    <div className="card-luxury p-8 hover:border-[var(--accent)]/30 transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 rounded-2xl bg-[var(--accent)]/5 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all duration-500">
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${trend.startsWith('+') ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20' : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'}`}>
          {trend}
        </span>
      </div>
      <p className="micro-label mb-2">{title}</p>
      <h4 className="text-3xl font-display font-bold tracking-tighter text-[var(--text)]">{value}</h4>
    </div>
  );
}


interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

export function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-95 ${
        active 
          ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-lg shadow-[var(--accent)]/20' 
          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent)]/10'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 bg-[var(--accent-foreground)] rounded-full" />}
    </button>
  );
}

