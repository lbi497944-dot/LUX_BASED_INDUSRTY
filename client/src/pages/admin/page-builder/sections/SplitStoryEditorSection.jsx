import EditableBox from '../EditableBox';
import { ArrowRight } from 'lucide-react';

export default function SplitStoryEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};
  const media = section.media || {};

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  const imageUrl = media.url || 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85';

  return (
    <section
      className="pb-section pb-split-story"
      style={{
        padding: '90px 48px',
        backgroundColor: 'var(--white)',
        color: 'var(--dark-green)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Text */}
        <div>
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
                  color: 'var(--gold-text)',
                  marginBottom: '14px',
                }}
              >
                {content.eyebrow || 'OUR STORY'}
              </span>
            </EditableBox>
          )}

          <div style={{ marginBottom: '20px' }}>
            <EditableBox
              sectionId={section.sectionId}
              path="content.heading"
              field="heading"
              label="Story Heading"
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
                  lineHeight: 1.15,
                  color: 'var(--dark-green)',
                  margin: 0,
                }}
              >
                {content.heading || 'Crafting Light,'}
              </h2>
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
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(28px, 4vw, 44px)',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    lineHeight: 1.15,
                    color: 'var(--gold-text)',
                    margin: 0,
                  }}
                >
                  {content.italicHeading || 'Defining Luxury'}
                </h3>
              </EditableBox>
            )}
          </div>

          {(content.body || mode === 'editor') && (
            <EditableBox
              sectionId={section.sectionId}
              path="content.body"
              field="body"
              label="Story Body"
              value={content.body || ''}
              mode={mode}
              isSelected={isFieldSelected('content.body')}
              onSelect={onSelect}
              style={{ marginBottom: '32px' }}
            >
              <p
                style={{
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'var(--muted-text)',
                  margin: 0,
                }}
              >
                {content.body ||
                  'At LUX BASED INDUSTRY, lighting is more than illumination — it is an art form. We combine craftsmanship, innovation and thoughtful design to create ambience that transforms and enriches every space.'}
              </p>
            </EditableBox>
          )}

          {(content.primaryBtnText || mode === 'editor') && (
            <EditableBox
              sectionId={section.sectionId}
              path="content.primaryBtnText"
              field="primaryBtnText"
              type="cta"
              label="Story CTA"
              value={content.primaryBtnText || ''}
              mode={mode}
              isSelected={isFieldSelected('content.primaryBtnText')}
              onSelect={onSelect}
              className="pb-inline-block"
            >
              <span className="btn btn-gold" style={{ cursor: 'pointer' }}>
                {content.primaryBtnText || 'DISCOVER OUR STORY'} <ArrowRight size={14} />
              </span>
            </EditableBox>
          )}
        </div>

        {/* Right Column: Media */}
        <EditableBox
          sectionId={section.sectionId}
          path="media"
          field="media"
          type="media"
          label="Story Image"
          value={media}
          mode={mode}
          isSelected={isFieldSelected('media')}
          onSelect={onSelect}
          style={{ minHeight: '400px', borderRadius: '6px', overflow: 'hidden' }}
        >
          {media.mediaType === 'video' && media.videoUrl ? (
            <video
              src={media.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover' }}
            />
          ) : (
            <img
              src={imageUrl}
              alt={content.heading || 'Story Image'}
              style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover' }}
            />
          )}
        </EditableBox>
      </div>
    </section>
  );
}
