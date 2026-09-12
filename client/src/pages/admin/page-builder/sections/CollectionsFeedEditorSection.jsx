import EditableBox from '../EditableBox';
import { ArrowUpRight } from 'lucide-react';

const mockCollections = [
  {
    title: 'Grand Chandeliers',
    eyebrow: '01 / STATEMENT ELEGANCE',
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80',
    tagline: 'Timeless elegance in every crystal.',
  },
  {
    title: 'Architectural Pendants',
    eyebrow: '02 / MODERN GEOMETRY',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
    tagline: 'Sculptural forms. Refined spaces.',
  },
  {
    title: 'Smart Ambient Systems',
    eyebrow: '03 / INTELLIGENT LIVING',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    tagline: 'Concealed illumination that breathes with architecture.',
  },
];

export default function CollectionsFeedEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-collections-feed"
      style={{
        padding: '90px 48px',
        backgroundColor: '#0f2915',
        color: 'var(--white)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
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
                {content.eyebrow || 'OUR COLLECTIONS'}
              </span>
            </EditableBox>
          )}

          <EditableBox
            sectionId={section.sectionId}
            path="content.heading"
            field="heading"
            label="Feed Heading"
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
              {content.heading || 'Lighting Designed Around Extraordinary Spaces.'}
            </h2>
          </EditableBox>
        </div>

        {/* Collections Feed Cards Preview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {mockCollections.map((col, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#112e17',
                border: '1px solid rgba(230, 199, 122, 0.15)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img
                  src={col.image}
                  alt={col.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '20px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.15em',
                    color: 'var(--gold)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {col.eyebrow}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '22px',
                    color: 'var(--white)',
                    margin: '8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {col.title} <ArrowUpRight size={18} color="var(--gold)" />
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(243, 243, 235, 0.6)', margin: 0 }}>
                  {col.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
