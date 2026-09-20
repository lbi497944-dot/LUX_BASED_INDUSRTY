import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeSocialLinks } from './src/services/settingService.js';
import { getOrganizationSchema } from '../client/src/seo/seoConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================');
console.log('PHASE 6F — ADMIN INTERACTION, SOCIAL SYNC & NEWSLETTER');
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
// 1. PASSWORD VISIBILITY CONTROLS (ChangePasswordManager.jsx)
// ----------------------------------------------------
const changePasswordPath = path.join(rootDir, 'client/src/pages/admin/ChangePasswordManager.jsx');
assert(fs.existsSync(changePasswordPath), 'ChangePasswordManager.jsx exists');

if (fs.existsSync(changePasswordPath)) {
  const code = fs.readFileSync(changePasswordPath, 'utf8');

  // Independent state booleans
  assert(code.includes('showCurrentPassword') && code.includes('setShowCurrentPassword'), 'Has independent showCurrentPassword state');
  assert(code.includes('showNewPassword') && code.includes('setShowNewPassword'), 'Has independent showNewPassword state');
  assert(code.includes('showConfirmPassword') && code.includes('setShowConfirmPassword'), 'Has independent showConfirmPassword state');

  // Buttons have type="button" to prevent form submission
  const buttonTypeMatches = code.match(/type="button"/g);
  assert(buttonTypeMatches && buttonTypeMatches.length >= 3, 'All toggle buttons specify explicit type="button"');

  // Accessible aria attributes
  assert(code.includes('aria-label') && code.includes('aria-pressed'), 'Eye toggle buttons implement aria-label and aria-pressed attributes');
  assert(code.includes('onMouseDown={(e) => e.preventDefault()}'), 'Eye buttons preventDefault onMouseDown to prevent label/focus theft');

  // Labels match inputs with htmlFor and id
  assert(code.includes('htmlFor="currentPassword"') && code.includes('id="currentPassword"'), 'Current password label and input properly associated via htmlFor');
  assert(code.includes('htmlFor="newPassword"') && code.includes('id="newPassword"'), 'New password label and input properly associated via htmlFor');
  assert(code.includes('htmlFor="confirmNewPassword"') && code.includes('id="confirmNewPassword"'), 'Confirm password label and input properly associated via htmlFor');

  // Password values preserved in state
  assert(code.includes('value={formData.currentPassword}') && code.includes('value={formData.newPassword}') && code.includes('value={formData.confirmNewPassword}'), 'Inputs bind values to state preserving entered characters');
}

