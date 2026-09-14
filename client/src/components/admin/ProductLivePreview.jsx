import { useState } from 'react';
import { Sparkles, MessageCircle, Heart, CheckCircle2, Shield, Layers, Settings } from 'lucide-react';
import { images } from '../../data/site';
import { useSettings } from '../../context/SettingsContext';

export default function ProductLivePreview({ formData = {} }) {
  const { settings } = useSettings();
  const brand = settings?.brandName || 'LUX BASED INDUSTRY';
  const [isSaved, setIsSaved] = useState(false);

  const name = formData.name?.trim() || 'Bespoke Luminaire Fixture';
  const category = formData.category || 'Grand Chandelier';
  const image = formData.image?.trim() || images.chandelier;
  const description =
    formData.description?.trim() ||
    'Precision-engineered luxury lighting fixture crafted with optical-grade crystal and hand-finished solid brass for prestigious architectural interiors.';
  const finish = formData.finish?.trim() || formData.materials?.trim() || 'Solid Brushed Brass · Hand-Finished Patina';
  const dimensions = formData.dimensions?.trim() || 'Ø 1200mm × H 1800mm (Custom Drop Available)';
  const colorTemp = formData.colorTemperature || '2700K Warm White';
  const wattage = formData.wattage?.trim() ? `${formData.wattage}W` : 'Integrated High-CRI LED';
  const ipRating = formData.ipRating || 'IP20 (Indoor)';
  const specifications = formData.specifications?.trim();

  return (
    <div className="preview-product-container">
      {/* Product Card Presentation matching public site */}
      <div className="product-card-luxury detail-product-card preview-elevated-card">
        <div className="product-image-frame" style={{ position: 'relative' }}>
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              if (e.target.src !== images.chandelier) {
                e.target.src = images.chandelier;
              }
            }}
          />
          <button
            type="button"
            className={`product-save-heart preview-interactive ${isSaved ? 'saved' : ''}`}
            onClick={() => setIsSaved(!isSaved)}
            title="Save to bookmarks"
            aria-label="Bookmark product preview"
          >
            <Heart size={16} fill={isSaved ? 'var(--gold)' : 'none'} color={isSaved ? 'var(--gold)' : '#ffffff'} />
          </button>
          {formData.featured && (
            <span
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(21, 57, 29, 0.9)',
                color: 'var(--gold, #e6c77a)',
                border: '1px solid rgba(230, 199, 122, 0.4)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                letterSpacing: '0.1em',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Featured Piece
            </span>
          )}
        </div>

        <div className="product-info">
          <small className="product-category">{category?.toUpperCase()}</small>
          <h3 className="product-name">{name}</h3>
          <p className="product-desc">{description}</p>

          <div
            className="preview-specs-box"
            style={{
              background: 'rgba(21, 57, 29, 0.4)',
              border: '1px solid rgba(230, 199, 122, 0.2)',
              borderRadius: '6px',
              padding: '12px 14px',
              margin: '14px 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              fontSize: '11px',
            }}
          >
            <div>
              <span style={{ color: 'var(--gold, #e6c77a)', display: 'block', fontWeight: 600 }}>DIMENSIONS</span>
              <span style={{ color: 'rgba(243, 243, 235, 0.85)' }}>{dimensions}</span>
            </div>
            <div>
              <span style={{ color: 'var(--gold, #e6c77a)', display: 'block', fontWeight: 600 }}>FINISH / MATERIAL</span>
              <span style={{ color: 'rgba(243, 243, 235, 0.85)' }}>{finish}</span>
            </div>
            <div>
              <span style={{ color: 'var(--gold, #e6c77a)', display: 'block', fontWeight: 600 }}>COLOR TEMP</span>
              <span style={{ color: 'rgba(243, 243, 235, 0.85)' }}>{colorTemp}</span>
            </div>
            <div>
              <span style={{ color: 'var(--gold, #e6c77a)', display: 'block', fontWeight: 600 }}>WATTAGE & RATING</span>
              <span style={{ color: 'rgba(243, 243, 235, 0.85)' }}>{wattage} · {ipRating}</span>
            </div>
          </div>

          {specifications && (
            <p className="product-specs" style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(243, 243, 235, 0.7)' }}>
              {specifications}
            </p>
          )}

          <div className="product-card-actions" style={{ marginTop: '14px' }}>
            <span className="btn-link-whatsapp" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <MessageCircle size={14} /> ENQUIRE ON WHATSAPP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
