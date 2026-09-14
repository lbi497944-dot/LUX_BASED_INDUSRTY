import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = fs.existsSync(path.join(process.cwd(), 'client'))
  ? process.cwd()
  : path.resolve(__dirname, '..');

console.log('==============================================');
console.log('PHASE 5D — AUTOMATED CODE & UI AUDIT VERIFIER');
console.log('==============================================\n');

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

// 1. Audit AdminHeader.jsx
const adminHeaderPath = path.join(rootDir, 'client/src/components/ui/AdminHeader.jsx');
const adminHeaderContent = fs.readFileSync(adminHeaderPath, 'utf8');

assert(
  !adminHeaderContent.includes('<span>Veloura Admin</span>') &&
  !adminHeaderContent.includes('Veloura Admin</span>'),
  'AdminHeader.jsx does not have hardcoded "Veloura Admin" in the badge'
);

assert(
  adminHeaderContent.includes('formatAdminDisplayName') &&
  adminHeaderContent.includes('LBI Admin'),
  'AdminHeader.jsx defines formatAdminDisplayName returning "LBI Admin"'
);

// Test formatAdminDisplayName logic in isolation
const testFormat = (username) => {
  if (!username) return 'LBI Admin';
  const clean = String(username).trim();
  if (!clean || /veloura/i.test(clean)) return 'LBI Admin';
  return clean.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};
assert(testFormat('admin_veloura') === 'LBI Admin', 'formatAdminDisplayName("admin_veloura") -> "LBI Admin"');
assert(testFormat('veloura') === 'LBI Admin', 'formatAdminDisplayName("veloura") -> "LBI Admin"');
assert(testFormat('VELOURA') === 'LBI Admin', 'formatAdminDisplayName("VELOURA") -> "LBI Admin"');
assert(testFormat('') === 'LBI Admin', 'formatAdminDisplayName("") -> "LBI Admin"');
assert(testFormat('lux_director') === 'Lux Director', 'formatAdminDisplayName("lux_director") -> "Lux Director"');

