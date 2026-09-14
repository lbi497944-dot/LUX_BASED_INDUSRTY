import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

import app from './src/app.js';
import Admin from './src/models/Admin.js';
import Newsletter from './src/models/Newsletter.js';
import NewsletterSubscriber from './src/models/NewsletterSubscriber.js';
import ContactEnquiry from './src/models/ContactEnquiry.js';
import Consultation from './src/models/Consultation.js';
import Review from './src/models/Review.js';
import { sanitizeNewsletterContent, renderNewsletterHtml, generateWhatsAppShare } from './src/services/newsletterService.js';
import { getNotificationSummary } from './src/services/statsService.js';

console.log('========================================================');
console.log('STARTING PHASE 5H: NEWSLETTER & NOTIFICATIONS TEST SUITE');
console.log('========================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log('  [PASS] ' + message);
  } else {
    failed++;
    console.error('  [FAIL] ' + message);
  }
}

const PORT = 5557;
const BASE_URL = 'http://127.0.0.1:' + PORT;

async function requestHttp(method, reqPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, BASE_URL);
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

export async function runSuite() {
  let server;
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/veloura_test');
    }

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));

    const testJwtSecret = process.env.JWT_SECRET || 'test_jwt_secret_for_security_suite_minimum_32_chars';
    process.env.JWT_SECRET = testJwtSecret;

    let admin = await Admin.findOne({ email: 'newsletter_audit_admin@luxbasedindustry.com' });
    if (!admin) {
      admin = await Admin.create({
        username: 'NewsletterAdmin',
        email: 'newsletter_audit_admin@luxbasedindustry.com',
        password: 'SecurePassword123!',
        role: 'admin',
      });
    }

    const adminToken = jwt.sign(
      { id: admin._id.toString(), role: 'admin', username: admin.username },
      testJwtSecret,
      { expiresIn: '1h' }
    );
    const authHeaders = { Authorization: 'Bearer ' + adminToken };

    // 1. Content Security & XSS Sanitization
    console.log('1. Content Security & XSS Sanitization');
    const maliciousPayload = '<p>Hello <script>alert("XSS")</script><iframe src="javascript:alert(1)"></iframe><a href="javascript:steal()" onclick="hack()">Click</a></p>';
    const sanitized = sanitizeNewsletterContent(maliciousPayload);
    assert(!sanitized.includes('<script>') && !sanitized.includes('alert("XSS")'), 'Strips <script> tags completely');
    assert(!sanitized.includes('<iframe'), 'Strips <iframe> tags completely');
    assert(!sanitized.includes('href="javascript:steal()"') && sanitized.includes('href="#"'), 'Neutralizes javascript: href protocols');
    assert(!sanitized.includes('onclick'), 'Strips onclick event handlers');
    assert(sanitized.includes('<p>Hello') && sanitized.includes('Click</a></p>'), 'Preserves safe paragraph content');

    // 2. Luxury Email Template Generator
    console.log('\n2. Luxury Email Template Generator');
    const mockNewsletter = {
      title: 'Architectural Lighting Preview',
      subject: 'LUX Bespoke Innovations',
      previewText: 'Exclusive luminaires for luxury spaces',
      heading: 'Bespoke Illumination 2026',
      content: '<p>Discover handcrafted architectural lighting fixtures.</p>',
      imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/preview.jpg',
      ctaText: 'Explore Collections',
      ctaUrl: 'https://lux-based-indusrty.vercel.app/collections',
      attachments: [{ url: 'https://res.cloudinary.com/test/raw/upload/v1/spec.pdf', filename: 'Spec_Sheet.pdf', size: 102400 }],
    };
    const html = renderNewsletterHtml(mockNewsletter, 'client@luxindustry.com');
    assert(html.includes('LUX BASED INDUSTRY'), 'Email contains LUX BASED INDUSTRY branding');
    assert(html.includes('ARCHITECTURAL LIGHTING STUDIO'), 'Email contains ARCHITECTURAL LIGHTING STUDIO subtitle');
    assert(html.includes('Bespoke Illumination 2026'), 'Email contains rendered heading');
    assert(html.includes('href="https://lux-based-indusrty.vercel.app/collections"'), 'Email contains CTA button with valid URL');
    assert(html.includes('Spec_Sheet.pdf'), 'Email contains attachment links');
    assert(html.includes('client@luxindustry.com'), 'Email contains recipient email in footer');

    // 3. WhatsApp Deep-Link Generator
    console.log('\n3. WhatsApp Deep-Link Generator');
    const mockDoc = await Newsletter.create({
      title: 'Winter Penthouse Collection',
      subject: 'New Pendants',
      content: 'Engineered for luxury living in Dubai.',
      ctaText: 'View Pendants',
      ctaUrl: 'https://lux-based-indusrty.vercel.app/collections/architectural-pendants',
    });

    const waRes = await generateWhatsAppShare(mockDoc._id, '+971 50-123-4567');
    assert(waRes.phone === '971501234567', 'Normalizes international phone number');
    assert(waRes.deepLink.startsWith('https://wa.me/971501234567?text='), 'Deep-link starts with https://wa.me/');
    assert(waRes.messageText.includes('*LUX BASED INDUSTRY*'), 'Message includes LUX BASED INDUSTRY header');
    assert(waRes.messageText.includes('https://lux-based-indusrty.vercel.app/collections/architectural-pendants'), 'Message includes CTA link');
    await Newsletter.findByIdAndDelete(mockDoc._id);

    // 4. Newsletter Campaign API Endpoints (Admin Protected)
    console.log('\n4. Newsletter Campaign API Endpoints');
    
    // 4a. Unauthenticated access blocked
    const unauthRes = await requestHttp('GET', '/api/newsletter/campaigns');
    assert(unauthRes.status === 401, 'GET /api/newsletter/campaigns returns 401 when unauthenticated');

    // 4b. Create newsletter draft
    const createRes = await requestHttp(
      'POST',
      '/api/newsletter/campaigns',
      {
        title: 'Grand Villa Showcase Broadcast',
        subject: 'Private Lighting Commission',
        content: '<p>Introducing exclusive handcrafted chandeliers.</p>',
        previewText: 'Luxury lighting insights',
        heading: 'Grand Villa Architectural Series',
        ctaText: 'Explore Lookbook',
        ctaUrl: 'https://lux-based-indusrty.vercel.app/portfolio',
      },
      authHeaders
    );
    assert(createRes.status === 201, 'POST /api/newsletter/campaigns creates draft with 201');
    const createdId = createRes.body?.data?._id;
    assert(createRes.body?.data?.status === 'Draft', 'Created campaign has default status Draft');

    // 4c. Update newsletter draft
    const updateRes = await requestHttp(
      'PATCH',
      '/api/newsletter/campaigns/' + createdId,
      {
        heading: 'Updated Villa Architectural Series',
      },
      authHeaders
    );
    assert(updateRes.status === 200 && updateRes.body?.data?.heading === 'Updated Villa Architectural Series', 'PATCH /api/newsletter/campaigns/:id updates draft');

    // 4d. Preview newsletter
    const previewRes = await requestHttp(
      'GET',
      '/api/newsletter/campaigns/' + createdId + '/preview',
      null,
      authHeaders
    );
    assert(previewRes.status === 200 && previewRes.body?.data?.html?.includes('LUX BASED INDUSTRY'), 'GET /api/newsletter/campaigns/:id/preview returns HTML');

    // 4e. Duplicate newsletter
    const dupRes = await requestHttp(
      'POST',
      '/api/newsletter/campaigns/' + createdId + '/duplicate',
      null,
      authHeaders
    );
    assert(dupRes.status === 201 && dupRes.body?.data?.title?.startsWith('Copy of'), 'POST /api/newsletter/campaigns/:id/duplicate creates copy');
    const dupId = dupRes.body?.data?._id;
    if (dupId) await Newsletter.findByIdAndDelete(dupId);

    // 4f. WhatsApp endpoint
    const waApiRes = await requestHttp(
      'POST',
      '/api/newsletter/campaigns/' + createdId + '/whatsapp',
      { phone: '+971509998888' },
      authHeaders
    );
    assert(waApiRes.status === 200 && waApiRes.body?.data?.deepLink?.includes('971509998888'), 'POST /api/newsletter/campaigns/:id/whatsapp generates share link');

    // 4g. Delete newsletter
    const delRes = await requestHttp(
      'DELETE',
      '/api/newsletter/campaigns/' + createdId,
      null,
      authHeaders
    );
    assert(delRes.status === 200, 'DELETE /api/newsletter/campaigns/:id deletes campaign');

    // 5. Duplicate Send Protection & Atomic Locking
    console.log('\n5. Duplicate Send Protection & Atomic Locking');
    const lockDoc = await Newsletter.create({
      title: 'Concurrency Test Campaign',
      subject: 'Concurrency Test',
      content: '<p>Testing atomic send locks.</p>',
      status: 'Sending',
    });

    const sendLockedRes = await requestHttp(
      'POST',
      '/api/newsletter/campaigns/' + lockDoc._id + '/send',
      null,
      authHeaders
    );
    assert(sendLockedRes.status === 409, 'Reject send when status is already Sending (409 Conflict)');

    lockDoc.status = 'Sent';
    await lockDoc.save();

    const sendSentRes = await requestHttp(
      'POST',
      '/api/newsletter/campaigns/' + lockDoc._id + '/send',
      null,
      authHeaders
    );
    assert(sendSentRes.status === 409, 'Reject send when status is already Sent (409 Conflict)');
    await Newsletter.findByIdAndDelete(lockDoc._id);

    // 6. Notification Summary API & Today Tasks
    console.log('\n6. Notification Summary API & Today Tasks');

    // 6a. Unauthenticated access blocked
    const unauthNotif = await requestHttp('GET', '/api/stats/notifications');
    assert(unauthNotif.status === 401, 'GET /api/stats/notifications returns 401 when unauthenticated');

    // 6b. Authenticated notification summary
    const notifRes = await requestHttp('GET', '/api/stats/notifications', null, authHeaders);
    assert(notifRes.status === 200, 'GET /api/stats/notifications responds with 200');
    const notifCounts = notifRes.body?.data?.counts;
    assert(typeof notifCounts?.consultations === 'number' && typeof notifCounts?.enquiries === 'number', 'Notification summary contains numeric counts');
    assert(Array.isArray(notifRes.body?.data?.tasks), 'Notification summary contains tasks array');
    assert(notifRes.body?.data?.tasks.some((t) => t.path === '/admin/consultations') && notifRes.body?.data?.tasks.some((t) => t.path === '/admin/contact'), 'Notification tasks have correct routes');

    // 6c. Dashboard stats consistency
    const dashRes = await requestHttp('GET', '/api/stats/dashboard', null, authHeaders);
    assert(dashRes.status === 200, 'GET /api/stats/dashboard responds with 200');
    assert(dashRes.body?.data?.notifications?.consultations === notifCounts?.consultations, 'Dashboard stats contains notification counts matching summary');

    // 7. Subscriber Security & Privacy
    console.log('\n7. Subscriber Security & Privacy');
    const subsRes = await requestHttp('GET', '/api/newsletter', null, authHeaders);
    assert(subsRes.status === 200, 'Admin can view subscribers with JWT');

    const unauthSubs = await requestHttp('GET', '/api/newsletter');
    assert(unauthSubs.status === 401, 'Public users cannot view subscriber list (401)');

    // Cleanup test admin
    if (admin) {
      await Admin.findByIdAndDelete(admin._id);
    }
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  }

  console.log('\n========================================================');
  console.log('PHASE 5H SUITE SUMMARY: ' + passed + ' PASSED, ' + failed + ' FAILED');
  console.log('========================================================\n');

  return { passed, failed };
}

if (process.argv[1] && process.argv[1].endsWith('test_phase5h_newsletter_notifications.js')) {
  runSuite().then((result) => {
    process.exit(result.failed > 0 ? 1 : 0);
  }).catch((err) => {
    console.error('Fatal suite error:', err);
    process.exit(1);
  });
}
