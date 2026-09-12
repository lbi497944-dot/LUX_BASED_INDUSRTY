import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Page from '../models/Page.js';

dotenv.config();

export const initialPagesData = [
  // ===========================================================================
  // 1. HOME PAGE
  // ===========================================================================
  {
    name: 'Home Page',
    slug: 'home',
    status: 'published',
    seo: {
      title: 'LUX BASED INDUSTRY | Architectural & Luxury Lighting Dubai',
      description: 'Bespoke architectural lighting fixtures, grand chandeliers, and smart ambient systems tailored for luxury residences, palaces, and hospitality worldwide.',
      ogImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=90',
      canonical: '/',
    },
    publishedSections: [
      {
        sectionId: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        content: {
          eyebrow: 'PREMIUM LIGHTING DESIGN',
          heading: 'Illuminating',
          italicHeading: 'Luxury Spaces',
          body: 'Bespoke lighting solutions that transform extraordinary spaces into timeless experiences.',
          primaryBtnText: 'EXPLORE COLLECTIONS',
          primaryBtnUrl: '/collections',
          secondaryBtnText: 'BOOK CONSULTATION',
          secondaryBtnUrl: '/consultation',
          alignment: 'left',
        },
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=90',
          overlay: true,
          overlayOpacity: 0.85,
        },
      },
      {
        sectionId: 'philosophy',
        type: 'philosophy',
        enabled: true,
        order: 2,
        content: {
          eyebrow: 'OUR PHILOSOPHY',
          heading: 'Crafted to Inspire.',
          italicHeading: 'Designed to Endure.',
          body: 'LUX BASED INDUSTRY approaches illumination as an architectural discipline. We fuse technical optical precision with hand-finished craftsmanship to shape mood, accentuate texture, and elevate extraordinary residential and hospitality spaces worldwide.',
          primaryBtnText: 'VIEW OUR COLLECTIONS',
          primaryBtnUrl: '/collections',
          alignment: 'left',
        },
      },
      {
        sectionId: 'collections',
        type: 'collections_feed',
        enabled: true,
        order: 3,
        content: {
          eyebrow: 'OUR COLLECTIONS',
          heading: 'Lighting Designed Around Extraordinary Spaces.',
        },
      },
      {
        sectionId: 'products',
        type: 'products_feed',
        enabled: true,
        order: 4,
        content: {
          eyebrow: 'SIGNATURE PIECES',
          heading: 'Iconic Designs. Unmatched Brilliance.',
          primaryBtnText: 'VIEW ALL PRODUCTS',
          primaryBtnUrl: '/collections',
        },
      },
      {
        sectionId: 'before_after',
        type: 'before_after',
        enabled: true,
        order: 5,
        content: {
          eyebrow: 'THE TRANSFORMATION',
          heading: 'See the Difference Light Makes',
          body: 'Drag the slider to experience how layered architectural lighting transforms an interior from dull shadows into warm elegance.',
        },
      },
      {
        sectionId: 'story',
        type: 'split_story',
        enabled: true,
        order: 6,
        content: {
          eyebrow: 'OUR STORY',
          heading: 'Crafting Light,',
          italicHeading: 'Defining Luxury',
          body: 'At LUX BASED INDUSTRY, lighting is more than illumination — it is an art form. We combine craftsmanship, innovation and thoughtful design to create ambience that transforms and enriches every space.',
          primaryBtnText: 'DISCOVER OUR STORY',
          primaryBtnUrl: '/about',
        },
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85',
        },
      },
      {
        sectionId: 'why_lux',
        type: 'value_cards',
        enabled: true,
        order: 7,
        content: {
          eyebrow: 'WHY LUX BASED INDUSTRY',
          heading: 'The Standards of Luxury Illumination',
          alignment: 'center',
          customItems: [
            {
              title: 'BESPOKE DESIGN',
              text: 'Tailored lighting solutions crafted for your space.',
              iconName: 'Sparkles',
              order: 1,
            },
            {
              title: 'PREMIUM QUALITY',
              text: 'Exceptional materials and meticulous craftsmanship.',
              iconName: 'Ruler',
              order: 2,
            },
            {
              title: 'INNOVATIVE TECHNOLOGY',
              text: 'Intelligent lighting solutions for modern living.',
              iconName: 'Lightbulb',
              order: 3,
            },
            {
              title: 'EXPERT CONSULTATION',
              text: 'Professional guidance from concept to execution.',
              iconName: 'ShieldCheck',
              order: 4,
            },
          ],
        },
      },
      {
        sectionId: 'projects',
        type: 'projects_feed',
        enabled: true,
        order: 8,
        content: {
          eyebrow: 'FEATURED PROJECTS',
          heading: 'Transforming Spaces Across the World',
          primaryBtnText: 'VIEW ALL PROJECTS',
          primaryBtnUrl: '/portfolio',
        },
      },
      {
        sectionId: 'catalogue',
        type: 'catalogue_cta',
        enabled: true,
        order: 9,
        content: {
          eyebrow: 'CURATED CATALOGUE',
          heading: 'Download the LUX Architectural Collection',
          body: 'Explore technical specifications, photometric profiles, and custom finish options across our complete portfolio.',
          primaryBtnText: 'DOWNLOAD SPECIFICATION CATALOGUE',
          primaryBtnUrl: '/consultation',
        },
      },
      {
        sectionId: 'process',
        type: 'process_timeline',
        enabled: true,
        order: 10,
        content: {
          eyebrow: 'OUR PROCESS',
          heading: 'From Vision to Illumination',
          customItems: [
            {
              subtitle: '01',
              title: 'DISCOVERY & ARCHITECTURAL AUDIT',
              text: 'We review spatial layouts, ceiling heights, architectural geometries, and natural daylight vectors.',
              order: 1,
            },
            {
              subtitle: '02',
              title: 'CUSTOM CONCEPT & SCHEMATIC DESIGN',
              text: 'Our lighting designers formulate photometrics, beam distributions, and fixture selections.',
              order: 2,
            },
            {
              subtitle: '03',
              title: 'PRECISION FABRICATION & ASSEMBLY',
              text: 'Master artisans hand-finish solid brass patinas, lead-free optical crystals, and premium LED engines.',
              order: 3,
            },
            {
              subtitle: '04',
              title: 'COMMISSIONING & SCENE TUNING',
              text: 'On-site aiming, dimming curve calibration, and intelligent smart automation integration.',
              order: 4,
            },
          ],
        },
      },
      {
        sectionId: 'testimonials',
        type: 'testimonials_feed',
        enabled: true,
        order: 11,
        content: {
          eyebrow: 'CLIENT TESTIMONIALS',
          heading: 'Endorsements from Leading Architects & Designers',
        },
      },
      {
        sectionId: 'faqs',
        type: 'faq_accordion',
        enabled: true,
        order: 12,
        content: {
          eyebrow: 'FREQUENTLY ASKED QUESTIONS',
          heading: 'Architectural Lighting Insights',
          alignment: 'center',
        },
      },
      {
        sectionId: 'consultation_cta',
        type: 'consultation_cta',
        enabled: true,
        order: 13,
        content: {
          eyebrow: 'PRIVATE CONSULTATION',
          heading: 'Bring Your Vision to Light.',
          body: "Let's create an extraordinary lighting experience for your space.",
          primaryBtnText: 'BOOK A CONSULTATION',
          primaryBtnUrl: '/consultation',
        },
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
        },
      },
    ],
  },

  // ===========================================================================
  // 2. COLLECTIONS PAGE
  // ===========================================================================
  {
    name: 'Collections Page',
    slug: 'collections',
    status: 'published',
    seo: {
      title: 'Architectural Lighting Collections | LUX BASED INDUSTRY',
      description: 'Explore bespoke chandeliers, architectural pendants, ambient systems, and wall sconces.',
      ogImage: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1400&q=85',
      canonical: '/collections',
    },
    publishedSections: [
      {
        sectionId: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        content: {
          eyebrow: 'PORTFOLIO CATEGORIES',
          heading: 'Curated Architectural Collections',
          body: 'From statement centerpiece chandeliers to quiet plaster-in cove details, every LUX BASED INDUSTRY collection balances proportion, materiality, and light quality.',
          primaryBtnText: 'EXPLORE FIXTURES',
          primaryBtnUrl: '#collections-feed',
        },
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1400&q=85',
          overlay: true,
          overlayOpacity: 0.75,
        },
      },
      {
        sectionId: 'collections-feed',
        type: 'collections_feed',
        enabled: true,
        order: 2,
        content: {
          eyebrow: 'ALL COLLECTIONS',
          heading: 'Explore Architectural Fixtures',
        },
      },
      {
        sectionId: 'bespoke_cta',
        type: 'consultation_cta',
        enabled: true,
        order: 3,
        content: {
          eyebrow: 'BESPOKE LIGHTING',
          heading: 'Require a Custom Fixture Specification?',
          body: 'Our lighting architects develop tailor-made fixtures for private estates, super-yachts, and flagship commercial spaces.',
          primaryBtnText: 'REQUEST A QUOTE',
          primaryBtnUrl: '/consultation',
        },
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=85',
        },
      },
    ],
  },

  // ===========================================================================
  // 3. PORTFOLIO PAGE
  // ===========================================================================
  {
    name: 'Portfolio Page',
    slug: 'portfolio',
    status: 'published',
    seo: {
      title: 'Architectural Portfolio | LUX BASED INDUSTRY',
      description: 'Realized architectural lighting projects across luxury residences, luxury hospitality, and commercial flagships worldwide.',
      ogImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85',
      canonical: '/portfolio',
    },
    publishedSections: [
      {
        sectionId: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        content: {
          eyebrow: 'GLOBAL PORTFOLIO',
          heading: 'Architectural Lighting in Realized Spaces',
          body: 'Explore private villas, luxury hotels, and flagship dining destinations illuminated by LUX BASED INDUSTRY.',
        },
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85',
          overlay: true,
          overlayOpacity: 0.75,
        },
      },
      {
        sectionId: 'projects_grid',
        type: 'projects_feed',
        enabled: true,
        order: 2,
        content: {
          eyebrow: 'FEATURED COMMISSIONS',
          heading: 'Realized Architectural Lighting',
        },
      },
      {
        sectionId: 'commission_cta',
        type: 'consultation_cta',
        enabled: true,
        order: 3,
        content: {
          eyebrow: 'COMMISSION A PROJECT',
          heading: 'Have a Space Ready for Illumination?',
          body: 'Our technical lighting design team partners with architects and interior designers worldwide.',
          primaryBtnText: 'BEGIN YOUR PROJECT',
          primaryBtnUrl: '/consultation',
        },
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
        },
      },
    ],
  },

  // ===========================================================================
  // 4. ABOUT PAGE
  // ===========================================================================
  {
    name: 'About Page',
    slug: 'about',
    status: 'published',
    seo: {
      title: 'Our Story & Philosophy | LUX BASED INDUSTRY',
      description: 'Discover the craftsmanship, optical precision, and design philosophy behind LUX BASED INDUSTRY architectural lighting.',
      ogImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85',
      canonical: '/about',
    },
    publishedSections: [
      {
        sectionId: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        content: {
          eyebrow: 'OUR STORY',
          heading: 'Crafting Light. Defining Luxury.',
          body: 'LUX BASED INDUSTRY brings together artistic vision, architectural understanding, and technical optical precision to create unforgettable lighting environments.',
        },
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85',
          overlay: true,
          overlayOpacity: 0.75,
        },
      },
      {
        sectionId: 'statement',
        type: 'editorial_text',
        enabled: true,
        order: 2,
        content: {
          eyebrow: 'THE LUX STATEMENT',
          heading: 'Lighting is the soul',
          italicHeading: 'of an interior.',
          body: 'At LUX BASED INDUSTRY, we believe the best lighting is felt before it is noticed. It reveals raw material, frames architectural symmetry, creates human rhythm, and gives people a compelling reason to linger.',
        },
      },
      {
        sectionId: 'photo_showcase',
        type: 'photo_banner',
        enabled: true,
        order: 3,
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
        },
      },
      {
        sectionId: 'principles',
        type: 'value_cards',
        enabled: true,
        order: 4,
        content: {
          eyebrow: 'OUR CORE PILLARS',
          heading: 'Architectural Principles',
          customItems: [
            {
              subtitle: '01',
              title: 'Our Philosophy',
              text: 'Lighting is the soul of an interior. It reveals architectural form, creates emotional depth, and defines how people feel within a space.',
              iconName: 'Sparkles',
              order: 1,
            },
            {
              subtitle: '02',
              title: 'Our Craft',
              text: 'We combine hand-blown European crystal, hand-finished solid brass, and custom optical lenses to build luminaires of enduring brilliance.',
              iconName: 'Ruler',
              order: 2,
            },
            {
              subtitle: '03',
              title: 'Our Expertise',
              text: 'Our lighting architects bring decades of experience across high-end residential estates, luxury hospitality, and private palaces.',
              iconName: 'Award',
              order: 3,
            },
            {
              subtitle: '04',
              title: 'Our Approach',
              text: 'We integrate fixture design with smart automation (DALI/Lutron/KNX) so your lighting transitions seamlessly from morning to night.',
              iconName: 'Compass',
              order: 4,
            },
          ],
        },
      },
      {
        sectionId: 'journey_cta',
        type: 'consultation_cta',
        enabled: true,
        order: 5,
        content: {
          eyebrow: 'JOIN OUR JOURNEY',
          heading: 'Experience the Brilliance of LUX BASED INDUSTRY',
          body: 'Schedule a private consultation at our Dubai studio or book a virtual session with our lighting architects.',
          primaryBtnText: 'SCHEDULE CONSULTATION',
          primaryBtnUrl: '/consultation',
        },
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
        },
      },
    ],
  },

  // ===========================================================================
  // 5. CONTACT PAGE
  // ===========================================================================
  {
    name: 'Contact Page',
    slug: 'contact',
    status: 'published',
    seo: {
      title: 'Contact Our Lighting Studio | LUX BASED INDUSTRY',
      description: 'Connect with our architectural lighting team in Dubai for commissions, consultations, and fixture inquiries.',
      ogImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
      canonical: '/contact',
    },
    publishedSections: [
      {
        sectionId: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        content: {
          eyebrow: 'GET IN TOUCH',
          heading: "Let's Talk About Your Space",
          body: 'Whether you are an architect, interior designer, developer, or private homeowner, our lighting studio is here to assist with your vision.',
        },
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
          overlay: true,
          overlayOpacity: 0.75,
        },
      },
      {
        sectionId: 'directory',
        type: 'contact_directory',
        enabled: true,
        order: 2,
        content: {
          eyebrow: 'STUDIO DIRECTORY',
          heading: 'Start with a',
          italicHeading: 'conversation.',
          body: 'Reach out to our lighting studio to discuss fixture specifications, arrange a private lighting demonstration, or request sample finish boxes.',
        },
      },
    ],
  },

  // ===========================================================================
  // 6. CONSULTATION PAGE
  // ===========================================================================
  {
    name: 'Consultation Page',
    slug: 'consultation',
    status: 'published',
    seo: {
      title: 'Book an Architectural Lighting Consultation | LUX BASED INDUSTRY',
      description: 'Schedule a private consultation with our lighting design specialists for spatial planning, photometrics, and bespoke lighting fixtures.',
      ogImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
      canonical: '/consultation',
    },
    publishedSections: [
      {
        sectionId: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        content: {
          eyebrow: 'BESPOKE CONSULTATION',
          heading: 'Schedule a Private Lighting Consultation',
          body: 'Collaborate with our senior lighting architects on residential, hospitality, or commercial projects. Receive customized photometrics, fixture schedules, and spatial design plans.',
        },
        media: {
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
          overlay: true,
          overlayOpacity: 0.75,
        },
      },
      {
        sectionId: 'editorial_process',
        type: 'editorial_text',
        enabled: true,
        order: 2,
        content: {
          eyebrow: 'CONSULTATION PROCESS',
          heading: 'Architectural Precision from Inception',
          body: 'Bring your blueprints and lighting concepts to our design team. We analyze circadian rhythm requirements, reflection indices, and smart automation compatibility.',
        },
      },
    ],
  },
];

