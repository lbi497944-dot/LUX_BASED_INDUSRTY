import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { images } from '../../../data/site';

export default function HeroSection({ content = {}, media = {} }) {
  const eyebrow = content?.eyebrow || 'PREMIUM LIGHTING DESIGN';
  const heading = content?.heading || 'Illuminating';
  const italicHeading = content?.italicHeading !== undefined ? content.italicHeading : 'Luxury Spaces';
  const body = content?.body || 'Bespoke lighting solutions that transform extraordinary spaces into timeless experiences.';
  const primaryBtnText = content?.primaryBtnText || 'EXPLORE COLLECTIONS';
  const primaryBtnUrl = content?.primaryBtnUrl || '/collections';
  const secondaryBtnText = content?.secondaryBtnText || 'BOOK CONSULTATION';
  const secondaryBtnUrl = content?.secondaryBtnUrl || '/consultation';
  const bgImage = media?.url || images.hero;
  const overlayOpacity = typeof media?.overlayOpacity === 'number' ? media.overlayOpacity : 0.82;
  const showOverlay = media?.overlay !== false;

  const isExternalUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url.trim());
  const isSafeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const sanitized = url.trim().replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();
    return !sanitized.startsWith('javascript:') && !sanitized.startsWith('data:') && !sanitized.startsWith('vbscript:');
  };

  const bgStyle = showOverlay
    ? {
        backgroundImage: `linear-gradient(90deg, rgba(21, 57, 29, 0.96) 0%, rgba(21, 57, 29, ${overlayOpacity}) 40%, rgba(21, 57, 29, 0.25) 85%), url(${bgImage})`,
      }
    : {
        backgroundImage: `url(${bgImage})`,
      };

  return (
    <section className="hero">
      <motion.div
        className="hero-bg-frame"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1.0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={bgStyle}
      />

      <div className="container hero-content" style={{ textAlign: content?.alignment || 'left' }}>
        {eyebrow && (
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {eyebrow}
          </motion.span>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {heading}
          {italicHeading ? (
            <>
              <br />
              <em>{italicHeading}</em>
            </>
          ) : null}
        </motion.h1>

        {body && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {body}
          </motion.p>
        )}

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
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
          {secondaryBtnText && isSafeUrl(secondaryBtnUrl) && (
            isExternalUrl(secondaryBtnUrl) ? (
              <a className="btn btn-outline" href={secondaryBtnUrl} target="_blank" rel="noopener noreferrer">
                {secondaryBtnText}
              </a>
            ) : (
              <Link className="btn btn-outline" to={secondaryBtnUrl}>
                {secondaryBtnText}
              </Link>
            )
          )}
        </motion.div>

        <motion.a
          href="#philosophy"
          className="scroll-indicator"
          aria-label="Scroll to explore philosophy section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown size={14} />
        </motion.a>
      </div>
    </section>
  );
}
