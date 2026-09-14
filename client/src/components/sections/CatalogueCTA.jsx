import { Link } from 'react-router-dom';
import { Download, ArrowUpRight, MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { siteConfig, getCatalogueWhatsAppMessage, getCatalogueDownloadUrl } from '../../seo/seoConfig';

export default function CatalogueCTA({ content = {} } = {}) {
  const { settings } = useSettings();

  // The global catalogue system is AUTHORITATIVE.
  // Page Builder primaryBtnUrl or legacy settings.catalogueUrl must NOT override the active state or inject stale URLs.
  const globalCatalogueUrl = (settings?.catalogue?.url || '').trim();
  const isVelouraUrl = /veloura/i.test(globalCatalogueUrl);
  const hasRealCatalogue = Boolean(
    globalCatalogueUrl &&
    !isVelouraUrl &&
    (globalCatalogueUrl.startsWith('http://') || globalCatalogueUrl.startsWith('https://'))
  );

  const rawFilename = settings?.catalogue?.originalFilename || 'LUX_BASED_INDUSTRY_Catalogue_2026.pdf';
  const downloadUrl = hasRealCatalogue ? getCatalogueDownloadUrl(globalCatalogueUrl, rawFilename) : '';

  // WhatsApp concierge destination & prefilled message
  const cleanNumber = (settings?.whatsappNumberClean || settings?.whatsapp || siteConfig.whatsAppNumber || '').replace(/[^0-9]/g, '');
  const brandName = settings?.brandName || 'LUX BASED INDUSTRY';
  const whatsappMsg = getCatalogueWhatsAppMessage(brandName);
  const whatsappUrl = cleanNumber ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMsg)}` : '';

  const eyebrow = content?.eyebrow || '2026 ARCHITECTURAL SPECIFICATION';
  const heading = content?.heading || 'Explore The 2026 Collection';
  const body =
    content?.body ||
    'Request our comprehensive luminaire catalogue and architectural specification guide featuring technical dimensions, photometrics, material patinas, and installation guidelines for interior designers and architects.';

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
                href={downloadUrl}
                download={rawFilename}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
                title={`Download ${rawFilename}`}
              >
                <Download size={18} /> {content?.primaryBtnText || 'DOWNLOAD CATALOGUE (PDF)'} <ArrowUpRight size={16} />
              </a>
            ) : whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
                title="Request official architectural catalogue via WhatsApp Concierge"
              >
                <MessageCircle size={18} /> {content?.primaryBtnText || 'REQUEST CATALOGUE ON WHATSAPP'} <ArrowUpRight size={16} />
              </a>
            ) : (
              <Link
                to="/contact"
                className="btn btn-gold"
                title="Contact our studio to request the 2026 specification catalogue"
              >
                <Download size={18} /> {content?.primaryBtnText || 'REQUEST SPECIFICATION CATALOGUE'} <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
