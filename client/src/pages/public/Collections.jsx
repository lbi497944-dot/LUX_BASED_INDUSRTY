import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { collections as fallbackCollections, images } from '../../data/site';
import { collectionService } from '../../services/collectionService';
import PageHero from '../../components/sections/PageHero';
import Reveal from '../../components/sections/Reveal';
import SectionTitle from '../../components/sections/SectionTitle';
import SEO from '../../components/common/SEO';
import { pageSeoData } from '../../seo/seoConfig';
import { useSettings } from '../../context/SettingsContext';

export default function Collections() {
  const { settings } = useSettings();
  const brand = settings?.brandName || 'LUX BASED INDUSTRY';
  const [collections, setCollections] = useState(fallbackCollections);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await collectionService.getCollections();
        if (res.data?.length) {
          setCollections(res.data);
        }
      } catch {
        // Retain fallback
      }
    };

    fetchCollections();
  }, []);

  return (
    <main className="collections-page">
      <SEO
        title={pageSeoData.collections.title}
        description={pageSeoData.collections.description}
        canonical="/collections"
      />

      <PageHero
        eyebrow="OUR COLLECTIONS"
        title="Lighting Without Compromise."
        description="Explore a refined portfolio of sculptural chandeliers, architectural pendants, and intelligent ambient systems designed for extraordinary spaces."
        image={images.chandelier}
      />

      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="PORTFOLIO CATEGORIES"
            title="Curated Architectural Collections"
            description={`From statement centerpiece chandeliers to quiet plaster-in cove details, every ${brand} collection balances proportion, materiality, and light quality.`}
          />

          <div className="collections-editorial-list">
            {collections.map((item, idx) => {
              const title = item.name || item.title;
              const img = item.heroImage || item.image;
              return (
                <Reveal key={item._id || item.id || item.slug || `col-${idx}`} delay={idx * 0.1}>
                  <Link to={`/collections/${item.slug}`} className="collection-editorial-row">
                    <div className="row-index">0{idx + 1}</div>
                    <div className="row-image-frame">
                      <img src={img} alt={`${brand} ${title} Collection`} loading="lazy" decoding="async" />
                    </div>
                    <div className="row-copy-frame">
                      <span className="eyebrow">{item.eyebrow}</span>
                      <h2>{title}</h2>
                      <p className="row-tagline">{item.tagline}</p>
                      <p className="row-desc">{item.description}</p>
                      <span className="text-link-gold">
                        EXPLORE COLLECTION <ArrowRight size={16} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="cta-section-dark">
        <div className="container cta-container-split">
          <div className="cta-text-side">
            <span className="eyebrow">BESPOKE LIGHTING</span>
            <h2>Require a Custom Fixture Specification?</h2>
            <p>Our lighting architects develop tailor-made fixtures for private estates, super-yachts, and flagship commercial spaces.</p>
            <Link className="btn btn-gold" to="/consultation">
              REQUEST A QUOTE
            </Link>
          </div>
          <div className="cta-image-side" style={{ backgroundImage: `url(${images.custom})` }} />
        </div>
      </section>
    </main>
  );
}
