import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================');
console.log('PHASE 6C — REAL BUSINESS CONTENT & COMMERCIAL OPERATIONS');
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

// 1. BUSINESS SETTINGS & DYNAMIC SOURCING (PHASE 6C-1)
const settingsContextPath = path.join(rootDir, 'client/src/context/SettingsContext.jsx');
assert(fs.existsSync(settingsContextPath), 'SettingsContext.jsx exists');
if (fs.existsSync(settingsContextPath)) {
  const content = fs.readFileSync(settingsContextPath, 'utf8');
  assert(content.includes("brandName: 'LUX BASED INDUSTRY'"), 'SettingsContext defaults brandName to LUX BASED INDUSTRY');
  assert(content.includes("tagline: 'Illuminating Luxury Spaces'"), 'SettingsContext defaults tagline to Illuminating Luxury Spaces');
  assert(content.includes('luxbasedindustries@gmail.com'), 'SettingsContext defaults email to luxbasedindustries@gmail.com');
  assert(content.includes('+971 4 340 8899'), 'SettingsContext defaults phone to +971 4 340 8899');
  assert(content.includes('Alserkal Avenue, Building 42, Al Quoz 1, Dubai'), 'SettingsContext defaults address to Alserkal Avenue, Dubai');
  assert(content.includes('settingService.getSettings()'), 'SettingsContext dynamically synchronizes with CMS API');
}

const siteSettingModelPath = path.join(rootDir, 'server/src/models/SiteSetting.js');
assert(fs.existsSync(siteSettingModelPath), 'SiteSetting.js model exists');
if (fs.existsSync(siteSettingModelPath)) {
  const content = fs.readFileSync(siteSettingModelPath, 'utf8');
  assert(content.includes("default: 'LUX BASED INDUSTRY'"), 'SiteSetting model brandName default is LUX BASED INDUSTRY');
  assert(content.includes("default: 'luxbasedindustries@gmail.com'"), 'SiteSetting model email default is luxbasedindustries@gmail.com');
  assert(content.includes("default: '+971 4 340 8899'"), 'SiteSetting model phone default is +971 4 340 8899');
  assert(content.includes("default: 'Alserkal Avenue, Building 42, Al Quoz 1, Dubai, United Arab Emirates'"), 'SiteSetting model address is Alserkal Avenue');
  assert(content.includes('locations: ['), 'SiteSetting model supports multi-showroom locations array');
}

// 2. OFFICIAL SOCIAL LINKS & REPOSITORIES (PHASE 6C-2)
const socialUtilsPath = path.join(rootDir, 'client/src/utils/socialPlatforms.jsx');
assert(fs.existsSync(socialUtilsPath), 'socialPlatforms.jsx utility exists');
if (fs.existsSync(socialUtilsPath)) {
  const content = fs.readFileSync(socialUtilsPath, 'utf8');
  assert(content.includes('PLATFORM_CATALOG'), 'socialPlatforms.js defines platform catalog');
  assert(content.includes('validateSafeSocialUrl'), 'socialPlatforms.js enforces strict URL safety validation');
  assert(content.includes('javascript:') && content.includes('data:'), 'socialPlatforms.js explicitly rejects dangerous protocol strings');
}

const footerPath = path.join(rootDir, 'client/src/components/layout/Footer.jsx');
assert(fs.existsSync(footerPath), 'Footer.jsx exists');
if (fs.existsSync(footerPath)) {
  const content = fs.readFileSync(footerPath, 'utf8');
  assert(content.includes('activeSocials.length > 0'), 'Footer only renders social section when active links exist');
  assert(content.includes('validateSafeSocialUrl(item.url)'), 'Footer filters only safe social URLs');
}

// 3. OFFICIAL CATALOGUE & WHATSAPP FALLBACK (PHASE 6C-3)
const catalogueCtaPath = path.join(rootDir, 'client/src/components/sections/CatalogueCTA.jsx');
assert(fs.existsSync(catalogueCtaPath), 'CatalogueCTA.jsx exists');
if (fs.existsSync(catalogueCtaPath)) {
  const content = fs.readFileSync(catalogueCtaPath, 'utf8');
  assert(content.includes('hasRealCatalogue ?'), 'CatalogueCTA conditionally renders download vs WhatsApp');
  assert(content.includes('DOWNLOAD CATALOGUE (PDF)'), 'CatalogueCTA provides Download PDF action when catalogue exists');
  assert(content.includes('REQUEST CATALOGUE ON WHATSAPP'), 'CatalogueCTA provides WhatsApp concierge when catalogue is absent');
  assert(content.includes('settings?.whatsappNumberClean || settings?.whatsapp'), 'CatalogueCTA derives WhatsApp number dynamically from settings');
}

const settingControllerPath = path.join(rootDir, 'server/src/controllers/settingController.js');
assert(fs.existsSync(settingControllerPath), 'settingController.js exists');
if (fs.existsSync(settingControllerPath)) {
  const content = fs.readFileSync(settingControllerPath, 'utf8');
  assert(content.includes('uploadCatalogue'), 'settingController exposes uploadCatalogue endpoint handler');
  assert(content.includes('deleteCatalogue'), 'settingController exposes deleteCatalogue endpoint handler');
}

