import { useMemo } from 'react';
import { getSectionComponent } from './SectionRegistry';
import { EyeOff } from 'lucide-react';

export default function VisualEditor({
  sections = [],
  mode = 'editor',
  selectedElement = null,
  selectedSection = null,
  onSelect = () => {},
  viewport = 'desktop',
}) {
  // Sort sections strictly by their numerical order
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [sections]);

  // Viewport width styling
  const viewportWidth = useMemo(() => {
    switch (viewport) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  }, [viewport]);

  return (
    <div className="pb-canvas-outer">
      <div
        className={`pb-viewport-frame pb-viewport-${viewport}`}
        style={{
          width: viewportWidth,
          maxWidth: '100%',
          margin: '0 auto',
          transition: 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {sortedSections.length === 0 ? (
          <div className="pb-empty-canvas">
            <h3>No sections configured</h3>
            <p>This page currently has no draft sections to preview.</p>
          </div>
        ) : (
          sortedSections.map((section) => {
            const isEnabled = section.enabled !== false;
            // In preview mode, completely omit disabled sections
            if (!isEnabled && mode === 'preview') {
              return null;
            }

            const SectionComponent = getSectionComponent(section.type);
            const isSectionSelected = selectedSection === section.sectionId;

            return (
              <div
                key={section.sectionId || section._id || section.order}
                id={`pb-section-${section.sectionId}`}
                data-section-id={section.sectionId}
                className={`pb-section-container ${!isEnabled ? 'is-disabled' : ''} ${
                  isSectionSelected ? 'is-section-selected' : ''
                }`}
                onClick={(e) => {
                  // If clicked directly on the section container background
                  if (mode === 'editor' && e.target === e.currentTarget) {
                    onSelect({
                      sectionId: section.sectionId,
                      path: '',
                      field: 'section',
                      type: 'section',
                      value: section,
                      label: `SECTION (${section.type})`,
                    });
                  }
                }}
              >
                {!isEnabled && mode === 'editor' && (
                  <div className="pb-disabled-banner" aria-label="Section hidden from public display">
                    <EyeOff size={14} />
                    <span>SECTION HIDDEN / DISABLED</span>
                  </div>
                )}

                <SectionComponent
                  section={section}
                  mode={mode}
                  selectedElement={selectedElement}
                  selectedSection={selectedSection}
                  onSelect={onSelect}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
