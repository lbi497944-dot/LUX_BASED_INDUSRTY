import EditableBox from '../EditableBox';
import { Sparkles, Ruler, Lightbulb, ShieldCheck, Award, Compass } from 'lucide-react';

const iconMap = {
  Sparkles,
  Ruler,
  Lightbulb,
  ShieldCheck,
  Award,
  Compass,
};

export default function ValueCardsEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};
  const customItems = content.customItems || [];
  const alignment = content.alignment || 'center';

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-value-cards"
      style={{
        padding: '90px 48px',
        backgroundColor: '#0d2613',
        color: 'var(--white)',
        textAlign: alignment,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '48px' }}>
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
                {content.eyebrow || 'WHY LUX BASED INDUSTRY'}
              </span>
            </EditableBox>
          )}

          <EditableBox
            sectionId={section.sectionId}
            path="content.heading"
            field="heading"
            label="Section Heading"
            value={content.heading || ''}
            mode={mode}
            isSelected={isFieldSelected('content.heading')}
            onSelect={onSelect}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontWeight: 400,
                color: 'var(--white)',
                margin: 0,
              }}
            >
              {content.heading || 'The Standards of Luxury Illumination'}
            </h2>
          </EditableBox>
        </div>

        {/* Value Cards Grid */}
        <EditableBox
          sectionId={section.sectionId}
          path="content.customItems"
          field="customItems"
          type="customItems"
          label="Value Cards"
          value={customItems}
          mode={mode}
          isSelected={isFieldSelected('content.customItems')}
          onSelect={onSelect}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              textAlign: 'left',
            }}
          >
            {(customItems.length > 0 ? customItems : [
              { title: 'BESPOKE DESIGN', text: 'Tailored lighting solutions crafted for your space.', iconName: 'Sparkles' },
              { title: 'PREMIUM QUALITY', text: 'Exceptional materials and meticulous craftsmanship.', iconName: 'Ruler' },
              { title: 'INNOVATIVE TECHNOLOGY', text: 'Intelligent lighting solutions for modern living.', iconName: 'Lightbulb' },
              { title: 'EXPERT CONSULTATION', text: 'Professional guidance from concept to execution.', iconName: 'ShieldCheck' },
            ]).map((item, idx) => {
              const IconComp = iconMap[item.iconName] || Sparkles;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#112e17',
                    border: '1px solid rgba(230, 199, 122, 0.15)',
                    borderRadius: '6px',
                    padding: '28px',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(230, 199, 122, 0.12)',
                      color: 'var(--gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <IconComp size={20} />
                  </div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '20px',
                      color: 'var(--white)',
                      margin: '0 0 10px',
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: 'rgba(243, 243, 235, 0.7)',
                      margin: 0,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </EditableBox>
      </div>
    </section>
  );
}
