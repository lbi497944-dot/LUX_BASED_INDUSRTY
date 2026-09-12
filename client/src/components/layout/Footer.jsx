import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Loader2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { newsletterService } from '../../services/newsletterService';
import { companyContact } from '../../data/site';
import Toast from '../common/Toast';

export default function Footer() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [settings?.logo]);

  const luxTapCount = useRef(0);
  const luxTapTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (luxTapTimer.current) {
        clearTimeout(luxTapTimer.current);
      }
    };
  }, []);

  const handleLuxTap = () => {
    luxTapCount.current += 1;

    if (luxTapTimer.current) {
      clearTimeout(luxTapTimer.current);
    }

    if (luxTapCount.current === 3) {
      luxTapCount.current = 0;
      navigate('/admin/login');
      return;
    }

    luxTapTimer.current = setTimeout(() => {
      luxTapCount.current = 0;
    }, 1500);
  };

  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setToast({
        type: 'error',
        title: 'Subscription Error',
        message: 'Please provide a valid email address.'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await newsletterService.subscribe(email, 'footer');
      setToast({
        type: 'success',
        title: 'Subscribed Successfully',
        message: res.message || `Thank you for subscribing to ${settings?.brandName || 'LUX BASED INDUSTRY'} updates.`
      });
      setEmail('');
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Subscription Error',
        message: err?.message || 'Unable to complete subscription at this time.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <footer className="footer">
        <div className="footer-main">
          {/* Brand Col */}
          <div className="footer-brand">
            <Link className="logo footer-logo" to="/" aria-label={`${settings?.brandName || 'LUX BASED INDUSTRY'} Home`}>
              {!logoError && settings?.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.brandName || 'LUX BASED INDUSTRY'}
                  className="logo-img footer-logo-img"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <>
                  <span className="logo-main">{settings?.brandName || 'LUX BASED INDUSTRY'}</span>
                  <small className="logo-sub">{settings?.tagline || 'ARCHITECTURAL LIGHTING'}</small>
                </>
              )}
            </Link>
            <p className="footer-tagline">{settings?.tagline || 'Illuminating Luxury Spaces.'}</p>
            <p className="footer-desc">
              Bespoke architectural lighting solutions for spaces that command extraordinary detail and timeless elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>QUICK LINKS</h4>
            <Link to="/">Home</Link>
            <Link to="/collections">Collections</Link>
            <Link to="/portfolio">Portfolio</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>

          {/* Collections */}
          <div className="footer-col">
            <h4>COLLECTIONS</h4>
            <Link to="/collections/grand-chandeliers">Grand Chandelier</Link>
            <Link to="/collections/architectural-pendants">Architectural Pendants</Link>
            <Link to="/collections/smart-ambient-systems">Smart Ambient Systems</Link>
            <Link to="/collections/wall-lighting">Wall Lighting</Link>
            <Link to="/collections/custom-solutions">Custom Solutions</Link>
          </div>

          {/* Contact & Socials */}
          <div className="footer-col">
            <h4>CONTACT</h4>
            <p className="contact-address">{(settings?.address && settings.address.trim()) || companyContact.address}</p>
            <a href={`mailto:${(settings?.email && settings.email.trim()) || companyContact.email}`} className="footer-contact-link">
              {(settings?.email && settings.email.trim()) || companyContact.email}
            </a>
            <a href={`tel:${(settings?.phone && settings.phone.trim()) || companyContact.phone}`} className="footer-contact-link">
              {(settings?.phone && settings.phone.trim()) || companyContact.phone}
            </a>
            <a 
              href={`https://wa.me/${(settings.whatsappNumberClean || settings.whatsapp || '').replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-whatsapp"
            >
              <MessageCircle size={14} /> WhatsApp Consultation
            </a>

            <div className="footer-socials">
              <span className="social-label">FOLLOW US</span>
              <div className="social-icons">
                <a href={settings.socialLinks?.instagram || 'https://instagram.com'} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href={settings.socialLinks?.linkedin || 'https://linkedin.com'} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href={settings.socialLinks?.pinterest || 'https://pinterest.com'} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="22"/>
                    <path d="M12 2a9 9 0 0 0-9 9c0 3.8 2.3 7 5.5 8.3-.1-.7-.2-1.8 0-2.6l1-4.2s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.2-.9 3.4-.2 1.1.5 2 1.6 2 2 0 3.5-2.1 3.5-5.1 0-2.7-1.9-4.6-4.7-4.6-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 1 2.6.1.1.1.2.1.3l-.3 1.4c0 .2-.2.3-.4.2-1.4-.7-2.3-2.8-2.3-4.5 0-3.7 2.7-7.1 7.8-7.1 4.1 0 7.3 2.9 7.3 6.8 0 4.1-2.6 7.4-6.2 7.4-1.2 0-2.3-.6-2.7-1.4l-.7 2.8c-.3 1.1-1.1 2.5-1.6 3.4"/>
                  </svg>
                </a>
                <a href={settings.socialLinks?.facebook || 'https://facebook.com'} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Bar */}
        <div className="footer-newsletter">
          <div className="container newsletter-inner">
            <div className="newsletter-text">
              <h4>NEWSLETTER</h4>
              <p>Stay updated with our latest collections and architectural lighting insights.</p>
            </div>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address for newsletter"
              />
              <button type="submit" className="newsletter-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin-icon" /> SUBSCRIBING...
                  </>
                ) : (
                  <>
                    SUBSCRIBE <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <span>
              © {currentYear} <span className="lux-trigger" onClick={handleLuxTap}>LUX</span> BASED INDUSTRY. All Rights Reserved.
            </span>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <span className="legal-sep">•</span>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
