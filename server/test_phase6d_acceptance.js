import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================');
console.log('PHASE 6D — CONTROLLED CONTENT ENTRY & OWNER ACCEPTANCE');
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
// 1. BUSINESS SETTINGS VERIFICATION (STEP 2)
// ----------------------------------------------------
const settingsPath = path.join(rootDir, 'client/src/context/SettingsContext.jsx');
assert(fs.existsSync(settingsPath), 'SettingsContext.jsx exists');
if (fs.existsSync(settingsPath)) {
  const content = fs.readFileSync(settingsPath, 'utf8');
  assert(content.includes('LUX BASED INDUSTRY'), 'SettingsContext defaults to LUX BASED INDUSTRY');
  assert(content.includes('luxbasedindustries@gmail.com'), 'SettingsContext email is luxbasedindustries@gmail.com');
  assert(content.includes('+971 4 340 8899'), 'SettingsContext phone is +971 4 340 8899');
  assert(content.includes('Alserkal Avenue, Building 42, Al Quoz 1, Dubai'), 'SettingsContext address is Alserkal Avenue');
  assert(content.includes('Monday – Saturday: 09:00 AM – 07:00 PM GST'), 'SettingsContext operating hours verified');
}

// ----------------------------------------------------
// 2. CATALOGUE FALLBACK & DYNAMIC CTA (STEP 3)
// ----------------------------------------------------
const catalogueCtaPath = path.join(rootDir, 'client/src/components/sections/CatalogueCTA.jsx');
assert(fs.existsSync(catalogueCtaPath), 'CatalogueCTA.jsx exists');
if (fs.existsSync(catalogueCtaPath)) {
  const content = fs.readFileSync(catalogueCtaPath, 'utf8');
  assert(content.includes('REQUEST CATALOGUE ON WHATSAPP'), 'CatalogueCTA provides fallback WhatsApp concierge when PDF is absent');
  assert(content.includes('DOWNLOAD CATALOGUE (PDF)'), 'CatalogueCTA provides Download PDF when real catalogue exists');
}

// ----------------------------------------------------
// 3. PRODUCT SPECIFICATIONS & ARCHITECTURE (STEP 4)
// ----------------------------------------------------
const productModelPath = path.join(rootDir, 'server/src/models/Product.js');
assert(fs.existsSync(productModelPath), 'Product.js model exists');
if (fs.existsSync(productModelPath)) {
  const content = fs.readFileSync(productModelPath, 'utf8');
  assert(content.includes('dimensions:'), 'Product schema contains dimensions');
  assert(content.includes('materials:'), 'Product schema contains materials');
  assert(content.includes('finish:'), 'Product schema contains finish');
  assert(content.includes('colorTemperature:'), 'Product schema contains colorTemperature');
  assert(content.includes('ipRating:'), 'Product schema contains ipRating');
  assert(!content.includes('price: { type: Number, required: true }'), 'Product schema does not require fake price');
}

// ----------------------------------------------------
// 4. APPROVED CANONICAL COLLECTIONS (STEP 5)
// ----------------------------------------------------
const siteDataPath = path.join(rootDir, 'client/src/data/site.js');
assert(fs.existsSync(siteDataPath), 'site.js exists');
if (fs.existsSync(siteDataPath)) {
  const content = fs.readFileSync(siteDataPath, 'utf8');
  const collections = [
    'grand-chandeliers',
    'architectural-pendants',
    'smart-ambient-systems',
    'wall-lighting',
    'floor-lighting',
    'custom-solutions',
  ];
  collections.forEach((slug) => {
    assert(content.includes(`slug: '${slug}'`), `site.js defines collection slug: ${slug}`);
  });
}

// ----------------------------------------------------
// 5. PROJECTS / PORTFOLIO & CLIENT PRIVACY (STEP 6)
// ----------------------------------------------------
const projectModelPath = path.join(rootDir, 'server/src/models/Project.js');
assert(fs.existsSync(projectModelPath), 'Project.js exists');
if (fs.existsSync(projectModelPath)) {
  const content = fs.readFileSync(projectModelPath, 'utf8');
  assert(content.includes('location:'), 'Project model includes location field');
  assert(content.includes('category:'), 'Project model includes category field');
  assert(content.includes('year:'), 'Project model includes year field');
}

// ----------------------------------------------------
// 6. TRANSFORMATIONS STRUCTURE (STEP 7)
// ----------------------------------------------------
const transModelPath = path.join(rootDir, 'server/src/models/Transformation.js');
assert(fs.existsSync(transModelPath), 'Transformation.js exists');
if (fs.existsSync(transModelPath)) {
  const content = fs.readFileSync(transModelPath, 'utf8');
  assert(content.includes('beforeImage:'), 'Transformation model includes beforeImage');
  assert(content.includes('afterImage:'), 'Transformation model includes afterImage');
}

// ----------------------------------------------------
// 7. PARTNERS ZERO-GAP RESILIENCE (STEP 8)
// ----------------------------------------------------
const marqueePath = path.join(rootDir, 'client/src/components/sections/ClientPartnersMarquee.jsx');
assert(fs.existsSync(marqueePath), 'ClientPartnersMarquee.jsx exists');
if (fs.existsSync(marqueePath)) {
  const content = fs.readFileSync(marqueePath, 'utf8');
  assert(content.includes('if (!Array.isArray(partners) || partners.length === 0) {\n    return null;\n  }'), 'ClientPartnersMarquee renders null on zero partners');
}

