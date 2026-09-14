import { images } from '../../data/site';
import { useSettings } from '../../context/SettingsContext';
import { Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CollectionLivePreview({ formData = {} }) {
  const { settings } = useSettings();
  const brand = settings?.brandName || 'LUX BASED INDUSTRY';

  const name = formData.name?.trim() || 'Curated Collection';
  const eyebrow = formData.eyebrow?.trim() || '01 / STATEMENT ELEGANCE';
  const tagline = formData.tagline?.trim() || 'Timeless elegance in every crystal.';
  const description =
    formData.description?.trim() ||
    'Sculptural centrepieces designed to command the room without overwhelming it. Crafted with optical-grade crystal and hand-finished brushed brass.';
  const heroImage = formData.heroImage?.trim() || images.chandelier;
  const materials = formData.materials?.trim() || 'Solid Brushed Brass, Hand-Cut Lead-Free Crystal, Anodized Aluminum';
  const applications = formData.applications?.trim() || 'Grand foyers, double-height living rooms, formal dining halls, luxury hotel lobbies';

  const rawFeatures = formData.featuresText || (Array.isArray(formData.features) ? formData.features.join('\n') : '');
  const featuresList = rawFeatures
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  return (
    <div className="preview-collection-container">
      {/* Luxury Hero Banner */}
      <div
        className="preview-hero-banner"
        style={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '20px',
          border: '1px solid rgba(230, 199, 122, 0.25)',
          background: '#040e08',
        }}
      >
        <div style={{ height: '240px', width: '100%', position: 'relative' }}>
          <img
            src={heroImage}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }}
            onError={(e) => {
              if (e.target.src !== images.chandelier) {
                e.target.src = images.chandelier;
              }
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(4, 14, 8, 0.95) 0%, rgba(4, 14, 8, 0.3) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '20px',
            }}
          >
            <span className="eyebrow gold-label" style={{ fontSize: '10px', letterSpacing: '0.2em' }}>
              {eyebrow}
            </span>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold, #e6c77a)', fontSize: '22px', margin: '4px 0 6px' }}>
              {name}
            </h2>
            <p style={{ fontStyle: 'italic', fontSize: '13px', color: '#FAF8F1', margin: 0 }}>
              {tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Description & Technical Highlights */}
      <div
        style={{
          background: '#112e17',
          border: '1px solid rgba(230, 199, 122, 0.2)',
          borderRadius: '8px',
          padding: '18px 20px',
          marginBottom: '16px',
        }}
      >
        <span className="eyebrow gold-label" style={{ fontSize: '9px' }}>CURATORIAL OVERVIEW</span>
        <p style={{ color: 'rgba(243, 243, 235, 0.9)', fontSize: '13px', lineHeight: '1.6', margin: '8px 0 16px' }}>
          {description}
        </p>

        {featuresList.length > 0 && (
          <div style={{ margin: '14px 0' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gold, #e6c77a)', display: 'block', marginBottom: '8px' }}>
              SIGNATURE CRAFTSMANSHIP & FEATURES
            </span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {featuresList.map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#FAF8F1' }}>
                  <CheckCircle2 size={13} style={{ color: 'var(--gold, #e6c77a)', flexShrink: 0 }} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(230, 199, 122, 0.15)' }}>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--gold, #e6c77a)', display: 'block', fontWeight: 600 }}>MATERIALS</span>
            <span style={{ fontSize: '11px', color: 'rgba(243, 243, 235, 0.8)' }}>{materials}</span>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--gold, #e6c77a)', display: 'block', fontWeight: 600 }}>APPLICATIONS</span>
            <span style={{ fontSize: '11px', color: 'rgba(243, 243, 235, 0.8)' }}>{applications}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
