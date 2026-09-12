import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Sparkles, Ruler, Lightbulb, ShieldCheck, ChevronDown, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { images, collections as fallbackCollections, projects as fallbackProjects, products as fallbackProducts, processSteps, testimonials as fallbackTestimonials } from '../../data/site';
import { collectionService } from '../../services/collectionService';
import { productService } from '../../services/productService';
import { projectService } from '../../services/projectService';
import { faqService } from '../../services/faqService';
import { testimonialService } from '../../services/testimonialService';
import { pageService } from '../../services/pageService';
import DynamicPageRenderer from '../../components/page-builder/DynamicPageRenderer';
import { useSettings } from '../../context/SettingsContext';
import Reveal from '../../components/sections/Reveal';
import SectionTitle from '../../components/sections/SectionTitle';
import BeforeAfterSlider from '../../components/sections/BeforeAfterSlider';
import CatalogueCTA from '../../components/sections/CatalogueCTA';
import TestimonialsSection from '../../components/sections/TestimonialsSection';
import SEO from '../../components/common/SEO';
import { pageSeoData, siteConfig } from '../../seo/seoConfig';
import { getSavedProductIds, toggleSaveProduct } from '../../utils/savedProducts';

const fallbackFaqs = [
  {
    question: 'What types of architectural lighting does LUX BASED INDUSTRY offer?',
    answer: 'LUX BASED INDUSTRY specializes in luxury chandeliers, architectural pendants, concealed smart ambient cove systems, low-profile wall sconces, and fully bespoke custom lighting concepts for high-end residential and commercial spaces.'
  },
  {
    question: 'Do you provide custom lighting solutions for private villas and hotels?',
    answer: 'Yes, our lighting architects and master craftsmen engineer bespoke one-of-one lighting fixtures tailored to unique room ceiling scales, architectural geometry, and interior design briefs across Dubai, Abu Dhabi, Doha, and globally.'
  },
  {
    question: 'Does LUX BASED INDUSTRY provide lighting consultation services in Dubai & UAE?',
    answer: 'We provide end-to-end lighting consultations in Dubai and the UAE. Our team reviews room blueprints, natural light orientation, material finishes, photometrics, and smart lighting scene controls.'
  },
  {
    question: 'Are your lighting systems compatible with Lutron, KNX, or DALI controls?',
    answer: 'All LUX BASED INDUSTRY fixtures and ambient systems integrate seamlessly with major smart automation standards including DALI-2, Lutron HomeWorks, Control4, and KNX digital dimming controllers.'
  }
];

