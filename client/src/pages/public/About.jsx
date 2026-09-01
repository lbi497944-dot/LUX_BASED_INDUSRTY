import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Ruler, Compass, Award } from 'lucide-react';
import { images, processSteps } from '../../data/site';
import PageHero from '../../components/sections/PageHero';
import SectionTitle from '../../components/sections/SectionTitle';
import Reveal from '../../components/sections/Reveal';
import SEO from '../../components/common/SEO';
import { pageSeoData, siteConfig } from '../../seo/seoConfig';

export default function About() {
  const principles = [
    {
      num: '01',
      title: 'Our Philosophy',
      text: 'Lighting is the soul of an interior. It reveals architectural form, creates emotional depth, and defines how people feel within a space.',
      icon: <Sparkles size={22} />
    },
    {
      num: '02',
      title: 'Our Craft',
      text: 'We combine hand-blown European crystal, hand-finished solid brass, and custom optical lenses to build luminaires of enduring brilliance.',
      icon: <Ruler size={22} />
    },
    {
      num: '03',
      title: 'Our Expertise',
      text: 'Our lighting architects bring decades of experience across high-end residential estates, luxury hospitality, and private palaces.',
      icon: <Award size={22} />
    },
    {
      num: '04',
      title: 'Our Approach',
      text: 'We integrate fixture design with smart automation (DALI/Lutron/KNX) so your lighting transitions seamlessly from morning to night.',
      icon: <Compass size={22} />
    }
  ];

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.siteName,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/favicon.svg`,
    description: siteConfig.defaultDescription,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dubai',
      addressCountry: 'AE'
    }
  };

  return (
    <main className="about-page">
      <SEO
        title={pageSeoData.about.title}
        description={pageSeoData.about.description}
        canonical="/about"
        schemaData={aboutSchema}
      />

      <PageHero
        eyebrow="OUR STORY"
        title="Crafting Light. Defining Luxury."
        description="Veloura brings together artistic vision, architectural understanding, and technical optical precision to create unforgettable lighting environments."
        image={images.story}
      />

      {/* Editorial Intro Section */}
      <section className="section">
        <div className="container">
          <div className="editorial-split">
            <div className="editorial-left">
              <span className="eyebrow gold-label">THE VELOURA STATEMENT</span>
              <h2 className="editorial-heading">
                Lighting is the <em>soul</em><br />
                of an interior.
              </h2>
            </div>
            <div className="editorial-right">
              <p className="editorial-body">
                At Veloura, we believe the best lighting is felt before it is noticed. It reveals raw material, frames architectural symmetry, creates human rhythm, and gives people a compelling reason to linger.
              </p>
              <p className="editorial-body" style={{ marginTop: '16px' }}>
                From a private beachfront residence to a landmark destination hotel, every project begins with listening, understanding room proportions, and designing around the distinct character of the space.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Large Photography Showcase */}
      <section className="about-photo-banner">
        <div className="container">
          <div className="photo-frame-luxury">
            <img src={images.living} alt="Veloura Architectural Interior Illumination" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="section dark-section">
        <div className="container">
          <SectionTitle
            eyebrow="WHAT GUIDES US"
            title="The Five Pillars of Veloura"
            align="center"
          />

          <div className="principles-grid-luxury">
            {principles.map((p, idx) => (
              <Reveal key={p.num || p.title || `principle-${idx}`} delay={idx * 0.1}>
                <div className="principle-card-luxury">
                  <div className="principle-header">
                    <span className="principle-icon">{p.icon}</span>
                    <span className="principle-num">{p.num}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process Walkthrough */}
      <section className="section process-section">
        <div className="container">
          <SectionTitle
            eyebrow="OUR METHODOLOGY"
            title="From Concept to Commissioned Glow"
          />

          <div className="process-list-vertical">
            {processSteps.map((step, idx) => (
              <div key={step.step || step.title || `step-${idx}`} className="process-row-item">
                <span className="process-row-num">{step.step}</span>
                <div className="process-row-content">
                  <h3>{step.title}</h3>
                  <small className="process-subtitle">{step.subtitle}</small>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-dark">
        <div className="container cta-container-split">
          <div className="cta-text-side">
            <span className="eyebrow">START A CONVERSATION</span>
            <h2>Have a Space Worth Illuminating?</h2>
            <p>Speak with our studio designers to explore how Veloura can elevate your upcoming architectural project.</p>
            <Link className="btn btn-gold" to="/consultation">
              TALK TO VELOURA <ArrowRight size={16} />
            </Link>
          </div>
          <div className="cta-image-side" style={{ backgroundImage: `url(${images.ambient})` }} />
        </div>
      </section>
    </main>
  );
}
