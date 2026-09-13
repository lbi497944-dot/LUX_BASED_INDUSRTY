import { useState, useRef, useCallback } from 'react';
import { images } from '../../data/site';

export default function BeforeAfterSlider({
  content = {},
  media = {},
  transformations = [],
} = {}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);

  const hasTransformations = Array.isArray(transformations) && transformations.length > 0;
  const activeIndex = hasTransformations && selectedIndex < transformations.length ? selectedIndex : 0;
  const activeTransformation = hasTransformations ? transformations[activeIndex] : null;

  const eyebrow = content?.eyebrow || 'THE TRANSFORMATION';
  const heading = activeTransformation?.title || content?.heading || 'See the Difference Light Makes';
  const body =
    activeTransformation?.shortDescription ||
    content?.body ||
    'Drag the slider to experience how layered architectural lighting transforms an interior from dull shadows into warm elegance.';

  const afterImage = activeTransformation?.afterImage || media?.url || images.hero;
  const beforeImage = activeTransformation?.beforeImage || media?.secondaryUrl || images.living;
  const detailedDescription = activeTransformation?.detailedDescription || null;

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <section className="section before-after-section">
      <div className="container">
        <div className="section-title center">
          <span className="eyebrow gold-label">{eyebrow}</span>
          <h2>{heading}</h2>
          <p>{body}</p>
        </div>

        <div
          ref={containerRef}
          className="before-after-container"
          role="slider"
          aria-label="Before and after lighting comparison slider"
          aria-valuenow={Math.round(sliderPosition)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchCancel={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          {/* AFTER IMAGE (Warm Illuminated Interior) */}
          <img
            src={afterImage}
            alt={`${heading} with Lux Architectural Lighting (After)`}
            className="ba-image image-after"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              if (e.target.src !== images.hero) {
                e.target.src = images.hero;
              }
            }}
          />
          <span className="ba-label label-after">WITH LUX ARCHITECTURAL LIGHTING</span>

          {/* BEFORE IMAGE (Dim / Unlit Interior Clip) */}
          <div
            className="ba-before-wrapper"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={beforeImage}
              alt={`${heading} without Layered Architectural Lighting (Before)`}
              className="ba-image image-before"
              loading="lazy"
              decoding="async"
              style={activeTransformation ? {} : { filter: 'brightness(0.55) contrast(1.1) grayscale(0.2)' }}
              onError={(e) => {
                if (e.target.src !== images.living) {
                  e.target.src = images.living;
                }
              }}
            />
            <span className="ba-label label-before">UNLIT SPACE</span>
          </div>

          {/* DRAGGABLE DIVIDER HANDLE */}
          <div
            className="ba-divider"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="ba-handle">
              <span className="ba-arrows">◄ ►</span>
            </div>
          </div>
        </div>

        {/* DETAILED NARRATIVE (If Provided) */}
        {detailedDescription && (
          <div className="ba-detailed-description">
            <p>{detailedDescription}</p>
          </div>
        )}

        {/* CASE STUDY SELECTOR (When 2+ Transformations Exist) */}
        {hasTransformations && transformations.length >= 2 && (
          <div
            className="ba-case-study-selector"
            role="tablist"
            aria-label="Transformation Case Studies"
          >
            {transformations.map((t, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={t._id || idx}
                  type="button"
                  role="tab"
                  id={`transformation-tab-${idx}`}
                  aria-selected={isSelected}
                  aria-controls={`transformation-panel-${idx}`}
                  tabIndex={isSelected ? 0 : -1}
                  className={`ba-selector-card ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedIndex(idx);
                    setSliderPosition(50);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      const next = (idx + 1) % transformations.length;
                      setSelectedIndex(next);
                      setSliderPosition(50);
                      document.getElementById(`transformation-tab-${next}`)?.focus();
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      const prev = (idx - 1 + transformations.length) % transformations.length;
                      setSelectedIndex(prev);
                      setSliderPosition(50);
                      document.getElementById(`transformation-tab-${prev}`)?.focus();
                    }
                  }}
                >
                  <span className="ba-selector-num">
                    CASE STUDY {String(idx + 1).padStart(2, '0')} / {String(transformations.length).padStart(2, '0')}
                  </span>
                  <div className="ba-selector-thumb-wrap">
                    <img
                      src={t.afterImage || images.hero}
                      alt={t.title}
                      className="ba-selector-thumb"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <span className="ba-selector-title">{t.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
