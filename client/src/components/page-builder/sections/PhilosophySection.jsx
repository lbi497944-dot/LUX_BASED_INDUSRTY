import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PhilosophySection({ content = {}, context = {} }) {
  const eyebrow = content?.eyebrow || 'OUR PHILOSOPHY';
  const heading = content?.heading || 'Crafted to Inspire.';
  const italicHeading = content?.italicHeading !== undefined ? content.italicHeading : 'Designed to Endure.';
  const brandName = context?.settings?.brandName || 'LUX BASED INDUSTRY';
  const defaultBody = `${brandName} approaches illumination as an architectural discipline. We fuse technical optical precision with hand-finished craftsmanship to shape mood, accentuate texture, and elevate extraordinary residential and hospitality spaces worldwide.`;
  const body = content?.body || defaultBody;
  const primaryBtnText = content?.primaryBtnText || 'VIEW OUR COLLECTIONS';
  const primaryBtnUrl = content?.primaryBtnUrl || '/collections';

  const isExternalUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url.trim());
  const isSafeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const sanitized = url.trim().replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();
    return !sanitized.startsWith('javascript:') && !sanitized.startsWith('data:') && !sanitized.startsWith('vbscript:');
  };

  return (
    <section className="section philosophy-section" id="philosophy">
      <div className="container">
        <div className="editorial-split">
          <div className="editorial-left">
            <span className="eyebrow gold-label">{eyebrow}</span>
            <h2 className="editorial-heading">
              {heading}
              {italicHeading ? (
                <>
                  <br />
                  <em>{italicHeading}</em>
                </>
              ) : null}
            </h2>
          </div>
          <div className="editorial-right">
            <p className="editorial-body">{body}</p>
            {primaryBtnText && isSafeUrl(primaryBtnUrl) && (
              isExternalUrl(primaryBtnUrl) ? (
                <a className="text-link-gold" href={primaryBtnUrl} target="_blank" rel="noopener noreferrer">
                  {primaryBtnText} <ArrowRight size={16} />
                </a>
              ) : (
                <Link className="text-link-gold" to={primaryBtnUrl}>
                  {primaryBtnText} <ArrowRight size={16} />
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
