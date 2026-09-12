import EditableBox from '../EditableBox';

export default function ProcessTimelineEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};
  const customItems = content.customItems || [];

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-process-timeline"
      style={{
        padding: '90px 48px',
        backgroundColor: 'var(--bg-cream)',
        color: 'var(--dark-green)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
                {content.eyebrow || 'OUR PROCESS'}
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
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                fontWeight: 400,
                color: 'var(--dark-green)',
                margin: 0,
              }}
            >
              {content.heading || 'From Vision to Illumination'}
            </h2>
          </EditableBox>
        </div>

        {/* Steps Grid */}
        <EditableBox
          sectionId={section.sectionId}
          path="content.customItems"
          field="customItems"
          type="customItems"
          label="Process Steps"
          value={customItems}
          mode={mode}
          isSelected={isFieldSelected('content.customItems')}
          onSelect={onSelect}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '28px',
            }}
          >
            {(customItems.length > 0 ? customItems : [
              { subtitle: '01', title: 'DISCOVERY & AUDIT', text: 'We review spatial layouts, ceiling heights, and daylight vectors.' },
              { subtitle: '02', title: 'CONCEPT DESIGN', text: 'Our lighting designers formulate photometrics and fixture selections.' },
              { subtitle: '03', title: 'PRECISION FABRICATION', text: 'Master artisans hand-finish solid brass patinas and optical lenses.' },
              { subtitle: '04', title: 'COMMISSIONING & TUNING', text: 'On-site aiming, dimming curve calibration, and smart control.' },
            ]).map((step, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--white)',
                  border: '1px solid rgba(21, 57, 29, 0.1)',
                  borderRadius: '4px',
                  padding: '28px 20px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '36px',
                    fontWeight: 300,
                    color: 'var(--gold-text)',
                    lineHeight: 1,
                    display: 'block',
                    marginBottom: '12px',
                  }}
                >
                  {step.subtitle || `0${idx + 1}`}
                </span>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: 'var(--dark-green)',
                    margin: '0 0 10px',
                    textTransform: 'uppercase',
                  }}
                >
                  {step.title}
                </h4>
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--muted-text)', margin: 0 }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </EditableBox>
      </div>
    </section>
  );
}
