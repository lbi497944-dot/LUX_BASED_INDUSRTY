import EditableBox from '../EditableBox';

export default function PhotoBannerEditorSection({ section, mode, selectedElement, onSelect }) {
  const media = section.media || {};

  const isFieldSelected = (path) =>
    selectedElement?.sectionId === section.sectionId && selectedElement?.path === path;

  const imageUrl = media.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85';

  return (
    <section
      className="pb-section pb-photo-banner"
      style={{
        padding: 0,
        backgroundColor: '#0d2613',
      }}
    >
      <EditableBox
        sectionId={section.sectionId}
        path="media"
        field="media"
        type="media"
        label="Photo Banner"
        value={media}
        mode={mode}
        isSelected={isFieldSelected('media')}
        onSelect={onSelect}
        style={{
          position: 'relative',
          height: '480px',
          overflow: 'hidden',
        }}
      >
        {media.mediaType === 'video' && media.videoUrl ? (
          <video
            src={media.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img
            src={imageUrl}
            alt="Showcase Banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </EditableBox>
    </section>
  );
}
