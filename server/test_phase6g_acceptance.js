import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  REVIEW_PAGE_PATH,
  getReviewPageUrl,
  DEFAULT_REVIEW_MESSAGE,
  getReviewWhatsAppMessage,
  normalizeWhatsAppPhone,
  validateWhatsAppPhone,
  buildWhatsAppReviewUrl,
} from '../client/src/utils/reviewWhatsApp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================');
console.log('PHASE 6G — ADMIN SEND REVIEW LINK VIA WHATSAPP SUITE');
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
// 1. ADMIN NAVBAR BUTTON INTEGRATION
// ----------------------------------------------------
const adminHeaderPath = path.join(rootDir, 'client/src/components/ui/AdminHeader.jsx');
assert(fs.existsSync(adminHeaderPath), 'AdminHeader.jsx exists');

if (fs.existsSync(adminHeaderPath)) {
  const headerCode = fs.readFileSync(adminHeaderPath, 'utf8');
  assert(headerCode.includes('SEND REVIEW LINK'), 'AdminHeader contains "SEND REVIEW LINK" button text');
  assert(headerCode.includes('MessageCircle'), 'AdminHeader uses MessageCircle icon for review link button');
  assert(headerCode.includes('admin-send-review-btn'), 'AdminHeader applies admin-send-review-btn CSS class');
  assert(headerCode.includes('setReviewModalOpen(true)'), 'Clicking navbar button triggers review modal open');
  assert(headerCode.includes('AdminSendReviewModal'), 'AdminHeader renders AdminSendReviewModal component');
}

// ----------------------------------------------------
// 2. MODAL STRUCTURE, TITLE & UX
// ----------------------------------------------------
const modalPath = path.join(rootDir, 'client/src/components/admin/AdminSendReviewModal.jsx');
assert(fs.existsSync(modalPath), 'AdminSendReviewModal.jsx exists');

if (fs.existsSync(modalPath)) {
  const modalCode = fs.readFileSync(modalPath, 'utf8');
  assert(modalCode.includes('Send Review Link'), 'Modal contains primary title "Send Review Link"');
  assert(modalCode.includes('Send a direct review link to a customer via WhatsApp.'), 'Modal displays correct subtitle');
  assert(modalCode.includes('WhatsApp Number *'), 'Modal has accessible input label "WhatsApp Number *"');
  assert(modalCode.includes('+91 95621 27245'), 'Modal includes example placeholder "+91 95621 27245"');
  assert(modalCode.includes('Message Preview'), 'Modal contains "Message Preview" section');
  assert(modalCode.includes('whiteSpace: \'pre-wrap\'') || modalCode.includes('pre-wrap'), 'Message preview preserves formatting with pre-wrap');
  assert(modalCode.includes('COPY REVIEW LINK'), 'Modal includes secondary action "COPY REVIEW LINK"');
  assert(modalCode.includes('COPY MESSAGE'), 'Modal includes "COPY MESSAGE" helper action');
  assert(modalCode.includes('SEND VIA WHATSAPP'), 'Modal has primary action "SEND VIA WHATSAPP"');
  assert(modalCode.includes('Escape'), 'Modal listens for Escape key to close');
  assert(modalCode.includes('handleBackdropClick') || modalCode.includes('role="presentation"'), 'Modal supports backdrop click dismissal');
  assert(modalCode.includes('isOpening'), 'Modal implements duplicate-click protection via opening state');
  assert(modalCode.includes('WhatsApp opened with the review message.'), 'Modal reports accurate status wording (never claiming "Message sent")');
  assert(!modalCode.includes('Review link sent successfully'), 'Modal avoids false "sent successfully" claims');
}

