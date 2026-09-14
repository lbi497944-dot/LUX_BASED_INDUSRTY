import { useState, useRef, useCallback } from 'react';
import { images } from '../../data/site';
import { Sliders, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export default function TransformationLivePreview({ formData = {} }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const title = formData.title?.trim() || 'Private Villa Lighting Transformation';
  const shortDescription =
    formData.shortDescription?.trim() ||
    'Drag the interactive slider to experience the dramatic difference layered architectural illumination creates.';
  const detailedDescription = formData.detailedDescription?.trim();

  const beforeImage = formData.beforeImage?.trim();
  const afterImage = formData.afterImage?.trim();

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

  const hasBothImages = Boolean(beforeImage && afterImage);

  return (
    <div className="preview-transformation-container">
      <div style={{ marginBottom: '14px' }}>
        <span className="eyebrow gold-label" style={{ fontSize: '9px' }}>THE TRANSFORMATION</span>
        <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold, #e6c77a)', fontSize: '18px', margin: '4px 0 6px' }}>
          {title}
        </h3>
        <p style={{ color: 'rgba(243, 243, 235, 0.85)', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
          {shortDescription}
        </p>
      </div>

      {hasBothImages ? (
        <div
          ref={containerRef}
          className="before-after-container preview-interactive"
          style={{
            position: 'relative',
            height: '240px',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid rgba(230, 199, 122, 0.3)',
            cursor: 'ew-resize',
            userSelect: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchCancel={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          {/* After Photo (Illuminated) */}
          <img
            src={afterImage}
            alt="After Illumination"
            className="ba-image image-after"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <span className="ba-label label-after" style={{ fontSize: '9px', padding: '3px 6px' }}>
            WITH LUX LIGHTING
          </span>

          {/* Before Photo (Unlit) */}
          <div
            className="ba-before-wrapper"
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
            }}
          >
            <img
              src={beforeImage}
              alt="Before Illumination"
              className="ba-image image-before"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span className="ba-label label-before" style={{ fontSize: '9px', padding: '3px 6px' }}>
              UNLIT
            </span>
          </div>

          {/* Slider Handle */}
          <div
            className="ba-handle"
            style={{
              left: `${sliderPosition}%`,
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '2px',
              background: 'var(--gold, #e6c77a)',
              boxShadow: '0 0 10px rgba(0,0,0,0.8)',
            }}
          >
            <div
              className="ba-handle-line"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#15391D',
                border: '2px solid var(--gold, #e6c77a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold, #e6c77a)',
              }}
            >
              <Sliders size={12} />
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '14px',
          }}
        >
          {/* Before Slot */}
          <div
            style={{
              height: '160px',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px dashed rgba(230, 199, 122, 0.25)',
              background: 'rgba(21, 57, 29, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {beforeImage ? (
              <img src={beforeImage} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <ImageIcon size={24} style={{ color: 'rgba(230, 199, 122, 0.4)', marginBottom: '4px' }} />
                <span style={{ fontSize: '10px', color: 'rgba(243, 243, 235, 0.6)' }}>Before Photo (Unlit)</span>
              </>
            )}
          </div>

          {/* After Slot */}
          <div
            style={{
              height: '160px',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px dashed rgba(230, 199, 122, 0.25)',
              background: 'rgba(21, 57, 29, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {afterImage ? (
              <img src={afterImage} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <ImageIcon size={24} style={{ color: 'rgba(230, 199, 122, 0.4)', marginBottom: '4px' }} />
                <span style={{ fontSize: '10px', color: 'rgba(243, 243, 235, 0.6)' }}>After Photo (Illuminated)</span>
              </>
            )}
          </div>
        </div>
      )}

      {detailedDescription && (
        <div
          style={{
            marginTop: '14px',
            background: '#112e17',
            border: '1px solid rgba(230, 199, 122, 0.15)',
            borderRadius: '6px',
            padding: '12px 14px',
            fontSize: '11px',
            color: 'rgba(243, 243, 235, 0.8)',
            lineHeight: '1.5',
          }}
        >
          <span style={{ fontSize: '9px', color: 'var(--gold, #e6c77a)', display: 'block', fontWeight: 600, marginBottom: '2px' }}>
            ARCHITECTURAL SPECIFICATION & AIMING NOTES
          </span>
          {detailedDescription}
        </div>
      )}
    </div>
  );
}
