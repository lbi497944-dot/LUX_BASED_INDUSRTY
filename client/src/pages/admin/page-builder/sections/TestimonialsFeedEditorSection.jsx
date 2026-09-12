import EditableBox from '../EditableBox';
import { Star } from 'lucide-react';

const mockTestimonials = [
  {
    quote: 'LUX BASED INDUSTRY created a luminaire configuration for our Emirates Hills villa that elevated the entire architecture. The precision of their warm dimming curves is extraordinary.',
    client: 'Tariq Al-Mansoor',
    role: 'Managing Principal, Apex Architecture',
  },
  {
    quote: 'The craftsmanship on the custom solid brass pendants for our Doha boutique hotel was world-class. Delivery, photometric tuning, and commissioning were completely seamless.',
    client: 'Elena Rostova',
    role: 'Senior Interior Architect',
  },
];

export default function TestimonialsFeedEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-testimonials-feed"
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
              {content.eyebrow || 'CLIENT TESTIMONIALS'}
            </span>
          </EditableBox>
        )}

        <div style={{ marginBottom: '48px' }}>
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
                color: 'var(--white)',
                margin: 0,
              }}
            >
              {content.heading || 'Endorsements from Leading Architects & Designers'}
            </h2>
          </EditableBox>
        </div>

        {/* Testimonials Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
            textAlign: 'left',
          }}
        >
          {mockTestimonials.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#112e17',
                border: '1px solid rgba(230, 199, 122, 0.15)',
                borderRadius: '6px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', color: 'var(--gold)' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="var(--gold)" />
                ))}
              </div>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  color: 'rgba(243, 243, 235, 0.85)',
                  marginBottom: '24px',
                }}
              >
                "{item.quote}"
              </p>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--white)' }}>
                  {item.client}
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--gold)' }}>{item.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
