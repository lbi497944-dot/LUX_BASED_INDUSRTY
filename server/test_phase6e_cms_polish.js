import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================');
console.log('PHASE 6E — FINAL ADMIN CMS POLISH & SIMPLE CMS TEST');
console.log('========================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

// ----------------------------------------------------
// 1. NO APPROVAL WORKFLOWS IN ADMIN CMS SCHEMAS (PART 1 & 2)
// ----------------------------------------------------
const modelsToVerify = [
  { name: 'Product.js', path: 'server/src/models/Product.js' },
  { name: 'Collection.js', path: 'server/src/models/Collection.js' },
  { name: 'Project.js', path: 'server/src/models/Project.js' },
  { name: 'Transformation.js', path: 'server/src/models/Transformation.js' },
  { name: 'Partner.js', path: 'server/src/models/Partner.js' },
  { name: 'Testimonial.js', path: 'server/src/models/Testimonial.js' },
  { name: 'Faq.js', path: 'server/src/models/Faq.js' },
  { name: 'SiteSetting.js', path: 'server/src/models/SiteSetting.js' },
];

modelsToVerify.forEach(({ name, path: relPath }) => {
  const fullPath = path.join(rootDir, relPath);
  assert(fs.existsSync(fullPath), `${name} exists`);
  if (fs.existsSync(fullPath)) {
    const code = fs.readFileSync(fullPath, 'utf8');
    assert(!code.includes('approvalStatus'), `${name} has 0 approvalStatus`);
    assert(!code.includes('moderationStatus'), `${name} has 0 moderationStatus`);
    assert(!code.includes('pendingApproval'), `${name} has 0 pendingApproval`);
    if (name !== 'SiteSetting.js') {
      assert(code.includes('isActive'), `${name} uses direct isActive publishing toggle`);
    }
  }
});

// ----------------------------------------------------
// 2. ADMIN CMS MANAGER COMPONENTS EXISTENCE (PART 1)
// ----------------------------------------------------
const adminPagesDir = path.join(rootDir, 'client/src/pages/admin');
const expectedManagers = [
  'ProductsManager.jsx',
  'CollectionsManager.jsx',
  'ProjectsManager.jsx',
  'TransformationsManager.jsx',
  'PartnersManager.jsx',
  'TestimonialsManager.jsx',
  'FaqsManager.jsx',
  'SettingsManager.jsx',
  'NewsletterManager.jsx',
  'ReviewsManager.jsx',
  'ConsultationsManager.jsx',
  'ContactEnquiriesManager.jsx',
  'DashboardOverview.jsx',
];

expectedManagers.forEach((file) => {
  assert(fs.existsSync(path.join(adminPagesDir, file)), `${file} exists in client admin`);
});

// ----------------------------------------------------
// 3. UNIFIED "+ ADD [ITEM]" PRIMARY ACTIONS (PART 3)
// ----------------------------------------------------
const managerAddChecks = [
  { file: 'ProductsManager.jsx', text: 'ADD PRODUCT' },
  { file: 'CollectionsManager.jsx', text: 'ADD COLLECTION' },
  { file: 'ProjectsManager.jsx', text: 'ADD PROJECT' },
  { file: 'TransformationsManager.jsx', text: 'ADD TRANSFORMATION' },
  { file: 'PartnersManager.jsx', text: 'ADD PARTNER' },
  { file: 'TestimonialsManager.jsx', text: 'ADD TESTIMONIAL' },
  { file: 'FaqsManager.jsx', text: 'ADD FAQ' },
  { file: 'NewsletterManager.jsx', text: 'CREATE NEWSLETTER' },
];

managerAddChecks.forEach(({ file, text }) => {
  const content = fs.readFileSync(path.join(adminPagesDir, file), 'utf8');
  assert(content.includes(text), `${file} contains primary action button "${text}"`);
});

// ----------------------------------------------------
// 4. SEARCH & REFRESH CONTROLS IN TOOLBARS (PART 6 & 7)
// ----------------------------------------------------
const toolbarsToCheck = [
  'ProductsManager.jsx',
  'CollectionsManager.jsx',
  'ProjectsManager.jsx',
  'TransformationsManager.jsx',
  'PartnersManager.jsx',
  'TestimonialsManager.jsx',
  'FaqsManager.jsx',
  'ReviewsManager.jsx',
  'ConsultationsManager.jsx',
  'ContactEnquiriesManager.jsx',
  'NewsletterManager.jsx',
];

toolbarsToCheck.forEach((file) => {
  const content = fs.readFileSync(path.join(adminPagesDir, file), 'utf8');
  assert(content.includes('admin-search-box') || content.includes('Search'), `${file} provides search toolbar input`);
  assert(content.includes('admin-refresh-btn'), `${file} provides standardized admin-refresh-btn`);
});

// ----------------------------------------------------
// 5. LIVE CLIENT-SIDE PREVIEWS WIRED TO UNSAVED STATE (PART 9)
// ----------------------------------------------------
const livePreviewManagers = [
  { file: 'ProductsManager.jsx', preview: 'ProductLivePreview' },
  { file: 'CollectionsManager.jsx', preview: 'CollectionLivePreview' },
  { file: 'ProjectsManager.jsx', preview: 'ProjectLivePreview' },
  { file: 'TransformationsManager.jsx', preview: 'TransformationLivePreview' },
  { file: 'NewsletterManager.jsx', preview: 'NewsletterLivePreview' },
];

livePreviewManagers.forEach(({ file, preview }) => {
  const content = fs.readFileSync(path.join(adminPagesDir, file), 'utf8');
  assert(content.includes(preview), `${file} renders ${preview}`);
  assert(content.includes('formData'), `${file} feeds real-time unsaved formData into preview`);
});

// ----------------------------------------------------
// 6. DELETE CONFIRMATION PROTECTIONS (PART 5)
// ----------------------------------------------------
const deleteProtectedManagers = [
  'ProductsManager.jsx',
  'CollectionsManager.jsx',
  'ProjectsManager.jsx',
  'TransformationsManager.jsx',
  'PartnersManager.jsx',
  'TestimonialsManager.jsx',
  'FaqsManager.jsx',
  'ReviewsManager.jsx',
  'ConsultationsManager.jsx',
  'ContactEnquiriesManager.jsx',
  'NewsletterManager.jsx',
];

deleteProtectedManagers.forEach((file) => {
  const content = fs.readFileSync(path.join(adminPagesDir, file), 'utf8');
  assert(content.includes('ModalConfirm'), `${file} protects deletions with custom ModalConfirm`);
  assert(!content.includes('window.confirm('), `${file} avoids raw browser confirm() dialogs`);
});

// ----------------------------------------------------
// 7. ZERO BRAND LEAKS ON PUBLIC SURFACES (PART 28)
// ----------------------------------------------------
const publicComponents = [
  'client/src/components/layout/Navbar.jsx',
  'client/src/components/layout/Footer.jsx',
  'client/src/pages/Home.jsx',
  'client/src/pages/Collections.jsx',
  'client/src/pages/Products.jsx',
  'client/src/pages/Portfolio.jsx',
  'client/src/pages/Contact.jsx',
  'client/src/pages/Consultation.jsx',
];

publicComponents.forEach((relPath) => {
  const fullPath = path.join(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    const code = fs.readFileSync(fullPath, 'utf8');
    const lines = code.split('\n');
    let hasLeak = false;
    lines.forEach((line) => {
      if (line.includes('Veloura') && !line.includes('//') && !line.includes('veloura-lighting-client')) {
        hasLeak = true;
      }
    });
    assert(!hasLeak, `${relPath} contains 0 customer-visible Veloura branding leaks`);
  }
});

// ----------------------------------------------------
// 8. NEWSLETTER OPERATIONAL BROADCAST STATES (PART 25)
// ----------------------------------------------------
const newsletterServicePath = path.join(rootDir, 'server/src/services/newsletterService.js');
assert(fs.existsSync(newsletterServicePath), 'newsletterService.js exists');
if (fs.existsSync(newsletterServicePath)) {
  const code = fs.readFileSync(newsletterServicePath, 'utf8');
  assert(code.includes('sendNewsletterBroadcast'), 'newsletterService contains sendNewsletterBroadcast');
  assert(code.includes('Send_Failed'), 'newsletterService contains graceful Send_Failed error state');
}

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n========================================================');
console.log(`  PHASE 6E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
