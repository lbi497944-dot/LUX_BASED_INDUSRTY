import { useState, useRef, useCallback } from 'react';
import { images } from '../../data/site';

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

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

  return (
    <section className="section before-after-section">
      <div className="container">
        <div className="section-title center">
          <span className="eyebrow gold-label">THE TRANSFORMATION</span>
          <h2>See the Difference Light Makes</h2>
          <p>Drag the slider to experience how layered architectural lighting transforms an interior from dull shadows into warm elegance.</p>
        </div>

        <div
          ref={containerRef}
          className="before-after-container"
          role="slider"
          aria-label="Before and after lighting comparison slider"
          aria-valuenow={Math.round(sliderPosition)}
          aria-valuemin={0}
          aria-valuemax={100}
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
            src={images.hero}
            alt="Interior with Lux Architectural Lighting (After)"
            className="ba-image image-after"
            loading="lazy"
            decoding="async"
          />
          <span className="ba-label label-after">WITH LUX ARCHITECTURAL LIGHTING</span>

          {/* BEFORE IMAGE (Dim / Unlit Interior Clip) */}
          <div
            className="ba-before-wrapper"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={images.living}
              alt="Interior without Layered Architectural Lighting (Before)"
              className="ba-image image-before"
              loading="lazy"
              decoding="async"
              style={{ filter: 'brightness(0.55) contrast(1.1) grayscale(0.2)' }}
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
