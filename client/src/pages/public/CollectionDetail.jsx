import { useState, useEffect } from 'react';
import { useParams as useReactParams, Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Shield, Layers, Settings, MessageCircle } from 'lucide-react';
import { collections as fallbackCollections, products as fallbackProducts, images } from '../../data/site';
import { collectionService } from '../../services/collectionService';
import { productService } from '../../services/productService';
import PageHero from '../../components/sections/PageHero';
import SectionTitle from '../../components/sections/SectionTitle';
import Reveal from '../../components/sections/Reveal';
import SEO from '../../components/common/SEO';
import { getWhatsAppLink, getCollectionWhatsAppMessage, getProductWhatsAppMessage } from '../../seo/seoConfig';

export default function CollectionDetail() {
  const { slug } = useReactParams();
  const fallbackCol = fallbackCollections.find((c) => c.slug === slug) || fallbackCollections[0];
  const [collection, setCollection] = useState(fallbackCol);
  const [relatedProducts, setRelatedProducts] = useState(
    fallbackProducts.filter((p) => p.collectionSlug === fallbackCol.slug).slice(0, 4)
  );

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        const colRes = await collectionService.getCollectionBySlug(slug);
        if (colRes.data?.collection) {
          setCollection(colRes.data.collection);
        }

        const prodRes = await productService.getProducts({ collection: slug });
        if (prodRes.data?.length) {
          setRelatedProducts(prodRes.data.slice(0, 4));
        }
      } catch {
        // Retain fallback
      }
    };

    fetchCollectionData();
  }, [slug]);

  const collectionTitle = collection.name || collection.title;
  const collectionImage = collection.heroImage || collection.image;
  const collectionWhatsAppUrl = getWhatsAppLink(getCollectionWhatsAppMessage(collectionTitle));

  return (
    <main className="collection-detail-page">
      <SEO
        title={`${collectionTitle} | Veloura Lighting Dubai`}
        description={`${collectionTitle} — ${collection.description}`}
        canonical={`/collections/${collection.slug}`}
      />

      <PageHero
        eyebrow={collection.eyebrow}
        title={collectionTitle}
        description={collection.description}
        image={collectionImage}
      />

      {/* Intro / Technical Specifications Section */}
      <section className="section">
        <div className="container">
          <div className="detail-split-overview">
            <div className="detail-left-copy">
              <SectionTitle
                eyebrow="ARCHITECTURAL INTENT"
                title={collection.tagline}
                description="Designed in collaboration with lighting designers and master craftsmen, every luminaire in this collection undergoes rigorous thermal, optical, and mechanical refinement."
              />

              <div className="collection-cta-group">
                <a
                  href={collectionWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  <MessageCircle size={18} /> DISCUSS THIS COLLECTION ON WHATSAPP
                </a>

                <Link className="btn btn-gold" to="/consultation">
                  REQUEST A QUOTE <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            <div className="detail-right-specs">
              <div className="spec-card">
                <div className="spec-header">
                  <Settings size={20} className="gold-icon" />
                  <h4>Technical Characteristics</h4>
                </div>
                <ul className="spec-list">
                  {collection.features?.map((feat, i) => (
                    <li key={i}>
                      <CheckCircle2 size={16} className="gold-icon" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="spec-card">
                <div className="spec-header">
                  <Layers size={20} className="gold-icon" />
                  <h4>Materials & Finishes</h4>
                </div>
                <p className="spec-text">{collection.materials}</p>
              </div>

              <div className="spec-card">
                <div className="spec-header">
                  <Shield size={20} className="gold-icon" />
                  <h4>Recommended Applications</h4>
                </div>
                <p className="spec-text">{collection.applications}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Range / Products Grid */}
      <section className="section dark-section">
        <div className="container">
          <SectionTitle
            eyebrow="COLLECTION HIGHLIGHTS"
            title="Featured Luminaires & Specifications"
            description="Explore selected forms within this collection. Sizes, drops, and metal patinas can be customized to project dimensions."
          />

          <div className="product-grid-luxury">
            {relatedProducts.map((prod, idx) => {
              const productWhatsAppUrl = getWhatsAppLink(getProductWhatsAppMessage(prod.name));
              return (
                <Reveal key={prod.id} delay={idx * 0.1}>
                  <div className="product-card-luxury detail-product-card">
                    <div className="product-image-frame">
                      <img src={prod.image} alt={`Veloura ${prod.name} ${prod.category}`} loading="lazy" decoding="async" />
                    </div>
                    <div className="product-info">
                      <small className="product-category">{prod.category}</small>
                      <h3 className="product-name">{prod.name}</h3>
                      <p className="product-desc">{prod.description}</p>
                      {prod.specs && <p className="product-specs">{prod.specs}</p>}

                      <div className="product-card-actions">
                        <a
                          href={productWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-link-whatsapp"
                        >
                          <MessageCircle size={14} /> ASK ON WHATSAPP
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Editorial Photo Gallery */}
      <section className="section gallery-section">
        <div className="container">
          <SectionTitle
            eyebrow="IN SITU GALLERY"
            title="Lighting in Extraordinary Spaces"
            align="center"
          />

          <div className="gallery-grid">
            <div className="gallery-item large">
              <img src={images.villa} alt="Luxury Villa Architectural Lighting" loading="lazy" decoding="async" />
            </div>
            <div className="gallery-item">
              <img src={images.hotel} alt="Luxury Hotel Lobby Chandelier" loading="lazy" decoding="async" />
            </div>
            <div className="gallery-item">
              <img src={images.restaurant} alt="Fine Dining Ambient Lighting" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-dark">
        <div className="container cta-container-split">
          <div className="cta-text-side">
            <span className="eyebrow">CONSULTATION & SPECIFICATION</span>
            <h2>Bring {collectionTitle} to Your Project</h2>
            <p>Speak directly with our architectural lighting team for sample boxes, CAD files, or custom finish consultations.</p>
            <div className="cta-buttons-row">
              <a
                href={collectionWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={18} /> DISCUSS ON WHATSAPP
              </a>
              <Link className="btn btn-gold" to="/consultation">
                REQUEST A QUOTE <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <div className="cta-image-side" style={{ backgroundImage: `url(${collectionImage})` }} />
        </div>
      </section>
    </main>
  );
}
