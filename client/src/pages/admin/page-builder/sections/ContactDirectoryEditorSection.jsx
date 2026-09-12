import EditableBox from '../EditableBox';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactDirectoryEditorSection({ section, mode, selectedElement, onSelect }) {
  const content = section.content || {};

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  return (
    <section
      className="pb-section pb-contact-directory"
      style={{
        padding: '90px 48px',
        backgroundColor: 'var(--white)',
        color: 'var(--dark-green)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ maxWidth: '700px', marginBottom: '48px' }}>
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
                {content.eyebrow || 'STUDIO DIRECTORY'}
              </span>
            </EditableBox>
          )}

          <div style={{ marginBottom: '20px' }}>
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
                {content.heading || 'Start with a'}
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
                  {content.italicHeading || 'conversation.'}
                </h3>
              </EditableBox>
            )}
          </div>

          {(content.body || mode === 'editor') && (
            <EditableBox
              sectionId={section.sectionId}
              path="content.body"
              field="body"
              label="Directory Body"
              value={content.body || ''}
              mode={mode}
              isSelected={isFieldSelected('content.body')}
              onSelect={onSelect}
            >
              <p style={{ fontSize: '16px', lineHeight: 1.65, color: 'var(--muted-text)', margin: 0 }}>
                {content.body ||
                  'Reach out to our lighting studio to discuss fixture specifications, arrange a private lighting demonstration, or request sample finish boxes.'}
              </p>
            </EditableBox>
          )}
        </div>

        {/* Directory Contact Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
          }}
        >
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-cream)', borderRadius: '6px' }}>
            <MapPin size={22} color="var(--gold-text)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '15px', color: 'var(--dark-green)', margin: '0 0 6px' }}>Studio Location</h4>
            <p style={{ fontSize: '13px', color: 'var(--muted-text)', margin: 0 }}>
              Design District, Building 4, Suite 302, Dubai, UAE
            </p>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-cream)', borderRadius: '6px' }}>
            <Phone size={22} color="var(--gold-text)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '15px', color: 'var(--dark-green)', margin: '0 0 6px' }}>Direct Phone</h4>
            <p style={{ fontSize: '13px', color: 'var(--muted-text)', margin: 0 }}>
              +971 4 812 3400
            </p>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-cream)', borderRadius: '6px' }}>
            <Mail size={22} color="var(--gold-text)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '15px', color: 'var(--dark-green)', margin: '0 0 6px' }}>Enquiries</h4>
            <p style={{ fontSize: '13px', color: 'var(--muted-text)', margin: 0 }}>
              studio@luxindustry.ae
            </p>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-cream)', borderRadius: '6px' }}>
            <Clock size={22} color="var(--gold-text)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '15px', color: 'var(--dark-green)', margin: '0 0 6px' }}>Consultation Hours</h4>
            <p style={{ fontSize: '13px', color: 'var(--muted-text)', margin: 0 }}>
              Monday – Saturday: 09:00 – 19:00
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
