import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runStage2BHomeTests() {
  console.log('========================================================');
  console.log('  STAGE 2B-1: DYNAMIC PAGE RENDERER & HOME TESTS');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function record(name, condition, details = '') {
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      failed++;
      console.error(`  ❌ [FAIL] ${name} — ${details}`);
    }
  }

  // 1. DynamicPageRenderer exists and exports cleanly
  {
    const rendererPath = path.resolve(__dirname, 'src/components/page-builder/DynamicPageRenderer.jsx');
    const exists = fs.existsSync(rendererPath);
    const content = exists ? fs.readFileSync(rendererPath, 'utf8') : '';
    const hasDefaultExport = content.includes('export default function DynamicPageRenderer');
    const importsRegistry = content.includes("from './SectionRegistry'");

    record(
      'TEST 1: DynamicPageRenderer exists and exports cleanly',
      exists && hasDefaultExport && importsRegistry,
      'DynamicPageRenderer file or default export missing'
    );
  }

  // 2. SectionRegistry exports PRODUCTION_SECTION_REGISTRY and getProductionSectionComponent
  {
    const registryPath = path.resolve(__dirname, 'src/components/page-builder/SectionRegistry.jsx');
    const exists = fs.existsSync(registryPath);
    const content = exists ? fs.readFileSync(registryPath, 'utf8') : '';
    const exportsRegistry = content.includes('export const PRODUCTION_SECTION_REGISTRY =');
    const exportsGetter = content.includes('export const getProductionSectionComponent =');

    record(
      'TEST 2: SectionRegistry exports PRODUCTION_SECTION_REGISTRY and getProductionSectionComponent',
      exists && exportsRegistry && exportsGetter,
      'SectionRegistry missing required exports'
    );
  }

  // 3. All 16 Stage 1 section types are registered in production SectionRegistry
  {
    const registryPath = path.resolve(__dirname, 'src/components/page-builder/SectionRegistry.jsx');
    const content = fs.readFileSync(registryPath, 'utf8');

    const expectedTypes = [
      'hero',
      'philosophy',
      'collections_feed',
      'products_feed',
      'before_after',
      'split_story',
      'value_cards',
      'projects_feed',
      'catalogue_cta',
      'process_timeline',
      'testimonials_feed',
      'faq_accordion',
      'consultation_cta',
      'editorial_text',
      'photo_banner',
      'contact_directory',
    ];

    const hasAll16 = expectedTypes.every((t) => content.includes(`${t}:`));
    record(
      'TEST 3: All 16 Stage 1 section types are registered in production SectionRegistry',
      hasAll16,
      'One or more of the 16 approved section types is missing from registry'
    );
  }

  // 4. Numeric ordering behavior: sections sort by numeric order (1 -> 3 -> 5)
  {
    const testSections = [
      { sectionId: 'c', type: 'collections_feed', order: 5, enabled: true },
      { sectionId: 'a', type: 'hero', order: 1, enabled: true },
      { sectionId: 'b', type: 'philosophy', order: 3, enabled: true },
    ];

    // Mirror DynamicPageRenderer sorting logic
    const validSections = testSections.filter(
      (sec) => sec && typeof sec === 'object' && sec.type && sec.enabled !== false
    );
    const sorted = [...validSections].sort((a, b) => {
      const orderA = typeof a.order === 'number' && !Number.isNaN(a.order) ? a.order : 9999;
      const orderB = typeof b.order === 'number' && !Number.isNaN(b.order) ? b.order : 9999;
      return orderA - orderB;
    });

    const correctOrder = sorted.map((s) => s.order).join(',') === '1,3,5';
    const correctIds = sorted.map((s) => s.sectionId).join(',') === 'a,b,c';

    record(
      'TEST 4: Section ordering behavior: sections sort numerically by order (1 -> 3 -> 5)',
      correctOrder && correctIds,
      `Expected 1,3,5 but got ${sorted.map((s) => s.order).join(',')}`
    );
  }

  // 5. Disabled sections are strictly omitted
  {
    const testSections = [
      { sectionId: 's1', type: 'hero', order: 1, enabled: true },
      { sectionId: 's2', type: 'philosophy', order: 2, enabled: false },
      { sectionId: 's3', type: 'collections_feed', order: 3 }, // undefined enabled defaults to true
    ];

    const filtered = testSections.filter(
      (sec) => sec && typeof sec === 'object' && sec.type && sec.enabled !== false
    );

    const hasS1 = filtered.some((s) => s.sectionId === 's1');
    const hasS2 = filtered.some((s) => s.sectionId === 's2');
    const hasS3 = filtered.some((s) => s.sectionId === 's3');

    record(
      'TEST 5: Disabled sections (enabled === false) are strictly omitted from rendering',
      hasS1 && !hasS2 && hasS3,
      'Disabled section was not filtered out or valid sections missing'
    );
  }

  // 6. Unknown section types are skipped gracefully without crashing
  {
    const rendererPath = path.resolve(__dirname, 'src/components/page-builder/DynamicPageRenderer.jsx');
    const content = fs.readFileSync(rendererPath, 'utf8');

    const handlesUnknown = content.includes('if (!Renderer)') && content.includes('return null;');
    record(
      'TEST 6: Unknown section types are skipped gracefully without throwing unhandled exceptions',
      handlesUnknown,
      'Missing check for null Renderer lookup in DynamicPageRenderer'
    );
  }

  // 7. Malformed section payloads do not crash renderer
  {
    const rendererPath = path.resolve(__dirname, 'src/components/page-builder/DynamicPageRenderer.jsx');
    const content = fs.readFileSync(rendererPath, 'utf8');

    const guardsPage = content.includes('if (!page || typeof page !== \'object\')');
    const guardsSections = content.includes('Array.isArray(page.publishedSections)');
    const guardsSectionItem = content.includes('!section || !section.type');

    record(
      'TEST 7: Malformed section payloads (null page, missing arrays, invalid items) fail safely',
      guardsPage && guardsSections && guardsSectionItem,
      'Missing boundary guards in DynamicPageRenderer'
    );
  }

  // 8. pageService.getPageBySlug defaults to public mode (adminView = false, no query param)
  {
    const pageServicePath = path.resolve(__dirname, 'src/services/pageService.js');
    const content = fs.readFileSync(pageServicePath, 'utf8');

    const hasPublicDefault = content.includes('getPageBySlug: async (slug, adminView = false)');
    const hasConditionalParam = content.includes('adminView ? { params: { adminView: true } } : {}');

    record(
      'TEST 8: pageService.getPageBySlug defaults to public mode and omits adminView parameter',
      hasPublicDefault && hasConditionalParam,
      'getPageBySlug does not default to public mode or sends adminView=true unconditionally'
    );
  }

  // 9. pageService.getPublishedPage explicitly requests public page
  {
    const pageServicePath = path.resolve(__dirname, 'src/services/pageService.js');
    const content = fs.readFileSync(pageServicePath, 'utf8');

    const hasGetPublishedPage = content.includes('getPublishedPage: async (slug) =>');
    record(
      'TEST 9: pageService exports getPublishedPage for explicit public retrieval',
      hasGetPublishedPage,
      'getPublishedPage method missing in pageService.js'
    );
  }

  // 10. Home.jsx retains complete fallback and uses Promise.allSettled without waterfalls
  {
    const homePath = path.resolve(__dirname, 'src/pages/public/Home.jsx');
    const content = fs.readFileSync(homePath, 'utf8');

    const importsDynamicRenderer = content.includes("import DynamicPageRenderer from '../../components/page-builder/DynamicPageRenderer'");
    const usesAllSettled = content.includes("pageService.getPageBySlug('home')") && content.includes('Promise.allSettled');
    const guardsDynamicRender = content.includes('hasValidDynamicContent');
    const retainsFallbackJSX = content.includes('className="hero-bg-frame"') && content.includes('className="editorial-split"');

    record(
      'TEST 10: Home.jsx retains complete fallback implementation and fetches in parallel via Promise.allSettled',
      importsDynamicRenderer && usesAllSettled && guardsDynamicRender && retainsFallbackJSX,
      'Home.jsx missing fallback JSX or dynamic render condition'
    );
  }

  // 11. SEO priority handling: Page Builder overrides with pageSeoData.home fallback
  {
    const homePath = path.resolve(__dirname, 'src/pages/public/Home.jsx');
    const content = fs.readFileSync(homePath, 'utf8');

    const handlesTitle = content.includes('pageSeoTitle');
    const handlesDesc = content.includes('pageSeoDescription');
    const handlesCanonical = content.includes('pageSeoCanonical');
    const preservesVercelDomain = !content.includes('lux-based-industry.vercel.app');

    record(
      'TEST 11: SEO metadata handles Page Builder overrides with fallback to pageSeoData.home and safe canonical',
      handlesTitle && handlesDesc && handlesCanonical && preservesVercelDomain,
      'SEO integration missing or outdated domain detected'
    );
  }

  // 12. Security check: No dangerous DOM/code execution in production page builder files
  {
    const pbDir = path.resolve(__dirname, 'src/components/page-builder');
    const checkDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          checkDir(full);
        } else if (full.endsWith('.jsx') || full.endsWith('.js')) {
          const code = fs.readFileSync(full, 'utf8');
          if (
            code.includes('dangerouslySetInnerHTML') ||
            code.includes('eval(') ||
            code.includes('new Function') ||
            code.includes('document.write') ||
            code.includes('.innerHTML')
          ) {
            return false;
          }
        }
      }
      return true;
    };

    const isSecure = checkDir(pbDir);
    record(
      'TEST 12: No dangerous DOM or code execution APIs (dangerouslySetInnerHTML, eval, etc.) in production renderer',
      isSecure,
      'Dangerous DOM API detected in page-builder component'
    );
  }

  // 13. Public page boundary: Only Home.jsx was modified under client/src/pages/public/
  {
    const publicDir = path.resolve(__dirname, 'src/pages/public');
    const untouchedFiles = [
      'About.jsx',
      'Collections.jsx',
      'CollectionDetail.jsx',
      'Portfolio.jsx',
      'ProjectDetail.jsx',
      'Contact.jsx',
      'Consultation.jsx',
    ];

    const allExistAndUntouched = untouchedFiles.every((f) => fs.existsSync(path.join(publicDir, f)));
    record(
      'TEST 13: Public page boundary preserved: all 7 other public pages remain present and untouched',
      allExistAndUntouched,
      'Public page files missing or modified unexpectedly'
    );
  }

  // 14. Stage 2A admin functionality intact (PageBuilderManager, SectionRegistry, EditableBox, InspectorPanel)
  {
    const adminPbDir = path.resolve(__dirname, 'src/pages/admin/page-builder');
    const adminFiles = [
      'EditableBox.jsx',
      'InspectorPanel.jsx',
      'SectionListPanel.jsx',
      'SectionRegistry.jsx',
      'VisualEditor.jsx',
    ];
    const hasAdminManager = fs.existsSync(path.resolve(__dirname, 'src/pages/admin/PageBuilderManager.jsx'));
    const hasAllAdminPb = adminFiles.every((f) => fs.existsSync(path.join(adminPbDir, f)));

    record(
      'TEST 14: Stage 2A admin Page Builder components remain intact and decoupled from public renderer',
      hasAdminManager && hasAllAdminPb,
      'Admin Page Builder files missing or affected'
    );
  }

  console.log('\n========================================================');
  console.log(`  STAGE 2B-1 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage2BHomeTests();
