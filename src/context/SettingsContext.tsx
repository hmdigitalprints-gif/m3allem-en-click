import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [settings, setSettings] = useState<Settings>({
    commission_standard: '0.10',
    commission_featured: '0.15',
    commission_material_standard: '0.05',
    commission_material_premium: '0.08',
    commission_rate: '10',
    commission_material_rate: '5',
    platform_name: 'M3allem En Click',
    contact_email: 'contact@m3allemenclick.ma',
    support_phone: '+212 5 22 00 00 00',
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    console.log('Updating settings with:', newSettings);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}`
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