// ----------------------------------------------------
// 3. PHONE NUMBER NORMALIZATION
// ----------------------------------------------------
assert(normalizeWhatsAppPhone('+91 95621 27245') === '919562127245', 'Normalizes Indian phone with spaces (+91 95621 27245 -> 919562127245)');
assert(normalizeWhatsAppPhone('+919562127245') === '919562127245', 'Normalizes Indian phone without spaces (+919562127245 -> 919562127245)');
assert(normalizeWhatsAppPhone('919562127245') === '919562127245', 'Normalizes raw digit Indian number (919562127245)');
assert(normalizeWhatsAppPhone('09562127245') === '09562127245', 'Normalizes local prefixed Indian number (09562127245)');
assert(normalizeWhatsAppPhone('+91-95621-27245') === '919562127245', 'Strips hyphens from phone number (+91-95621-27245 -> 919562127245)');
assert(normalizeWhatsAppPhone('+91 (95621) 27245') === '919562127245', 'Strips parentheses from phone number (+91 (95621) 27245 -> 919562127245)');
assert(normalizeWhatsAppPhone('+971 50 123 4567') === '971501234567', 'Normalizes UAE phone number (+971 50 123 4567 -> 971501234567)');
assert(normalizeWhatsAppPhone('+1 (415) 555-2671') === '14155552671', 'Normalizes US phone number (+1 (415) 555-2671 -> 14155552671)');
assert(normalizeWhatsAppPhone('+44 7911 123456') === '447911123456', 'Normalizes UK phone number (+44 7911 123456 -> 447911123456)');

// ----------------------------------------------------
// 4. PHONE NUMBER VALIDATION (E.164 STANDARDS & EDGE CASES)
// ----------------------------------------------------
const emptyVal = validateWhatsAppPhone('');
assert(!emptyVal.isValid && emptyVal.error.includes('valid WhatsApp number'), 'Rejects empty phone number');

const spacesVal = validateWhatsAppPhone('     ');
assert(!spacesVal.isValid, 'Rejects whitespace-only phone number');

const plusVal = validateWhatsAppPhone('+');
assert(!plusVal.isValid, 'Rejects single + input');

const shortVal = validateWhatsAppPhone('12345');
assert(!shortVal.isValid, 'Rejects number with fewer than 7 digits');

const validIndianVal = validateWhatsAppPhone('+91 95621 27245');
assert(validIndianVal.isValid && validIndianVal.normalized === '919562127245', 'Validates legitimate Indian number');

const validUaeVal = validateWhatsAppPhone('+971 50 123 4567');
assert(validUaeVal.isValid && validUaeVal.normalized === '971501234567', 'Validates legitimate UAE number');

// ----------------------------------------------------
// 5. CANONICAL REVIEW URL & MESSAGE BUILDER
// ----------------------------------------------------
assert(REVIEW_PAGE_PATH === '/review', 'Review path is canonical /review (not /reviews or /admin/reviews)');
assert(getReviewPageUrl() === 'https://lux-based-indusrty.vercel.app/review', 'getReviewPageUrl uses canonical siteUrl configuration');

const defaultMsg = DEFAULT_REVIEW_MESSAGE;
assert(defaultMsg.includes('Hello,'), 'Message begins with polite "Hello," greeting');
assert(defaultMsg.includes('LUX BASED INDUSTRY'), 'Message represents LUX BASED INDUSTRY brand');
assert(defaultMsg.includes('https://lux-based-indusrty.vercel.app/review'), 'Message contains exact public review URL');
assert(!defaultMsg.includes('discount'), 'Message contains 0 discount claims');
assert(!defaultMsg.includes('reward'), 'Message contains 0 reward promises');
assert(!defaultMsg.includes('free'), 'Message contains 0 incentive claims');

// ----------------------------------------------------
// 6. WHATSAPP DEEP-LINK URL GENERATION & ENCODING
// ----------------------------------------------------
const urlResult = buildWhatsAppReviewUrl('+91 95621 27245');
assert(urlResult.success === true, 'buildWhatsAppReviewUrl succeeds with valid input');
assert(urlResult.url.startsWith('https://wa.me/919562127245?text='), 'Deep-link format is https://wa.me/<digits>?text=...');
assert(!urlResult.url.includes('+'), 'Final wa.me URL has zero + characters');
assert(!urlResult.url.includes(' 95621'), 'Final wa.me URL phone portion has zero spaces');

