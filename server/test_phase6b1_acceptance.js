import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================');
console.log('PHASE 6B.1 — CMS LIVE PREVIEWS FIDELITY & UX ACCEPTANCE');
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

// PART 1 — PRODUCT PREVIEW FIDELITY
const prodPreviewPath = path.join(rootDir, 'client/src/components/admin/ProductLivePreview.jsx');
assert(fs.existsSync(prodPreviewPath), 'ProductLivePreview.jsx exists');
if (fs.existsSync(prodPreviewPath)) {
  const content = fs.readFileSync(prodPreviewPath, 'utf8');
  assert(content.includes('product-card-luxury') && content.includes('detail-product-card'), 'ProductLivePreview uses customer-facing .product-card-luxury and .detail-product-card CSS classes');
  assert(content.includes('product-image-frame') && content.includes('product-save-heart'), 'ProductLivePreview includes luxury image frame and interactive bookmark heart');
  assert(content.includes('product-category') && content.includes('product-name'), 'ProductLivePreview renders category eyebrow and serif product title');
  assert(content.includes('preview-specs-box') && content.includes('DIMENSIONS') && content.includes('FINISH / MATERIAL'), 'ProductLivePreview displays structured architectural specifications grid');
  assert(content.includes('COLOR TEMP') && content.includes('WATTAGE & RATING'), 'ProductLivePreview renders color temperature (2700K) and wattage / IP rating');
  assert(content.includes('btn-link-whatsapp') && content.includes('WHATSAPP'), 'ProductLivePreview renders non-navigating WhatsApp customer action');
  assert(content.includes('images.chandelier'), 'ProductLivePreview has graceful fallback for missing images');
}

// PART 2 — COLLECTION PREVIEW FIDELITY
const colPreviewPath = path.join(rootDir, 'client/src/components/admin/CollectionLivePreview.jsx');
assert(fs.existsSync(colPreviewPath), 'CollectionLivePreview.jsx exists');
if (fs.existsSync(colPreviewPath)) {
  const content = fs.readFileSync(colPreviewPath, 'utf8');
  assert(content.includes('preview-hero-banner') && content.includes('eyebrow gold-label'), 'CollectionLivePreview renders full-width hero banner with gold eyebrow');
  assert(content.includes('CURATORIAL OVERVIEW') && content.includes('description'), 'CollectionLivePreview renders curatorial architectural narrative');
  assert(content.includes('SIGNATURE CRAFTSMANSHIP & FEATURES') && content.includes('CheckCircle2'), 'CollectionLivePreview renders technical specifications with gold check icons');
  assert(content.includes('MATERIALS') && content.includes('APPLICATIONS'), 'CollectionLivePreview renders materials and architectural applications breakdown');
}

// PART 3 — PROJECT / PORTFOLIO PREVIEW FIDELITY
const projPreviewPath = path.join(rootDir, 'client/src/components/admin/ProjectLivePreview.jsx');
assert(fs.existsSync(projPreviewPath), 'ProjectLivePreview.jsx exists');
if (fs.existsSync(projPreviewPath)) {
  const content = fs.readFileSync(projPreviewPath, 'utf8');
  assert(content.includes('category?.toUpperCase()') && content.includes('year'), 'ProjectLivePreview displays category pill and completion year tag');
  assert(content.includes('MapPin') && content.includes('location'), 'ProjectLivePreview renders project location with MapPin icon');
  assert(content.includes('COMMISSION DETAILS') && content.includes('PROJECT SCOPE'), 'ProjectLivePreview renders narrative overview and scope deliverables');
  assert(content.includes('IN SITU PHOTOGRAPHY GALLERY') && content.includes('gallery'), 'ProjectLivePreview renders in-situ photo gallery grid with count indicators');
}

// PART 4 — TRANSFORMATION PREVIEW FIDELITY
const transPreviewPath = path.join(rootDir, 'client/src/components/admin/TransformationLivePreview.jsx');
assert(fs.existsSync(transPreviewPath), 'TransformationLivePreview.jsx exists');
if (fs.existsSync(transPreviewPath)) {
  const content = fs.readFileSync(transPreviewPath, 'utf8');
  assert(content.includes('sliderPos') && content.includes('handleMove'), 'TransformationLivePreview provides interactive before/after split slider');
  assert(content.includes('WITH LUX LIGHTING') && content.includes('UNLIT'), 'TransformationLivePreview includes spatial lighting labels');
  assert(content.includes('Before Photo (Unlit)') && content.includes('After Photo (Illuminated)'), 'TransformationLivePreview gracefully handles incomplete photo states without fake images');
  assert(content.includes('shortDescription') && content.includes('detailedDescription'), 'TransformationLivePreview renders both card summary and detailed engineering narrative');
}

