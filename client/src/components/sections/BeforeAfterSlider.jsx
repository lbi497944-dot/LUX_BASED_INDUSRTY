import { useState, useRef, useCallback } from 'react';
import { images } from '../../data/site';

export default function BeforeAfterSlider({ content = {}, media = {} } = {}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const eyebrow = content?.eyebrow || 'THE TRANSFORMATION';
  const heading = content?.heading || 'See the Difference Light Makes';
  const body = content?.body || 'Drag the slider to experience how layered architectural lighting transforms an interior from dull shadows into warm elegance.';
  const afterImage = media?.url || images.hero;
  const beforeImage = media?.secondaryUrl || images.living;

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
            alt="Interior with Lux Architectural Lighting (After)"
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
              alt="Interior without Layered Architectural Lighting (Before)"
              className="ba-image image-before"
              loading="lazy"
              decoding="async"
              style={{ filter: 'brightness(0.55) contrast(1.1) grayscale(0.2)' }}
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
      </div>
    </section>
  );
}
