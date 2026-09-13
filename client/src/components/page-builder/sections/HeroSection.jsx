import { useState, useEffect, useRef } from 'react';
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

  const validSlides = media?.mediaType === 'slideshow' && Array.isArray(media?.slides)
    ? media.slides.filter((s) => s && typeof s.url === 'string' && s.url.trim() !== '')
    : [];
  const slideInterval = typeof media?.slideInterval === 'number' && media.slideInterval >= 2 && media.slideInterval <= 30
    ? media.slideInterval
    : 5;

  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (validSlides.length > 1) {
      timerRef.current = setInterval(() => {
        if (!document.hidden) {
          setActiveSlide((prev) => (prev + 1) % validSlides.length);
        }
      }, slideInterval * 1000);
    }
  };

  useEffect(() => {
    if (validSlides.length <= 1) return;

    startTimer();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [validSlides.length, slideInterval]);

  const goToSlide = (index) => {
    setActiveSlide(index);
    startTimer();
  };

  const safeSlideIndex = validSlides.length > 0 ? activeSlide % validSlides.length : 0;

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
      {media?.mediaType === 'none' ? null : media?.mediaType === 'video' && media?.videoUrl ? (
        <motion.div
          className="hero-bg-frame"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <video
            src={media.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {showOverlay && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, rgba(21, 57, 29, 0.96) 0%, rgba(21, 57, 29, ${overlayOpacity}) 40%, rgba(21, 57, 29, 0.25) 85%)`,
                zIndex: 1,
              }}
            />
          )}
        </motion.div>
      ) : media?.mediaType === 'slideshow' && validSlides.length > 0 ? (
        <div
          className="hero-bg-frame hero-slideshow-frame"
          style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1 }}
        >
          {validSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`hero-slide ${idx === safeSlideIndex ? 'active' : ''}`}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${slide.url})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                opacity: idx === safeSlideIndex ? 1 : 0,
                transition: 'opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                zIndex: idx === safeSlideIndex ? 1 : 0,
              }}
            />
          ))}
          {showOverlay && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, rgba(21, 57, 29, 0.96) 0%, rgba(21, 57, 29, ${overlayOpacity}) 40%, rgba(21, 57, 29, 0.25) 85%)`,
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />
          )}
          {validSlides.length > 1 && (
            <div
              className="hero-slideshow-dots"
              role="tablist"
              aria-label="Slideshow slide navigation"
              style={{
                position: 'absolute',
                bottom: '36px',
                right: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 3,
              }}
            >
              {validSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === safeSlideIndex}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goToSlide(i)}
                  className={`hero-dot-btn ${i === safeSlideIndex ? 'active' : ''}`}
                  style={{
                    width: i === safeSlideIndex ? '28px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(230, 199, 122, 0.6)',
                    backgroundColor: i === safeSlideIndex ? 'var(--gold)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <motion.div
          className="hero-bg-frame"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={bgStyle}
        />
      )}

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
