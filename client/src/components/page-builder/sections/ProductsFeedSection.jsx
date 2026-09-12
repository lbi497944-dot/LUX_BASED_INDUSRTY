import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import SectionTitle from '../../sections/SectionTitle';
import Reveal from '../../sections/Reveal';
import { images, products as fallbackProducts } from '../../../data/site';

export default function ProductsFeedSection({ content = {}, context = {} }) {
  const eyebrow = content?.eyebrow || 'SIGNATURE PIECES';
  const heading = content?.heading || 'Iconic Designs. Unmatched Brilliance.';
  const primaryBtnText = content?.primaryBtnText || 'VIEW ALL PRODUCTS';
  const primaryBtnUrl = content?.primaryBtnUrl || '/collections';
  const productsList = Array.isArray(context?.products) && context.products.length > 0
    ? context.products
    : fallbackProducts;
  const savedIds = Array.isArray(context?.savedIds) ? context.savedIds : [];
  const handleToggleHeart = context?.handleToggleHeart || (() => {});

  const isExternalUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url.trim());
  const isSafeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const sanitized = url.trim().replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();
    return !sanitized.startsWith('javascript:') && !sanitized.startsWith('data:') && !sanitized.startsWith('vbscript:');
  };

  const renderLink = (className, text) => {
    if (!text || !isSafeUrl(primaryBtnUrl)) return null;
    return isExternalUrl(primaryBtnUrl) ? (
      <a className={className} href={primaryBtnUrl} target="_blank" rel="noopener noreferrer">
        {text} <ArrowRight size={16} />
      </a>
    ) : (
      <Link className={className} to={primaryBtnUrl}>
        {text} <ArrowRight size={16} />
      </Link>
    );
  };

  return (
    <section className="section dark-section">
      <div className="container">
        <div className="section-head-row">
          <SectionTitle
            eyebrow={eyebrow}
            title={heading}
          />
          {renderLink('text-link-gold desktop-only-link', primaryBtnText)}
        </div>

        <div className="product-grid-luxury">
          {productsList.map((prod, idx) => {
            const prodKey = prod._id || prod.id || prod.slug || `product-${idx}`;
            const prodId = prod._id || prod.id;
            const isSaved = savedIds.includes(prodId);
            return (
              <Reveal key={prodKey} delay={idx * 0.1}>
                <div className="product-card-luxury">
                  <Link to={`/collections/${prod.collectionSlug || ''}`}>
                    <div className="product-image-frame">
                      <img
                        src={prod.image || images.chandelier}
                        alt={`${prod.name} ${prod.category || ''}`}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          if (e.target.src !== images.chandelier) {
                            e.target.src = images.chandelier;
                          }
                        }}
                      />
                      <button
                        className={`product-save-heart ${isSaved ? 'saved' : ''}`}
                        onClick={(e) => handleToggleHeart(e, prodId)}
                        aria-label={isSaved ? `Remove ${prod.name} from saved items` : `Save ${prod.name} to saved items`}
                        title={isSaved ? 'Saved to bookmarks' : 'Save product'}
                      >
                        <Heart size={16} fill={isSaved ? 'var(--gold)' : 'none'} color={isSaved ? 'var(--gold)' : '#ffffff'} />
                      </button>
                    </div>
                    <div className="product-card-body">
                      <small className="product-category-eyebrow">{prod.category?.toUpperCase()}</small>
                      <h4>{prod.name}</h4>
                      <p className="product-finish-label">{prod.finish || prod.materials}</p>
                      <span className="product-view-action">
                        DISCOVER PIECE <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mobile-center-link">
          {renderLink('text-link-gold', primaryBtnText)}
        </div>
      </div>
    </section>
  );
}
