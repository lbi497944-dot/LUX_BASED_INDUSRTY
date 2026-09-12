import { Sparkles, Ruler, Lightbulb, ShieldCheck, Award, Compass, Gem, Layers, Settings, Check } from 'lucide-react';
import SectionTitle from '../../sections/SectionTitle';
import Reveal from '../../sections/Reveal';

const ICON_MAP = {
  Sparkles: <Sparkles size={24} />,
  Ruler: <Ruler size={24} />,
  Lightbulb: <Lightbulb size={24} />,
  ShieldCheck: <ShieldCheck size={24} />,
  Award: <Award size={24} />,
  Compass: <Compass size={24} />,
  Gem: <Gem size={24} />,
  Layers: <Layers size={24} />,
  Settings: <Settings size={24} />,
  Check: <Check size={24} />,
};

export default function ValueCardsSection({ content = {}, context = {} }) {
  const brandName = context?.settings?.brandName || 'LUX BASED INDUSTRY';
  const eyebrow = content?.eyebrow || `WHY ${brandName}`;
  const heading = content?.heading || 'The Standards of Luxury Illumination';
  const alignment = content?.alignment || 'center';

  const defaultItems = [
    {
      title: 'BESPOKE DESIGN',
      text: 'Tailored lighting solutions crafted for your space.',
      icon: <Sparkles size={24} />,
    },
    {
      title: 'PREMIUM QUALITY',
      text: 'Exceptional materials and meticulous craftsmanship.',
      icon: <Ruler size={24} />,
    },
    {
      title: 'INNOVATIVE TECHNOLOGY',
      text: 'Intelligent lighting solutions for modern living.',
      icon: <Lightbulb size={24} />,
    },
    {
      title: 'EXPERT CONSULTATION',
      text: 'Professional guidance from concept to execution.',
      icon: <ShieldCheck size={24} />,
    },
  ];

  let displayItems = defaultItems;
  if (Array.isArray(content?.customItems) && content.customItems.length > 0) {
    const sorted = [...content.customItems].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    displayItems = sorted.map((item, idx) => ({
      title: item.title || `Standard 0${idx + 1}`,
      text: item.text || item.description || '',
      icon: (item.iconName && ICON_MAP[item.iconName]) || <Sparkles size={24} />,
    }));
  }

  return (
    <section className="section why-section">
      <div className="container">
        <SectionTitle
          eyebrow={eyebrow}
          title={heading}
          align={alignment}
        />
        <div className="why-grid">
          {displayItems.map((item, idx) => {
            const whyKey = item.id || item.title || `why-${idx}`;
            return (
              <Reveal key={whyKey} delay={idx * 0.1}>
                <div className="why-card">
                  <div className="why-icon-box">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
