import EditableBox from '../EditableBox';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const mockProjects = [
  {
    title: 'The Emirates Hills Villa',
    location: 'Dubai, UAE',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    type: 'Private Residence',
  },
  {
    title: 'The Pearl Penthouse',
    location: 'Doha, Qatar',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    type: 'Luxury Hospitality',
  },
  {
    title: 'Al Barari Sanctuary',
    location: 'Dubai, UAE',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    type: 'Flagship Dining',
  },
];

export default function ProjectsFeedEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-projects-feed"
      style={{
        padding: '90px 48px',
        backgroundColor: '#0f2915',
        color: 'var(--white)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
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
                    color: 'var(--gold)',
                    marginBottom: '12px',
                  }}
                >
                  {content.eyebrow || 'FEATURED PROJECTS'}
                </span>
              </EditableBox>
            )}

            <EditableBox
              sectionId={section.sectionId}
              path="content.heading"
              field="heading"
              label="Projects Heading"
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
                {content.heading || 'Transforming Spaces Across the World'}
              </h2>
            </EditableBox>
          </div>

          {(content.primaryBtnText || mode === 'editor') && (
            <EditableBox
              sectionId={section.sectionId}
              path="content.primaryBtnText"
              field="primaryBtnText"
              type="cta"
              label="Projects CTA"
              value={content.primaryBtnText || ''}
              mode={mode}
              isSelected={isFieldSelected('content.primaryBtnText')}
              onSelect={onSelect}
            >
              <span className="btn btn-gold" style={{ cursor: 'pointer' }}>
                {content.primaryBtnText || 'VIEW ALL PROJECTS'} <ArrowRight size={14} />
              </span>
            </EditableBox>
          )}
        </div>

        {/* Project Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {mockProjects.map((proj, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                height: '340px',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#112e17',
              }}
            >
              <img
                src={proj.image}
                alt={proj.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(13,38,19,0.92) 0%, rgba(13,38,19,0.2) 60%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '24px',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.1em' }}>
                  {proj.location} • {proj.type}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '22px',
                    color: 'var(--white)',
                    margin: '6px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {proj.title} <ArrowUpRight size={18} color="var(--gold)" />
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
