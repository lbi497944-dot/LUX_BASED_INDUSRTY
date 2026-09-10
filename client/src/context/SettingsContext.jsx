import { createContext, useContext, useState, useEffect } from 'react';
import { settingService } from '../services/settingService';
import { companyContact } from '../data/site';
import { siteConfig } from '../seo/seoConfig';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    brandName: 'Veloura Lighting',
    tagline: 'Illuminating Luxury Spaces',
    email: companyContact?.email || 'concierge@veloura-lighting.com',
    phone: companyContact?.phone || '+971 4 340 8899',
    whatsapp: companyContact?.whatsapp || '+971 50 892 4411',
    whatsappNumberClean: '971508924411',
    address: companyContact?.address || 'Alserkal Avenue, Building 42, Al Quoz 1, Dubai, United Arab Emirates',
    hours: companyContact?.hours || 'Monday – Saturday: 09:00 AM – 07:00 PM GST',
    catalogueUrl: '',
    socialLinks: {
      instagram: 'https://instagram.com/veloura.lighting',
      linkedin: 'https://linkedin.com/company/veloura-lighting',
      pinterest: 'https://pinterest.com/velouralighting',
      facebook: 'https://facebook.com/velouralighting',
    },
  });

  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const res = await settingService.getSettings();
      if (res.data?.settings) {
        setSettings((prev) => ({
          ...prev,
          ...res.data.settings,
        }));
      }
    } catch {
      // Fallback is already initialized
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
