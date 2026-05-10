import React from 'react';
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
  Wind as Wind2
} from 'lucide-react';

const CategoryIcon = ({ name, size = 20, className = "" }: { name?: string, size?: number, className?: string }) => {
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

export default CategoryIcon;
