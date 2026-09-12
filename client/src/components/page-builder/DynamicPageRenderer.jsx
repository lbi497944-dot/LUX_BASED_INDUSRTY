import { getProductionSectionComponent } from './SectionRegistry';

export default function DynamicPageRenderer({ page, context = {} }) {
  if (!page || typeof page !== 'object') {
    return null;
  }

  const rawSections = Array.isArray(page.publishedSections) ? page.publishedSections : [];
  if (rawSections.length === 0) {
    return null;
  }

  // 1. Filter enabled sections only (enabled !== false)
  const validSections = rawSections.filter(
    (sec) => sec && typeof sec === 'object' && sec.type && sec.enabled !== false
  );

  // 2. Sort by numeric order safely (fall back to original index if order is missing or non-numeric)
  const sortedSections = [...validSections].sort((a, b) => {
    const orderA = typeof a.order === 'number' && !Number.isNaN(a.order) ? a.order : 9999;
    const orderB = typeof b.order === 'number' && !Number.isNaN(b.order) ? b.order : 9999;
    return orderA - orderB;
  });

  return (
    <>
      {sortedSections.map((section, index) => {
        if (!section || !section.type) return null;

        const Renderer = getProductionSectionComponent(section.type);
        if (!Renderer) {
          // Gracefully skip unknown or unsupported section types without crashing
          return null;
        }

        const sectionKey = section.sectionId || `${section.type}-${section.order !== undefined ? section.order : index}`;

        return (
          <Renderer
            key={sectionKey}
            section={section}
            content={section.content || {}}
            media={section.media || {}}
            context={context || {}}
          />
        );
      })}
    </>
  );
}
