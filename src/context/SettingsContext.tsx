import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Settings {
  commission_standard: string;
  commission_featured: string;
  commission_material_standard: string;
  commission_material_premium: string;
  commission_rate: string;
  commission_material_rate: string;
  platform_name: string;
  contact_email: string;
  support_phone: string;
  [key: string]: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    commission_standard: '0',
    commission_featured: '0',
    commission_material_standard: '0',
    commission_material_premium: '0',
    commission_rate: '0',
    commission_material_rate: '0',
    platform_name: 'M3allem En Click',
    contact_email: 'contact@m3allemenclick.ma',
    support_phone: '+212 5 22 00 00 00',
    show_stats_section: '1',
    show_categories_section: '1',
    show_features_section: '1',
    show_faq_section: '1'});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      if (!token) {
        // Fetch public settings for non-authenticated users
        const pubRes = await fetch('/api/public/settings', { credentials: 'include' });
        if (pubRes.ok) {
          const data = await pubRes.json();
          setSettings(prev => ({ ...prev, ...data }));
        }
        setLoading(false);
        return;
      }
      
      // Fetch both admin if possible
      const [adminRes, pubRes] = await Promise.all([
        fetch('/api/admin/settings', { credentials: 'include'}).catch(() => null),
        fetch('/api/public/settings', { credentials: 'include' })
      ]);

      let newSettings = {};
      if (pubRes?.ok) {
        const pubData = await pubRes.json();
        newSettings = { ...newSettings, ...pubData };
      }
      
      if (adminRes?.ok) {
        const adminData = await adminRes.json();
        newSettings = { ...newSettings, ...adminData };
      } else if (adminRes?.status === 401 || adminRes?.status === 403) {
        console.log('Not authorized to fetch admin settings');
      }
      
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn('Network error fetching settings. Server might be starting up.');
      } else {
        console.error('Error fetching settings:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!token) throw new Error('Authentication required');
    console.log('Updating settings with:', newSettings);
    try {
      const response = await fetch('/api/admin/settings', { credentials: 'include', 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          },
        body: JSON.stringify(newSettings)
      });
      if (response.ok) {
        setSettings(prev => ({ ...prev, ...newSettings }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update settings:', errorData);
        throw new Error(errorData.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
