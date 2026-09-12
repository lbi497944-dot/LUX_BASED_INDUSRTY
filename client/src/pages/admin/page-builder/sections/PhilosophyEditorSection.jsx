import EditableBox from '../EditableBox';
import { ArrowRight } from 'lucide-react';

export default function PhilosophyEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};
  const alignment = content.alignment || 'left';

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-philosophy-section"
      style={{
        padding: '90px 48px',
        backgroundColor: 'var(--bg-cream)',
        color: 'var(--dark-green)',
        textAlign: alignment,
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: alignment === 'center' ? '0 auto' : alignment === 'right' ? '0 0 0 auto' : '0',
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
                color: 'var(--gold-text)',
                marginBottom: '16px',
              }}
            >
              {content.eyebrow || 'OUR PHILOSOPHY'}
            </span>
          </EditableBox>
        )}

        <div style={{ marginBottom: '24px' }}>
          <EditableBox
            sectionId={section.sectionId}
            path="content.heading"
            field="heading"
            label="Philosophy Heading"
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
              {content.heading || 'Crafted to Inspire.'}
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
                {content.italicHeading || 'Designed to Endure.'}
              </h3>
            </EditableBox>
          )}
        </div>

        {(content.body || mode === 'editor') && (
          <EditableBox
            sectionId={section.sectionId}
            path="content.body"
            field="body"
            label="Philosophy Body"
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
                'LUX BASED INDUSTRY approaches illumination as an architectural discipline. We fuse technical optical precision with hand-finished craftsmanship to shape mood, accentuate texture, and elevate extraordinary residential and hospitality spaces worldwide.'}
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
              {content.primaryBtnText || 'VIEW OUR COLLECTIONS'} <ArrowRight size={14} />
            </span>
          </EditableBox>
        )}
      </div>
    </section>
  );
}
