import { Quote, Star } from 'lucide-react';
import SectionTitle from './SectionTitle';
import Reveal from './Reveal';

export default function TestimonialsSection({
  testimonials = [],
  eyebrow = 'CLIENT ENDORSEMENTS',
  title = 'Trusted by Leading Architects & Designers',
}) {
  if (!Array.isArray(testimonials) || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="section dark-section testimonials-section" id="testimonials">
      <div className="container">
        <SectionTitle
          eyebrow={eyebrow}
          title={title}
          align="center"
        />

        <div className="testimonials-grid">
          {testimonials.map((item, idx) => {
            const itemKey = item._id || item.id || `testimonial-${idx}`;
            const safeRating = Math.min(Math.max(Number(item.rating) || 5, 1), 5);
            const attribution = [item.role, item.company].filter(Boolean).join(' · ');

            return (
              <Reveal key={itemKey} delay={idx * 0.12}>
                <div className="testimonial-card-luxury">
                  <div className="testimonial-card-header">
                    <div className="testimonial-rating" aria-label={`${safeRating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          size={14}
                          fill={starIdx < safeRating ? 'var(--gold)' : 'none'}
                          color={starIdx < safeRating ? 'var(--gold)' : 'rgba(243, 243, 235, 0.2)'}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <Quote size={24} className="testimonial-quote-icon" aria-hidden="true" />
                  </div>

                  <blockquote className="testimonial-quote">
                    <p>{item.content}</p>
                  </blockquote>

                  <cite className="testimonial-author">
                    <strong className="testimonial-author-name">{item.name}</strong>
                    {attribution ? (
                      <span className="testimonial-author-title">{attribution}</span>
                    ) : null}
                  </cite>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
