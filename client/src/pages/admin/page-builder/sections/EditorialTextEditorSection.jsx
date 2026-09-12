import EditableBox from '../EditableBox';

export default function EditorialTextEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};
  const alignment = content.alignment || 'left';

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-editorial-text"
      style={{
        padding: '90px 48px',
        backgroundColor: 'var(--bg-cream)',
        color: 'var(--dark-green)',
        textAlign: alignment,
      }}
    >
      <div
        style={{
          maxWidth: '850px',
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
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--gold-text)',
                marginBottom: '14px',
              }}
            >
              {content.eyebrow || 'THE LUX STATEMENT'}
            </span>
          </EditableBox>
        )}

        <div style={{ marginBottom: '24px' }}>
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
                color: 'var(--dark-green)',
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              {content.heading || 'Lighting is the soul'}
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
                  color: 'var(--gold-text)',
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                {content.italicHeading || 'of an interior.'}
              </h3>
            </EditableBox>
          )}
        </div>

        {(content.body || mode === 'editor') && (
          <EditableBox
            sectionId={section.sectionId}
            path="content.body"
            field="body"
            label="Editorial Body"
            value={content.body || ''}
            mode={mode}
            isSelected={isFieldSelected('content.body')}
            onSelect={onSelect}
          >
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.75,
                color: 'var(--muted-text)',
                margin: 0,
              }}
            >
              {content.body ||
                'At LUX BASED INDUSTRY, we believe the best lighting is felt before it is noticed. It reveals raw material, frames architectural symmetry, creates human rhythm, and gives people a compelling reason to linger.'}
            </p>
          </EditableBox>
        )}
      </div>
    </section>
  );
}
