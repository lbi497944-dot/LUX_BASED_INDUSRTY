import HeroSection from './sections/HeroSection';
import PhilosophySection from './sections/PhilosophySection';
import CollectionsFeedSection from './sections/CollectionsFeedSection';
import ProductsFeedSection from './sections/ProductsFeedSection';
import BeforeAfterSlider from '../sections/BeforeAfterSlider';
import SplitStorySection from './sections/SplitStorySection';
import ValueCardsSection from './sections/ValueCardsSection';
import ProjectsFeedSection from './sections/ProjectsFeedSection';
import CatalogueCTA from '../sections/CatalogueCTA';
import ProcessTimelineSection from './sections/ProcessTimelineSection';
import TestimonialsSection from '../sections/TestimonialsSection';
import FaqAccordionSection from './sections/FaqAccordionSection';
import ConsultationCTASection from './sections/ConsultationCTASection';
import EditorialTextSection from './sections/EditorialTextSection';
import PhotoBannerSection from './sections/PhotoBannerSection';
import ContactDirectorySection from './sections/ContactDirectorySection';

// Adapters for existing section components to consume standard Page Builder props
const BeforeAfterAdapter = ({ content, media }) => (
  <BeforeAfterSlider content={content} media={media} />
);

const CatalogueCTAAdapter = ({ content }) => (
  <CatalogueCTA content={content} />
);

const TestimonialsFeedAdapter = ({ content, context }) => (
  <TestimonialsSection
    testimonials={context?.testimonials}
    eyebrow={content?.eyebrow}
    title={content?.heading}
  />
);

export const PRODUCTION_SECTION_REGISTRY = {
  hero: HeroSection,
  philosophy: PhilosophySection,
  collections_feed: CollectionsFeedSection,
  products_feed: ProductsFeedSection,
  before_after: BeforeAfterAdapter,
  split_story: SplitStorySection,
  value_cards: ValueCardsSection,
  projects_feed: ProjectsFeedSection,
  catalogue_cta: CatalogueCTAAdapter,
  process_timeline: ProcessTimelineSection,
  testimonials_feed: TestimonialsFeedAdapter,
  faq_accordion: FaqAccordionSection,
  consultation_cta: ConsultationCTASection,
  editorial_text: EditorialTextSection,
  photo_banner: PhotoBannerSection,
  contact_directory: ContactDirectorySection,
};

export const getProductionSectionComponent = (type) => {
  if (!type || typeof type !== 'string') return null;
  return PRODUCTION_SECTION_REGISTRY[type] || null;
};
