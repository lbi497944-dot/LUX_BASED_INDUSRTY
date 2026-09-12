import Page, { ALLOWED_SECTION_TYPES, ALLOWED_MEDIA_TYPES } from './src/models/Page.js';
import * as pageService from './src/services/pageService.js';
import * as pageController from './src/controllers/pageController.js';
import { isSafeUrl } from './src/controllers/pageController.js';
import pageRoutes from './src/routes/pageRoutes.js';
import { initialPagesData } from './src/seeders/pageSeeder.js';

async function runPageBuilderTests() {
  console.log('========================================================');
  console.log('  VISUAL PAGE BUILDER BACKEND & SECURITY TESTS');
  console.log('========================================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  function record(name, passed, details = '') {
    if (passed) {
      results.passed++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      results.failed++;
      console.error(`  ❌ [FAIL] ${name} — ${details}`);
    }
    results.tests.push({ name, passed, details });
  }

  const mockRes = () => {
    const res = {
      statusCode: 200,
      data: null,
      status: (code) => {
        res.statusCode = code;
        return res;
      },
      json: (d) => {
        res.data = d;
        return res;
      },
    };
    return res;
  };

  // Backup original model methods
  const originalPageCreate = Page.create;
  const originalPageFindOne = Page.findOne;
  const originalPageFind = Page.find;
  const originalPageFindOneAndDelete = Page.findOneAndDelete;

  try {
    // =========================================================================
    // 1. MODEL SCHEMA & VALIDATION TESTS
    // =========================================================================
    console.log('--- 1. Model Schema & Validation ---');

    // TEST 1: Valid page structure passes validation
    {
      const validPage = new Page({
        name: 'Test Page',
        slug: 'test-page',
        status: 'published',
        publishedSections: [
          {
            sectionId: 'hero-1',
            type: 'hero',
            enabled: true,
            order: 1,
            content: {
              eyebrow: 'PREMIUM',
              heading: 'Luxury Fixture',
            },
            media: {
              mediaType: 'image',
              url: 'https://example.com/hero.jpg',
            },
          },
        ],
      });
      const error = validPage.validateSync();
      record('TEST 1: Valid Page structure passes Mongoose validation with zero errors', !error, error?.message);
    }

    // TEST 2: Invalid section type is rejected by Mongoose enum
    {
      const invalidSection = new Page({
        name: 'Invalid Section Page',
        slug: 'invalid-section',
        publishedSections: [
          {
            sectionId: 'sec-1',
            type: 'unauthorized_arbitrary_html',
          },
        ],
      });
      const error = invalidSection.validateSync();
      const hasTypeError = error?.errors?.['publishedSections.0.type'] !== undefined;
      record('TEST 2: Invalid section type is strictly rejected by enum validation', hasTypeError, error?.message);
    }

    // TEST 3: Invalid media type is rejected by Mongoose enum
    {
      const invalidMedia = new Page({
        name: 'Invalid Media Page',
        slug: 'invalid-media',
        publishedSections: [
          {
            sectionId: 'sec-1',
            type: 'hero',
            media: {
              mediaType: 'flash_swf_stream',
            },
          },
        ],
      });
      const error = invalidMedia.validateSync();
      const hasMediaError = error?.errors?.['publishedSections.0.media.mediaType'] !== undefined;
      record('TEST 3: Invalid media type is strictly rejected by enum validation', hasMediaError, error?.message);
    }

    // TEST 4: Required fields are enforced
    {
      const missingPage = new Page({});
      const error = missingPage.validateSync();
      const hasName = error?.errors?.name !== undefined;
      const hasSlug = error?.errors?.slug !== undefined;
      record('TEST 4: Page name and slug are strictly required', hasName && hasSlug, error?.message);
    }

    // TEST 5: All 16 approved section types pass schema validation
    {
      const allTypesPassed = ALLOWED_SECTION_TYPES.every((type, index) => {
        const p = new Page({
          name: `Type Test ${type}`,
          slug: `type-test-${type}`,
          publishedSections: [
            {
              sectionId: `sec-${index}`,
              type,
            },
          ],
        });
        const err = p.validateSync();
        return !err;
      });
      record(`TEST 5: All ${ALLOWED_SECTION_TYPES.length} approved section types pass schema validation`, allTypesPassed);
    }

    // =========================================================================
    // 2. SECURITY & WHITELIST FILTERING TESTS
    // =========================================================================
    console.log('\n--- 2. Security & Whitelist Filtering ---');

    // TEST 6: Unknown fields stripped at page, section, content, and media levels
    {
      const rawPayload = {
        name: 'Clean Page',
        slug: 'clean-page',
        maliciousPageProp: 'evil',
        _id: 'injected-id',
        __v: 99,
        createdAt: '1970-01-01',
        draftSections: [
          {
            sectionId: 'sec-hero',
            type: 'hero',
            arbitrarySectionProp: 'drop-me',
            content: {
              heading: 'Valid Heading',
              scriptInjection: '<script>alert(1)</script>',
            },
            media: {
              mediaType: 'image',
              url: 'https://example.com/img.jpg',
              hiddenTracker: 'drop-me',
            },
          },
        ],
      };

      const filtered = pageController.filterPageFields(rawPayload);
      const pass =
        filtered.name === 'Clean Page' &&
        filtered.slug === 'clean-page' &&
        !('maliciousPageProp' in filtered) &&
        !('_id' in filtered) &&
        !('__v' in filtered) &&
        !('createdAt' in filtered) &&
        !('arbitrarySectionProp' in filtered.draftSections[0]) &&
        !('scriptInjection' in filtered.draftSections[0].content) &&
        filtered.draftSections[0].content.heading === 'Valid Heading' &&
        !('hiddenTracker' in filtered.draftSections[0].media);

      record('TEST 6: Unknown and malicious fields are stripped across all schema levels', pass);
    }

    // TEST 7: Falsey values ('', 0, false) are strictly preserved
    {
      const rawPayload = {
        name: '',
        slug: 'falsey-test',
        draftSections: [
          {
            sectionId: 'sec-1',
            type: 'hero',
            enabled: false,
            order: 0,
            content: {
              eyebrow: '',
              heading: 'Non-empty',
            },
            media: {
              overlay: false,
              overlayOpacity: 0,
            },
          },
        ],
      };

      const filtered = pageController.filterPageFields(rawPayload);
      const sec = filtered.draftSections[0];
      const pass =
        filtered.name === '' &&
        sec.enabled === false &&
        sec.order === 0 &&
        sec.content.eyebrow === '' &&
        sec.media.overlay === false &&
        sec.media.overlayOpacity === 0;

      record("TEST 7: Falsey values ('', 0, false) are strictly preserved by whitelist", pass);
    }

    // TEST 8: Explicit undefined properties are excluded
    {
      const rawPayload = {
        name: 'Defined Name',
        slug: undefined,
        draftSections: [
          {
            sectionId: 'sec-1',
            type: 'hero',
            order: undefined,
            content: {
              heading: undefined,
              eyebrow: 'Keep me',
            },
          },
        ],
      };

      const filtered = pageController.filterPageFields(rawPayload);
      const pass =
        filtered.name === 'Defined Name' &&
        !('slug' in filtered) &&
        !('order' in filtered.draftSections[0]) &&
        !('heading' in filtered.draftSections[0].content) &&
        filtered.draftSections[0].content.eyebrow === 'Keep me';

      record('TEST 8: Explicit undefined properties are excluded and do not overwrite DB', pass);
    }

    // TEST 9: Dangerous URL protocols rejected by URL validator
    {
      const dangerousUrls = [
        'javascript:alert(document.cookie)',
        'JAVASCRIPT:malicious()',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        'vbscript:msgbox("hello")',
        'file:///etc/passwd',
      ];
      const allRejected = dangerousUrls.every((u) => !isSafeUrl(u));
      record('TEST 9: Dangerous protocols (javascript:, data:, vbscript:, file:) are rejected', allRejected);
    }

    // TEST 10: Safe URLs accepted by URL validator
    {
      const safeUrls = [
        '/collections',
        '/portfolio/private-villa',
        '#philosophy',
        '?category=chandeliers',
        'https://example.com/spec-sheet.pdf',
        'http://example.com/brochure.pdf',
        'mailto:concierge@lux-lighting.com',
        'tel:+97143408899',
        'https://wa.me/971508924411?text=Hello',
        '',
        null,
      ];
      const allAccepted = safeUrls.every((u) => isSafeUrl(u));
      record('TEST 10: Safe URLs (relative paths, https, mailto, tel, whatsapp) are accepted', allAccepted);
    }

    // =========================================================================
    // 3. SERVICE LIFECYCLE & DRAFT/PUBLISHED SEPARATION
    // =========================================================================
    console.log('\n--- 3. Service Lifecycle & Draft/Published Separation ---');

    // In-memory mock document store for page lifecycle testing
    let mockPages = new Map();

    Page.findOne = async ({ slug }) => {
      const p = mockPages.get(slug);
      if (!p) return null;
      // Return mongoose-like doc with save method
      return {
        ...p,
        toObject: () => ({ ...p }),
        save: async function () {
          mockPages.set(this.slug, { ...this });
          return this;
        },
      };
    };

    Page.create = async (data) => {
      const doc = {
        _id: `page-${Date.now()}`,
        publishedAt: new Date(),
        ...data,
        toObject: () => ({ ...data }),
        save: async function () {
          mockPages.set(this.slug, { ...this });
          return this;
        },
      };
      mockPages.set(doc.slug, doc);
      return doc;
    };

    Page.find = (filter) => ({
      sort: () => ({
        select: (fields) => ({
          exec: async () => {
            let list = Array.from(mockPages.values());
            if (filter?.status) {
              list = list.filter((p) => p.status === filter.status);
            }
            return list;
          },
        }),
        exec: async () => {
          let list = Array.from(mockPages.values());
          if (filter?.status) {
            list = list.filter((p) => p.status === filter.status);
          }
          return list;
        },
      }),
    });

    Page.findOneAndDelete = async ({ slug }) => {
      const existing = mockPages.get(slug);
      mockPages.delete(slug);
      return existing;
    };

    // TEST 11: createPage initializes both draft and published sets
    {
      const created = await pageService.createPage({
        name: 'Bespoke Villas',
        slug: 'villas',
        status: 'published',
        publishedSections: [
          {
            sectionId: 'sec-1',
            type: 'hero',
            content: { heading: 'Villa Lighting' },
          },
        ],
      });

      const pass =
        created.slug === 'villas' &&
        created.publishedSections.length === 1 &&
        created.draftSections.length === 1 &&
        created.draftSections[0].content.heading === 'Villa Lighting';

      record('TEST 11: createPage initializes both published and draft sections', pass);
    }

    // TEST 12: Public getPageBySlug NEVER exposes draft data
    {
      // Give draft a different title
      const p = mockPages.get('villas');
      p.draftSections[0].content.heading = 'SECRET UNPUBLISHED HEADING';

      const publicView = await pageService.getPageBySlug('villas', { adminView: false });
      const pass =
        publicView.publishedSections[0].content.heading === 'Villa Lighting' &&
        publicView.draftSections === undefined;

      record('TEST 12: Public getPageBySlug strictly excludes draftSections from response', pass);
    }

    // TEST 13: Admin getPageBySlug returns draftSections and status
    {
      const adminView = await pageService.getPageBySlug('villas', { adminView: true });
      const pass =
        adminView.draftSections[0].content.heading === 'SECRET UNPUBLISHED HEADING' &&
        adminView.publishedSections[0].content.heading === 'Villa Lighting';

      record('TEST 13: Admin getPageBySlug includes both draftSections and publishedSections', pass);
    }

    // TEST 14: updateDraft modifies draftSections and leaves publishedSections untouched
    {
      await pageService.updateDraft('villas', {
        draftSections: [
          {
            sectionId: 'sec-1',
            type: 'hero',
            content: { heading: 'Pending Live Review' },
          },
        ],
      });

      const publicCheck = await pageService.getPageBySlug('villas', { adminView: false });
      const adminCheck = await pageService.getPageBySlug('villas', { adminView: true });

      const pass =
        publicCheck.publishedSections[0].content.heading === 'Villa Lighting' &&
        adminCheck.draftSections[0].content.heading === 'Pending Live Review';

      record('TEST 14: updateDraft modifies draft without altering live published site', pass);
    }

    // TEST 15: publishPage atomically copies draft to published and updates status
    {
      const published = await pageService.publishPage('villas');
      const publicCheck = await pageService.getPageBySlug('villas', { adminView: false });

      const pass =
        published.status === 'published' &&
        publicCheck.publishedSections[0].content.heading === 'Pending Live Review';

      record('TEST 15: publishPage promotes draftSections to publishedSections live', pass);
    }

    // TEST 16: discardDraft restores draftSections from current publishedSections
    {
      // Modify draft again
      await pageService.updateDraft('villas', {
        draftSections: [
          {
            sectionId: 'sec-1',
            type: 'hero',
            content: { heading: 'Discarded Experiment' },
          },
        ],
      });

      await pageService.discardDraft('villas');
      const adminCheck = await pageService.getPageBySlug('villas', { adminView: true });

      const pass = adminCheck.draftSections[0].content.heading === 'Pending Live Review';
      record('TEST 16: discardDraft restores draft to match current published state', pass);
    }

    // TEST 17: deletePage removes page from storage
    {
      await pageService.deletePage('villas');
      let threw = false;
      try {
        await pageService.getPageBySlug('villas');
      } catch (err) {
        threw = err.statusCode === 404;
      }
      record('TEST 17: deletePage removes page and subsequent requests return 404', threw);
    }

    // =========================================================================
    // 4. CLOUDINARY MEDIA LIFECYCLE & ASSET COLLECTION
    // =========================================================================
    console.log('\n--- 4. Cloudinary Media Lifecycle ---');

    // TEST 18: collectSectionPublicIds extracts images, videos, and slides
    {
      const sections = [
        {
          sectionId: 'hero',
          media: {
            mediaType: 'image',
            publicId: 'veloura_lighting/hero_cover',
            videoPublicId: 'veloura_lighting/hero_video',
            slides: [
              { publicId: 'veloura_lighting/slide_1' },
              { publicId: 'veloura_lighting/slide_2' },
            ],
          },
        },
      ];

      const assets = pageService.collectSectionPublicIds(sections);
      const publicIds = assets.map((a) => a.publicId);
      const pass =
        publicIds.includes('veloura_lighting/hero_cover') &&
        publicIds.includes('veloura_lighting/hero_video') &&
        publicIds.includes('veloura_lighting/slide_1') &&
        publicIds.includes('veloura_lighting/slide_2') &&
        assets.find((a) => a.publicId === 'veloura_lighting/hero_video')?.resourceType === 'video';

      record('TEST 18: collectSectionPublicIds extracts image, video, and slideshow publicIds with resource types', pass);
    }

    // TEST 19: External URLs (null/empty publicId) are ignored
    {
      const sections = [
        {
          sectionId: 'hero',
          media: {
            mediaType: 'image',
            url: 'https://images.unsplash.com/photo-1540932239986',
            publicId: '',
            slides: [{ url: 'https://images.unsplash.com/photo-slide', publicId: null }],
          },
        },
      ];

      const assets = pageService.collectSectionPublicIds(sections);
      record('TEST 19: External media without publicId produces zero Cloudinary cleanup targets', assets.length === 0);
    }

    // =========================================================================
    // 5. SEEDER VERIFICATION
    // =========================================================================
    console.log('\n--- 5. Seeder Integrity & Content Map ---');

    // TEST 20: Initial seed dataset contains exactly 6 approved pages
    {
      const slugs = initialPagesData.map((p) => p.slug);
      const expected = ['home', 'collections', 'portfolio', 'about', 'contact', 'consultation'];
      const exact = expected.every((s) => slugs.includes(s)) && initialPagesData.length === 6;

      record('TEST 20: Initial page seeder defines all 6 canonical website pages', exact);
    }

    // TEST 21: Home page seed contains all 13 sections with approved types
    {
      const home = initialPagesData.find((p) => p.slug === 'home');
      const types = home.publishedSections.map((s) => s.type);
      const allValid = types.every((t) => ALLOWED_SECTION_TYPES.includes(t));
      const hasFeeds =
        types.includes('collections_feed') &&
        types.includes('products_feed') &&
        types.includes('projects_feed') &&
        types.includes('testimonials_feed') &&
        types.includes('faq_accordion');

      record('TEST 21: Home page seed contains 13 sections and uses feed section types for CMS feeds', home.publishedSections.length === 13 && allValid && hasFeeds);
    }

    // =========================================================================
    // 6. ROUTE REGISTRATION & AUTHORIZATION CONVENTIONS
    // =========================================================================
    console.log('\n--- 6. Route Registration & Middleware ---');

    // TEST 22: pageRoutes exports a valid Express Router
    {
      const isRouter = typeof pageRoutes === 'function' && pageRoutes.stack !== undefined;
      record('TEST 22: pageRoutes exports an intact Express Router with registered middleware', isRouter);
    }
  } finally {
    // Restore Mongoose methods
    Page.create = originalPageCreate;
    Page.findOne = originalPageFindOne;
    Page.find = originalPageFind;
    Page.findOneAndDelete = originalPageFindOneAndDelete;
  }

  console.log('\n========================================================');
  console.log(`  PAGE BUILDER TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('========================================================\n');

  return results.failed === 0;
}

runPageBuilderTests().then((ok) => {
  if (!ok) process.exit(1);
}).catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
