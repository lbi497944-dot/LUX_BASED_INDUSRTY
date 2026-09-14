import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const publicDir = path.join(clientDir, 'public');
const srcDir = path.join(clientDir, 'src');

console.log('====================================================');
console.log('  PHASE 5F — SEO & CONVERSION AUDIT TEST SUITE');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${message}`);
  }
}

// 1. Audit robots.txt
console.log('1. Checking robots.txt Configuration:');
const robotsPath = path.join(publicDir, 'robots.txt');
assert(fs.existsSync(robotsPath), 'robots.txt exists in client/public');

const robotsContent = fs.readFileSync(robotsPath, 'utf8');
assert(robotsContent.includes('User-agent: *'), 'robots.txt contains User-agent: *');
assert(robotsContent.includes('Disallow: /admin'), 'robots.txt contains Disallow: /admin');
assert(robotsContent.includes('Disallow: /admin/'), 'robots.txt contains Disallow: /admin/');
assert(robotsContent.includes('Disallow: /api'), 'robots.txt contains Disallow: /api');
assert(robotsContent.includes('Disallow: /api/'), 'robots.txt contains Disallow: /api/');
assert(robotsContent.includes('Allow: /'), 'robots.txt contains Allow: /');
assert(
  robotsContent.includes('Sitemap: https://lux-based-indusrty.vercel.app/sitemap.xml'),
  'robots.txt links to canonical https://lux-based-indusrty.vercel.app/sitemap.xml'
);

// 2. Audit sitemap.xml
console.log('\n2. Checking sitemap.xml Configuration:');
const sitemapPath = path.join(publicDir, 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'sitemap.xml exists in client/public');

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
const urls = urlMatches.map((m) => m.replace(/<\/?loc>/g, ''));

assert(urls.length === 18, `sitemap.xml contains exactly 18 canonical URLs (found ${urls.length})`);

const expectedUrls = [
  'https://lux-based-indusrty.vercel.app/',
  'https://lux-based-indusrty.vercel.app/collections',
  'https://lux-based-indusrty.vercel.app/portfolio',
  'https://lux-based-indusrty.vercel.app/about',
  'https://lux-based-indusrty.vercel.app/contact',
  'https://lux-based-indusrty.vercel.app/consultation',
  'https://lux-based-indusrty.vercel.app/review',
  'https://lux-based-indusrty.vercel.app/collections/grand-chandeliers',
  'https://lux-based-indusrty.vercel.app/collections/architectural-pendants',
  'https://lux-based-indusrty.vercel.app/collections/smart-ambient-systems',
  'https://lux-based-indusrty.vercel.app/collections/wall-lighting',
  'https://lux-based-indusrty.vercel.app/collections/floor-lighting',
  'https://lux-based-indusrty.vercel.app/collections/custom-solutions',
  'https://lux-based-indusrty.vercel.app/portfolio/private-residence-dubai',
  'https://lux-based-indusrty.vercel.app/portfolio/the-grand-hotel-doha',
  'https://lux-based-indusrty.vercel.app/portfolio/luxury-villa-abu-dhabi',
  'https://lux-based-indusrty.vercel.app/portfolio/fine-dining-restaurant-dubai',
  'https://lux-based-indusrty.vercel.app/portfolio/royal-commercial-tower',
];

expectedUrls.forEach((u) => {
  assert(urls.includes(u), `sitemap.xml contains ${u}`);
});

assert(!sitemapContent.includes('/products/testing'), 'sitemap.xml does NOT contain testing products');
assert(!sitemapContent.includes('/admin'), 'sitemap.xml does NOT expose admin URLs');

// 3. Audit SEO Component & Config
console.log('\n3. Checking SEO Component & Config:');
const seoCompPath = path.join(srcDir, 'components', 'common', 'SEO.jsx');
assert(fs.existsSync(seoCompPath), 'SEO.jsx component exists');
const seoCompContent = fs.readFileSync(seoCompPath, 'utf8');
assert(seoCompContent.includes('robots'), 'SEO.jsx handles robots prop');
assert(seoCompContent.includes('@graph'), 'SEO.jsx supports JSON-LD @graph structured data');

const seoConfigPath = path.join(srcDir, 'seo', 'seoConfig.js');
assert(fs.existsSync(seoConfigPath), 'seoConfig.js exists');
const seoConfigContent = fs.readFileSync(seoConfigPath, 'utf8');
assert(seoConfigContent.includes('https://lux-based-indusrty.vercel.app'), 'siteConfig siteUrl has canonical domain');
assert(seoConfigContent.includes('luxbasedindustries@gmail.com'), 'siteConfig email is luxbasedindustries@gmail.com');
assert(seoConfigContent.includes('getOrganizationSchema'), 'seoConfig exports getOrganizationSchema');
assert(seoConfigContent.includes('getWebSiteSchema'), 'seoConfig exports getWebSiteSchema');
assert(seoConfigContent.includes('getLocalBusinessSchema'), 'seoConfig exports getLocalBusinessSchema');
assert(seoConfigContent.includes('getBreadcrumbSchema'), 'seoConfig exports getBreadcrumbSchema');
assert(seoConfigContent.includes('getCollectionPageSchema'), 'seoConfig exports getCollectionPageSchema');
assert(seoConfigContent.includes('getCreativeWorkSchema'), 'seoConfig exports getCreativeWorkSchema');

// 4. Audit Breadcrumbs Component
console.log('\n4. Checking Breadcrumbs Component:');
const breadcrumbCompPath = path.join(srcDir, 'components', 'common', 'Breadcrumbs.jsx');
assert(fs.existsSync(breadcrumbCompPath), 'Breadcrumbs.jsx exists');
const breadcrumbContent = fs.readFileSync(breadcrumbCompPath, 'utf8');
assert(breadcrumbContent.includes('aria-label="Breadcrumbs"'), 'Breadcrumbs.jsx has aria-label="Breadcrumbs"');
assert(breadcrumbContent.includes('aria-current="page"'), 'Breadcrumbs.jsx marks active crumb with aria-current="page"');

// 5. Audit Public Pages for Breadcrumbs & Schemas
console.log('\n5. Checking Public Pages for Breadcrumbs & Structured Data:');
const colDetailPath = path.join(srcDir, 'pages', 'public', 'CollectionDetail.jsx');
const colDetailContent = fs.readFileSync(colDetailPath, 'utf8');
assert(colDetailContent.includes('Breadcrumbs'), 'CollectionDetail.jsx includes Breadcrumbs');
assert(colDetailContent.includes('getBreadcrumbSchema'), 'CollectionDetail.jsx injects BreadcrumbList schema');
assert(colDetailContent.includes('getCollectionPageSchema'), 'CollectionDetail.jsx injects CollectionPage schema');

const projDetailPath = path.join(srcDir, 'pages', 'public', 'ProjectDetail.jsx');
const projDetailContent = fs.readFileSync(projDetailPath, 'utf8');
assert(projDetailContent.includes('Breadcrumbs'), 'ProjectDetail.jsx includes Breadcrumbs');
assert(projDetailContent.includes('getBreadcrumbSchema'), 'ProjectDetail.jsx injects BreadcrumbList schema');
assert(projDetailContent.includes('getCreativeWorkSchema'), 'ProjectDetail.jsx injects CreativeWork schema');

const homePath = path.join(srcDir, 'pages', 'public', 'Home.jsx');
const homeContent = fs.readFileSync(homePath, 'utf8');
assert(homeContent.includes('getOrganizationSchema'), 'Home.jsx injects Organization schema');
assert(homeContent.includes('getWebSiteSchema'), 'Home.jsx injects WebSite schema');
assert(homeContent.includes('getLocalBusinessSchema'), 'Home.jsx injects LocalBusiness schema');

const notFoundPath = path.join(srcDir, 'pages', 'public', 'NotFound.jsx');
const notFoundContent = fs.readFileSync(notFoundPath, 'utf8');
assert(notFoundContent.includes('robots="noindex, nofollow"'), 'NotFound.jsx sets robots="noindex, nofollow"');

const adminLoginPath = path.join(srcDir, 'pages', 'admin', 'AdminLogin.jsx');
const adminLoginContent = fs.readFileSync(adminLoginPath, 'utf8');
assert(adminLoginContent.includes('robots="noindex, nofollow"'), 'AdminLogin.jsx sets robots="noindex, nofollow"');

const adminLayoutPath = path.join(srcDir, 'layouts', 'AdminLayout.jsx');
const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf8');
assert(adminLayoutContent.includes('robots="noindex, nofollow"'), 'AdminLayout.jsx sets robots="noindex, nofollow"');

// 6. Zero Customer-Facing Veloura or Fake Email Leaks
console.log('\n6. Checking for Zero Customer-Facing Leaks:');
assert(!homeContent.includes('>Veloura<'), 'Home.jsx has 0 customer-visible Veloura');
assert(!colDetailContent.includes('>Veloura<'), 'CollectionDetail.jsx has 0 customer-visible Veloura');
assert(!projDetailContent.includes('>Veloura<'), 'ProjectDetail.jsx has 0 customer-visible Veloura');

console.log('\n====================================================');
console.log(`  PHASE 5F AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
