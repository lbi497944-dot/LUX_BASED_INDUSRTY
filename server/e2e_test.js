import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config(); // fallback

import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { validateEnvironment } from './src/config/envValidator.js';
import { generateToken } from './src/utils/generateToken.js';
import Admin from './src/models/Admin.js';
import Product from './src/models/Product.js';

const PORT = 5555;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
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
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('========================================================');
  console.log('  VELOURA LIGHTING — SECURITY & REGRESSION TEST RUNNER');
  console.log('========================================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  function record(name, passed, details = '') {
    if (passed) {
      results.passed++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      results.failed++;
      console.error(`  ❌ [FAIL] ${name} — ${details}`);
    }
    results.tests.push({ name, passed, details });
  }

  // 1. CONFIGURATION & STARTUP FAIL-FAST AUDIT
  console.log('--- 1. Startup & Configuration Fail-Fast Audit ---');
  // Check JWT missing fail-fast
  const savedJwtSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  let jwtFailFastPassed = false;
  try {
    validateEnvironment();
  } catch (err) {
    jwtFailFastPassed = err.message.includes('Environment validation failed');
  }
  process.env.JWT_SECRET = savedJwtSecret;
  record('Missing JWT_SECRET causes immediate configuration validation failure', jwtFailFastPassed);

  // Check MONGODB_URI missing fail-fast
  const savedMongoUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  let mongoFailFastPassed = false;
  try {
    await connectDB();
  } catch (err) {
    mongoFailFastPassed = err.message.includes('MONGODB_URI is not defined');
  }
  process.env.MONGODB_URI = savedMongoUri;
  record('Missing MONGODB_URI causes immediate database connection failure', mongoFailFastPassed);

  // Now connect legitimately
  await connectDB();
  const server = app.listen(PORT);

  let adminToken = '';
  let adminUserId = '';
  let createdProductId = '';
  let createdConsultationId = '';
  let createdContactId = '';

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@veloura-lighting.com';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'VelouraAdmin2026!';

  // Ensure test admin exists for test execution
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await Admin.create({
      username: 'Veloura Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
  }

  try {
    // 2. HEALTH & SERVER CHECK
    console.log('\n--- 2. Health & MongoDB Verification ---');
    const resHealth = await request('GET', '/api/health');
    record(
      'GET /api/health accurately reports MongoDB connected and safe status',
      resHealth.status === 200 &&
        resHealth.data?.status === 'ok' &&
        resHealth.data?.database?.connected === true &&
        Boolean(resHealth.data?.uptime) &&
        !JSON.stringify(resHealth.data).includes('mongodb://')
    );

    const resRoot = await request('GET', '/');
    record('GET / returns 200 API Status', resRoot.status === 200);

    // 3. CORS ENFORCEMENT AUDIT
    console.log('\n--- 3. CORS Enforcement Audit ---');
    // Allowed origin
    const resCorsAllowed = await request('GET', '/api/products', null, {
      Origin: 'http://localhost:5173',
    });
    record(
      'CORS allows explicitly configured origin (http://localhost:5173)',
      resCorsAllowed.status === 200
    );

    // Unknown/unauthorized origin must be blocked
    const resCorsBlocked = await request('GET', '/api/products', null, {
      Origin: 'https://malicious-unauthorized-origin.com',
    });
    record(
      'CORS strictly blocks unauthorized origin with 403',
      resCorsBlocked.status === 403
    );

    // 4. PUBLIC CATALOG & CONTENT RETRIEVAL
    console.log('\n--- 4. Public Catalog & Content Retrieval ---');
    const resProducts = await request('GET', '/api/products');
    record('GET /api/products returns products array with pagination', resProducts.status === 200 && Array.isArray(resProducts.data?.data) && resProducts.data.pagination);

    const resCollections = await request('GET', '/api/collections');
    record('GET /api/collections returns collections array', resCollections.status === 200 && Array.isArray(resCollections.data?.data));

    const resProjects = await request('GET', '/api/projects');
    record('GET /api/projects returns portfolio projects', resProjects.status === 200 && Array.isArray(resProjects.data?.data));

    const resFaqs = await request('GET', '/api/faqs');
    record('GET /api/faqs returns active FAQs', resFaqs.status === 200 && Array.isArray(resFaqs.data?.data));

    const resTestimonials = await request('GET', '/api/testimonials');
    record('GET /api/testimonials returns testimonials', resTestimonials.status === 200 && Array.isArray(resTestimonials.data?.data));

    const resSettings = await request('GET', '/api/settings');
    record('GET /api/settings returns site configuration', resSettings.status === 200 && Boolean(resSettings.data?.data?.settings));

    const resSitemap = await request('GET', '/api/sitemap.xml');
    record('GET /api/sitemap.xml returns application/xml with urlset', resSitemap.status === 200 && typeof resSitemap.data === 'string' && resSitemap.data.includes('<urlset'));

    // 5. AUTHENTICATION & AUTHORIZATION (ROLE-BASED)
    console.log('\n--- 5. Authentication & Authorization Security ---');
    // Valid login
    const resLogin = await request('POST', '/api/auth/login', {
      email: adminEmail,
      password: adminPassword,
    });
    adminToken = resLogin.data?.data?.token;
    adminUserId = resLogin.data?.data?.admin?.id;
    record('POST /api/auth/login with valid credentials returns JWT token', resLogin.status === 200 && Boolean(adminToken));

    // Invalid password
    const resBadLogin = await request('POST', '/api/auth/login', {
      email: adminEmail,
      password: 'WrongPassword999!',
    });
    record('POST /api/auth/login with wrong password returns 401', resBadLogin.status === 401);

    // Missing fields
    const resEmptyLogin = await request('POST', '/api/auth/login', {});
    record('POST /api/auth/login with missing fields returns 400 validation error', resEmptyLogin.status === 400 && resEmptyLogin.data?.errors?.length > 0);

    // Protected /me with token
    const resMe = await request('GET', '/api/auth/me', null, { Authorization: `Bearer ${adminToken}` });
    record('GET /api/auth/me with valid Bearer token returns admin profile without password hash', resMe.status === 200 && !resMe.data?.data?.admin?.password);

    // Anonymous to protected
    const resAnonStats = await request('GET', '/api/stats/dashboard');
    record('GET /api/stats/dashboard without token rejected with 401', resAnonStats.status === 401);

    // Malformed token
    const resFakeToken = await request('GET', '/api/stats/dashboard', null, { Authorization: 'Bearer fake_invalid_jwt_token' });
    record('GET /api/stats/dashboard with malformed token rejected with 401', resFakeToken.status === 401);

    // Valid admin token to stats dashboard => 200
    const resAdminStats = await request('GET', '/api/stats/dashboard', null, { Authorization: `Bearer ${adminToken}` });
    record('GET /api/stats/dashboard with admin role succeeds with 200', resAdminStats.status === 200);

    // Non-admin (editor role) token to stats dashboard => 403 Forbidden
    const editorEmail = `test.editor.${Date.now()}@veloura-lighting.com`;
    const editorUser = await Admin.create({
      username: 'Test Editor',
      email: editorEmail,
      password: 'EditorPassword2026!',
      role: 'editor',
    });
    const editorToken = generateToken(editorUser._id, 'editor');
    const resEditorStats = await request('GET', '/api/stats/dashboard', null, { Authorization: `Bearer ${editorToken}` });
    record('GET /api/stats/dashboard with non-admin (editor) role strictly rejected with 403', resEditorStats.status === 403);
    await Admin.findByIdAndDelete(editorUser._id);

    // 6. ADMINVIEW PRIVILEGE SEPARATION
    console.log('\n--- 6. adminView Privilege Separation ---');
    // Create an inactive test product directly in DB
    const inactiveProduct = await Product.create({
      name: 'Draft Hidden Product',
      slug: `draft-hidden-product-${Date.now()}`,
      category: 'Chandeliers',
      collectionSlug: 'grand-chandeliers',
      image: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=1200&q=85',
      description: 'Hidden unpublished test fixture',
      isActive: false,
    });

    // Public request with ?adminView=true without auth
    const resPublicAdminView = await request('GET', '/api/products?adminView=true');
    const publicFoundInactive = resPublicAdminView.data?.data?.some((p) => p._id === String(inactiveProduct._id));
    record(
      'Public user cannot bypass draft visibility by passing ?adminView=true',
      !publicFoundInactive
    );

    // Authenticated admin request with ?adminView=true
    const resAdminAdminView = await request('GET', '/api/products?adminView=true', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    const adminFoundInactive = resAdminAdminView.data?.data?.some((p) => p._id === String(inactiveProduct._id));
    record(
      'Authenticated admin with ?adminView=true can view draft/inactive products',
      adminFoundInactive
    );

    // Clean up inactive test product
    await Product.findByIdAndDelete(inactiveProduct._id);

    // 7. PASSWORD CHANGE LIFECYCLE & HASHING
    console.log('\n--- 7. Password Change Lifecycle & Security ---');
    // Attempt change with wrong current password => 400
    const resWrongCurrentPass = await request(
      'PUT',
      '/api/auth/password',
      {
        currentPassword: 'IncorrectOldPassword123!',
        newPassword: 'NewSecurePass2026!A',
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    record('PUT /api/auth/password with wrong current password returns 400', resWrongCurrentPass.status === 400);

    // Attempt change with weak new password => 400
    const resWeakNewPass = await request(
      'PUT',
      '/api/auth/password',
      {
        currentPassword: adminPassword,
        newPassword: 'simple',
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    record('PUT /api/auth/password rejects weak new password with 400 validation error', resWeakNewPass.status === 400);

    // Change to a new valid password
    const temporaryNewPassword = 'VelouraUpdated2026!New';
    const resChangePassSuccess = await request(
      'PUT',
      '/api/auth/password',
      {
        currentPassword: adminPassword,
        newPassword: temporaryNewPassword,
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    record('PUT /api/auth/password with valid data successfully updates password', resChangePassSuccess.status === 200);

    // Old password must immediately stop working
    const resLoginOldPass = await request('POST', '/api/auth/login', {
      email: adminEmail,
      password: adminPassword,
    });
    record('Old password immediately rejected with 401 after change', resLoginOldPass.status === 401);

    // New password works
    const resLoginNewPass = await request('POST', '/api/auth/login', {
      email: adminEmail,
      password: temporaryNewPassword,
    });
    const freshToken = resLoginNewPass.data?.data?.token;
    record('New password successfully authenticates with 200', resLoginNewPass.status === 200 && Boolean(freshToken));

    // Restore original password so database remains consistent
    const resRestorePass = await request(
      'PUT',
      '/api/auth/password',
      {
        currentPassword: temporaryNewPassword,
        newPassword: adminPassword,
      },
      { Authorization: `Bearer ${freshToken}` }
    );
    record('Original password safely restored via bcrypt .save()', resRestorePass.status === 200);

    // Re-verify original password works
    const resReVerify = await request('POST', '/api/auth/login', {
      email: adminEmail,
      password: adminPassword,
    });
    adminToken = resReVerify.data?.data?.token;
    record('Re-login with restored original credentials succeeds', resReVerify.status === 200 && Boolean(adminToken));

    // 8. PRODUCT CRUD LIFECYCLE
    console.log('\n--- 8. Product CRUD Lifecycle ---');
    const resCreateProd = await request(
      'POST',
      '/api/products',
      {
        name: 'E2E Security Luminaire',
        category: 'Chandeliers',
        collectionSlug: 'grand-chandeliers',
        description: 'E2E testing bespoke chandelier fixture.',
        image: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=1200&q=85',
        materials: 'Hand-blown Murano Crystal, Brushed Brass',
        wattage: '90W LED',
        dimensions: 'Ø 120cm x H 160cm',
        featured: true,
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    createdProductId = resCreateProd.data?.data?.product?._id;
    const prodSlug = resCreateProd.data?.data?.product?.slug;
    record('Admin POST /api/products creates product with unique slug', resCreateProd.status === 201 && Boolean(createdProductId));

    // Read by slug
    const resGetProdBySlug = await request('GET', `/api/products/${prodSlug}`);
    record('Public GET /api/products/:slug retrieves created product', resGetProdBySlug.status === 200 && resGetProdBySlug.data?.data?.product?.name === 'E2E Security Luminaire');

    // Update
    const resUpdateProd = await request(
      'PUT',
      `/api/products/${createdProductId}`,
      {
        name: 'E2E Security Luminaire',
        wattage: '120W LED',
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    record('Admin PUT /api/products/:id updates product', resUpdateProd.status === 200 && resUpdateProd.data?.data?.product?.wattage === '120W LED');

    // Delete
    const resDeleteProd = await request('DELETE', `/api/products/${createdProductId}`, null, { Authorization: `Bearer ${adminToken}` });
    record('Admin DELETE /api/products/:id deletes product', resDeleteProd.status === 200);

    // Verify deleted returns 404
    const resCheckDeletedProd = await request('GET', `/api/products/${prodSlug}`);
    record('Public GET /api/products/:slug returns 404 after deletion', resCheckDeletedProd.status === 404);

    // 9. CONSULTATION CRM & EMAIL ISOLATION
    console.log('\n--- 9. Consultation CRM & Email Fault-Tolerance ---');
    // Public visitor submits (even when SMTP is not configured)
    const resSubmitConsult = await request('POST', '/api/consultations', {
      fullName: 'VIP Security Lead',
      email: 'vip.security@example.com',
      phone: '+971 50 111 2233',
      projectLocation: 'Palm Jumeirah Villa',
      projectType: 'Residential Villa',
      projectStage: 'Under Construction',
      estimatedBudget: '$100,000+',
      lightingRequirements: 'Full Architectural & Custom Chandelier Scheme',
      message: 'Turnkey architectural lighting consultation.',
    });
    createdConsultationId = resSubmitConsult.data?.data?.consultation?._id;
    record(
      'Public POST /api/consultations succeeds even if SMTP is unconfigured/offline',
      resSubmitConsult.status === 201 && Boolean(createdConsultationId)
    );

    // Admin updates status workflow
    const resStatusUpdate = await request(
      'PATCH',
      `/api/consultations/${createdConsultationId}/status`,
      { status: 'In Discussion' },
      { Authorization: `Bearer ${adminToken}` }
    );
    record('Admin PATCH /api/consultations/:id/status updates lead status', resStatusUpdate.status === 200 && resStatusUpdate.data?.data?.consultation?.status === 'In Discussion');

    // Admin updates private notes
    const resNotesUpdate = await request(
      'PATCH',
      `/api/consultations/${createdConsultationId}/notes`,
      { adminNotes: 'CONFIDENTIAL: Client meeting scheduled.' },
      { Authorization: `Bearer ${adminToken}` }
    );
    record('Admin PATCH /api/consultations/:id/notes stores confidential notes', resNotesUpdate.status === 200 && resNotesUpdate.data?.data?.consultation?.adminNotes?.includes('CONFIDENTIAL'));

    // Verify public cannot access consultations
    const resAnonConsult = await request('GET', `/api/consultations/${createdConsultationId}`);
    record('Anonymous GET /api/consultations/:id rejected with 401 (Privacy isolated)', resAnonConsult.status === 401);

    // Admin clean up
    await request('DELETE', `/api/consultations/${createdConsultationId}`, null, { Authorization: `Bearer ${adminToken}` });

    // 10. CONTACT ENQUIRY FLOW & EMAIL FAULT-TOLERANCE
    console.log('\n--- 10. Contact Enquiry Flow & Email Fault-Tolerance ---');
    const resSubmitContact = await request('POST', '/api/contact', {
      name: 'Architect Hassan',
      email: 'hassan@archstudio.ae',
      phone: '+971 4 222 3344',
      projectType: 'Hospitality',
      location: 'Downtown Dubai',
      message: 'Requesting specification drawings.',
    });
    createdContactId = resSubmitContact.data?.data?.enquiry?._id || resSubmitContact.data?.data?.contact?._id;
    record(
      'Public POST /api/contact succeeds and persists to database even when SMTP is unconfigured',
      resSubmitContact.status === 201 && Boolean(createdContactId)
    );

    const resGetContacts = await request('GET', '/api/contact', null, { Authorization: `Bearer ${adminToken}` });
    record('Admin GET /api/contact lists contact enquiries', resGetContacts.status === 200 && Array.isArray(resGetContacts.data?.data));

    // Admin clean up
    if (createdContactId) {
      await request('DELETE', `/api/contact/${createdContactId}`, null, { Authorization: `Bearer ${adminToken}` });
    }

    // 11. NEWSLETTER READERSHIP & NORMALIZATION
    console.log('\n--- 11. Newsletter Readership & Normalization ---');
    const testNewsletterEmail = 'test.subscriber@luxuryinteriors.com';
    const resSub1 = await request('POST', '/api/newsletter/subscribe', { email: testNewsletterEmail });
    record('POST /api/newsletter/subscribe accepts new email', resSub1.status === 201 || resSub1.status === 200);

    // Duplicate email with whitespace and uppercase
    const resSubDup = await request('POST', '/api/newsletter/subscribe', { email: '  TEST.SUBSCRIBER@LUXURYINTERIORS.COM  ' });
    record('POST /api/newsletter/subscribe handles uppercase/whitespace duplicate gracefully', resSubDup.status === 200 && resSubDup.data?.message?.includes('already subscribed'));

    // Invalid email
    const resSubBad = await request('POST', '/api/newsletter/subscribe', { email: 'invalid-email-string' });
    record('POST /api/newsletter/subscribe rejects invalid email format with 400', resSubBad.status === 400);

    // 12. SETTINGS SINGLETON & WHATSAPP SYNC
    console.log('\n--- 12. Settings Singleton & WhatsApp Sync ---');
    const newWhatsApp = '+971 50 999 8877';
    const resUpdateSettings = await request(
      'PUT',
      '/api/settings',
      {
        whatsapp: newWhatsApp,
        brandName: 'Veloura Lighting',
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    const updatedSettings = resUpdateSettings.data?.data?.settings;
    record('Admin PUT /api/settings updates WhatsApp and auto-cleans number', resUpdateSettings.status === 200 && updatedSettings?.whatsappNumberClean === '971509998877');

    const resGetFreshSettings = await request('GET', '/api/settings');
    record('Public GET /api/settings immediately returns fresh WhatsApp number', resGetFreshSettings.data?.data?.settings?.whatsapp === newWhatsApp);

    // Reset settings to default
    await request(
      'PUT',
      '/api/settings',
      {
        whatsapp: '+971 50 892 4411',
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    // 13. API ERROR HANDLING & ISOLATION
    console.log('\n--- 13. Error Handling & API Isolation ---');
    const resNotFoundAPI = await request('GET', '/api/non-existent-endpoint');
    record('GET /api/non-existent-endpoint returns standardized 404 JSON (not HTML)', resNotFoundAPI.status === 404 && resNotFoundAPI.data?.success === false);

    const resCastError = await request('GET', '/api/products/id/invalid-mongodb-objectid', null, { Authorization: `Bearer ${adminToken}` });
    record('Mongoose CastError returns standardized 404 JSON', resCastError.status === 404 && resCastError.data?.success === false);
  } catch (err) {
    console.error('Fatal Test Exception:', err);
    record('E2E Execution without unhandled crash', false, err.message);
  } finally {
    server.close();
    await mongoose.disconnect();
  }

  console.log('\n========================================================');
  console.log(`  E2E TEST SUMMARY: ${results.passed} PASSED, ${results.failed} FAILED (TOTAL: ${results.tests.length})`);
  console.log('========================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2ETests();
