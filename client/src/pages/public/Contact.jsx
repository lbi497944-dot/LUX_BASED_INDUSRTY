import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, ArrowUpRight, Loader2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { contactService } from '../../services/contactService';
import { images } from '../../data/site';
import PageHero from '../../components/sections/PageHero';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';
import { pageSeoData, siteConfig, getWhatsAppLink } from '../../seo/seoConfig';

export default function Contact() {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    location: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await contactService.submitContact(formData);
      setToast({
        type: 'success',
        title: 'Enquiry Received',
        message: res.message || `Thank you for reaching out to ${settings?.brandName || 'LUX BASED INDUSTRY'}. Our architectural team will respond within 24 hours.`
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        projectType: '',
        location: '',
        message: ''
      });
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Submission Error',
        message: err?.message || 'Unable to submit enquiry at this time. Please try contacting via WhatsApp.'
      });
    } finally {
      setLoading(false);
    }
  };

  const activeLocations = Array.isArray(settings?.locations)
    ? settings.locations.filter((loc) => loc.isActive)
    : [];

  const primaryLocation = activeLocations.find((l) => l.isPrimary) || activeLocations[0];

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.brandName || siteConfig.siteName,
    url: `${siteConfig.siteUrl}/contact`,
    telephone: primaryLocation?.phone || settings.phone,
    email: primaryLocation?.email || settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: primaryLocation?.address || settings.address,
      addressLocality: primaryLocation?.city || settings.city || 'Dubai',
      addressCountry: primaryLocation?.country || 'AE'
    }
  };

  const cleanWhatsapp = (settings.whatsappNumberClean || settings.whatsapp || '').replace(/[^0-9]/g, '');
  const waContactMessage = encodeURIComponent(`Hello ${settings.brandName || 'LUX BASED INDUSTRY'}, I'm interested in discussing an architectural lighting project.`);

  return (
    <main className="contact-page">
      <SEO
        title={pageSeoData.contact.title}
        description={pageSeoData.contact.description}
        canonical="/contact"
        schemaData={contactSchema}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />

      <PageHero
        eyebrow="GET IN TOUCH"
        title="Let's Talk About Your Space"
        description="Whether you are an architect, interior designer, developer, or private homeowner, our lighting studio is here to assist with your vision."
        image={images.living}
      />

      <section className="section">
        <div className="container contact-grid-container">
          {/* Left Column: Contact Details */}
          <div className="contact-info-panel">
            <span className="eyebrow gold-label">STUDIO DIRECTORY</span>
            <h2>
              Start with a<br />
              <em>conversation.</em>
            </h2>
            <p className="contact-intro-text">
              Reach out to our lighting studio to discuss fixture specifications, arrange a private lighting demonstration, or request sample finish boxes.
            </p>

            {/* Showrooms & Locations Directory */}
            {activeLocations.length > 0 ? (
              <div className="contact-locations-directory">
                {activeLocations.map((loc, idx) => (
                  <div key={loc._id || `loc-${idx}`} className="contact-location-entry">
                    <div className="icon-box">
                      <MapPin size={18} />
                    </div>
                    <div className="location-entry-content">
                      <small className="gold-label">
                        {loc.name.toUpperCase()} {loc.isPrimary && '• PRIMARY STUDIO'}
                      </small>
                      <p className="entry-address">{loc.address}{loc.city && `, ${loc.city}`}{loc.country && `, ${loc.country}`}</p>
                      {loc.phone && (
                        <p className="entry-phone">
                          <a href={`tel:${loc.phone}`}>{loc.phone}</a>
                        </p>
                      )}
                      {loc.email && (
                        <p className="entry-email">
                          <a href={`mailto:${loc.email}`}>{loc.email}</a>
                        </p>
                      )}
                      {loc.mapUrl && (
                        <p className="entry-map">
                          <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="text-link-gold">
                            View on Google Maps <ArrowUpRight size={13} />
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="contact-details-list">
                <div className="contact-detail-item">
                  <div className="icon-box">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <small>STUDIO LOCATION</small>
                    <p>{settings.address}</p>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="icon-box">
                    <Mail size={18} />
                  </div>
                  <div>
                    <small>EMAIL ENQUIRIES</small>
                    <p>
                      <a href={`mailto:${settings.email}`}>{settings.email}</a>
                    </p>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="icon-box">
                    <Phone size={18} />
                  </div>
                  <div>
                    <small>TELEPHONE</small>
                    <p>
                      <a href={`tel:${settings.phone}`}>{settings.phone}</a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="contact-detail-item" style={{ marginTop: '16px' }}>
              <div className="icon-box">
                <Clock size={18} />
              </div>
              <div>
                <small>STUDIO HOURS</small>
                <p>{settings.businessHours || settings.hours}</p>
              </div>
            </div>

            <div className="whatsapp-cta-box">
              <a
                href={cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}?text=${waContactMessage}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={18} /> DIRECT WHATSAPP CONSULTATION
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-panel">
            <form className="form-luxury" onSubmit={handleSubmit}>
              <div className="form-header">
                <h3>Send an Enquiry</h3>
                <p>Fill out the fields below and our lighting specialists will get in touch.</p>
              </div>

              <div className="form-row">
                <label>
                  FULL NAME *
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Eleanor Vance"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  EMAIL ADDRESS *
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. eleanor@studio.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  PHONE / WHATSAPP
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+971 50 000 0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  PROJECT LOCATION
                  <input
                    type="text"
                    name="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <label>
                PROJECT TYPE
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                >
                  <option value="">Select project type</option>
                  <option value="Private Residence">Private Residence</option>
                  <option value="Hotel / Hospitality">Hotel / Hospitality</option>
                  <option value="Restaurant / Dining">Restaurant / Dining</option>
                  <option value="Retail Boutique">Retail Boutique</option>
                  <option value="Commercial HQ">Commercial HQ</option>
                  <option value="Custom Lighting Solution">Custom Lighting Solution</option>
                </select>
              </label>

              <label>
                MESSAGE & REQUIREMENTS *
                <textarea
                  rows="5"
                  name="message"
                  placeholder="Tell us about your space, dimensions, design stage, or specific fixture inquiries..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </label>

              <button
                type="submit"
                className="btn btn-gold btn-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-icon" /> PROCESSING ENQUIRY...
                  </>
                ) : (
                  <>
                    SEND ENQUIRY <ArrowUpRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
