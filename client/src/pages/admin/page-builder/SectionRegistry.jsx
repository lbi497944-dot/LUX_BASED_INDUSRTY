import HeroEditorSection from './sections/HeroEditorSection';
import PhilosophyEditorSection from './sections/PhilosophyEditorSection';
import CollectionsFeedEditorSection from './sections/CollectionsFeedEditorSection';
import ProductsFeedEditorSection from './sections/ProductsFeedEditorSection';
import BeforeAfterEditorSection from './sections/BeforeAfterEditorSection';
import SplitStoryEditorSection from './sections/SplitStoryEditorSection';
import ValueCardsEditorSection from './sections/ValueCardsEditorSection';
import ProjectsFeedEditorSection from './sections/ProjectsFeedEditorSection';
import CatalogueCTAEditorSection from './sections/CatalogueCTAEditorSection';
import ProcessTimelineEditorSection from './sections/ProcessTimelineEditorSection';
import TestimonialsFeedEditorSection from './sections/TestimonialsFeedEditorSection';
import FaqAccordionEditorSection from './sections/FaqAccordionEditorSection';
import ConsultationCTAEditorSection from './sections/ConsultationCTAEditorSection';
import EditorialTextEditorSection from './sections/EditorialTextEditorSection';
import PhotoBannerEditorSection from './sections/PhotoBannerEditorSection';
import ContactDirectoryEditorSection from './sections/ContactDirectoryEditorSection';
import { AlertTriangle } from 'lucide-react';

/**
 * Static, code-controlled registry mapping all 16 Stage 1 section types.
 * Strictly prevents dynamic code evaluation or arbitrary component injection.
 */
export const SECTION_REGISTRY = {
  hero: HeroEditorSection,
  philosophy: PhilosophyEditorSection,
  collections_feed: CollectionsFeedEditorSection,
  products_feed: ProductsFeedEditorSection,
  before_after: BeforeAfterEditorSection,
  split_story: SplitStoryEditorSection,
  value_cards: ValueCardsEditorSection,
  projects_feed: ProjectsFeedEditorSection,
  catalogue_cta: CatalogueCTAEditorSection,
  process_timeline: ProcessTimelineEditorSection,
  testimonials_feed: TestimonialsFeedEditorSection,
  faq_accordion: FaqAccordionEditorSection,
  consultation_cta: ConsultationCTAEditorSection,
  editorial_text: EditorialTextEditorSection,
  photo_banner: PhotoBannerEditorSection,
  contact_directory: ContactDirectoryEditorSection,
};

/**
 * Safe fallback component rendered when an unknown or unsupported section type is encountered.
 * Prevents editor crashes and provides graceful administrative recovery.
 */
export function UnknownSectionFallback({ section }) {
  return (
    <div
      className="pb-unknown-section"
      style={{
        padding: '36px 24px',
        margin: '16px',
        border: '1px dashed rgba(234, 179, 8, 0.4)',
        borderRadius: '6px',
        backgroundColor: 'rgba(234, 179, 8, 0.08)',
        color: '#facc15',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <AlertTriangle size={24} />
      <div>
        <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#facc15' }}>
          Unrecognized Section Type: <code>{String(section.type || 'unknown')}</code>
        </h4>
        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(243, 243, 235, 0.7)' }}>
          Section ID: <code>{section.sectionId}</code> (Order: {section.order}). This section cannot be visually rendered in the builder preview.
        </p>
      </div>
    </div>
  );
}

/**
 * Helper to retrieve the section component safely
 */
export function getSectionComponent(type) {
  if (Object.prototype.hasOwnProperty.call(SECTION_REGISTRY, type)) {
    return SECTION_REGISTRY[type];
  }
  return UnknownSectionFallback;
}

export default SECTION_REGISTRY;
