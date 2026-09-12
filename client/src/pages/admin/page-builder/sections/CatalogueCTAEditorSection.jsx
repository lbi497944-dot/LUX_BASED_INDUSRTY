import EditableBox from '../EditableBox';
import { Download } from 'lucide-react';

export default function CatalogueCTAEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-catalogue-cta"
      style={{
        padding: '80px 48px',
        backgroundColor: '#0d2613',
        color: 'var(--white)',
        borderTop: '1px solid rgba(230, 199, 122, 0.2)',
        borderBottom: '1px solid rgba(230, 199, 122, 0.2)',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
              {content.eyebrow || 'CURATED CATALOGUE'}
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
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 400,
              color: 'var(--white)',
              margin: '0 0 16px',
            }}
          >
            {content.heading || 'Download the LUX Architectural Collection'}
          </h2>
        </EditableBox>

        {(content.body || mode === 'editor') && (
          <EditableBox
            sectionId={section.sectionId}
            path="content.body"
            field="body"
            label="Body"
            value={content.body || ''}
            mode={mode}
            isSelected={isFieldSelected('content.body')}
            onSelect={onSelect}
            style={{ marginBottom: '32px' }}
          >
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: 'rgba(243, 243, 235, 0.75)',
                margin: 0,
              }}
            >
              {content.body ||
                'Explore technical specifications, photometric profiles, and custom finish options across our complete portfolio.'}
            </p>
          </EditableBox>
        )}

        {(content.primaryBtnText || mode === 'editor') && (
          <EditableBox
            sectionId={section.sectionId}
            path="content.primaryBtnText"
            field="primaryBtnText"
            type="cta"
            label="Catalogue CTA"
            value={content.primaryBtnText || ''}
            mode={mode}
            isSelected={isFieldSelected('content.primaryBtnText')}
            onSelect={onSelect}
            className="pb-inline-block"
          >
            <span className="btn btn-gold" style={{ cursor: 'pointer' }}>
              <Download size={14} /> {content.primaryBtnText || 'DOWNLOAD SPECIFICATION CATALOGUE'}
            </span>
          </EditableBox>
        )}
      </div>
    </section>
  );
}
