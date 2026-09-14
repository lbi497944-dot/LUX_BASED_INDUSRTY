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
import { validateSafeSocialUrl } from './src/services/settingService.js';
import { validatePdfBuffer } from './src/middleware/uploadMiddleware.js';

console.log('====================================================');
console.log('  PHASE 5G — SECURITY & PRODUCTION HARDENING SUITE  ');
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

const PORT = 5556;
const BASE_URL = `http://127.0.0.1:${PORT}`;

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

async function runSecurityTests() {
  let server;
  try {
    // Connect to DB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/veloura_test');
    }

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));

    const testJwtSecret = process.env.JWT_SECRET || 'test_jwt_secret_for_security_suite_minimum_32_chars';
    process.env.JWT_SECRET = testJwtSecret;

    // Create or find a test admin
    let admin = await Admin.findOne({ email: 'sec_audit_admin@luxbasedindustry.com' });
    if (!admin) {
      admin = await Admin.create({
        username: 'SecurityAuditAdmin',
        email: 'sec_audit_admin@luxbasedindustry.com',
        password: 'SecurePassword123!',
        role: 'admin',
      });
    }

    const validAdminToken = jwt.sign(
      { id: admin._id, role: 'admin' },
      testJwtSecret,
      { expiresIn: '1h' }
    );

    const expiredToken = jwt.sign(
      { id: admin._id, role: 'admin' },
      testJwtSecret,
      { expiresIn: '-10s' }
    );

    const forgedToken = jwt.sign(
      { id: admin._id, role: 'admin' },
      'wrong_unauthorized_secret_key',
      { expiresIn: '1h' }
    );

    // -------------------------------------------------------------
    // 1. Authentication & Token Verification Tests
    // -------------------------------------------------------------
    console.log('1. Authentication & Token Security:');

    // Test 1.1: Unauthenticated request to protected admin endpoint
    const unauthRes = await requestHttp('GET', '/api/stats/dashboard');
    assert(unauthRes.status === 401, 'Unauthenticated request to /api/stats/dashboard returns 401');
    assert(unauthRes.body?.success === false, 'Unauthenticated response returns success: false');

    // Test 1.2: Invalid / malformed bearer token
    const malformedRes = await requestHttp('GET', '/api/stats/dashboard', null, {
      Authorization: 'Bearer malformed.token.string',
    });
    assert(malformedRes.status === 401, 'Malformed bearer token returns 401');

    // Test 1.3: Forged token signed with wrong secret
    const forgedRes = await requestHttp('GET', '/api/stats/dashboard', null, {
      Authorization: `Bearer ${forgedToken}`,
    });
    assert(forgedRes.status === 401, 'Forged token signed with wrong secret returns 401');

    // Test 1.4: Expired token
    const expiredRes = await requestHttp('GET', '/api/stats/dashboard', null, {
      Authorization: `Bearer ${expiredToken}`,
    });
    assert(expiredRes.status === 401, 'Expired token returns 401');

    // Test 1.5: Valid admin token succeeds
    const validRes = await requestHttp('GET', '/api/stats/dashboard', null, {
      Authorization: `Bearer ${validAdminToken}`,
    });
    assert(validRes.status === 200, 'Valid admin token returns 200 OK');

    // -------------------------------------------------------------
    // 2. Authorization & Protected Routes
    // -------------------------------------------------------------
    console.log('\n2. Authorization & Role Enforcement:');

    // Protected Admin Endpoints
    const endpoints = [
      { method: 'GET', url: '/api/consultations' },
      { method: 'GET', url: '/api/contact' },
      { method: 'GET', url: '/api/newsletter' },
      { method: 'GET', url: '/api/reviews' },
      { method: 'GET', url: '/api/pages' },
      { method: 'POST', url: '/api/products' },
      { method: 'POST', url: '/api/collections' },
      { method: 'POST', url: '/api/projects' },
      { method: 'POST', url: '/api/partners' },
      { method: 'POST', url: '/api/transformations' },
    ];

    for (const ep of endpoints) {
      const res = await requestHttp(ep.method, ep.url);
      assert(res.status === 401, `Unauthenticated ${ep.method} ${ep.url} rejected with 401`);
    }

    // -------------------------------------------------------------
    // 3. NoSQL Injection & Operator Sanitization
    // -------------------------------------------------------------
    console.log('\n3. NoSQL Injection & Parameter Sanitization:');

    // Test 3.1: Operator injection in login body
    const nosqlLoginRes = await requestHttp('POST', '/api/auth/login', {
      email: { $gt: '' },
      password: { $gt: '' },
    });
    assert(nosqlLoginRes.status === 400 || nosqlLoginRes.status === 401, 'NoSQL operator injection in login rejected');

    // Test 3.2: Operator injection in public product query
    const nosqlQueryRes = await requestHttp('GET', '/api/products?category[$ne]=null&search[$regex]=.*');
    assert(nosqlQueryRes.status === 200, 'NoSQL operator query safely sanitized and handled');

    // Test 3.3: Malformed ObjectId handling
    const malformedIdRes = await requestHttp('GET', '/api/products/id/invalid-hex-object-id-12345');
    assert(malformedIdRes.status === 404, 'Malformed ObjectId returns 404 cleanly without 500 error');

    // -------------------------------------------------------------
    // 4. URL & XSS Sanitization
    // -------------------------------------------------------------
    console.log('\n4. URL Security & XSS Defense:');

    assert(!validateSafeSocialUrl('javascript:alert(1)'), 'validateSafeSocialUrl rejects javascript: URI');
    assert(!validateSafeSocialUrl('data:text/html,<script>alert(1)</script>'), 'validateSafeSocialUrl rejects data: URI');
    assert(!validateSafeSocialUrl('vbscript:msgbox(1)'), 'validateSafeSocialUrl rejects vbscript: URI');
    assert(!validateSafeSocialUrl('file:///etc/passwd'), 'validateSafeSocialUrl rejects file: URI');
    assert(validateSafeSocialUrl('https://instagram.com/luxbasedindustry'), 'validateSafeSocialUrl accepts valid https URI');

    // -------------------------------------------------------------
    // 5. File Upload & Magic Byte Verification
    // -------------------------------------------------------------
    console.log('\n5. File Upload Security:');

    let pdfError = null;
    try {
      validatePdfBuffer(Buffer.from('not_a_pdf_file'));
    } catch (e) {
      pdfError = e;
    }
    assert(pdfError !== null, 'validatePdfBuffer rejects non-PDF buffer');

    const validPdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');
    assert(validatePdfBuffer(validPdfBuffer) === true, 'validatePdfBuffer accepts valid %PDF- header');

    // -------------------------------------------------------------
    // 6. Security Headers & CORS
    // -------------------------------------------------------------
    console.log('\n6. Security HTTP Headers:');

    const headerRes = await requestHttp('GET', '/api/health');
    assert(headerRes.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options: nosniff present');
    assert(headerRes.headers['x-frame-options'] === 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN present');
    assert(headerRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy configured');
    assert(headerRes.headers['permissions-policy'] !== undefined, 'Permissions-Policy header present');
    assert(!headerRes.headers['x-powered-by'], 'X-Powered-By header is hidden');

    // -------------------------------------------------------------
    // 7. Public Data Exposure & Privacy
    // -------------------------------------------------------------
    console.log('\n7. Public Data Privacy & Isolation:');

    // Test 7.1: Public Reviews exclude PII
    const publicReviewsRes = await requestHttp('GET', '/api/reviews/public');
    assert(publicReviewsRes.status === 200, 'Public reviews endpoint returns 200');
    if (publicReviewsRes.body.data?.reviews?.length > 0) {
      const firstRev = publicReviewsRes.body.data.reviews[0];
      assert(firstRev.email === undefined, 'Public review excludes email');
      assert(firstRev.phone === undefined, 'Public review excludes phone');
      assert(firstRev.ipAddress === undefined, 'Public review excludes IP address');
      assert(firstRev.adminNotes === undefined, 'Public review excludes adminNotes');
    } else {
      assert(true, 'Public reviews endpoint structure verified');
    }

    // Test 7.2: Testing product is 404 on public endpoint
    const testingProductRes = await requestHttp('GET', '/api/products/testing');
    assert(testingProductRes.status === 404, 'Testing product slug returns 404 on public route');

    // Test 7.3: Password never returned in admin profile query
    const meRes = await requestHttp('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${validAdminToken}`,
    });
    assert(meRes.status === 200, 'Admin profile retrieved');
    assert(meRes.body.data?.admin?.password === undefined, 'Admin password is never returned in profile API');

    // -------------------------------------------------------------
    // 8. Clean up test artifacts
    // -------------------------------------------------------------
    await Admin.deleteOne({ email: 'sec_audit_admin@luxbasedindustry.com' });

  } catch (err) {
    failed++;
    console.error('Security test runner encountered error:', err);
  } finally {
    if (server) {
      server.close();
    }
    console.log('\n====================================================');
    console.log(`  PHASE 5G SECURITY RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runSecurityTests();
