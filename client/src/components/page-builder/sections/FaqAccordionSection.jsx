import { useState } from 'react';
import SectionTitle from '../../sections/SectionTitle';

const fallbackFaqs = [
  {
    question: 'What types of architectural lighting does LUX BASED INDUSTRY offer?',
    answer: 'LUX BASED INDUSTRY specializes in luxury chandeliers, architectural pendants, concealed smart ambient cove systems, low-profile wall sconces, and fully bespoke custom lighting concepts for high-end residential and commercial spaces.',
  },
  {
    question: 'Do you provide custom lighting solutions for private villas and hotels?',
    answer: 'Yes, our lighting architects and master craftsmen engineer bespoke one-of-one lighting fixtures tailored to unique room ceiling scales, architectural geometry, and interior design briefs across Dubai, Abu Dhabi, Doha, and globally.',
  },
  {
    question: 'Does LUX BASED INDUSTRY provide lighting consultation services in Dubai & UAE?',
    answer: 'We provide end-to-end lighting consultations in Dubai and the UAE. Our team reviews room blueprints, natural light orientation, material finishes, photometrics, and smart lighting scene controls.',
  },
  {
    question: 'Are your lighting systems compatible with Lutron, KNX, or DALI controls?',
    answer: 'All LUX BASED INDUSTRY fixtures and ambient systems integrate seamlessly with major smart automation standards including DALI-2, Lutron HomeWorks, Control4, and KNX digital dimming controllers.',
  },
];

export default function FaqAccordionSection({ content = {}, context = {} }) {
  const [localOpen, setLocalOpen] = useState(null);
  const openFaq = context?.openFaq !== undefined ? context.openFaq : localOpen;
  const setOpenFaq = context?.setOpenFaq || setLocalOpen;

  const eyebrow = content?.eyebrow || 'FREQUENTLY ASKED QUESTIONS';
  const heading = content?.heading || 'Architectural Lighting Insights';
  const alignment = content?.alignment || 'center';

  const items = Array.isArray(context?.faqItems) && context.faqItems.length > 0
    ? context.faqItems
    : fallbackFaqs;

  return (
    <section className="section faq-section">
      <div className="container">
        <SectionTitle
          eyebrow={eyebrow}
          title={heading}
          align={alignment}
        />

        <div className="faq-accordion-container">
          {items.map((faq, index) => {
            const faqKey = faq._id || faq.id || faq.question || `faq-${index}`;
            const isOpen = openFaq === index;
            return (
              <div
                key={faqKey}
                className={`faq-item ${isOpen ? 'open' : ''}`}
                onClick={() => setOpenFaq(isOpen ? null : index)}
              >
                <div className="faq-question">
                  <h3>{faq.question}</h3>
                  <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                </div>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