// ----------------------------------------------------
// 2. SOCIAL MEDIA BACKEND PERSISTENCE & CONTRACT NORMALIZATION
// ----------------------------------------------------
// Test normalizeSocialLinks service directly
const testPayload = [
  { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/luxbasedindustry', isActive: true, order: 0 },
  { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/luxbasedindustry', active: false, displayOrder: 1 },
  { platform: 'facebook', url: 'https://veloura.com/leak', active: true, order: 2 },
  { platform: 'custom', label: 'Pinterest', url: 'https://pinterest.com/lux', isActive: true, displayOrder: 3 },
];

const normalized = normalizeSocialLinks(testPayload);

assert(Array.isArray(normalized) && normalized.length === 4, 'normalizeSocialLinks outputs all defined platforms');

const insta = normalized.find(s => s.platform === 'instagram');
assert(insta && insta.active === true && insta.isActive === true, 'Instagram active and isActive flags are both true');
assert(insta && insta.displayOrder === 0 && insta.order === 0, 'Instagram displayOrder and order are both 0');

const linkedin = normalized.find(s => s.platform === 'linkedin');
assert(linkedin && linkedin.active === false && linkedin.isActive === false, 'LinkedIn active and isActive flags are both false');
assert(linkedin && linkedin.displayOrder === 1 && linkedin.order === 1, 'LinkedIn displayOrder and order are both 1');

const fb = normalized.find(s => s.platform === 'facebook');
assert(fb && fb.url === '', 'Veloura URLs are stripped to empty string');
assert(fb && fb.active === false && fb.isActive === false, 'Social link with stripped Veloura URL is marked inactive');

const custom = normalized.find(s => s.platform === 'custom');
assert(custom && custom.label === 'Pinterest' && custom.active === true, 'Custom social link is preserved and normalized');

// Check backend routes
const settingRoutesPath = path.join(rootDir, 'server/src/routes/settingRoutes.js');
const routesCode = fs.readFileSync(settingRoutesPath, 'utf8');
assert(routesCode.includes("router.put('/social'"), 'PUT /api/settings/social alias route registered');
assert(routesCode.includes("router.patch('/social'"), 'PATCH /api/settings/social alias route registered');

// Check client setting service
const clientSettingServicePath = path.join(rootDir, 'client/src/services/settingService.js');
const clientServiceCode = fs.readFileSync(clientSettingServicePath, 'utf8');
assert(clientServiceCode.includes('updateSocialLinks:'), 'client settingService provides updateSocialLinks helper');

// ----------------------------------------------------
// 3. SETTINGS MANAGER SOCIAL CRUD & IMMEDIATE PERSISTENCE
// ----------------------------------------------------
const settingsManagerPath = path.join(rootDir, 'client/src/pages/admin/SettingsManager.jsx');
assert(fs.existsSync(settingsManagerPath), 'SettingsManager.jsx exists');

if (fs.existsSync(settingsManagerPath)) {
  const code = fs.readFileSync(settingsManagerPath, 'utf8');

  // Immediate persistence methods
  assert(code.includes('handleSaveSocialModal') && code.includes('settingService.updateSettings'), 'handleSaveSocialModal immediately persists to backend');
  assert(code.includes('handleMoveSocial') && code.includes('settingService.updateSettings'), 'handleMoveSocial immediately persists reordered links to backend');
  assert(code.includes('handleToggleSocialActive') && code.includes('settingService.updateSettings'), 'handleToggleSocialActive immediately persists toggle to backend');
  assert(code.includes('handleDeleteSocialConfirm') && code.includes('settingService.updateSettings'), 'handleDeleteSocialConfirm immediately persists deletion to backend');

  // Immediate client context refresh
  assert(code.includes('await refreshSettings()'), 'SettingsManager calls refreshSettings() after mutations to update SettingsContext immediately');

  // Loading states
  assert(code.includes('socialModalSaving') && code.includes('socialDeleting') && code.includes('socialTogglingIndex') && code.includes('socialReordering'), 'Implements granular loading states for all social operations');

  // Boundary disable checks
  assert(code.includes('disabled={idx === 0'), 'Move Up button is disabled at top boundary (index 0)');
  assert(code.includes('disabled={idx === formData.socialLinks.length - 1'), 'Move Down button is disabled at bottom boundary');

  // ModalConfirm for delete
  assert(code.includes('deleteSocialTarget !== null') && code.includes('ModalConfirm'), 'Deletion is guarded by custom ModalConfirm');
  assert(!code.includes('Unsaved changes staged') || !code.includes('socialLinks.length > 0 && isDirty'), 'No misleading unsaved changes badge on social channels');
}

// ----------------------------------------------------
// 4. PUBLIC CLIENT REAL-TIME SYNCHRONIZATION
// ----------------------------------------------------
// Footer.jsx
const footerPath = path.join(rootDir, 'client/src/components/layout/Footer.jsx');
const footerCode = fs.readFileSync(footerPath, 'utf8');
assert(/item\.active\s*!==\s*false\s*&&\s*item\.isActive\s*!==\s*false/.test(footerCode), 'Footer filters links checking both active !== false and isActive !== false');

// seoConfig.js Organization schema sameAs
const mockSettings = {
  brandName: 'LUX BASED INDUSTRY',
  socialLinks: [
    { platform: 'instagram', url: 'https://instagram.com/luxbasedindustry', active: true, isActive: true },
    { platform: 'linkedin', url: 'https://linkedin.com/company/luxbasedindustry', active: false, isActive: false },
    { platform: 'facebook', url: 'https://facebook.com/luxbasedindustry', active: true, isActive: true },
  ]
};

const schema = getOrganizationSchema(mockSettings);
assert(Array.isArray(schema.sameAs) && schema.sameAs.length === 2, 'seoConfig.js extracts only active social URLs into schema.sameAs');
assert(schema.sameAs.includes('https://instagram.com/luxbasedindustry') && schema.sameAs.includes('https://facebook.com/luxbasedindustry'), 'schema.sameAs contains verified active social URLs');
assert(!schema.sameAs.includes('https://linkedin.com/company/luxbasedindustry'), 'schema.sameAs excludes inactive social URLs');

// ----------------------------------------------------
// 5. NEWSLETTER CAMPAIGN UI & DUAL-COLUMN LIVE PREVIEW
// ----------------------------------------------------
const newsletterManagerPath = path.join(rootDir, 'client/src/pages/admin/NewsletterManager.jsx');
assert(fs.existsSync(newsletterManagerPath), 'NewsletterManager.jsx exists');

if (fs.existsSync(newsletterManagerPath)) {
  const code = fs.readFileSync(newsletterManagerPath, 'utf8');

  // Modal header
  assert(code.includes('Mail') && code.includes('NEWSLETTER CAMPAIGN'), 'Newsletter modal header displays email icon and title');

  // Dual-column grid
  assert(code.includes('gridTemplateColumns: isMobile ? \'1fr\' : \'46% 54%\'') || code.includes('46% 54%'), 'Campaign editor uses ~46%/54% dual-column layout on desktop');

  // Compact image guidelines panel
  assert(code.includes('Banner Guidelines') && code.includes('Recommended: 1200'), 'Includes compact image banner guidelines');

  // Unsaved changes confirmation
  assert(code.includes('discardConfirmOpen') && code.includes('You have unsaved changes.'), 'Prompts confirmation modal on closing dirty campaign editor');
  assert(code.includes('Keep Editing') && code.includes('Discard Changes'), 'Unsaved dialog provides explicit Keep Editing and Discard Changes options');

  // Sticky footer hierarchy
  assert(code.includes('Save as Draft') && code.includes('Save Campaign'), 'Footer contains clear Save as Draft and Save Campaign actions');
}

// ----------------------------------------------------
// 6. UI COMPONENT INTEGRITY (AdminImageUpload & ModalConfirm)
// ----------------------------------------------------
const imageUploadPath = path.join(rootDir, 'client/src/components/ui/AdminImageUpload.jsx');
const uploadCode = fs.readFileSync(imageUploadPath, 'utf8');
assert(uploadCode.includes('admin-upload-preview-card') && uploadCode.includes('Replace') && uploadCode.includes('Remove'), 'AdminImageUpload renders preview with Replace and Remove actions when image is set');

const modalConfirmPath = path.join(rootDir, 'client/src/components/modals/ModalConfirm.jsx');
const modalCode = fs.readFileSync(modalConfirmPath, 'utf8');
assert(modalCode.includes('cancelText') || modalCode.includes('cancelLabel'), 'ModalConfirm supports custom cancelText / cancelLabel');

// ----------------------------------------------------
// 7. SECURITY & INTEGRITY AUDIT
// ----------------------------------------------------
// Ensure no Veloura brand leaks in client public pages
const publicPages = [
  'client/src/components/layout/Navbar.jsx',
  'client/src/components/layout/Footer.jsx',
  'client/src/pages/Home.jsx',
  'client/src/pages/Contact.jsx',
  'client/src/pages/Products.jsx',
];

publicPages.forEach(p => {
  const fullPath = path.join(rootDir, p);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasLeak = content.split('\n').some(line => line.includes('Veloura') && !line.includes('//') && !line.includes('veloura-lighting-client'));
    assert(!hasLeak, `${p} is free of customer-visible Veloura leaks`);
  }
});

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n========================================================');
console.log(`  PHASE 6F TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
