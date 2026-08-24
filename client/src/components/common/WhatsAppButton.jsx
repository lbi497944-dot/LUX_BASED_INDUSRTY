import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { siteConfig, getWhatsAppLink } from '../../seo/seoConfig';

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('veloura_wa_tooltip_dismissed');
    if (isDismissed) return;

    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e) => {
    e.stopPropagation();
    setShowTooltip(false);
    sessionStorage.setItem('veloura_wa_tooltip_dismissed', 'true');
  };

  const whatsappUrl = getWhatsAppLink();

  return (
    <div className="whatsapp-floating-container">
      {/* 3-Second Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="whatsapp-tooltip"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="tooltip-close-btn" onClick={handleDismiss} aria-label="Dismiss message">
              <X size={14} />
            </button>
            <span className="tooltip-eyebrow">PRIVATE CONSULTATION</span>
            <p className="tooltip-message">
              Need help choosing your lighting?<br />
              <strong>Chat with our design consultant.</strong>
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tooltip-chat-link"
              onClick={handleDismiss}
            >
              CHAT ON WHATSAPP <ArrowRight size={14} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Chat with Veloura Lighting on WhatsApp for private consultation"
      >
        <svg
          className="whatsapp-icon-svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="#25D366" stroke="#25D366"/>
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1zm4 3.5a3.5 3.5 0 0 1-3.5-3.5" stroke="#ffffff" strokeWidth="1.5"/>
        </svg>
      </a>
    </div>
  );
}
