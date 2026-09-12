import { useMemo } from 'react';
import {
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Layout,
  MessageSquare,
  HelpCircle,
  Phone,
  FileText,
  Image,
  Sliders,
  Calendar,
  Grid,
} from 'lucide-react';

const typeIcons = {
  hero: Layout,
  philosophy: FileText,
  collections_feed: Grid,
  products_feed: Sparkles,
  before_after: Sliders,
  split_story: Layers,
  value_cards: Sparkles,
  projects_feed: Grid,
  catalogue_cta: FileText,
  process_timeline: Layers,
  testimonials_feed: MessageSquare,
  faq_accordion: HelpCircle,
  consultation_cta: Calendar,
  editorial_text: FileText,
  photo_banner: Image,
  contact_directory: Phone,
};

function formatSectionTitle(section) {
  if (section.content?.heading) {
    return section.content.heading;
  }
  const typeStr = section.type || 'section';
  return typeStr
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function SectionListPanel({
  sections = [],
  selectedSection = null,
  onSelectSection = () => {},
  onReorderSections = () => {},
  onToggleVisibility = () => {},
}) {
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [sections]);

  const handleMoveUp = (e, index) => {
    e.stopPropagation();
    if (index === 0) return;
    const newSections = [...sortedSections];
    const tempOrder = newSections[index].order;
    newSections[index].order = newSections[index - 1].order;
    newSections[index - 1].order = tempOrder;
    onReorderSections(newSections);
  };

  const handleMoveDown = (e, index) => {
    e.stopPropagation();
    if (index === sortedSections.length - 1) return;
    const newSections = [...sortedSections];
    const tempOrder = newSections[index].order;
    newSections[index].order = newSections[index + 1].order;
    newSections[index + 1].order = tempOrder;
    onReorderSections(newSections);
  };

  const handleToggle = (e, sectionId) => {
    e.stopPropagation();
    onToggleVisibility(sectionId);
  };

  const handleSelect = (section) => {
    onSelectSection(section.sectionId);
    // Smoothly scroll the visual canvas to the selected section
    const el = document.getElementById(`pb-section-${section.sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <aside className="pb-section-list-panel" aria-label="Section Navigator">
      <div className="pb-panel-header">
        <div className="pb-panel-title-wrap">
          <Layers size={16} className="pb-panel-icon" />
          <h3>SECTIONS</h3>
        </div>
        <span className="pb-badge-count">{sortedSections.length}</span>
      </div>

      <div className="pb-section-list">
        {sortedSections.map((sec, idx) => {
          const Icon = typeIcons[sec.type] || Layers;
          const isSelected = selectedSection === sec.sectionId;
          const isEnabled = sec.enabled !== false;
          const title = formatSectionTitle(sec);

          return (
            <div
              key={sec.sectionId || sec._id || idx}
              className={`pb-section-item ${isSelected ? 'active' : ''} ${!isEnabled ? 'disabled' : ''}`}
              onClick={() => handleSelect(sec)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(sec);
                }
              }}
              aria-label={`Select section ${title}`}
            >
              <div className="pb-section-item-drag-icon">
                <span className="pb-order-number">{idx + 1}</span>
              </div>

              <div className="pb-section-item-icon">
                <Icon size={14} />
              </div>

              <div className="pb-section-item-meta">
                <span className="pb-section-item-title" title={title}>
                  {title}
                </span>
                <span className="pb-section-item-type">
                  {sec.type ? sec.type.replace(/_/g, ' ') : 'section'}
                </span>
              </div>

              <div className="pb-section-item-actions">
                <button
                  type="button"
                  className={`pb-action-btn ${isEnabled ? 'enabled' : 'disabled'}`}
                  onClick={(e) => handleToggle(e, sec.sectionId)}
                  title={isEnabled ? 'Hide section' : 'Show section'}
                  aria-label={isEnabled ? `Hide section ${title}` : `Show section ${title}`}
                >
                  {isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                <button
                  type="button"
                  className="pb-action-btn"
                  disabled={idx === 0}
                  onClick={(e) => handleMoveUp(e, idx)}
                  title="Move Up"
                  aria-label={`Move section ${title} up`}
                >
                  <ChevronUp size={14} />
                </button>

                <button
                  type="button"
                  className="pb-action-btn"
                  disabled={idx === sortedSections.length - 1}
                  onClick={(e) => handleMoveDown(e, idx)}
                  title="Move Down"
                  aria-label={`Move section ${title} down`}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