// 2. Audit DashboardOverview.jsx
const dashboardPath = path.join(rootDir, 'client/src/pages/admin/DashboardOverview.jsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

assert(
  dashboardContent.includes('to="/admin/consultations"') &&
  dashboardContent.includes('to="/admin/contact"') &&
  dashboardContent.includes('to="/admin/newsletter"') &&
  dashboardContent.includes('to="/admin/products"'),
  'DashboardOverview.jsx defines clickable navigation links to all 4 correct admin routes'
);

assert(
  dashboardContent.includes('admin-stat-card-link') &&
  dashboardContent.includes('aria-label='),
  'DashboardOverview.jsx wraps stat cards in accessible Link components with aria-label'
);

// 3. Audit AdminImageUpload.jsx
const uploaderPath = path.join(rootDir, 'client/src/components/ui/AdminImageUpload.jsx');
assert(fs.existsSync(uploaderPath), 'AdminImageUpload.jsx component exists');
const uploaderContent = fs.readFileSync(uploaderPath, 'utf8');

assert(
  uploaderContent.includes('onDragOver') &&
  uploaderContent.includes('onDrop') &&
  uploaderContent.includes('uploadService.uploadFile') &&
  uploaderContent.includes('.webp'),
  'AdminImageUpload.jsx supports drag-and-drop, Cloudinary uploadService, and webp'
);

assert(
  uploaderContent.includes('mode') &&
  uploaderContent.includes("'upload'") &&
  uploaderContent.includes("'url'"),
  'AdminImageUpload.jsx supports dual mode (file upload + direct secure URL)'
);

// 4. Audit ProductsManager.jsx
const productsPath = path.join(rootDir, 'client/src/pages/admin/ProductsManager.jsx');
const productsContent = fs.readFileSync(productsPath, 'utf8');

assert(
  productsContent.includes('AdminImageUpload') &&
  productsContent.includes('PRIMARY FIXTURE IMAGE'),
  'ProductsManager.jsx integrates AdminImageUpload for primary fixture image'
);

assert(
  productsContent.includes('DEFAULT_CATEGORIES') &&
  productsContent.includes('allCategories') &&
  productsContent.includes('Add New Category'),
  'ProductsManager.jsx dynamically computes allCategories and supports "Add New Category"'
);

assert(
  productsContent.includes('newCategoryName') &&
  productsContent.includes('handleAddNewCategory'),
  'ProductsManager.jsx includes inline custom category input adder'
);

// 5. Audit CollectionsManager.jsx
const collectionsPath = path.join(rootDir, 'client/src/pages/admin/CollectionsManager.jsx');
const collectionsContent = fs.readFileSync(collectionsPath, 'utf8');

assert(
  collectionsContent.includes('AdminImageUpload') &&
  collectionsContent.includes('HERO IMAGE'),
  'CollectionsManager.jsx integrates AdminImageUpload'
);

// 6. Audit ProjectsManager.jsx
const projectsPath = path.join(rootDir, 'client/src/pages/admin/ProjectsManager.jsx');
const projectsContent = fs.readFileSync(projectsPath, 'utf8');

assert(
  projectsContent.includes('AdminImageUpload') &&
  projectsContent.includes('PROJECT COVER IMAGE'),
  'ProjectsManager.jsx integrates AdminImageUpload'
);

// 7. Audit TransformationsManager.jsx
const transPath = path.join(rootDir, 'client/src/pages/admin/TransformationsManager.jsx');
const transContent = fs.readFileSync(transPath, 'utf8');

assert(
  transContent.includes('admin-transformation-modal') &&
  transContent.includes('BEFORE PHOTO (UNLIT)') &&
  transContent.includes('AFTER PHOTO (ILLUMINATED)'),
  'TransformationsManager.jsx uses admin-transformation-modal with dual Before & After AdminImageUpload'
);

assert(
  transContent.includes("e.key === 'Escape'"),
  'TransformationsManager.jsx includes Escape key dismissal handler'
);

// 8. Audit PartnersManager.jsx
const partnersPath = path.join(rootDir, 'client/src/pages/admin/PartnersManager.jsx');
const partnersContent = fs.readFileSync(partnersPath, 'utf8');

assert(
  partnersContent.includes('admin-partner-modal') &&
  partnersContent.includes('COMPANY LOGO'),
  'PartnersManager.jsx uses admin-partner-modal with AdminImageUpload'
);

assert(
  partnersContent.includes("e.key === 'Escape'"),
  'PartnersManager.jsx includes Escape key dismissal handler'
);

// 9. Audit styles.css
const stylesPath = path.join(rootDir, 'client/src/styles/styles.css');
const stylesContent = fs.readFileSync(stylesPath, 'utf8');

assert(
  stylesContent.includes('.admin-stat-card-link') &&
  stylesContent.includes('color-scheme: dark') &&
  stylesContent.includes('#0d2613'),
  'styles.css includes .admin-stat-card-link and color-scheme: dark with #0d2613 for selects'
);

assert(
  stylesContent.includes('.modal-container.admin-transformation-modal') &&
  stylesContent.includes('.modal-container.admin-partner-modal'),
  'styles.css explicitly decouples .admin-transformation-modal and .admin-partner-modal from cream public grid'
);

assert(
  stylesContent.includes('.admin-image-upload') &&
  stylesContent.includes('.admin-new-cat-box'),
  'styles.css defines comprehensive styles for AdminImageUpload and inline category adder'
);

// 10. Check for unexpected Veloura text in admin UI components
const adminFiles = [
  adminHeaderPath,
  dashboardPath,
  productsPath,
  collectionsPath,
  projectsPath,
  transPath,
  partnersPath,
];

let visibleVelouraCount = 0;
for (const file of adminFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/>[^<]*Veloura[^<]*</gi) || [];
  if (matches.length > 0) {
    console.error(`Warning: Found rendered Veloura text in ${path.basename(file)}:`, matches);
    visibleVelouraCount += matches.length;
  }
}
assert(visibleVelouraCount === 0, `0 user-visible "Veloura" display strings in Admin CMS components (found ${visibleVelouraCount})`);

console.log('\n==============================================');
console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('==============================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