export default function Home() {
  const { settings } = useSettings();
  const [collections, setCollections] = useState(fallbackCollections);
  const [products, setProducts] = useState(fallbackProducts);
  const [projects, setProjects] = useState(fallbackProjects);
  const [faqItems, setFaqItems] = useState(fallbackFaqs);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [savedIds, setSavedIds] = useState(getSavedProductIds());
  const [openFaq, setOpenFaq] = useState(null);
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [colRes, prodRes, projRes, faqRes, testRes, pageRes] = await Promise.allSettled([
          collectionService.getCollections({ featured: true }),
          productService.getProducts({ featured: true }),
          projectService.getProjects({ featured: true }),
          faqService.getFaqs(),
          testimonialService.getTestimonials(),
          pageService.getPageBySlug('home'),
        ]);

        if (colRes.status === 'fulfilled' && colRes.value.data?.length) {
          setCollections(colRes.value.data);
        }
        if (prodRes.status === 'fulfilled' && prodRes.value.data?.length) {
          setProducts(prodRes.value.data);
        }
        if (projRes.status === 'fulfilled' && projRes.value.data?.length) {
          setProjects(projRes.value.data);
        }
        if (faqRes.status === 'fulfilled' && faqRes.value.data?.length) {
          setFaqItems(faqRes.value.data);
        }
        if (testRes.status === 'fulfilled' && testRes.value.data?.length) {
          setTestimonials(testRes.value.data);
        }
        if (
          pageRes.status === 'fulfilled' &&
          pageRes.value?.data &&
          Array.isArray(pageRes.value.data.publishedSections) &&
          pageRes.value.data.publishedSections.length > 0
        ) {
          setPageData(pageRes.value.data);
        }
      } catch {
        // Retain fallback data gracefully
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() => {
    const syncSaved = () => setSavedIds(getSavedProductIds());
    window.addEventListener('veloura_saved_updated', syncSaved);
    return () => window.removeEventListener('veloura_saved_updated', syncSaved);
  }, []);

  const handleToggleHeart = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveProduct(productId);
  };

  // Schema.org structured data for LocalBusiness & FAQPage
  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings?.brandName || siteConfig.siteName,
    url: siteConfig.siteUrl,
    logo: settings?.logo || `${siteConfig.siteUrl}/favicon.svg`,
    image: siteConfig.defaultImage,
    description: siteConfig.defaultDescription,
    telephone: settings?.phone || siteConfig.contact.phone,
    email: settings?.email || siteConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.address || 'Alserkal Avenue, Building 42',
      addressLocality: settings?.city || 'Dubai',
      addressCountry: settings?.country ? 'AE' : 'AE'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.contact.geo.latitude,
      longitude: siteConfig.contact.geo.longitude
    },
    sameAs: Object.values(settings?.socialLinks || siteConfig.socialLinks)
  };

  const whyCompanyItems = [
    {
      title: 'BESPOKE DESIGN',
      text: 'Tailored lighting solutions crafted for your space.',
      icon: <Sparkles size={24} />
    },
    {
      title: 'PREMIUM QUALITY',
      text: 'Exceptional materials and meticulous craftsmanship.',
      icon: <Ruler size={24} />
    },
    {
      title: 'INNOVATIVE TECHNOLOGY',
      text: 'Intelligent lighting solutions for modern living.',
      icon: <Lightbulb size={24} />
    },
    {
      title: 'EXPERT CONSULTATION',
      text: 'Professional guidance from concept to execution.',
      icon: <ShieldCheck size={24} />
    }
  ];

  const featuredProjects = [
    {
      title: 'PRIVATE RESIDENCE',
      location: 'Dubai, UAE',
      image: images.villa,
      category: 'Residential'
    },
    {
      title: 'THE GRAND HOTEL',
      location: 'Doha, Qatar',
      image: images.hotel,
      category: 'Hospitality'
    },
    {
      title: 'LUXURY VILLA',
      location: 'Abu Dhabi, UAE',
      image: images.living,
      category: 'Residential'
    },
    {
      title: 'FINE DINING RESTAURANT',
      location: 'Dubai, UAE',
      image: images.restaurant,
      category: 'Dining'
    }
  ];

  const pageSeo = pageData?.seo;
  const pageSeoTitle = (pageSeo?.title && pageSeo.title.trim()) || pageSeoData.home.title;
  const pageSeoDescription = (pageSeo?.description && pageSeo.description.trim()) || pageSeoData.home.description;
  const rawCanonical = (pageSeo?.canonical && pageSeo.canonical.trim()) || '/';
  const pageSeoCanonical = rawCanonical.startsWith('http')
    ? (new URL(rawCanonical).pathname || '/')
    : rawCanonical;
  const pageSeoImage = (pageSeo?.ogImage && pageSeo.ogImage.trim()) || undefined;

  const hasValidDynamicContent =
    pageData &&
    typeof pageData === 'object' &&
    Array.isArray(pageData.publishedSections) &&
    pageData.publishedSections.some((s) => s && typeof s === 'object' && s.enabled !== false && s.type);

  if (hasValidDynamicContent) {
    return (
      <main className="home-page">
        <SEO
          title={pageSeoTitle}
          description={pageSeoDescription}
          canonical={pageSeoCanonical}
          image={pageSeoImage}
          schemaData={homeSchema}
        />
        <DynamicPageRenderer
          page={pageData}
          context={{
            collections,
            products,
            projects,
            faqItems,
            testimonials,
            settings,
            savedIds,
            handleToggleHeart,
            openFaq,
            setOpenFaq,
          }}
        />
      </main>
    );
  }

  return (
    <main className="home-page">
      <SEO
        title={pageSeoTitle}
        description={pageSeoDescription}
        canonical={pageSeoCanonical}
        image={pageSeoImage}
        schemaData={homeSchema}
      />

      {/* 1. HERO - ANIMATED SEQUENCE */}
      <section className="hero">
        <motion.div
          className="hero-bg-frame"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(21, 57, 29, 0.96) 0%, rgba(21, 57, 29, 0.82) 40%, rgba(21, 57, 29, 0.25) 85%), url(${images.hero})`,
          }}
        />

        <div className="container hero-content">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            PREMIUM LIGHTING DESIGN
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            Illuminating<br />
            <em>Luxury Spaces</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Bespoke lighting solutions that transform extraordinary spaces into timeless experiences.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link className="btn btn-gold" to="/collections">
              EXPLORE COLLECTIONS <ArrowUpRight size={16} />
            </Link>
            <Link className="btn btn-outline" to="/consultation">
              BOOK CONSULTATION
            </Link>
          </motion.div>

          <motion.a
            href="#philosophy"
            className="scroll-indicator"
            aria-label="Scroll to explore philosophy section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <span>SCROLL TO EXPLORE</span>
            <ChevronDown size={14} />
          </motion.a>
        </div>
      </section>

      {/* 2. INTRODUCTION / BRAND STATEMENT */}
      <section className="section philosophy-section" id="philosophy">
        <div className="container">
          <div className="editorial-split">
            <div className="editorial-left">
              <span className="eyebrow gold-label">OUR PHILOSOPHY</span>
              <h2 className="editorial-heading">
                Crafted to Inspire.<br />
                <em>Designed to Endure.</em>
              </h2>
            </div>
            <div className="editorial-right">
              <p className="editorial-body">
                {settings?.brandName || 'LUX BASED INDUSTRY'} approaches illumination as an architectural discipline. We fuse technical optical precision with hand-finished craftsmanship to shape mood, accentuate texture, and elevate extraordinary residential and hospitality spaces worldwide.
              </p>
              <Link className="text-link-gold" to="/collections">
                VIEW OUR COLLECTIONS <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COLLECTIONS */}
      <section className="section collections-section">
        <div className="container">
          <SectionTitle
            eyebrow="OUR COLLECTIONS"
            title="Lighting Designed Around Extraordinary Spaces."
          />
          <div className="collection-grid-large">
            {collections.slice(0, 3).map((item, idx) => {
              const collectionKey = item._id || item.id || item.slug || `collection-${idx}`;
              return (
                <Reveal key={collectionKey} delay={idx * 0.15}>
                  <Link className="collection-card-luxury" to={`/collections/${item.slug}`}>
                    <img
                      src={item.heroImage || item.image}
                      alt={`${item.title || item.name} Collection`}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (e.target.src !== images.chandelier) {
                          e.target.src = images.chandelier;
                        }
                      }}
                    />
                    <div className="card-overlay-luxury">
                      <span className="card-number">0{idx + 1}</span>
                      <h3 className="card-title">{item.title || item.name}</h3>
                      <p className="card-tagline">{item.tagline}</p>
                      <div className="card-arrow-circle">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SIGNATURE PRODUCTS WITH SAVE HEART TOGGLE */}
      <section className="section dark-section">
        <div className="container">
          <div className="section-head-row">
            <SectionTitle
              eyebrow="SIGNATURE PIECES"
              title="Iconic Designs. Unmatched Brilliance."
            />
            <Link className="text-link-gold desktop-only-link" to="/collections">
              VIEW ALL PRODUCTS <ArrowRight size={16} />
            </Link>
          </div>

          <div className="product-grid-luxury">
            {products.map((prod, idx) => {
              const prodKey = prod._id || prod.id || prod.slug || `product-${idx}`;
              const prodId = prod._id || prod.id;
              const isSaved = savedIds.includes(prodId);
              return (
                <Reveal key={prodKey} delay={idx * 0.1}>
                  <div className="product-card-luxury">
                    <Link to={`/collections/${prod.collectionSlug}`}>
                      <div className="product-image-frame">
                        <img
                          src={prod.image}
                          alt={`${prod.name} ${prod.category}`}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            if (e.target.src !== images.chandelier) {
                              e.target.src = images.chandelier;
                            }
                          }}
                        />
                        <button
                          className={`product-save-heart ${isSaved ? 'saved' : ''}`}
                          onClick={(e) => handleToggleHeart(e, prodId)}
                          aria-label={isSaved ? `Remove ${prod.name} from saved items` : `Save ${prod.name} to saved items`}
                          title={isSaved ? 'Saved to bookmarks' : 'Save product'}
                        >
                          <Heart size={16} fill={isSaved ? 'var(--gold)' : 'none'} color={isSaved ? 'var(--gold)' : '#ffffff'} />
                        </button>
                      </div>
                      <div className="product-card-body">
                        <small className="product-category-eyebrow">{prod.category?.toUpperCase()}</small>
                        <h4>{prod.name}</h4>
                        <p className="product-finish-label">{prod.finish || prod.materials}</p>
                        <span className="product-view-action">
                          DISCOVER PIECE <ArrowRight size={13} />
                        </span>
                      </div>
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mobile-center-link">
            <Link className="text-link-gold" to="/collections">
              VIEW ALL PRODUCTS <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BEFORE & AFTER TRANSFORMATION SLIDER */}
      <BeforeAfterSlider />

      {/* 6. BRAND STORY */}
      <section className="split-story-section">
        <div className="story-split-container">
          <div
            className="story-image-panel"
            style={{ backgroundImage: `url(${images.story})` }}
          />
          <div className="story-content-panel">
            <span className="eyebrow">OUR STORY</span>
            <h2>
              Crafting Light,<br />
              <em>Defining Luxury</em>
            </h2>
            <p>
              At {settings?.brandName || 'LUX BASED INDUSTRY'}, lighting is more than illumination — it is an art form. We combine craftsmanship, innovation and thoughtful design to create ambience that transforms and enriches every space.
            </p>
            <Link className="btn btn-gold-outline" to="/about">
              DISCOVER OUR STORY <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. WHY LUX BASED INDUSTRY */}
      <section className="section why-section">
        <div className="container">
          <SectionTitle
            eyebrow={`WHY ${settings?.brandName || 'LUX BASED INDUSTRY'}`}
            title="The Standards of Luxury Illumination"
            align="center"
          />
          <div className="why-grid">
            {whyCompanyItems.map((item, idx) => {
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

      {/* 8. FEATURED PROJECTS */}
      <section className="section projects-section">
        <div className="container">
          <div className="section-head-row">
            <SectionTitle
              eyebrow="FEATURED PROJECTS"
              title="Transforming Spaces Across the World"
            />
            <Link className="text-link-gold desktop-only-link" to="/portfolio">
              VIEW ALL PROJECTS <ArrowRight size={16} />
            </Link>
          </div>

          <div className="projects-grid-editorial">
            {featuredProjects.map((proj, idx) => {
              const projectKey = proj._id || proj.id || proj.slug || proj.title || `project-${idx}`;
              return (
                <Reveal key={projectKey} delay={idx * 0.12}>
                  <Link className="project-card-luxury" to="/portfolio">
                    <div className="project-image-box">
                      <img
                        src={proj.coverImage || proj.image}
                        alt={`${settings?.brandName || 'LUX BASED INDUSTRY'} Project - ${proj.title} in ${proj.location}`}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          if (e.target.src !== images.hotel) {
                            e.target.src = images.hotel;
                          }
                        }}
                      />
                      <div className="project-overlay-content">
                        <small>{proj.location}</small>
                        <h3>{proj.title}</h3>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <div className="mobile-center-link">
            <Link className="text-link-gold" to="/portfolio">
              VIEW ALL PROJECTS <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. CATALOGUE BANNER */}
      <CatalogueCTA />

      {/* 10. PROCESS */}
      <section className="section process-section">
        <div className="container">
          <SectionTitle
            eyebrow="OUR PROCESS"
            title="From Vision to Illumination"
          />
          <div className="process-timeline-desktop">
            {processSteps.map((step, idx) => {
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

      {/* 11. CLIENT ENDORSEMENTS / TESTIMONIALS */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 12. FREQUENTLY ASKED QUESTIONS (SEO FAQ) */}
      <section className="section faq-section">
        <div className="container">
          <SectionTitle
            eyebrow="FREQUENTLY ASKED QUESTIONS"
            title="Architectural Lighting Insights"
            align="center"
          />

          <div className="faq-accordion-container">
            {faqItems.map((faq, index) => {
              const faqKey = faq._id || faq.id || faq.question || `faq-${index}`;
              return (
                <div
                  key={faqKey}
                  className={`faq-item ${openFaq === index ? 'open' : ''}`}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="faq-question">
                    <h3>{faq.question}</h3>
                    <span className="faq-icon">{openFaq === index ? '−' : '+'}</span>
                  </div>
                  {openFaq === index && (
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

      {/* 13. CONSULTATION CTA */}
      <section className="cta-section-dark">
        <div className="container cta-container-split">
          <div className="cta-text-side">
            <span className="eyebrow">PRIVATE CONSULTATION</span>
            <h2>Bring Your Vision to Light.</h2>
            <p>Let's create an extraordinary lighting experience for your space.</p>
            <Link className="btn btn-gold" to="/consultation">
              BOOK A CONSULTATION <ArrowUpRight size={16} />
            </Link>
          </div>
          <div
            className="cta-image-side"
            style={{ backgroundImage: `url(${images.ambient})` }}
          />
        </div>
      </section>
    </main>
  );
}
