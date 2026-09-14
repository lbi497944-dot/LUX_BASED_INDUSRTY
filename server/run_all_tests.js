import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testSuites = [
  { name: 'E2E Security & Regression Suite', file: 'e2e_test.js' },
  { name: 'Catalogue Lifecycle Suite', file: 'test_catalogue_lifecycle.js' },
  { name: 'Collection Integrity Suite', file: 'test_collection_integrity.js' },
  { name: 'Consultation Deletion Suite', file: 'test_delete_consultation.js' },
  { name: 'FAQ & Testimonial Whitelist Suite', file: 'test_faq_testimonial_whitelist.js' },
  { name: 'Page Builder Backend Suite', file: 'test_page_builder.js' },
  { name: 'Page Initialization Suite', file: 'test_page_initialization.js' },
  { name: 'Partner Backend Suite', file: 'test_partner_backend.js' },
  { name: 'Phase 5C Sitemap & Showcase Suite', file: 'test_phase5c_sitemap_showcase.js' },
  { name: 'Product Media & Cloudinary Suite', file: 'test_product_media.js' },
  { name: 'Project Media & Cloudinary Suite', file: 'test_project_media.js' },
  { name: 'Review Backend Suite', file: 'test_review_backend.js' },
  { name: 'Settings Whitelist Suite', file: 'test_settings_whitelist.js' },
  { name: 'Transformation Backend Suite', file: 'test_transformation_backend.js' },
  { name: 'Phase 5D Admin UI & Code Audit', file: 'verify_phase5d.js' },
  { name: 'Phase 5F SEO & Conversion Audit Suite', file: 'test_phase5f_seo_conversion.js' },
  { name: 'Phase 5G Security & Hardening Suite', file: 'test_phase5g_security.js' },
  { name: 'Phase 5H Newsletter & Notifications Suite', file: 'test_phase5h_newsletter_notifications.js' },
  { name: 'Phase 6B Live Preview & Workspace Modals Suite', file: 'test_phase6b_live_previews.js' },
  { name: 'Phase 6B.1 CMS Live Preview Fidelity & UX Acceptance', file: 'test_phase6b1_acceptance.js' },
  { name: 'Phase 6C Real Business Content & Commercial Operations', file: 'test_phase6c_content_operations.js' },
  { name: 'Phase 6D Controlled Production Content Entry & Owner Acceptance', file: 'test_phase6d_acceptance.js' },
  { name: 'Phase 6E Final Admin CMS Polish & Content Management', file: 'test_phase6e_cms_polish.js' },
];

console.log('========================================================');
console.log('  COMPLETE PROJECT REGRESSION & TEST RUNNER (ALL SUITES)');
console.log('========================================================\n');

let grandTotalPassed = 0;
let grandTotalFailed = 0;
const results = [];

for (const suite of testSuites) {
  const filePath = path.join(__dirname, suite.file);
  process.stdout.write(`Running ${suite.name} (${suite.file})... `);
  try {
    const output = execSync(`node "${filePath}"`, {
      cwd: __dirname,
      encoding: 'utf8',
      env: { ...process.env },
    });

    // Extract passed test count
    let passedCount = 0;
    const summaryMatch = output.match(/(\d+)\s*\/\s*(\d+)\s*tests?\s*passed/i) ||
      output.match(/(\d+)\s*PASSED/i) ||
      output.match(/AUDIT RESULTS:\s*(\d+)\s*PASSED/i);

    if (summaryMatch) {
      passedCount = parseInt(summaryMatch[1], 10);
    } else {
      const passMatches = output.match(/\[PASS\]/gi);
      passedCount = passMatches ? passMatches.length : 0;
    }

    grandTotalPassed += passedCount;
    results.push({ name: suite.name, file: suite.file, passed: passedCount, failed: 0, status: 'PASS' });
    console.log(`✅ [${passedCount} PASSED]`);
  } catch (err) {
    grandTotalFailed++;
    results.push({ name: suite.name, file: suite.file, passed: 0, failed: 1, status: 'FAIL', error: err.message });
    console.log(`❌ [FAILED]`);
    console.error(err.stdout || err.message);
  }
}

console.log('\n========================================================');
console.log('  FULL PROJECT REGRESSION SUMMARY');
console.log('========================================================');
results.forEach(r => {
  console.log(`  ${r.status === 'PASS' ? '✅' : '❌'} ${r.name.padEnd(42)}: ${r.passed} passed, ${r.failed} failed`);
});
console.log('========================================================');
console.log(`  GRAND TOTAL: ${grandTotalPassed} PASSED, ${grandTotalFailed} FAILED (${testSuites.length} test suites)`);
console.log('========================================================\n');

if (grandTotalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
