import SectionTitle from '../../sections/SectionTitle';
import { processSteps as fallbackProcessSteps } from '../../../data/site';

export default function ProcessTimelineSection({ content = {} }) {
  const eyebrow = content?.eyebrow || 'OUR PROCESS';
  const heading = content?.heading || 'From Vision to Illumination';

  let displaySteps = fallbackProcessSteps;
  if (Array.isArray(content?.customItems) && content.customItems.length > 0) {
    const sorted = [...content.customItems].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    displaySteps = sorted.map((item, idx) => ({
      step: item.subtitle || item.step || `0${idx + 1}`,
      title: item.title || `Phase 0${idx + 1}`,
      description: item.text || item.description || '',
    }));
  }

  return (
    <section className="section process-section">
      <div className="container">
        <SectionTitle
          eyebrow={eyebrow}
          title={heading}
        />
        <div className="process-timeline-desktop">
          {displaySteps.map((step, idx) => {
            const stepKey = step.step || step.title || `step-${idx}`;
            return (
              <div key={stepKey} className="process-step-col">
                <span className="process-number">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
