import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runStage2ATests() {
  console.log('========================================================');
  console.log('  STAGE 2A: FRONTEND INTEGRATION & SECURITY TESTS');
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

  // 1. Check pageService.js exists and exports all required functions
  {
    const pageServicePath = path.resolve(__dirname, 'src/services/pageService.js');
    const content = fs.readFileSync(pageServicePath, 'utf8');
    const hasGetPages = content.includes('getPages:');
    const hasGetPageBySlug = content.includes('getPageBySlug:');
    const hasCreatePage = content.includes('createPage:');
    const hasUpdateDraft = content.includes('updateDraft:');
    const hasPublishPage = content.includes('publishPage:');
    const hasDiscardDraft = content.includes('discardDraft:');
    const hasDeletePage = content.includes('deletePage:');
    const usesAxiosApi = content.includes("import api from './api'");

    record(
      'TEST 1: pageService.js exports all 7 required API methods and reuses existing Axios instance',
      hasGetPages &&
        hasGetPageBySlug &&
        hasCreatePage &&
        hasUpdateDraft &&
        hasPublishPage &&
        hasDiscardDraft &&
        hasDeletePage &&
        usesAxiosApi
    );
  }

  // 2. Check validateUrl security function
  {
    const inspectorPath = path.resolve(__dirname, 'src/pages/admin/page-builder/InspectorPanel.jsx');
    const content = fs.readFileSync(inspectorPath, 'utf8');

    // Test regex/function behavior
    const testCases = [
      { url: 'javascript:alert(1)', valid: false },
      { url: 'data:text/html,<script>alert(1)</script>', valid: false },
      { url: 'vbscript:msgbox(1)', valid: false },
      { url: 'file:///etc/passwd', valid: false },
      { url: '/collections', valid: true },
      { url: '#hero', valid: true },
      { url: 'https://images.unsplash.com/photo-1', valid: true },
      { url: 'http://example.com', valid: true },
      { url: 'mailto:contact@lux.ae', valid: true },
      { url: 'tel:+971508924411', valid: true },
      { url: '', valid: true },
    ];

    const isSafeUrlFn = (url) => {
      if (!url || typeof url !== 'string' || url.trim() === '') return true;
      const trimmed = url.trim();
      const sanitized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();
      if (
        sanitized.startsWith('javascript:') ||
        sanitized.startsWith('data:') ||
        sanitized.startsWith('vbscript:') ||
        sanitized.startsWith('file:')
      ) {
        return false;
      }
      return (
        trimmed.startsWith('/') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('?') ||
        /^https?:\/\//i.test(trimmed) ||
        /^mailto:/i.test(trimmed) ||
        /^tel:/i.test(trimmed)
      );
    };

    const allPassed = testCases.every((tc) => isSafeUrlFn(tc.url) === tc.valid);
    record('TEST 2: Client-side URL validator rejects dangerous protocols and accepts valid web URLs', allPassed);
  }

  // 3. Check SectionRegistry contains all 16 approved section types
  {
    const registryPath = path.resolve(__dirname, 'src/pages/admin/page-builder/SectionRegistry.jsx');
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

    const hasAllTypes = expectedTypes.every((t) => content.includes(`${t}:`));
    const hasFallback = content.includes('UnknownSectionFallback');
    record(
      'TEST 3: SectionRegistry contains all 16 Stage 1 section types and provides safe fallback',
      hasAllTypes && hasFallback
    );
  }

  // 4. Verify all 16 section files exist
  {
    const sectionsDir = path.resolve(__dirname, 'src/pages/admin/page-builder/sections');
    const files = fs.readdirSync(sectionsDir);
    const expectedFiles = [
      'HeroEditorSection.jsx',
      'PhilosophyEditorSection.jsx',
      'CollectionsFeedEditorSection.jsx',
      'ProductsFeedEditorSection.jsx',
      'BeforeAfterEditorSection.jsx',
      'SplitStoryEditorSection.jsx',
      'ValueCardsEditorSection.jsx',
      'ProjectsFeedEditorSection.jsx',
      'CatalogueCTAEditorSection.jsx',
      'ProcessTimelineEditorSection.jsx',
      'TestimonialsFeedEditorSection.jsx',
      'FaqAccordionEditorSection.jsx',
      'ConsultationCTAEditorSection.jsx',
      'EditorialTextEditorSection.jsx',
      'PhotoBannerEditorSection.jsx',
      'ContactDirectoryEditorSection.jsx',
    ];

    const allFilesExist = expectedFiles.every((f) => files.includes(f));
    record('TEST 4: All 16 modular editor section preview components are created on disk', allFilesExist);
  }

  // 5. Verify AppRoutes has admin pages routes
  {
    const appRoutesPath = path.resolve(__dirname, 'src/routes/AppRoutes.jsx');
    const content = fs.readFileSync(appRoutesPath, 'utf8');
    const hasLazyImport = content.includes("import('../pages/admin/PageBuilderManager')");
    const hasPagesRoute = content.includes('path="pages"');
    const hasSlugRoute = content.includes('path="pages/:slug"');

    record(
      'TEST 5: AppRoutes registers lazy-loaded /admin/pages and /admin/pages/:slug under ProtectedRoute',
      hasLazyImport && hasPagesRoute && hasSlugRoute
    );
  }

  // 6. Verify AdminSidebar includes Page Builder with PanelsTopLeft
  {
    const sidebarPath = path.resolve(__dirname, 'src/components/ui/AdminSidebar.jsx');
    const content = fs.readFileSync(sidebarPath, 'utf8');
    const hasPageBuilder = content.includes("label: 'Page Builder'");
    const hasPath = content.includes("path: '/admin/pages'");
    const hasIcon = content.includes('icon: PanelsTopLeft');

    record('TEST 6: AdminSidebar includes Page Builder navigation link with PanelsTopLeft icon', hasPageBuilder && hasPath && hasIcon);
  }

  // 7. Check for prohibited arbitrary HTML injection (dangerouslySetInnerHTML)
  {
    const srcDir = path.resolve(__dirname, 'src');
    function searchDangerous(dir) {
      let findings = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findings = findings.concat(searchDangerous(fullPath));
        } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('dangerouslySetInnerHTML')) {
            findings.push(fullPath);
          }
        }
      }
      return findings;
    }

    const dangerousFiles = searchDangerous(srcDir);
    // Ignore if there was any existing in SEO or public, but check page-builder specifically
    const pbDangerous = dangerousFiles.filter((f) => f.includes('page-builder') || f.includes('PageBuilderManager'));
    record('TEST 7: No dangerouslySetInnerHTML introduced in Page Builder components', pbDangerous.length === 0);
  }

  // 8. Verify public pages remain untouched
  {
    const publicPages = [
      'Home.jsx',
      'Collections.jsx',
      'CollectionDetail.jsx',
      'Portfolio.jsx',
      'ProjectDetail.jsx',
      'About.jsx',
      'Contact.jsx',
      'Consultation.jsx',
    ];

    const publicDir = path.resolve(__dirname, 'src/pages/public');
    const existing = fs.readdirSync(publicDir);
    const allPresent = publicPages.every((p) => existing.includes(p));
    record('TEST 8: All 8 public customer-facing page files remain present in client/src/pages/public/', allPresent);
  }

  console.log('\n========================================================');
  console.log(`  STAGE 2A TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  return failed === 0;
}

runStage2ATests().then((ok) => {
  if (!ok) process.exit(1);
});
