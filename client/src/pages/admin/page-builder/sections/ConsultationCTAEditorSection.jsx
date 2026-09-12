import EditableBox from '../EditableBox';
import { ArrowRight, Calendar } from 'lucide-react';

export default function ConsultationCTAEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};
  const media = section.media || {};

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  const bgImage = media.url || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85';

  return (
    <section
      className="pb-section pb-consultation-cta"
      style={{
        position: 'relative',
        padding: '100px 48px',
        color: 'var(--white)',
        backgroundColor: '#0d2613',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Background Media */}
      <EditableBox
        sectionId={section.sectionId}
        path="media"
        field="media"
        type="media"
        label="Background Media"
        value={media}
        mode={mode}
        isSelected={isFieldSelected('media')}
        onSelect={onSelect}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        <img
          src={bgImage}
          alt={content.heading || 'Consultation Background'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(13, 38, 19, 0.88)',
          }}
        />
      </EditableBox>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '750px', margin: '0 auto' }}>
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
                marginBottom: '16px',
              }}
            >
              {content.eyebrow || 'PRIVATE CONSULTATION'}
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
              fontSize: 'clamp(32px, 4.5vw, 52px)',
              fontWeight: 400,
              color: 'var(--white)',
              margin: '0 0 16px',
              lineHeight: 1.15,
            }}
          >
            {content.heading || 'Bring Your Vision to Light.'}
          </h2>
        </EditableBox>

        {(content.body || mode === 'editor') && (
          <EditableBox
            sectionId={section.sectionId}
            path="content.body"
            field="body"
            label="Body"
            value={content.body || ''}
            mode={mode}
            isSelected={isFieldSelected('content.body')}
            onSelect={onSelect}
            style={{ marginBottom: '32px' }}
          >
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.65,
                color: 'rgba(243, 243, 235, 0.85)',
                margin: 0,
              }}
            >
              {content.body || "Let's create an extraordinary lighting experience for your space."}
            </p>
          </EditableBox>
        )}

        {(content.primaryBtnText || mode === 'editor') && (
          <EditableBox
            sectionId={section.sectionId}
            path="content.primaryBtnText"
            field="primaryBtnText"
            type="cta"
            label="CTA Button"
            value={content.primaryBtnText || ''}
            mode={mode}
            isSelected={isFieldSelected('content.primaryBtnText')}
            onSelect={onSelect}
            className="pb-inline-block"
          >
            <span className="btn btn-gold" style={{ cursor: 'pointer' }}>
              <Calendar size={14} /> {content.primaryBtnText || 'BOOK A CONSULTATION'}
            </span>
          </EditableBox>
        )}
      </div>
    </section>
  );
}
