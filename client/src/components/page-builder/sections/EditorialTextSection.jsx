import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function EditorialTextSection({ content = {} }) {
  const eyebrow = content?.eyebrow;
  const heading = content?.heading;
  const italicHeading = content?.italicHeading;
  const body = content?.body;
  const alignment = content?.alignment || 'center';
  const primaryBtnText = content?.primaryBtnText;
  const primaryBtnUrl = content?.primaryBtnUrl;

  const isExternalUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url.trim());
  const isSafeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const sanitized = url.trim().replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();
    return !sanitized.startsWith('javascript:') && !sanitized.startsWith('data:') && !sanitized.startsWith('vbscript:');
  };

  return (
    <section className="section editorial-text-section">
      <div className="container" style={{ maxWidth: '840px', margin: '0 auto', textAlign: alignment }}>
        {eyebrow && <span className="eyebrow gold-label" style={{ display: 'block', marginBottom: '1rem' }}>{eyebrow}</span>}
        {heading && (
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.2, marginBottom: '1.5rem', color: '#f3f3eb' }}>
            {heading}
            {italicHeading ? (
              <>
                <br />
                <em style={{ fontFamily: 'Playfair Display, serif', color: 'var(--gold, #e6c77a)' }}>{italicHeading}</em>
              </>
            ) : null}
          </h2>
        )}
        {body && <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'rgba(243, 243, 235, 0.75)', marginBottom: '2rem' }}>{body}</p>}
        {primaryBtnText && isSafeUrl(primaryBtnUrl) && (
          isExternalUrl(primaryBtnUrl) ? (
            <a className="btn btn-gold" href={primaryBtnUrl} target="_blank" rel="noopener noreferrer">
              {primaryBtnText} <ArrowRight size={16} />
            </a>
          ) : (
            <Link className="btn btn-gold" to={primaryBtnUrl}>
              {primaryBtnText} <ArrowRight size={16} />
            </Link>
          )
        )}
      </div>
    </section>
  );
}
