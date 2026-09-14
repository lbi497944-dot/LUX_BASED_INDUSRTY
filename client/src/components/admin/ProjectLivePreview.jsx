import { images } from '../../data/site';
import { useSettings } from '../../context/SettingsContext';
import { MapPin, Calendar, Layers, Sparkles, MessageCircle } from 'lucide-react';

export default function ProjectLivePreview({ formData = {} }) {
  const { settings } = useSettings();
  const brand = settings?.brandName || 'LUX BASED INDUSTRY';

  const title = formData.title?.trim() || 'Private Architectural Commission';
  const location = formData.location?.trim() || 'Dubai, UAE';
  const category = formData.category || 'Residential';
  const year = formData.year?.trim() || '2025';
  const description =
    formData.description?.trim() ||
    'A bespoke architectural lighting commission encompassing bespoke crystal installations, cove scene programming, and custom facade accentuation.';
  const scope = formData.scope?.trim() || 'Interior Lighting Architecture, Custom Luminaire Engineering';
  const coverImage = formData.coverImage?.trim() || images.hotel;
  const gallery = Array.isArray(formData.gallery) ? formData.gallery.filter(Boolean) : [];

  return (
    <div className="preview-project-container">
      {/* Cover Image Showcase */}
      <div
        style={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '16px',
          border: '1px solid rgba(230, 199, 122, 0.25)',
          background: '#040e08',
        }}
      >
        <div style={{ height: '220px', width: '100%', position: 'relative' }}>
          <img
            src={coverImage}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              if (e.target.src !== images.hotel) {
                e.target.src = images.hotel;
              }
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(4, 14, 8, 0.95) 0%, rgba(4, 14, 8, 0.2) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  background: 'rgba(21, 57, 29, 0.85)',
                  color: 'var(--gold, #e6c77a)',
                  border: '1px solid rgba(230, 199, 122, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                {category?.toUpperCase()}
              </span>
              <span
                style={{
                  background: 'rgba(21, 57, 29, 0.85)',
                  color: '#FAF8F1',
                  border: '1px solid rgba(230, 199, 122, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '9px',
                }}
              >
                {year}
              </span>
            </div>
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold, #e6c77a)', fontSize: '18px', margin: '2px 0 4px' }}>
              {title}
            </h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'rgba(243, 243, 235, 0.8)', fontSize: '11px' }}>
              <MapPin size={11} style={{ color: 'var(--gold, #e6c77a)' }} /> {location}
            </span>
          </div>
        </div>
      </div>

      {/* Description & Scope Box */}
      <div
        style={{
          background: '#112e17',
          border: '1px solid rgba(230, 199, 122, 0.2)',
          borderRadius: '8px',
          padding: '16px 18px',
          marginBottom: '16px',
        }}
      >
        <span className="eyebrow gold-label" style={{ fontSize: '9px' }}>COMMISSION DETAILS</span>
        <p style={{ color: 'rgba(243, 243, 235, 0.9)', fontSize: '12px', lineHeight: '1.6', margin: '6px 0 12px' }}>
          {description}
        </p>

        <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(230, 199, 122, 0.15)' }}>
          <span style={{ fontSize: '10px', color: 'var(--gold, #e6c77a)', display: 'block', fontWeight: 600 }}>PROJECT SCOPE</span>
          <span style={{ fontSize: '11px', color: 'rgba(243, 243, 235, 0.85)' }}>{scope}</span>
        </div>
      </div>

      {/* In Situ Gallery Preview */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '10px', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--gold, #e6c77a)', display: 'block', marginBottom: '8px' }}>
          IN SITU PHOTOGRAPHY GALLERY ({gallery.length})
        </span>
        {gallery.length === 0 ? (
          <div
            style={{
              padding: '18px',
              textAlign: 'center',
              background: 'rgba(21, 57, 29, 0.3)',
              border: '1px dashed rgba(230, 199, 122, 0.2)',
              borderRadius: '6px',
              fontSize: '11px',
              color: 'rgba(243, 243, 235, 0.5)',
            }}
          >
            Upload photos to populate the project lightbox gallery
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
            {gallery.map((url, i) => (
              <div
                key={i}
                style={{
                  height: '70px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid rgba(230, 199, 122, 0.25)',
                }}
              >
                <img src={url} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Action */}
      <div style={{ textAlign: 'right' }}>
        <span className="btn-link-whatsapp" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          <MessageCircle size={14} /> ENQUIRE ABOUT THIS PROJECT
        </span>
      </div>
    </div>
  );
}
