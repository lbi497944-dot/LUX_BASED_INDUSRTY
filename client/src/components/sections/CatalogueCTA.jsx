import { Link } from 'react-router-dom';
import { Download, ArrowUpRight } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { siteConfig } from '../../seo/seoConfig';

export default function CatalogueCTA() {
  const { settings } = useSettings();
  const effectiveCatalogueUrl = (settings?.catalogueUrl || siteConfig.catalogueUrl || '').trim();

  // Valid real catalogue: MUST be an explicit external HTTP/HTTPS URL
  const hasRealCatalogue =
    effectiveCatalogueUrl.startsWith('http://') || effectiveCatalogueUrl.startsWith('https://');

  return (
    <section className="section catalogue-cta-section">
      <div className="container">
        <div className="catalogue-banner-inner">
          <div className="catalogue-copy">
            <span className="eyebrow gold-label">2026 ARCHITECTURAL SPECIFICATION</span>
            <h2>Explore The 2026 Collection</h2>
            <p>
              Request our comprehensive luminaire catalogue and architectural specification guide featuring technical
              dimensions, photometrics, material patinas, and installation guidelines for interior designers and
              architects.
            </p>
          </div>
          <div className="catalogue-action">
            {hasRealCatalogue ? (
              <a
                href={effectiveCatalogueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
              >
                <Download size={18} /> DOWNLOAD CATALOGUE (PDF) <ArrowUpRight size={16} />
              </a>
            ) : (
              <Link
                to="/consultation"
                className="btn btn-gold"
                title="Request 2026 Architectural Specification Catalogue via Private Consultation"
              >
                <Download size={18} /> REQUEST SPECIFICATION CATALOGUE <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
