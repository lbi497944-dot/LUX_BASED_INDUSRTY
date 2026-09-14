import { useSettings } from '../../context/SettingsContext';
import { Mail, Paperclip, FileText, ArrowRight } from 'lucide-react';

export default function NewsletterLivePreview({ formData = {} }) {
  const { settings } = useSettings();
  const brand = settings?.brandName || 'LUX BASED INDUSTRY';
  const email = settings?.email || 'luxbasedindustries@gmail.com';

  const subject = formData.subject?.trim() || 'Exclusive Architectural Preview: 2026 Collections';
  const previewText = formData.previewText?.trim() || 'Bespoke luminaires engineered for luxury interiors';
  const heading = formData.heading?.trim() || 'Architectural Illumination · 2026 Collection';
  const content =
    formData.content?.trim() ||
    '<p>We are delighted to present our latest bespoke luminaires, designed specifically for luxury residences, destination hotels, and signature commercial spaces.</p><p>Crafted with optical-grade crystal and hand-finished solid brass, each piece commands the room with timeless elegance.</p>';
  const imageUrl = formData.imageUrl?.trim();
  const ctaText = formData.ctaText?.trim();
  const attachments = Array.isArray(formData.attachments) ? formData.attachments : [];

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="preview-newsletter-container">
      {/* Simulated Email Client Envelope */}
      <div
        style={{
          background: '#0a1c10',
          border: '1px solid rgba(230, 199, 122, 0.2)',
          borderRadius: '6px 6px 0 0',
          padding: '10px 14px',
          fontSize: '11px',
          color: 'rgba(243, 243, 235, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ color: 'var(--gold, #e6c77a)', fontWeight: 600 }}>From:</span>
          <span>{brand} &lt;{email}&gt;</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ color: 'var(--gold, #e6c77a)', fontWeight: 600 }}>Subject:</span>
          <strong style={{ color: '#FAF8F1' }}>{subject}</strong>
        </div>
        {previewText && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ color: 'var(--gold, #e6c77a)', fontWeight: 600 }}>Preheader:</span>
            <span style={{ fontStyle: 'italic' }}>{previewText}</span>
          </div>
        )}
      </div>

      {/* Simulated Email Template Frame */}
      <div
        style={{
          background: '#0E1612',
          padding: '20px 14px',
          border: '1px solid rgba(230, 199, 122, 0.2)',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            background: '#FAF8F1',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            color: '#2B2B2B',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Email Header */}
          <div
            style={{
              padding: '24px 20px',
              textAlign: 'center',
              backgroundColor: '#15391D',
              borderBottom: '2px solid #C5A059',
            }}
          >
            <h1
              style={{
                fontFamily: 'Cinzel, "Cormorant Garamond", Georgia, serif',
                fontSize: '18px',
                letterSpacing: '0.15em',
                color: '#FAF8F1',
                margin: '0 0 2px 0',
                fontWeight: 600,
              }}
            >
              {brand}
            </h1>
            <p
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '8px',
                letterSpacing: '0.25em',
                color: '#C5A059',
                margin: 0,
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              ARCHITECTURAL LIGHTING
            </p>
          </div>

          {/* Featured Image */}
          {imageUrl && (
            <div style={{ width: '100%', maxHeight: '220px', overflow: 'hidden', backgroundColor: '#000' }}>
              <img src={imageUrl} alt="Newsletter Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Email Body */}
          <div style={{ padding: '24px 22px' }}>
            <h2
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: '20px',
                color: '#15391D',
                margin: '0 0 14px 0',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              {heading}
            </h2>

            <div
              style={{
                fontSize: '13px',
                lineHeight: '1.7',
                color: '#333333',
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {ctaText && (
              <div style={{ textAlign: 'center', margin: '22px 0 10px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#15391D',
                    color: '#FAF8F1',
                    padding: '10px 24px',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    border: '1px solid #C5A059',
                  }}
                >
                  {ctaText}
                </span>
              </div>
            )}

            {attachments.length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E0D8C3' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.1em', fontWeight: 600, color: '#15391D', display: 'block', marginBottom: '8px' }}>
                  ATTACHED DOCUMENTS ({attachments.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {attachments.map((att, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: '#F3EFE6',
                        border: '1px solid #E0D8C3',
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={13} color="#15391D" />
                        <span style={{ fontWeight: 500, color: '#15391D' }}>{att.filename || 'Document'}</span>
                      </div>
                      {att.size && <span style={{ color: '#888888', fontSize: '10px' }}>{formatFileSize(att.size)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Email Footer */}
          <div
            style={{
              padding: '18px 20px',
              textAlign: 'center',
              borderTop: '1px solid #E0D8C3',
              backgroundColor: '#F3EFE6',
              fontSize: '10px',
              color: '#666666',
              lineHeight: '1.5',
            }}
          >
            <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#15391D', letterSpacing: '0.05em' }}>
              {brand} · ARCHITECTURAL LIGHTING
            </p>
            <p style={{ margin: '0 0 6px 0' }}>Inquiries: {email}</p>
            <p style={{ margin: 0, color: '#888888' }}>You are receiving this communication as a subscriber to {brand} architectural updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
