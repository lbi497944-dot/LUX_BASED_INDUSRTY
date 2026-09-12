import EditableBox from '../EditableBox';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};
  const media = section.media || {};
  const alignment = content.alignment || 'left';

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  const bgImage = media.url || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=90';
  const overlayOpacity = media.overlayOpacity !== undefined ? media.overlayOpacity : 0.85;

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
      {/* Background Media */}
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        {media.mediaType === 'video' && media.videoUrl ? (
          <video
            src={media.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img
            src={bgImage}
            alt={content.heading || 'Hero Background'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {media.overlay !== false && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: `rgba(13, 38, 19, ${overlayOpacity})`,
            }}
          />
        )}
      </EditableBox>

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
