import { useState } from 'react';
import EditableBox from '../EditableBox';

export default function BeforeAfterEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};
  const [sliderPos, setSliderPos] = useState(50);

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-before-after"
      style={{
        padding: '90px 48px',
        backgroundColor: '#0d2613',
        color: 'var(--white)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
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
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '14px',
              }}
            >
              {content.eyebrow || 'THE TRANSFORMATION'}
            </span>
          </EditableBox>
        )}

        <EditableBox
          sectionId={section.sectionId}
          path="content.heading"
          field="heading"
          label="Heading"
          value={content.heading || ''}
          mode={mode}
          isSelected={isFieldSelected('content.heading')}
          onSelect={onSelect}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 400,
              color: 'var(--white)',
              margin: '0 0 16px',
            }}
          >
            {content.heading || 'See the Difference Light Makes'}
          </h2>
        </EditableBox>

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
            style={{ marginBottom: '40px' }}
          >
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(243, 243, 235, 0.75)',
                maxWidth: '650px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              {content.body ||
                'Drag the slider to experience how layered architectural lighting transforms an interior from dull shadows into warm elegance.'}
            </p>
          </EditableBox>
        )}

        {/* Visual Slider Mockup */}
        <div
          style={{
            position: 'relative',
            height: '420px',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
            alt="After lighting design"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              pointerEvents: 'none',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Before lighting design"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6) grayscale(0.4)' }}
            />
            <span
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'var(--white)',
                padding: '4px 10px',
                fontSize: '11px',
                letterSpacing: '0.1em',
                borderRadius: '3px',
              }}
            >
              BEFORE
            </span>
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${sliderPos}%`,
              width: '2px',
              backgroundColor: 'var(--gold)',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
          <span
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(21, 57, 29, 0.8)',
              color: 'var(--gold)',
              padding: '4px 10px',
              fontSize: '11px',
              letterSpacing: '0.1em',
              borderRadius: '3px',
            }}
          >
            AFTER (LUX)
          </span>

          <input
            type="range"
            min="10"
            max="90"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            aria-label="Before/After lighting comparison slider"
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              zIndex: 5,
              accentColor: 'var(--gold)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
