import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionTitle from '../../sections/SectionTitle';
import Reveal from '../../sections/Reveal';
import { images } from '../../../data/site';

const defaultFeaturedProjects = [
  {
    title: 'PRIVATE RESIDENCE',
    location: 'Dubai, UAE',
    image: images.villa,
    category: 'Residential',
  },
  {
    title: 'THE GRAND HOTEL',
    location: 'Doha, Qatar',
    image: images.hotel,
    category: 'Hospitality',
  },
  {
    title: 'LUXURY VILLA',
    location: 'Abu Dhabi, UAE',
    image: images.living,
    category: 'Residential',
  },
  {
    title: 'FINE DINING RESTAURANT',
    location: 'Dubai, UAE',
    image: images.restaurant,
    category: 'Dining',
  },
];

export default function ProjectsFeedSection({ content = {}, context = {} }) {
  const eyebrow = content?.eyebrow || 'FEATURED PROJECTS';
  const heading = content?.heading || 'Transforming Spaces Across the World';
  const primaryBtnText = content?.primaryBtnText || 'VIEW ALL PROJECTS';
  const primaryBtnUrl = content?.primaryBtnUrl || '/portfolio';
  const brandName = context?.settings?.brandName || 'LUX BASED INDUSTRY';

  const projectsList = Array.isArray(context?.projects) && context.projects.length > 0
    ? context.projects
    : defaultFeaturedProjects;

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
    <section className="section projects-section">
      <div className="container">
        <div className="section-head-row">
          <SectionTitle
            eyebrow={eyebrow}
            title={heading}
          />
          {renderLink('text-link-gold desktop-only-link', primaryBtnText)}
        </div>

        <div className="projects-grid-editorial">
          {projectsList.map((proj, idx) => {
            const projectKey = proj._id || proj.id || proj.slug || proj.title || `project-${idx}`;
            const coverImage = proj.coverImage || proj.image || images.hotel;
            const projectUrl = proj.slug ? `/portfolio/${proj.slug}` : '/portfolio';

            return (
              <Reveal key={projectKey} delay={idx * 0.12}>
                <Link className="project-card-luxury" to={projectUrl}>
                  <div className="project-image-box">
                    <img
                      src={coverImage}
                      alt={`${brandName} Project - ${proj.title || 'Project'} in ${proj.location || 'Global'}`}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (e.target.src !== images.hotel) {
                          e.target.src = images.hotel;
                        }
                      }}
                    />
                    <div className="project-overlay-content">
                      <small>{proj.location || 'Global'}</small>
                      <h3>{proj.title || 'Architectural Project'}</h3>
                    </div>
                  </div>
                </Link>
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
