import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Loader2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { newsletterService } from '../../services/newsletterService';
import { collectionService } from '../../services/collectionService';
import { companyContact } from '../../data/site';
import { getPlatformMetadata, validateSafeSocialUrl } from '../../utils/socialPlatforms';
import Toast from '../common/Toast';

export default function Footer() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [dbCollections, setDbCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCollections = async () => {
      try {
        const res = await collectionService.getCollections();
        if (isMounted && Array.isArray(res?.data) && res.data.length > 0) {
          setDbCollections(res.data.slice(0, 5));
        }
      } catch {
        // Safe neutral handling on API error
      } finally {
        if (isMounted) {
          setCollectionsLoading(false);
        }
      }
    };
    fetchCollections();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Baseline platform class fallbacks for legacy/direct mapping
  const BASELINE_CLASSES = {
    instagram: 'social-instagram',
    linkedin: 'social-linkedin',
    pinterest: 'social-pinterest',
    facebook: 'social-facebook',
  };

  const rawSocialLinks = settings?.socialLinks;
  let normalizedSocialList = [];

  if (Array.isArray(rawSocialLinks)) {
    normalizedSocialList = rawSocialLinks
      .filter(
        (item) =>
          item &&
          item.active !== false &&
          typeof item.url === 'string' &&
          item.url.trim().length > 0 &&
          validateSafeSocialUrl(item.url)
      )
      .map((item, idx) => {
        const meta = getPlatformMetadata(item.platform, item.label);
        return {
          key: item.id || `${item.platform}-${idx}`,
          label: item.label || meta.name,
          url: item.url.trim(),
          className: meta.className || BASELINE_CLASSES[item.platform] || 'social-custom',
          icon: meta.icon,
          displayOrder: Number.isFinite(item.displayOrder) ? item.displayOrder : idx,
        };
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  } else if (rawSocialLinks && typeof rawSocialLinks === 'object') {
    normalizedSocialList = Object.entries(rawSocialLinks)
      .filter(
        ([_, url]) =>
          typeof url === 'string' &&
          url.trim().length > 0 &&
          validateSafeSocialUrl(url)
      )
      .map(([platform, url], idx) => {
        const meta = getPlatformMetadata(platform);
        return {
          key: `${platform}-${idx}`,
          label: meta.name,
          url: url.trim(),
          className: meta.className || BASELINE_CLASSES[platform] || 'social-custom',
          icon: meta.icon,
          displayOrder: idx,
        };
      });
  }

  const activeSocials = normalizedSocialList.filter(
    (item) => typeof item.url === 'string' && item.url.trim().length > 0
  );

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
            {collectionsLoading ? null : dbCollections.length > 0 ? (
              dbCollections.map((col) => (
                <Link key={col._id || col.slug} to={`/collections/${col.slug}`}>
                  {col.name || col.title}
                </Link>
              ))
            ) : (
              <Link to="/collections">View All Collections</Link>
            )}
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

            {activeSocials.length > 0 && (
              <div className="footer-socials">
                <span className="social-label">FOLLOW US</span>
                <div className="social-icons">
                  {activeSocials.map((social) => (
                    <a
                      key={social.key}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`footer-social-btn ${social.className}`}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
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
