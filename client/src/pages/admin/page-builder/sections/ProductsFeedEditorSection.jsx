import EditableBox from '../EditableBox';
import { ArrowRight } from 'lucide-react';

const mockProducts = [
  {
    name: 'Aura Grand Chandelier',
    category: 'Chandeliers',
    price: '$12,400',
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Helios Minimal Pendant',
    category: 'Pendants',
    price: '$4,200',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Linea Architectural Cove',
    category: 'Ambient Systems',
    price: '$3,800',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Vesper Bronze Sconce',
    category: 'Wall Lighting',
    price: '$2,600',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=600&q=80',
  },
];

export default function ProductsFeedEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-products-feed"
      style={{
        padding: '90px 48px',
        backgroundColor: 'var(--bg-cream)',
        color: 'var(--dark-green)',
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
                    color: 'var(--gold-text)',
                    marginBottom: '12px',
                  }}
                >
                  {content.eyebrow || 'SIGNATURE PIECES'}
                </span>
              </EditableBox>
            )}

            <EditableBox
              sectionId={section.sectionId}
              path="content.heading"
              field="heading"
              label="Products Heading"
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
                {content.heading || 'Iconic Designs. Unmatched Brilliance.'}
              </h2>
            </EditableBox>
          </div>

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
            >
              <span className="btn btn-gold" style={{ cursor: 'pointer' }}>
                {content.primaryBtnText || 'VIEW ALL PRODUCTS'} <ArrowRight size={14} />
              </span>
            </EditableBox>
          )}
        </div>

        {/* Product Cards Grid Preview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}
        >
          {mockProducts.map((prod, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--white)',
                border: '1px solid rgba(21, 57, 29, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img
                  src={prod.image}
                  alt={prod.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '16px' }}>
                <span style={{ fontSize: '10px', color: 'var(--gold-text)', fontWeight: 600 }}>
                  {prod.category}
                </span>
                <h4 style={{ fontSize: '16px', margin: '4px 0', color: 'var(--dark-green)' }}>
                  {prod.name}
                </h4>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark-green)', margin: 0 }}>
                  {prod.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
