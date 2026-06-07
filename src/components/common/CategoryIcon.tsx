import React from 'react';
import { 
  Hammer, 
  Wrench, 
  Car, 
  Monitor, 
  Code, 
  Palette, 
  TrendingUp, 
  GraduationCap, 
  Heart, 
  Briefcase, 
  Truck, 
  Home, 
  Calendar, 
  Camera, 
  Sparkles, 
  Dog, 
  Scissors, 
  DollarSign, 
  Scale, 
  BookOpen,
  Droplets,
  Zap,
  Paintbrush
} from 'lucide-react';

const CategoryIcon = ({ name, size = 20, className = "" }: { name?: string, size?: number, className?: string }) => {
  const iconProps: any = { className: `transition-transform group-hover:scale-110 ${className}` };
  if (!className || className === "") {
    iconProps.size = size;
  }
  
  if (!name) return <Hammer {...iconProps} />;
  
  const normName = name.toLowerCase().trim();
  
  if (normName.includes('home & construction') || normName.includes('gros œuvre') || normName.includes('bâtiment') || normName === 'home_construction' || normName === 'construction') {
    return <Hammer {...iconProps} />;
  }
  if (normName.includes('repair & maintenance') || normName.includes('plomberie') || normName.includes('dépannage') || normName === 'repair_maintenance' || normName === 'hvac') {
    return <Wrench {...iconProps} />;
  }
  if (normName.includes('automotive') || normName.includes('automobile') || normName === 'automotive') {
    return <Car {...iconProps} />;
  }
  if (normName.includes('it & technology') || normName.includes('informatique') || normName === 'it_technology') {
    return <Monitor {...iconProps} />;
  }
  if (normName.includes('web & mobile') || normName.includes('développement') || normName === 'web_mobile_dev') {
    return <Code {...iconProps} />;
  }
  if (normName.includes('design & creative') || normName.includes('création') || normName === 'design_creative') {
    return <Palette {...iconProps} />;
  }
  if (normName.includes('marketing') || normName === 'digital_marketing') {
    return <TrendingUp {...iconProps} />;
  }
  if (normName.includes('training') || normName.includes('coaching') || normName.includes('formation') || normName === 'training_coaching') {
    return <GraduationCap {...iconProps} />;
  }
  if (normName.includes('health & wellness') || normName.includes('santé') || normName.includes('bien-être') || normName === 'health_wellness') {
    return <Heart {...iconProps} />;
  }
  if (normName.includes('professional') || normName.includes('services professionnels') || normName === 'professional_services') {
    return <Briefcase {...iconProps} />;
  }
  if (normName.includes('transport') || normName.includes('logis') || normName === 'transport_logistics') {
    return <Truck {...iconProps} />;
  }
  if (normName.includes('home services') || normName.includes('services à domicile') || normName === 'home_services') {
    return <Home {...iconProps} />;
  }
  if (normName.includes('events') || normName.includes('événement') || normName === 'events') {
    return <Calendar {...iconProps} />;
  }
  if (normName.includes('photo') || normName.includes('vidéo') || normName === 'photography_video') {
    return <Camera {...iconProps} />;
  }
  if (normName.includes('beauty') || normName.includes('beauté') || normName === 'beauty') {
    return <Sparkles {...iconProps} />;
  }
  if (normName.includes('pets') || normName.includes('animaux') || normName === 'pets') {
    return <Dog {...iconProps} />;
  }
  if (normName.includes('crafts') || normName.includes('artisanat') || normName === 'crafts') {
    return <Scissors {...iconProps} />;
  }
  if (normName.includes('finance') || normName.includes('compta') || normName === 'finance_accounting') {
    return <DollarSign {...iconProps} />;
  }
  if (normName.includes('legal') || normName.includes('juridique') || normName === 'legal') {
    return <Scale {...iconProps} />;
  }
  if (normName.includes('translation') || normName.includes('traduction') || normName.includes('rédaction') || normName === 'translation_writing') {
    return <BookOpen {...iconProps} />;
  }

  // legacy / fallback
  if (normName.includes('plumb')) return <Droplets {...iconProps} />;
  if (normName.includes('electr')) return <Zap {...iconProps} />;
  if (normName.includes('paint')) return <Paintbrush {...iconProps} />;
  if (normName.includes('clean') || normName.includes('soap')) return <Sparkles {...iconProps} />;
  
  return <Hammer {...iconProps} />;
};

export default CategoryIcon;