/**
 * Idempotent seeder: inserts missing pages without overwriting or destroying existing customized data
 */
export const seedPages = async () => {
  console.log('[PageSeeder] Starting safe idempotent page initialization...');

  let createdCount = 0;
  let skippedCount = 0;

  for (const pageData of initialPagesData) {
    // Also clone publishedSections into draftSections so drafts are immediately ready for editor
    const fullPageData = {
      ...pageData,
      draftSections: JSON.parse(JSON.stringify(pageData.publishedSections)),
    };

    const existing = await Page.findOne({ slug: pageData.slug });
    if (!existing) {
      await Page.create(fullPageData);
      console.log(`  [PageSeeder] Created page: '${pageData.slug}' (${pageData.name})`);
      createdCount++;
    } else {
      console.log(`  [PageSeeder] Preserved existing page: '${pageData.slug}'`);
      skippedCount++;
    }
  }

  console.log(`[PageSeeder] Finished: ${createdCount} created, ${skippedCount} preserved.`);
  return { createdCount, skippedCount };
};

// Standalone execution support
if (process.argv[1] && process.argv[1].endsWith('pageSeeder.js')) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/veloura_lighting';
  console.log(`[PageSeeder] Connecting to ${uri}...`);
  mongoose
    .connect(uri)
    .then(async () => {
      await seedPages();
      await mongoose.disconnect();
      console.log('[PageSeeder] Disconnected from database.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[PageSeeder] Fatal error:', err.message);
      process.exit(1);
    });
}
