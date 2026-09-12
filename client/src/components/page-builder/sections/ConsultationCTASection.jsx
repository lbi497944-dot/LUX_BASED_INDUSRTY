import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { images } from '../../../data/site';

export default function ConsultationCTASection({ content = {}, media = {} }) {
  const eyebrow = content?.eyebrow || 'PRIVATE CONSULTATION';
  const heading = content?.heading || 'Bring Your Vision to Light.';
  const body = content?.body || "Let's create an extraordinary lighting experience for your space.";
  const primaryBtnText = content?.primaryBtnText || 'BOOK A CONSULTATION';
  const primaryBtnUrl = content?.primaryBtnUrl || '/consultation';
  const bgImage = media?.url || images.ambient;

  const isExternalUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url.trim());
  const isSafeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const sanitized = url.trim().replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();
    return !sanitized.startsWith('javascript:') && !sanitized.startsWith('data:') && !sanitized.startsWith('vbscript:');
  };

  return (
    <section className="cta-section-dark">
      <div className="container cta-container-split">
        <div className="cta-text-side">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{heading}</h2>
          <p>{body}</p>
          {primaryBtnText && isSafeUrl(primaryBtnUrl) && (
            isExternalUrl(primaryBtnUrl) ? (
              <a className="btn btn-gold" href={primaryBtnUrl} target="_blank" rel="noopener noreferrer">
                {primaryBtnText} <ArrowUpRight size={16} />
              </a>
            ) : (
              <Link className="btn btn-gold" to={primaryBtnUrl}>
                {primaryBtnText} <ArrowUpRight size={16} />
              </Link>
            )
          )}
        </div>
        <div
          className="cta-image-side"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      </div>
    </section>
  );
}
