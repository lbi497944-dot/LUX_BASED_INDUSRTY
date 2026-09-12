import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { images } from '../../../data/site';

export default function SplitStorySection({ content = {}, media = {}, context = {} }) {
  const eyebrow = content?.eyebrow || 'OUR STORY';
  const heading = content?.heading || 'Crafting Light,';
  const italicHeading = content?.italicHeading !== undefined ? content.italicHeading : 'Defining Luxury';
  const brandName = context?.settings?.brandName || 'LUX BASED INDUSTRY';
  const defaultBody = `At ${brandName}, lighting is more than illumination — it is an art form. We combine craftsmanship, innovation and thoughtful design to create ambience that transforms and enriches every space.`;
  const body = content?.body || defaultBody;
  const primaryBtnText = content?.primaryBtnText || 'DISCOVER OUR STORY';
  const primaryBtnUrl = content?.primaryBtnUrl || '/about';
  const imageUrl = media?.url || images.story;

  const isExternalUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url.trim());
  const isSafeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const sanitized = url.trim().replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();
    return !sanitized.startsWith('javascript:') && !sanitized.startsWith('data:') && !sanitized.startsWith('vbscript:');
  };

  return (
    <section className="split-story-section">
      <div className="story-split-container">
        <div
          className="story-image-panel"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="story-content-panel">
          <span className="eyebrow">{eyebrow}</span>
          <h2>
            {heading}
            {italicHeading ? (
              <>
                <br />
                <em>{italicHeading}</em>
              </>
            ) : null}
          </h2>
          <p>{body}</p>
          {primaryBtnText && isSafeUrl(primaryBtnUrl) && (
            isExternalUrl(primaryBtnUrl) ? (
              <a className="btn btn-gold-outline" href={primaryBtnUrl} target="_blank" rel="noopener noreferrer">
                {primaryBtnText} <ArrowRight size={16} />
              </a>
            ) : (
              <Link className="btn btn-gold-outline" to={primaryBtnUrl}>
                {primaryBtnText} <ArrowRight size={16} />
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}