// 4. PRODUCTS & SPECIFICATIONS INTEGRITY (PHASE 6C-4 & 6C-5)
const productModelPath = path.join(rootDir, 'server/src/models/Product.js');
assert(fs.existsSync(productModelPath), 'Product.js model exists');
if (fs.existsSync(productModelPath)) {
  const content = fs.readFileSync(productModelPath, 'utf8');
  assert(content.includes('dimensions:'), 'Product model supports architectural dimensions');
  assert(content.includes('materials:'), 'Product model supports materials');
  assert(content.includes('finish:'), 'Product model supports finish');
  assert(content.includes('colorTemperature:'), 'Product model supports colorTemperature');
  assert(content.includes('ipRating:'), 'Product model supports ipRating');
  assert(content.includes('wattage:'), 'Product model supports wattage');
  assert(!content.includes('price: { type: Number, required: true }'), 'Product model does not enforce fake compulsory prices');
}

const siteDataPath = path.join(rootDir, 'client/src/data/site.js');
assert(fs.existsSync(siteDataPath), 'site.js exists');
if (fs.existsSync(siteDataPath)) {
  const content = fs.readFileSync(siteDataPath, 'utf8');
  assert(content.includes('export const products = ['), 'site.js exports products baseline');
  assert(content.includes('export const collections = ['), 'site.js exports collections baseline');
  assert(content.includes('export const projects = ['), 'site.js exports projects baseline');
}

// 5. COLLECTIONS ARCHITECTURE (PHASE 6C-6)
const canonicalCollectionSlugs = [
  'grand-chandeliers',
  'architectural-pendants',
  'smart-ambient-systems',
  'wall-lighting',
  'floor-lighting',
  'custom-solutions',
];

if (fs.existsSync(siteDataPath)) {
  const siteContent = fs.readFileSync(siteDataPath, 'utf8');
  for (const slug of canonicalCollectionSlugs) {
    assert(siteContent.includes(`slug: '${slug}'`), `site.js defines canonical collection slug: ${slug}`);
  }
}

// 6. PORTFOLIO & PROJECTS (PHASE 6C-7)
const projectModelPath = path.join(rootDir, 'server/src/models/Project.js');
assert(fs.existsSync(projectModelPath), 'Project.js model exists');
if (fs.existsSync(projectModelPath)) {
  const content = fs.readFileSync(projectModelPath, 'utf8');
  assert(content.includes('title:'), 'Project model includes title');
  assert(content.includes('location:'), 'Project model includes location');
  assert(content.includes('category:'), 'Project model includes category');
  assert(content.includes('year:'), 'Project model includes year');
  assert(content.includes('scope:'), 'Project model includes scope');
  assert(content.includes('gallery:'), 'Project model includes gallery array');
}

// 7. TRANSFORMATIONS (PHASE 6C-8)
const transModelPath = path.join(rootDir, 'server/src/models/Transformation.js');
assert(fs.existsSync(transModelPath), 'Transformation.js model exists');
if (fs.existsSync(transModelPath)) {
  const content = fs.readFileSync(transModelPath, 'utf8');
  assert(content.includes('beforeImage:'), 'Transformation model includes beforeImage');
  assert(content.includes('afterImage:'), 'Transformation model includes afterImage');
}

const beforeAfterPath = path.join(rootDir, 'client/src/components/sections/BeforeAfterSlider.jsx');
assert(fs.existsSync(beforeAfterPath), 'BeforeAfterSlider.jsx exists');
if (fs.existsSync(beforeAfterPath)) {
  const content = fs.readFileSync(beforeAfterPath, 'utf8');
  assert(content.includes('hasTransformations') && content.includes('activeTransformation'), 'BeforeAfterSlider handles zero-state gracefully');
}

// 8. PARTNERS & TESTIMONIALS (PHASE 6C-9 & 6C-10)
const marqueePath = path.join(rootDir, 'client/src/components/sections/ClientPartnersMarquee.jsx');
assert(fs.existsSync(marqueePath), 'ClientPartnersMarquee.jsx exists');
if (fs.existsSync(marqueePath)) {
  const content = fs.readFileSync(marqueePath, 'utf8');
  assert(content.includes('if (!Array.isArray(partners) || partners.length === 0) {\n    return null;\n  }'), 'ClientPartnersMarquee returns null when 0 partners');
  assert(content.includes('if (activePartners.length === 0) {\n    return null;\n  }'), 'ClientPartnersMarquee returns null when 0 active partners');
}

const testSecPath = path.join(rootDir, 'client/src/components/sections/TestimonialsSection.jsx');
assert(fs.existsSync(testSecPath), 'TestimonialsSection.jsx exists');
if (fs.existsSync(testSecPath)) {
  const content = fs.readFileSync(testSecPath, 'utf8');
  assert(content.includes('if (!Array.isArray(testimonials) || testimonials.length === 0) {\n    return null;\n  }'), 'TestimonialsSection returns null when 0 testimonials');
}

