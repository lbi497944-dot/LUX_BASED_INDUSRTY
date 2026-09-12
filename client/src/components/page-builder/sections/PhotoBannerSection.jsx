import { images } from '../../../data/site';

export default function PhotoBannerSection({ media = {} }) {
  const imageUrl = media?.url || images.villa;
  const overlayOpacity = typeof media?.overlayOpacity === 'number' ? media.overlayOpacity : 0.4;
  const showOverlay = media?.overlay !== false;

  return (
    <section
      className="photo-banner-section"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '450px',
        maxHeight: '600px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={imageUrl}
        alt="Architectural Lighting Banner"
        loading="lazy"
        decoding="async"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          inset: 0,
        }}
        onError={(e) => {
          if (e.target.src !== images.villa) {
            e.target.src = images.villa;
          }
        }}
      />
      {showOverlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: `rgba(13, 38, 19, ${overlayOpacity})`,
          }}
        />
      )}
    </section>
  );
}
