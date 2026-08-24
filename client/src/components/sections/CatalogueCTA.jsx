import { Download, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../../seo/seoConfig';

export default function CatalogueCTA() {
  return (
    <section className="section catalogue-cta-section">
      <div className="container">
        <div className="catalogue-banner-inner">
          <div className="catalogue-copy">
            <span className="eyebrow gold-label">2026 ARCHITECTURAL SPECIFICATION</span>
            <h2>Explore The 2026 Collection</h2>
            <p>Download our comprehensive luminaire catalogue featuring technical dimensions, photometrics, material patinas, and installation guidelines for interior designers and architects.</p>
          </div>
          <div className="catalogue-action">
            <a
              href={siteConfig.catalogueUrl}
              download="Veloura_Lighting_2026_Catalogue.pdf"
              className="btn btn-gold"
              onClick={(e) => {
                if (!siteConfig.catalogueUrl || siteConfig.catalogueUrl.includes('.pdf')) {
                  // Standard download link behavior
                }
              }}
            >
              <Download size={18} /> DOWNLOAD CATALOGUE (PDF) <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
