import Page from './src/models/Page.js';
import { seedPages, initialPagesData } from './src/seeders/pageSeeder.js';

async function runPageInitializationTests() {
  console.log('========================================================');
  console.log('  PAGE BUILDER STARTUP INITIALIZATION & IDEMPOTENCY TESTS');
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

  // Backup original Mongoose model methods
  const originalPageCreate = Page.create;
  const originalPageFindOne = Page.findOne;
  const originalPageFind = Page.find;
  const originalPageDeleteOne = Page.deleteOne;
  const originalPageDeleteMany = Page.deleteMany;
  const originalPageFindOneAndDelete = Page.findOneAndDelete;
  const originalPageUpdateOne = Page.updateOne;
  const originalPageFindOneAndUpdate = Page.findOneAndUpdate;

  // In-memory simulated MongoDB store
  const dbStore = new Map();
  let destructiveCallCount = 0;
  let updateCallCount = 0;
  let createCallCount = 0;

  // Mock Mongoose methods
  Page.create = async (doc) => {
    createCallCount++;
    const data = JSON.parse(JSON.stringify(doc));
    dbStore.set(data.slug, data);
    return data;
  };

  Page.findOne = async (query) => {
    if (query && query.slug) {
      const match = dbStore.get(query.slug);
      return match ? JSON.parse(JSON.stringify(match)) : null;
    }
    return null;
  };

  Page.find = async () => {
    return Array.from(dbStore.values()).map((doc) => JSON.parse(JSON.stringify(doc)));
  };

  // Mock destructive operations to monitor for violations
  Page.deleteOne = async () => {
    destructiveCallCount++;
    return { acknowledged: true, deletedCount: 1 };
  };

  Page.deleteMany = async () => {
    destructiveCallCount++;
    return { acknowledged: true, deletedCount: 0 };
  };

  Page.findOneAndDelete = async () => {
    destructiveCallCount++;
    return null;
  };

  Page.updateOne = async () => {
    updateCallCount++;
    return { acknowledged: true, modifiedCount: 1 };
  };

  Page.findOneAndUpdate = async () => {
    updateCallCount++;
    return null;
  };

  try {
    // =========================================================================
    // TEST A: Missing page → page is created
    // =========================================================================
    dbStore.clear();
    createCallCount = 0;
    const initialResult = await seedPages();

    record(
      'TEST A: Missing pages are created on initial run',
      initialResult.createdCount === 6 &&
        initialResult.skippedCount === 0 &&
        dbStore.size === 6 &&
        dbStore.has('home'),
      `Created: ${initialResult.createdCount}, Store size: ${dbStore.size}`
    );

    // =========================================================================
    // TEST B: Existing page → page is NOT overwritten
    // =========================================================================
    const preCallCreateCount = createCallCount;
    const secondResult = await seedPages();

    record(
      'TEST B: Existing pages are preserved and NOT recreated',
      secondResult.createdCount === 0 &&
        secondResult.skippedCount === 6 &&
        createCallCount === preCallCreateCount,
      `Created: ${secondResult.createdCount}, Skipped: ${secondResult.skippedCount}, New creates: ${createCallCount - preCallCreateCount}`
    );

    // =========================================================================
    // TEST C: Existing customized page remains unchanged
    // =========================================================================
    // Inject a customized home page with custom title, custom section, and custom SEO
    const customTimestamp = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const customHome = {
      name: 'Custom Home Title by Admin',
      slug: 'home',
      status: 'published',
      seo: {
        title: 'Custom Admin SEO Title',
        description: 'Custom Admin SEO Description',
        canonical: '/',
      },
      draftSections: [
        {
          sectionId: 'custom-hero-999',
          type: 'hero',
          enabled: true,
          order: 1,
          content: {
            heading: 'Custom Admin Heading Text',
          },
        },
      ],
      publishedSections: [
        {
          sectionId: 'custom-hero-999',
          type: 'hero',
          enabled: true,
          order: 1,
          content: {
            heading: 'Custom Admin Heading Text',
          },
        },
      ],
      updatedAt: customTimestamp,
    };

    dbStore.set('home', customHome);

    // Run seeder against store containing customized page
    const customRunResult = await seedPages();
    const storedHomeAfterSeed = dbStore.get('home');

    const nameIntact = storedHomeAfterSeed.name === 'Custom Home Title by Admin';
    const seoIntact = storedHomeAfterSeed.seo.title === 'Custom Admin SEO Title';
    const sectionIntact =
      storedHomeAfterSeed.publishedSections[0]?.content?.heading === 'Custom Admin Heading Text' &&
      storedHomeAfterSeed.publishedSections.length === 1;
    const timestampIntact = storedHomeAfterSeed.updatedAt === customTimestamp;

    record(
      'TEST C: Existing customized page data (content, sections, SEO, timestamps) remains strictly unchanged',
      customRunResult.skippedCount >= 1 && nameIntact && seoIntact && sectionIntact && timestampIntact,
      `Name intact: ${nameIntact}, SEO intact: ${seoIntact}, Section intact: ${sectionIntact}`
    );

    // =========================================================================
    // TEST D: Running initialization twice does not create duplicate pages
    // =========================================================================
    dbStore.clear();
    await seedPages();
    await seedPages();
    await seedPages();

    const uniqueSlugs = new Set(dbStore.keys());
    record(
      'TEST D: Running initialization multiple times produces exactly 6 unique pages with no duplicates',
      dbStore.size === 6 && uniqueSlugs.size === 6,
      `Total pages in store: ${dbStore.size}, Unique slugs: ${uniqueSlugs.size}`
    );

    // =========================================================================
    // TEST E: All six canonical pages are initialized with required schema fields
    // =========================================================================
    const canonicalSlugs = ['home', 'collections', 'portfolio', 'about', 'contact', 'consultation'];
    const allPresent = canonicalSlugs.every((s) => dbStore.has(s));
    const allHaveBothSections = canonicalSlugs.every((s) => {
      const p = dbStore.get(s);
      return (
        Array.isArray(p.publishedSections) &&
        p.publishedSections.length > 0 &&
        Array.isArray(p.draftSections) &&
        p.draftSections.length > 0 &&
        p.status === 'published' &&
        p.name &&
        p.seo?.title
      );
    });

    record(
      'TEST E: All six canonical pages (home, collections, portfolio, about, contact, consultation) are correctly seeded with published & draft sections',
      allPresent && allHaveBothSections,
      `All 6 present: ${allPresent}, All schemas complete: ${allHaveBothSections}`
    );

    // =========================================================================
    // TEST F: No destructive database operations occur
    // =========================================================================
    record(
      'TEST F: Zero destructive operations (deleteMany, deleteOne, findOneAndDelete) and zero overwrites occur during seeding',
      destructiveCallCount === 0 && updateCallCount === 0,
      `Destructive calls: ${destructiveCallCount}, Update calls: ${updateCallCount}`
    );
  } finally {
    // Restore original Mongoose methods
    Page.create = originalPageCreate;
    Page.findOne = originalPageFindOne;
    Page.find = originalPageFind;
    Page.deleteOne = originalPageDeleteOne;
    Page.deleteMany = originalPageDeleteMany;
    Page.findOneAndDelete = originalPageFindOneAndDelete;
    Page.updateOne = originalPageUpdateOne;
    Page.findOneAndUpdate = originalPageFindOneAndUpdate;
  }

  console.log('\n========================================================');
  console.log(`  INITIALIZATION TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('========================================================\n');

  return results.failed === 0;
}

runPageInitializationTests()
  .then((ok) => {
    if (!ok) process.exit(1);
  })
  .catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
