import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useDirection } from '../../hooks/useDirection';

interface SymmetricalIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  flipOnRtl?: boolean;
  strokeWidth?: number;
}

export const SymmetricalIcon: React.FC<SymmetricalIconProps> = ({ 
  icon: Icon, 
  size = 20, 
  className = "", 
  flipOnRtl = true,
  strokeWidth
}) => {
  const { isRtl } = useDirection();
  
  return (
    <Icon 
      size={size} 
      strokeWidth={strokeWidth}
      className={`${className} transition-transform duration-300 ${isRtl && flipOnRtl ? 'rotate-180' : ''}`} 
    />
  );
};