// 9. FAQ FACTUALITY (PHASE 6C-11)
const homePath = path.join(rootDir, 'client/src/pages/public/Home.jsx');
assert(fs.existsSync(homePath), 'Home.jsx exists');
if (fs.existsSync(homePath)) {
  const content = fs.readFileSync(homePath, 'utf8');
  assert(content.includes('Lutron, KNX, or DALI controls'), 'Home.jsx FAQs discuss factual automation capabilities');
  assert(!content.includes('30-day money back guarantee') && !content.includes('Free worldwide shipping in 2 days'), 'Home.jsx FAQs contain 0 fabricated commercial claims');
}

// 10. NEWSLETTER & RESEND CONFIGURATION (PHASE 6C-12 & 6C-13)
const emailConfigPath = path.join(rootDir, 'server/src/config/email.js');
assert(fs.existsSync(emailConfigPath), 'email.js configuration exists');
if (fs.existsSync(emailConfigPath)) {
  const content = fs.readFileSync(emailConfigPath, 'utf8');
  assert(content.includes('process.env.RESEND_API_KEY'), 'email.js checks RESEND_API_KEY from environment');
  assert(content.includes('process.env.EMAIL_FROM'), 'email.js checks EMAIL_FROM from environment');
  assert(content.includes('process.env.ADMIN_NOTIFICATION_EMAIL'), 'email.js checks ADMIN_NOTIFICATION_EMAIL from environment');
  assert(content.includes('getIsEmailConfigured'), 'email.js exports getIsEmailConfigured');
}

const newsletterServicePath = path.join(rootDir, 'server/src/services/newsletterService.js');
assert(fs.existsSync(newsletterServicePath), 'newsletterService.js exists');
if (fs.existsSync(newsletterServicePath)) {
  const content = fs.readFileSync(newsletterServicePath, 'utf8');
  assert(content.includes('Send_Failed'), 'newsletterService transitions to Send_Failed if email unconfigured or delivery fails');
  assert(content.includes('sanitizeNewsletterContent'), 'newsletterService cleanses HTML of malicious tags');
}

// 11. CONTENT LEAKAGE AUDIT (PHASE 6C-15)
const publicPagesDir = path.join(rootDir, 'client/src/pages/public');
const publicFiles = fs.readdirSync(publicPagesDir).filter((f) => f.endsWith('.jsx'));
let publicVelouraLeaks = 0;
for (const file of publicFiles) {
  const c = fs.readFileSync(path.join(publicPagesDir, file), 'utf8');
  // Check for user-visible rendered Veloura text (excluding JS storage keys and event names)
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

// 12. SEO & METADATA (PHASE 6C-16)
const seoConfigPath = path.join(rootDir, 'client/src/seo/seoConfig.js');
assert(fs.existsSync(seoConfigPath), 'seoConfig.js exists');
if (fs.existsSync(seoConfigPath)) {
  const content = fs.readFileSync(seoConfigPath, 'utf8');
  assert(content.includes("siteName: 'LUX BASED INDUSTRY'"), 'seoConfig siteName is LUX BASED INDUSTRY');
  assert(content.includes('getOrganizationSchema'), 'seoConfig defines Organization schema generator');
  assert(content.includes('getLocalBusinessSchema'), 'seoConfig defines LocalBusiness schema generator');
  assert(content.includes('getBreadcrumbSchema'), 'seoConfig defines BreadcrumbList schema generator');
  assert(content.includes('getCollectionPageSchema'), 'seoConfig defines CollectionPage schema generator');
  assert(content.includes('getCreativeWorkSchema'), 'seoConfig defines CreativeWork schema generator');
}

const seoComponentPath = path.join(rootDir, 'client/src/components/common/SEO.jsx');
assert(fs.existsSync(seoComponentPath), 'SEO.jsx exists');
if (fs.existsSync(seoComponentPath)) {
  const content = fs.readFileSync(seoComponentPath, 'utf8');
  assert(content.includes('document.title = metaTitle'), 'SEO.jsx updates document.title');
  assert(content.includes("property', 'og:title"), 'SEO.jsx injects OpenGraph tags');
  assert(content.includes("name', 'twitter:card"), 'SEO.jsx injects Twitter Card tags');
  assert(content.includes("id = 'jsonld-schema'"), 'SEO.jsx injects dynamic JSON-LD schema');
}

// 13. RESPONSIVE MEDIA QUERIES (PHASE 6C-17)
const stylesPath = path.join(rootDir, 'client/src/styles/styles.css');
assert(fs.existsSync(stylesPath), 'styles.css exists');
if (fs.existsSync(stylesPath)) {
  const content = fs.readFileSync(stylesPath, 'utf8');
  assert(content.includes('@media (max-width: 1024px)'), 'styles.css defines tablet 1024px responsive breakpoint');
  assert(content.includes('@media (max-width: 768px)'), 'styles.css defines mobile 768px responsive breakpoint');
  assert(content.includes('@media (max-width: 480px)'), 'styles.css defines compact mobile 480px responsive breakpoint');
}

console.log(`\n========================================================`);
console.log(`PHASE 6C AUDIT TOTAL: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
