import { useState, useEffect } from 'react';
import { settingService } from '../../services/settingService';
import { useSettings } from '../../context/SettingsContext';
import { Settings, Save, Loader2, Phone, Mail, MapPin, Globe, Share2 } from 'lucide-react';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export default function SettingsManager() {
  const { settings, refreshSettings } = useSettings();
  const [formData, setFormData] = useState({
    brandName: '',
    tagline: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    country: '',
    businessHours: '',
    catalogueUrl: '',
    socialLinks: {
      instagram: '',
      linkedin: '',
      pinterest: '',
      facebook: '',
    },
    defaultSeo: {
      title: '',
      description: '',
      ogImage: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        brandName: settings.brandName || 'Veloura Lighting',
        tagline: settings.tagline || 'Illuminating Luxury Spaces',
        email: settings.email || 'concierge@veloura-lighting.com',
        phone: settings.phone || '+971 4 340 8899',
        whatsapp: settings.whatsapp || '+971 50 892 4411',
        address: settings.address || 'Alserkal Avenue, Building 42, Al Quoz 1, Dubai, UAE',
        city: settings.city || 'Dubai',
        country: settings.country || 'United Arab Emirates',
        businessHours: settings.businessHours || 'Monday – Saturday: 09:00 AM – 07:00 PM GST',
        catalogueUrl: settings.catalogueUrl || '',
        socialLinks: {
          instagram: settings.socialLinks?.instagram || 'https://instagram.com/veloura.lighting',
          linkedin: settings.socialLinks?.linkedin || 'https://linkedin.com/company/veloura-lighting',
          pinterest: settings.socialLinks?.pinterest || 'https://pinterest.com/velouralighting',
          facebook: settings.socialLinks?.facebook || 'https://facebook.com/velouralighting',
        },
        defaultSeo: {
          title: settings.defaultSeo?.title || 'Veloura Lighting | Luxury Architectural Lighting in Dubai',
          description: settings.defaultSeo?.description || 'Veloura Lighting creates bespoke architectural lighting...',
          ogImage: settings.defaultSeo?.ogImage || '',
        },
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingService.updateSettings(formData);
      await refreshSettings();
      setToast({ type: 'success', title: 'Settings Saved', message: 'Studio settings and contact details updated.' });
    } catch (err) {
      setToast({ type: 'error', title: 'Save Failed', message: err?.message || 'Error updating settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Studio Settings & SEO | Veloura CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">GLOBAL CONFIGURATION</span>
          <h1>Studio Settings & SEO</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-settings-form">
        {/* Brand & Studio Info */}
        <div className="admin-card-panel">
          <div className="panel-head">
            <h3>Brand & Studio Directory</h3>
          </div>

          <div className="admin-form-grid">
            <div className="form-row">
              <label>
                BRAND NAME
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                />
              </label>
              <label>
                TAGLINE
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                EMAIL ADDRESS
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </label>
              <label>
                TELEPHONE NUMBER
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                WHATSAPP CONCIERGE NUMBER
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+971 50 892 4411"
                />
              </label>
              <label>
                STUDIO OPERATING HOURS
                <input
                  type="text"
                  value={formData.businessHours}
                  onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                />
              </label>
            </div>

            <label>
              PHYSICAL STUDIO ADDRESS
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </label>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="admin-card-panel">
          <div className="panel-head">
            <h3>Social Media Channels</h3>
          </div>

          <div className="admin-form-grid">
            <div className="form-row">
              <label>
                INSTAGRAM URL
                <input
                  type="url"
                  value={formData.socialLinks.instagram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                    })
                  }
                />
              </label>
              <label>
                LINKEDIN URL
                <input
                  type="url"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                    })
                  }
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                PINTEREST URL
                <input
                  type="url"
                  value={formData.socialLinks.pinterest}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, pinterest: e.target.value },
                    })
                  }
                />
              </label>
              <label>
                FACEBOOK URL
                <input
                  type="url"
                  value={formData.socialLinks.facebook}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                    })
                  }
                />
              </label>
            </div>
          </div>
        </div>

        {/* Global SEO Defaults */}
        <div className="admin-card-panel">
          <div className="panel-head">
            <h3>Default Search Engine Optimization (SEO)</h3>
          </div>

          <div className="admin-form-grid">
            <label>
              DEFAULT META TITLE
              <input
                type="text"
                value={formData.defaultSeo.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultSeo: { ...formData.defaultSeo, title: e.target.value },
                  })
                }
              />
            </label>

            <label>
              DEFAULT META DESCRIPTION
              <textarea
                rows="3"
                value={formData.defaultSeo.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultSeo: { ...formData.defaultSeo, description: e.target.value },
                  })
                }
              ></textarea>
            </label>

            <label>
              DEFAULT SOCIAL SHARE IMAGE (OG:IMAGE URL)
              <input
                type="url"
                value={formData.defaultSeo.ogImage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultSeo: { ...formData.defaultSeo, ogImage: e.target.value },
                  })
                }
              />
            </label>
          </div>
        </div>

        <div className="admin-form-submit-row">
          <button type="submit" className="btn btn-gold" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="spin-icon" /> SAVING CONFIGURATION...
              </>
            ) : (
              <>
                <Save size={16} /> SAVE GLOBAL SETTINGS
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
