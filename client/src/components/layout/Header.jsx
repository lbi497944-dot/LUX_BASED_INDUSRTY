import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, Heart } from 'lucide-react';
import LightingFinder from '../sections/LightingFinder';
import { getSavedProductIds } from '../../utils/savedProducts';
import { useSettings } from '../../context/SettingsContext';

const navLinks = [
  { label: 'HOME', path: '/' },
  { label: 'COLLECTIONS', path: '/collections' },
  { label: 'PORTFOLIO', path: '/portfolio' },
  { label: 'ABOUT', path: '/about' },
  { label: 'CONTACT', path: '/contact' },
];

export default function Header() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLogoError(false);
  }, [settings?.logo]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync saved count
  useEffect(() => {
    const updateSaved = () => {
      setSavedCount(getSavedProductIds().length);
    };
    updateSaved();
    window.addEventListener('veloura_saved_updated', updateSaved);
    return () => window.removeEventListener('veloura_saved_updated', updateSaved);
  }, []);

  // Close mobile menu on route change & unlock scroll
  useEffect(() => {
    setOpen(false);
    document.body.style.overflow = '';
  }, [location]);

  // Lock background scroll when mobile menu is open & listen for Escape key
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <LightingFinder isOpen={isFinderOpen} onClose={() => setIsFinderOpen(false)} />

      <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="nav-wrap">
          <Link className="logo" to="/" aria-label={`${settings?.brandName || 'LUX BASED INDUSTRY'} Home`}>
            {!logoError && settings?.logo ? (
              <img
                src={settings.logo}
                alt={settings.brandName || 'LUX BASED INDUSTRY'}
                className="logo-img"
                onError={() => setLogoError(true)}
              />
            ) : (
              <>
                <span className="logo-main">{settings?.brandName || 'LUX BASED INDUSTRY'}</span>
                <small className="logo-sub">{settings?.tagline || 'ARCHITECTURAL LIGHTING'}</small>
              </>
            )}
          </Link>

          <nav className="desktop-nav" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {link.label}
              </NavLink>
            ))}

            <button
              className="nav-finder-btn"
              onClick={() => setIsFinderOpen(true)}
              aria-label="Open Lighting Finder wizard"
            >
              <Sparkles size={13} /> FIND YOUR LIGHTING
            </button>

            {savedCount > 0 && (
              <span className="nav-saved-badge" title={`${savedCount} saved products`}>
                <Heart size={14} fill="var(--gold)" color="var(--gold)" />
                <small>{savedCount}</small>
              </span>
            )}

            <Link className="nav-cta" to="/consultation">
              BOOK CONSULTATION
            </Link>
          </nav>

          <button
            className="menu-btn"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={open}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {open && (
          <div className="mobile-nav-overlay" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
            <nav className="mobile-nav-content">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  {link.label}
                </NavLink>
              ))}

              <button
                className="mobile-finder-btn"
                onClick={() => {
                  setOpen(false);
                  setIsFinderOpen(true);
                }}
              >
                <Sparkles size={16} /> LIGHTING FINDER WIZARD
              </button>

              <Link
                className="mobile-cta"
                to="/consultation"
                onClick={() => setOpen(false)}
              >
                BOOK CONSULTATION
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
