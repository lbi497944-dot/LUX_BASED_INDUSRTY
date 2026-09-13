import { useMemo } from 'react';

/**
 * Public Client Partners Presentation Component
 * Supports:
 * - 0 partners: returns null (zero DOM footprint, zero gap)
 * - 1 partner: centered static luxury presentation without duplication
 * - 2 partners: balanced side-by-side static presentation without duplication
 * - 3+ partners: seamless continuous GPU-accelerated CSS marquee with hover pause and edge fade
 * - Respects @media (prefers-reduced-motion: reduce)
 */
export default function ClientPartnersMarquee({ partners = [] }) {
  // 1. Zero Partners Guard: absolutely no markup, margin, or empty space
  if (!Array.isArray(partners) || partners.length === 0) {
    return null;
  }

  // Filter only active partners with valid logos
  const activePartners = useMemo(() => {
    return partners
      .filter((p) => p && p.isActive !== false && p.logo && typeof p.logo === 'string')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [partners]);

  if (activePartners.length === 0) {
    return null;
  }

  // Render a single partner logo item with accessible links and alt text
  const renderPartnerItem = (partner, keyPrefix = '') => {
    const key = `${keyPrefix}-${partner._id || partner.id || partner.name}`;
    const imageNode = (
      <img
        src={partner.logo}
        alt={`${partner.name} logo`}
        className="partner-logo-img"
        loading="lazy"
        decoding="async"
      />
    );

    if (partner.website && typeof partner.website === 'string' && partner.website.trim()) {
      return (
        <a
          key={key}
          href={partner.website.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="partner-logo-item partner-logo-link"
          aria-label={`Visit ${partner.name} official website`}
          title={partner.name}
        >
          {imageNode}
        </a>
      );
    }

    return (
      <div key={key} className="partner-logo-item partner-logo-static" title={partner.name}>
        {imageNode}
      </div>
    );
  };

  // 2. Single Partner UX: Restrained luxury centered presentation
  if (activePartners.length === 1) {
    const partner = activePartners[0];
    return (
      <section
        className="client-partners-section client-partners-single"
        aria-label="Client Partners"
      >
        <div className="container">
          <span className="client-partners-eyebrow">TRUSTED BY ARCHITECTURAL LEADERS</span>
          <div className="partner-single-container">
            {renderPartnerItem(partner, 'single')}
          </div>
        </div>
      </section>
    );
  }

  // 3. Two Partners UX: Balanced side-by-side centered presentation
  if (activePartners.length === 2) {
    return (
      <section
        className="client-partners-section client-partners-dual"
        aria-label="Client Partners"
      >
        <div className="container">
          <span className="client-partners-eyebrow">TRUSTED BY ARCHITECTURAL LEADERS</span>
          <div className="partner-dual-container">
            {activePartners.map((partner) => renderPartnerItem(partner, 'dual'))}
          </div>
        </div>
      </section>
    );
  }

  // 4. Three or more Partners: Infinite smooth continuous CSS Marquee
  return (
    <section
      className="client-partners-section client-partners-marquee"
      aria-label="Client Partners"
    >
      <div className="container">
        <span className="client-partners-eyebrow">TRUSTED BY ARCHITECTURAL LEADERS</span>
      </div>

      <div className="marquee-wrapper">
        <div className="marquee-track" aria-hidden="false">
          {/* Primary Sequence */}
          <div className="marquee-group">
            {activePartners.map((partner) => renderPartnerItem(partner, 'primary'))}
          </div>

          {/* Seamless Duplicate Sequence for 100% continuous wrap */}
          <div className="marquee-group" aria-hidden="true">
            {activePartners.map((partner) => renderPartnerItem(partner, 'duplicate'))}
          </div>
        </div>
      </div>
    </section>
  );
}
