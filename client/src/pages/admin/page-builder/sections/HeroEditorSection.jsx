import { useState, useEffect, useRef } from 'react';
import EditableBox from '../EditableBox';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};
  const media = section.media || {};
  const alignment = content.alignment || 'left';

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  const bgImage = media.url || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=90';
  const overlayOpacity = media.overlayOpacity !== undefined ? media.overlayOpacity : 0.85;

  const validSlides = media.mediaType === 'slideshow' && Array.isArray(media.slides)
    ? media.slides.filter((s) => s && typeof s.url === 'string' && s.url.trim() !== '')
    : [];
  const slideInterval = typeof media.slideInterval === 'number' && media.slideInterval >= 2 && media.slideInterval <= 30
    ? media.slideInterval
    : 5;

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (validSlides.length > 1) {
      timerRef.current = setInterval(() => {
        setActiveSlideIndex((prev) => (prev + 1) % validSlides.length);
      }, slideInterval * 1000);
    }
  };

  useEffect(() => {
    if (validSlides.length <= 1) return;

    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [validSlides.length, slideInterval]);

  const handleManualSlide = (newIndex) => {
    setActiveSlideIndex(newIndex);
    startTimer();
  };

  const safeIndex = validSlides.length > 0 ? activeSlideIndex % validSlides.length : 0;

  return (
    <section
      className="pb-section pb-hero-section"
      style={{
        position: 'relative',
        minHeight: '560px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
        padding: '100px 48px',
        color: 'var(--white)',
        overflow: 'hidden',
        backgroundColor: '#0d2613',
      }}
    >
      {/* Background Media Layer (Full-Bleed) */}
      <div
        className="pb-hero-bg-frame"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <EditableBox
          sectionId={section.sectionId}
          path="media"
          field="media"
          type="media"
          label="Hero Media"
          value={media}
          mode={mode}
          isSelected={isFieldSelected('media')}
          onSelect={onSelect}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {media.mediaType === 'none' ? null : media.mediaType === 'video' && media.videoUrl ? (
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
                pointerEvents: 'none',
              }}
            />
          ) : media.mediaType === 'slideshow' && validSlides.length > 0 ? (
            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              {validSlides.map((slide, idx) => (
                <img
                  key={idx}
                  src={slide.url}
                  alt={slide.title || content.heading || `Slide ${idx + 1}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: idx === safeIndex ? 1 : 0,
                    transition: 'opacity 0.8s ease-in-out',
                    pointerEvents: 'none',
                  }}
                />
              ))}
              {validSlides.length > 1 && (
                <div
                  className="pb-hero-slideshow-nav"
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 3,
                    backgroundColor: 'rgba(13, 38, 19, 0.85)',
                    padding: '6px 14px',
                    borderRadius: '24px',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(230, 199, 122, 0.4)',
                    pointerEvents: 'auto',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleManualSlide(safeIndex === 0 ? validSlides.length - 1 : safeIndex - 1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--gold)',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Previous slide"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {validSlides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleManualSlide(i)}
                      style={{
                        width: i === safeIndex ? '20px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: i === safeIndex ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        padding: 0,
                      }}
                      title={`Slide ${i + 1}`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => handleManualSlide((safeIndex + 1) % validSlides.length)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--gold)',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Next slide"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--gold)',
                      marginLeft: '6px',
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {slideInterval}s
                  </span>
                </div>
              )}
            </div>
          ) : (
            <img
              src={bgImage}
              alt={content.heading || 'Hero Background'}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />
          )}
          {media.mediaType !== 'none' && media.overlay !== false && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: `rgba(13, 38, 19, ${overlayOpacity})`,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          )}
        </EditableBox>
      </div>

      {/* Hero Content */}
      <div
        className="pb-hero-content"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '820px',
          textAlign: alignment,
        }}
      >
        {(content.eyebrow || mode === 'editor') && (
          <EditableBox
            sectionId={section.sectionId}
            path="content.eyebrow"
            field="eyebrow"
            label="Eyebrow"
            value={content.eyebrow || ''}
            mode={mode}
            isSelected={isFieldSelected('content.eyebrow')}
            onSelect={onSelect}
            className="pb-inline-block"
          >
            <span
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '16px',
              }}
            >
              {content.eyebrow || 'PREMIUM LIGHTING DESIGN'}
            </span>
          </EditableBox>
        )}

        <div style={{ marginBottom: '20px' }}>
          <EditableBox
            sectionId={section.sectionId}
            path="content.heading"
            field="heading"
            label="Main Heading"
            value={content.heading || ''}
            mode={mode}
            isSelected={isFieldSelected('content.heading')}
            onSelect={onSelect}
          >
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 400,
                lineHeight: 1.1,
                color: 'var(--white)',
                margin: 0,
              }}
            >
              {content.heading || 'Illuminating'}
            </h1>
          </EditableBox>

          {(content.italicHeading || mode === 'editor') && (
            <EditableBox
              sectionId={section.sectionId}
              path="content.italicHeading"
              field="italicHeading"
              label="Italic Accent"
              value={content.italicHeading || ''}
              mode={mode}
              isSelected={isFieldSelected('content.italicHeading')}
              onSelect={onSelect}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.1,
                  color: 'var(--gold)',
                  margin: 0,
                }}
              >
                {content.italicHeading || 'Luxury Spaces'}
              </h2>
            </EditableBox>
          )}
        </div>

        {(content.body || mode === 'editor') && (
          <EditableBox
            sectionId={section.sectionId}
            path="content.body"
            field="body"
            label="Body Description"
            value={content.body || ''}
            mode={mode}
            isSelected={isFieldSelected('content.body')}
            onSelect={onSelect}
            style={{ marginBottom: '32px' }}
          >
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'rgba(243, 243, 235, 0.85)',
                margin: 0,
                maxWidth: '650px',
              }}
            >
              {content.body || 'Bespoke lighting solutions that transform extraordinary spaces into timeless experiences.'}
            </p>
          </EditableBox>
        )}

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
          }}
        >
          {(content.primaryBtnText || mode === 'editor') && (
            <EditableBox
              sectionId={section.sectionId}
              path="content.primaryBtnText"
              field="primaryBtnText"
              type="cta"
              label="Primary CTA"
              value={content.primaryBtnText || ''}
              mode={mode}
              isSelected={isFieldSelected('content.primaryBtnText')}
              onSelect={onSelect}
            >
              <span className="btn btn-gold" style={{ cursor: 'pointer' }}>
                {content.primaryBtnText || 'EXPLORE COLLECTIONS'} <ArrowRight size={14} />
              </span>
            </EditableBox>
          )}

          {(content.secondaryBtnText || mode === 'editor') && (
            <EditableBox
              sectionId={section.sectionId}
              path="content.secondaryBtnText"
              field="secondaryBtnText"
              type="cta"
              label="Secondary CTA"
              value={content.secondaryBtnText || ''}
              mode={mode}
              isSelected={isFieldSelected('content.secondaryBtnText')}
              onSelect={onSelect}
            >
              <span className="btn btn-outline" style={{ cursor: 'pointer' }}>
                {content.secondaryBtnText || 'BOOK CONSULTATION'}
              </span>
            </EditableBox>
          )}
        </div>
      </div>
    </section>
  );
}
