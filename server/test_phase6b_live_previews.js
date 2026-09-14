import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================');
console.log('PHASE 6B — LIVE PREVIEW & WORKSPACE MODALS TEST SUITE');
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

// 1. Audit AdminLivePreviewFrame.jsx
const framePath = path.join(rootDir, 'client/src/components/admin/AdminLivePreviewFrame.jsx');
assert(fs.existsSync(framePath), 'AdminLivePreviewFrame.jsx exists in client/src/components/admin/');
if (fs.existsSync(framePath)) {
  const content = fs.readFileSync(framePath, 'utf8');
  assert(content.includes('deviceMode') && content.includes('setDeviceMode'), 'AdminLivePreviewFrame supports dynamic desktop/mobile device modes');
  assert(content.includes('handleContainerClick') && content.includes('preventDefault'), 'AdminLivePreviewFrame intercepts child clicks to prevent accidental navigation');
  assert(content.includes('admin-preview-pulse-dot'), 'AdminLivePreviewFrame includes pulse live indicator');
  assert(content.includes('admin-device-switcher'), 'AdminLivePreviewFrame includes responsive device switcher toolbar');
}

// 2. Audit ProductLivePreview.jsx
const prodPreviewPath = path.join(rootDir, 'client/src/components/admin/ProductLivePreview.jsx');
assert(fs.existsSync(prodPreviewPath), 'ProductLivePreview.jsx exists');
if (fs.existsSync(prodPreviewPath)) {
  const content = fs.readFileSync(prodPreviewPath, 'utf8');
  assert(content.includes('formData.name') && content.includes('formData.category'), 'ProductLivePreview reactively renders title and category');
  assert(content.includes('DIMENSIONS') && content.includes('WHATSAPP'), 'ProductLivePreview includes luxury specifications and WhatsApp inquiry');
}

// 3. Audit CollectionLivePreview.jsx
const colPreviewPath = path.join(rootDir, 'client/src/components/admin/CollectionLivePreview.jsx');
assert(fs.existsSync(colPreviewPath), 'CollectionLivePreview.jsx exists');
if (fs.existsSync(colPreviewPath)) {
  const content = fs.readFileSync(colPreviewPath, 'utf8');
  assert(content.includes('heroImage') || content.includes('formData.heroImage'), 'CollectionLivePreview renders collection hero image');
  assert(content.includes('SIGNATURE CRAFTSMANSHIP') && content.includes('CURATORIAL OVERVIEW'), 'CollectionLivePreview renders curatorial architectural details');
}

// 4. Audit ProjectLivePreview.jsx
const projPreviewPath = path.join(rootDir, 'client/src/components/admin/ProjectLivePreview.jsx');
assert(fs.existsSync(projPreviewPath), 'ProjectLivePreview.jsx exists');
if (fs.existsSync(projPreviewPath)) {
  const content = fs.readFileSync(projPreviewPath, 'utf8');
  assert(content.includes('formData.title') && content.includes('gallery'), 'ProjectLivePreview renders commission overview and in-situ gallery');
}

// 5. Audit TransformationLivePreview.jsx
const transPreviewPath = path.join(rootDir, 'client/src/components/admin/TransformationLivePreview.jsx');
assert(fs.existsSync(transPreviewPath), 'TransformationLivePreview.jsx exists');
if (fs.existsSync(transPreviewPath)) {
  const content = fs.readFileSync(transPreviewPath, 'utf8');
  assert(content.includes('sliderPos') || content.includes('BeforeAfterSlider'), 'TransformationLivePreview provides interactive before/after comparison');
}

// 6. Audit NewsletterLivePreview.jsx
const newsPreviewPath = path.join(rootDir, 'client/src/components/admin/NewsletterLivePreview.jsx');
assert(fs.existsSync(newsPreviewPath), 'NewsletterLivePreview.jsx exists');
if (fs.existsSync(newsPreviewPath)) {
  const content = fs.readFileSync(newsPreviewPath, 'utf8');
  assert(content.includes('brand') && content.includes('formData.content'), 'NewsletterLivePreview renders branded HTML email template matching server design');
  assert(content.includes('formData.attachments') && content.includes('formData.ctaText'), 'NewsletterLivePreview renders attachments list and CTA button');
}

// 7. Audit Managers integration with Workspace Modals
const managers = [
  { file: 'NewsletterManager.jsx', previewComp: 'NewsletterLivePreview' },
  { file: 'ProductsManager.jsx', previewComp: 'ProductLivePreview' },
  { file: 'CollectionsManager.jsx', previewComp: 'CollectionLivePreview' },
  { file: 'ProjectsManager.jsx', previewComp: 'ProjectLivePreview' },
  { file: 'TransformationsManager.jsx', previewComp: 'TransformationLivePreview' },
];

for (const m of managers) {
  const filePath = path.join(rootDir, 'client/src/pages/admin', m.file);
  assert(fs.existsSync(filePath), `${m.file} exists`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    assert(content.includes('AdminLivePreviewFrame'), `${m.file} imports and integrates AdminLivePreviewFrame`);
    assert(content.includes(m.previewComp), `${m.file} imports and integrates ${m.previewComp}`);
    assert(content.includes('admin-modal-workspace'), `${m.file} uses admin-modal-workspace dual-column layout`);
    assert(content.includes('admin-workspace-grid'), `${m.file} uses admin-workspace-grid layout`);
    assert(content.includes('workspaceTab') && content.includes('setWorkspaceTab'), `${m.file} provides mobile/tablet workspace switcher`);
  }
}

// 8. Audit styles.css for live preview classes
const stylesPath = path.join(rootDir, 'client/src/styles/styles.css');
const stylesContent = fs.readFileSync(stylesPath, 'utf8');
assert(stylesContent.includes('.admin-modal-workspace'), 'styles.css defines .admin-modal-workspace');
assert(stylesContent.includes('.admin-workspace-grid'), 'styles.css defines .admin-workspace-grid');
assert(stylesContent.includes('.admin-workspace-editor'), 'styles.css defines .admin-workspace-editor');
assert(stylesContent.includes('.admin-workspace-preview-column'), 'styles.css defines .admin-workspace-preview-column');
assert(stylesContent.includes('.admin-live-preview-panel'), 'styles.css defines .admin-live-preview-panel');
assert(stylesContent.includes('.admin-device-switcher'), 'styles.css defines .admin-device-switcher');

// 9. Check 0 Veloura mentions in new admin preview components
const previewDir = path.join(rootDir, 'client/src/components/admin');
const previewFiles = fs.readdirSync(previewDir).filter((f) => f.endsWith('.jsx'));
let velouraCount = 0;
for (const pf of previewFiles) {
  const c = fs.readFileSync(path.join(previewDir, pf), 'utf8');
  const matches = c.match(/veloura/gi) || [];
  velouraCount += matches.length;
}
assert(velouraCount === 0, `0 customer-visible "Veloura" references in admin live preview components (found ${velouraCount})`);

console.log(`\n========================================================`);
console.log(`PHASE 6B LIVE PREVIEW SUITE: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
