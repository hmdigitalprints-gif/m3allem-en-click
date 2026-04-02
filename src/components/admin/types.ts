import { ReactNode } from 'react';

export interface ViewProps {
  isDarkMode: boolean;
  cardClasses: string;
  textMutedClasses: string;
  hoverClasses: string;
  onAction?: (msg: string) => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  section: 'MAIN' | 'FEATURES' | 'TOOLS';
}
