import { useState } from 'react';
import EditableBox from '../EditableBox';
import { ChevronDown } from 'lucide-react';

const mockFaqs = [
  {
    q: 'What types of architectural lighting does LUX BASED INDUSTRY offer?',
    a: 'LUX BASED INDUSTRY specializes in luxury chandeliers, architectural pendants, concealed smart ambient cove systems, low-profile wall sconces, and bespoke custom lighting fixtures.',
  },
  {
    q: 'Do you provide custom lighting solutions for private villas and hotels?',
    a: 'Yes, our lighting architects engineer bespoke one-of-one lighting fixtures tailored to unique ceiling scales, architectural geometry, and interior design briefs.',
  },
  {
    q: 'Are your lighting systems compatible with Lutron, KNX, or DALI controls?',
    a: 'All fixtures and systems integrate seamlessly with major automation standards including DALI-2, Lutron HomeWorks, Control4, and KNX controllers.',
  },
];

export default function FaqAccordionEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};
  const alignment = content.alignment || 'center';
  const [openIdx, setOpenIdx] = useState(0);

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-faq-accordion"
      style={{
        padding: '90px 48px',
        backgroundColor: 'var(--bg-cream)',
        color: 'var(--dark-green)',
        textAlign: alignment,
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
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
                {content.eyebrow || 'FREQUENTLY ASKED QUESTIONS'}
              </span>
            </EditableBox>
          )}

          <EditableBox
            sectionId={section.sectionId}
            path="content.heading"
            field="heading"
            label="FAQ Heading"
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
              {content.heading || 'Architectural Lighting Insights'}
            </h2>
          </EditableBox>
        </div>

        {/* Accordion Preview */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockFaqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid rgba(21, 57, 29, 0.15)',
                borderRadius: '4px',
                backgroundColor: 'var(--white)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--dark-green)',
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openIdx === idx ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                    color: 'var(--gold-text)',
                  }}
                />
              </button>
              {openIdx === idx && (
                <div style={{ padding: '0 24px 20px', fontSize: '14px', lineHeight: 1.65, color: 'var(--muted-text)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