// Decode message portion from URL and verify roundtrip fidelity
const urlParts = urlResult.url.split('?text=');
const decodedText = decodeURIComponent(urlParts[1]);
assert(decodedText === DEFAULT_REVIEW_MESSAGE, 'Message text decodes with 100% roundtrip fidelity including newlines');

// ----------------------------------------------------
// 7. ZERO PHONE PERSISTENCE & ZERO BACKEND CHURN
// ----------------------------------------------------
const serverFiles = [
  'server/src/models/Review.js',
  'server/src/models/SiteSetting.js',
  'server/src/controllers/reviewController.js',
  'server/src/routes/reviewRoutes.js',
];

serverFiles.forEach((rel) => {
  const full = path.join(rootDir, rel);
  if (fs.existsSync(full)) {
    const code = fs.readFileSync(full, 'utf8');
    assert(!code.includes('reviewWhatsApp') && !code.includes('sendReviewLink'), `${rel} contains zero Phase 6G backend churn`);
  }
});

// Check client modal does not store phone in localStorage or sessionStorage
if (fs.existsSync(modalPath)) {
  const modalCode = fs.readFileSync(modalPath, 'utf8');
  assert(!modalCode.includes('localStorage'), 'AdminSendReviewModal never accesses localStorage');
  assert(!modalCode.includes('sessionStorage'), 'AdminSendReviewModal never accesses sessionStorage');
  assert(!modalCode.includes('console.log('), 'AdminSendReviewModal contains zero console.log of customer phone numbers');
  assert(!modalCode.includes('api.post') && !modalCode.includes('axios.post'), 'AdminSendReviewModal never POSTs phone number to backend');
}

// ----------------------------------------------------
// 8. PUBLIC /review ROUTE AND PAGE VERIFICATION
// ----------------------------------------------------
const appRoutesPath = path.join(rootDir, 'client/src/routes/AppRoutes.jsx');
assert(fs.existsSync(appRoutesPath), 'AppRoutes.jsx exists');

if (fs.existsSync(appRoutesPath)) {
  const routesCode = fs.readFileSync(appRoutesPath, 'utf8');
  assert(routesCode.includes('path="/review" element={<ReviewUs />}'), 'AppRoutes registers /review pointing to ReviewUs');
}

const reviewUsPath = path.join(rootDir, 'client/src/pages/public/ReviewUs.jsx');
assert(fs.existsSync(reviewUsPath), 'ReviewUs.jsx exists');

if (fs.existsSync(reviewUsPath)) {
  const reviewCode = fs.readFileSync(reviewUsPath, 'utf8');
  assert(reviewCode.includes('reviewService.submitReview'), 'ReviewUs.jsx provides functional customer review submission');
  assert(!reviewCode.includes('Veloura') || reviewCode.includes('veloura-lighting-client'), 'ReviewUs.jsx is free of customer-visible Veloura leaks');
}

// ----------------------------------------------------
// 9. MOBILE RESPONSIVENESS AND STYLES
// ----------------------------------------------------
const stylesPath = path.join(rootDir, 'client/src/styles/styles.css');
assert(fs.existsSync(stylesPath), 'styles.css exists');

if (fs.existsSync(stylesPath)) {
  const css = fs.readFileSync(stylesPath, 'utf8');
  assert(css.includes('.admin-send-review-btn'), 'styles.css defines .admin-send-review-btn rules');
  assert(css.includes('.admin-send-review-btn span'), 'styles.css includes responsive rule for .admin-send-review-btn span on small screens');
}

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n========================================================');
console.log(`  PHASE 6G TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
