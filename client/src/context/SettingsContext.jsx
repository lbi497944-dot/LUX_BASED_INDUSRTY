import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingService } from '../services/settingService';
import { companyContact } from '../data/site';
import { siteConfig } from '../seo/seoConfig';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    brandName: 'LUX BASED INDUSTRY',
    tagline: 'Illuminating Luxury Spaces',
    logo: '',
    logoPublicId: '',
    email: companyContact?.email || 'concierge@luxbasedindustry.com',
    phone: companyContact?.phone || '+971 4 340 8899',
    whatsapp: companyContact?.whatsapp || '+971 50 892 4411',
    whatsappNumberClean: '971508924411',
    address: companyContact?.address || 'Alserkal Avenue, Building 42, Al Quoz 1, Dubai, United Arab Emirates',
    hours: companyContact?.hours || 'Monday – Saturday: 09:00 AM – 07:00 PM GST',
    catalogue: {
      url: '',
      publicId: '',
      originalFilename: '',
      bytes: 0,
      updatedAt: null,
    },
    catalogueUrl: '',
    locations: [],
    socialLinks: [],
  });

  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await settingService.getSettings();
      if (res.data?.settings) {
        setSettings((prev) => ({
          ...prev,
          ...res.data.settings,
        }));
        return res.data.settings;
      }
    } catch {
      // Fallback is already initialized
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshSettings();

    // Periodic safe background sync (every 30s when document is visible)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshSettings();
      }
    }, 30000);

    // Re-sync when tab becomes visible again
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshSettings();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [refreshSettings]);

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