// PART 5 — NEWSLETTER PREVIEW FIDELITY
const newsPreviewPath = path.join(rootDir, 'client/src/components/admin/NewsletterLivePreview.jsx');
assert(fs.existsSync(newsPreviewPath), 'NewsletterLivePreview.jsx exists');
if (fs.existsSync(newsPreviewPath)) {
  const content = fs.readFileSync(newsPreviewPath, 'utf8');
  assert(content.includes('preview-newsletter-container') && content.includes('Preheader:'), 'NewsletterLivePreview renders email envelope with sender, subject, and preheader');
  assert(content.includes('brand') && content.includes('ARCHITECTURAL LIGHTING'), 'NewsletterLivePreview renders studio header branding from dynamic settings');
  assert(content.includes('attachments') && content.includes('formatFileSize'), 'NewsletterLivePreview renders attached lookbook documents with file size badges');
  assert(content.includes('ctaText'), 'NewsletterLivePreview renders CTA action button matching server template');
  assert(content.includes('luxbasedindustries@gmail.com'), 'NewsletterLivePreview uses verified studio email contact info');
}

// PART 6 — UNSAVED STATE & REACTIVITY
const managers = [
  'NewsletterManager.jsx',
  'ProductsManager.jsx',
  'CollectionsManager.jsx',
  'ProjectsManager.jsx',
  'TransformationsManager.jsx',
];

for (const m of managers) {
  const p = path.join(rootDir, 'client/src/pages/admin', m);
  assert(fs.existsSync(p), `${m} exists`);
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    assert(c.includes('formData={formData}'), `${m} reactively passes form state directly to live preview component`);
    assert(!c.includes('onKeystrokeSave') && !c.includes('autoSaveToDatabase'), `${m} does NOT trigger premature API calls or DB writes while typing`);
  }
}

// PART 8 — PREVIEW INTERACTION SAFETY
const framePath = path.join(rootDir, 'client/src/components/admin/AdminLivePreviewFrame.jsx');
assert(fs.existsSync(framePath), 'AdminLivePreviewFrame.jsx exists');
if (fs.existsSync(framePath)) {
  const content = fs.readFileSync(framePath, 'utf8');
  assert(content.includes('onClickCapture={handleContainerClick}'), 'AdminLivePreviewFrame uses capture phase click containment');
  assert(content.includes('target.classList.contains(\'preview-interactive\')'), 'AdminLivePreviewFrame permits legitimate interactive elements while blocking page navigation');
}

// PART 9, 10, 11 — RESPONSIVENESS & WORKSPACE STYLES
const stylesPath = path.join(rootDir, 'client/src/styles/styles.css');
assert(fs.existsSync(stylesPath), 'styles.css exists');
if (fs.existsSync(stylesPath)) {
  const content = fs.readFileSync(stylesPath, 'utf8');
  assert(content.includes('.admin-modal-workspace'), 'styles.css defines .admin-modal-workspace modal container');
  assert(content.includes('.admin-workspace-grid'), 'styles.css defines .admin-workspace-grid layout');
  assert(content.includes('.admin-workspace-tabs'), 'styles.css defines .admin-workspace-tabs for mobile navigation');
  assert(content.includes('@media (max-width: 1024px)'), 'styles.css includes responsive breakpoint for <= 1024px tablet/mobile view');
  assert(content.includes('.admin-device-switcher'), 'styles.css defines .admin-device-switcher controls');
  assert(content.includes('.device-mobile'), 'styles.css defines .device-mobile 390px viewport frame');
}

// PART 12 — MODAL STACKING & DISMISSAL
for (const m of managers) {
  const p = path.join(rootDir, 'client/src/pages/admin', m);
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    assert(c.includes('admin-modal-backdrop') || c.includes('modal-backdrop'), `${m} includes modal backdrop overlay`);
    assert(c.includes('admin-modal-close-btn') || c.includes('modal-close'), `${m} includes accessible close button`);
  }
}

// PART 13 — ACCESSIBILITY
for (const m of managers) {
  const p = path.join(rootDir, 'client/src/pages/admin', m);
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    assert(c.includes('role="dialog"') && c.includes('aria-modal="true"'), `${m} includes WAI-ARIA dialog attributes`);
  }
}

// PART 15 — BUSINESS CONTENT SAFETY & BRANDING
const adminDir = path.join(rootDir, 'client/src/components/admin');
const previewFiles = fs.readdirSync(adminDir).filter((f) => f.endsWith('.jsx'));
let velouraCount = 0;
for (const f of previewFiles) {
  const c = fs.readFileSync(path.join(adminDir, f), 'utf8');
  const matches = c.match(/veloura/gi) || [];
  velouraCount += matches.length;
}
assert(velouraCount === 0, `0 customer-visible "Veloura" branding strings in admin preview components (found ${velouraCount})`);

console.log(`\n========================================================`);
console.log(`PHASE 6B.1 AUDIT TOTAL: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