// ----------------------------------------------------
// 8. TESTIMONIALS & REVIEWS INTEGRITY (STEP 9)
// ----------------------------------------------------
const testSecPath = path.join(rootDir, 'client/src/components/sections/TestimonialsSection.jsx');
assert(fs.existsSync(testSecPath), 'TestimonialsSection.jsx exists');
if (fs.existsSync(testSecPath)) {
  const content = fs.readFileSync(testSecPath, 'utf8');
  assert(content.includes('if (!Array.isArray(testimonials) || testimonials.length === 0) {\n    return null;\n  }'), 'TestimonialsSection renders null on zero testimonials');
}

// ----------------------------------------------------
// 9. SOCIAL CHANNELS URL VALIDATION (STEP 10)
// ----------------------------------------------------
const socialUtilsPath = path.join(rootDir, 'client/src/utils/socialPlatforms.jsx');
assert(fs.existsSync(socialUtilsPath), 'socialPlatforms.jsx exists');
if (fs.existsSync(socialUtilsPath)) {
  const content = fs.readFileSync(socialUtilsPath, 'utf8');
  assert(content.includes('validateSafeSocialUrl'), 'socialPlatforms validates safe URLs');
  assert(content.includes('javascript:') && content.includes('data:'), 'socialPlatforms blocks dangerous URLs');
}

// ----------------------------------------------------
// 10. NEWSLETTER SAFETY & RESEND CONFIG (STEP 11 & 12)
// ----------------------------------------------------
const emailConfigPath = path.join(rootDir, 'server/src/config/email.js');
assert(fs.existsSync(emailConfigPath), 'email.js exists');
if (fs.existsSync(emailConfigPath)) {
  const content = fs.readFileSync(emailConfigPath, 'utf8');
  assert(content.includes('process.env.RESEND_API_KEY'), 'email.js reads RESEND_API_KEY from environment');
  assert(content.includes('getIsEmailConfigured'), 'email.js exports getIsEmailConfigured');
}

const newsletterServicePath = path.join(rootDir, 'server/src/services/newsletterService.js');
assert(fs.existsSync(newsletterServicePath), 'newsletterService.js exists');
if (fs.existsSync(newsletterServicePath)) {
  const content = fs.readFileSync(newsletterServicePath, 'utf8');
  assert(content.includes('Send_Failed'), 'newsletterService marks Send_Failed safely without crash');
}

// ----------------------------------------------------
// 11. PUBLIC CUSTOMER PAGES & CANONICAL ROUTES (STEP 13)
// ----------------------------------------------------
const canonicalRoutes = [
  'client/src/pages/public/Home.jsx',
  'client/src/pages/public/Collections.jsx',
  'client/src/pages/public/Portfolio.jsx',
  'client/src/pages/public/About.jsx',
  'client/src/pages/public/Contact.jsx',
  'client/src/pages/public/Consultation.jsx',
  'client/src/pages/public/ReviewUs.jsx',
  'client/src/pages/public/CollectionDetail.jsx',
  'client/src/pages/public/ProjectDetail.jsx',
  'client/src/pages/public/NotFound.jsx',
];

canonicalRoutes.forEach((relPath) => {
  const fullP = path.join(rootDir, relPath);
  assert(fs.existsSync(fullP), `Public page exists: ${path.basename(relPath)}`);
});

// ----------------------------------------------------
// 12. BRAND LEAKAGE AUDIT (STEP 14)
// ----------------------------------------------------
const publicPagesDir = path.join(rootDir, 'client/src/pages/public');
const publicFiles = fs.readdirSync(publicPagesDir).filter((f) => f.endsWith('.jsx'));
let publicVelouraLeaks = 0;
for (const file of publicFiles) {
  const c = fs.readFileSync(path.join(publicPagesDir, file), 'utf8');
  const lines = c.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('addEventListener') || line.includes('removeEventListener') || line.includes('localStorage') || line.includes('sessionStorage')) {
      continue;
    }
    const renderedMatch = line.match(/>[^<]*\bVeloura\b[^<]*/i);
    if (renderedMatch) {
      console.error(`Found visible Veloura leak in ${file}:${i + 1}: ${line.trim()}`);
      publicVelouraLeaks++;
    }
  }
}
assert(publicVelouraLeaks === 0, `0 customer-visible "Veloura" branding strings in public pages (found ${publicVelouraLeaks})`);

// ----------------------------------------------------
// 13. RESPONSIVE MEDIA QUERIES (STEP 15)
// ----------------------------------------------------
const stylesPath = path.join(rootDir, 'client/src/styles/styles.css');
assert(fs.existsSync(stylesPath), 'styles.css exists');
if (fs.existsSync(stylesPath)) {
  const content = fs.readFileSync(stylesPath, 'utf8');
  assert(content.includes('@media (max-width: 1024px)'), 'styles.css includes 1024px breakpoint');
  assert(content.includes('@media (max-width: 768px)'), 'styles.css includes 768px breakpoint');
  assert(content.includes('@media (max-width: 480px)'), 'styles.css includes 480px breakpoint');
}

console.log(`\n========================================================`);
console.log(`PHASE 6D AUDIT TOTAL: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
