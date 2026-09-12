import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionTitle from '../../sections/SectionTitle';
import Reveal from '../../sections/Reveal';
import { images, collections as fallbackCollections } from '../../../data/site';

export default function CollectionsFeedSection({ content = {}, context = {} }) {
  const eyebrow = content?.eyebrow || 'OUR COLLECTIONS';
  const heading = content?.heading || 'Lighting Designed Around Extraordinary Spaces.';
  const collectionsList = Array.isArray(context?.collections) && context.collections.length > 0
    ? context.collections
    : fallbackCollections;

  return (
    <section className="section collections-section">
      <div className="container">
        <SectionTitle
          eyebrow={eyebrow}
          title={heading}
        />
        <div className="collection-grid-large">
          {collectionsList.slice(0, 3).map((item, idx) => {
            const collectionKey = item._id || item.id || item.slug || `collection-${idx}`;
            return (
              <Reveal key={collectionKey} delay={idx * 0.15}>
                <Link className="collection-card-luxury" to={`/collections/${item.slug}`}>
                  <img
                    src={item.heroImage || item.image || images.chandelier}
                    alt={`${item.title || item.name} Collection`}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (e.target.src !== images.chandelier) {
                        e.target.src = images.chandelier;
                      }
                    }}
                  />
                  <div className="card-overlay-luxury">
                    <span className="card-number">0{idx + 1}</span>
                    <h3 className="card-title">{item.title || item.name}</h3>
                    <p className="card-tagline">{item.tagline}</p>
                    <div className="card-arrow-circle">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
