import { Link } from 'react-router-dom';
import { Download, ArrowUpRight } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { siteConfig } from '../../seo/seoConfig';

export default function CatalogueCTA({ content = {} } = {}) {
  const { settings } = useSettings();
  const effectiveCatalogueUrl = (content?.primaryBtnUrl || settings?.catalogueUrl || siteConfig.catalogueUrl || '').trim();

  // Valid real catalogue: MUST be an explicit external HTTP/HTTPS URL
  const hasRealCatalogue =
    effectiveCatalogueUrl.startsWith('http://') || effectiveCatalogueUrl.startsWith('https://');

  const eyebrow = content?.eyebrow || '2026 ARCHITECTURAL SPECIFICATION';
  const heading = content?.heading || 'Explore The 2026 Collection';
  const body =
    content?.body ||
    'Request our comprehensive luminaire catalogue and architectural specification guide featuring technical dimensions, photometrics, material patinas, and installation guidelines for interior designers and architects.';
  const btnText =
    content?.primaryBtnText || (hasRealCatalogue ? 'DOWNLOAD CATALOGUE (PDF)' : 'REQUEST SPECIFICATION CATALOGUE');

  return (
    <section className="section catalogue-cta-section">
      <div className="container">
        <div className="catalogue-banner-inner">
          <div className="catalogue-copy">
            <span className="eyebrow gold-label">{eyebrow}</span>
            <h2>{heading}</h2>
            <p>{body}</p>
          </div>
          <div className="catalogue-action">
            {hasRealCatalogue ? (
              <a
                href={effectiveCatalogueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
              >
                <Download size={18} /> {btnText} <ArrowUpRight size={16} />
              </a>
            ) : (
              <Link
                to={content?.primaryBtnUrl || '/consultation'}
                className="btn btn-gold"
                title="Request 2026 Architectural Specification Catalogue via Private Consultation"
              >
                <Download size={18} /> {btnText} <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
