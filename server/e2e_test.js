import http from 'http';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import mongoose from 'mongoose';

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
  console.log('  VELOURA LIGHTING — END-TO-END INTEGRATION TEST RUNNER');
  console.log('========================================================\n');

  await connectDB();
  const server = app.listen(PORT);

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

  let adminToken = '';
  let createdProductId = '';
  let createdCollectionId = '';
  let createdProjectId = '';
  let createdConsultationId = '';
  let createdContactId = '';

  try {
    // 1. HEALTH & SERVER CHECK
    console.log('\n--- 1. Health & Root Endpoints ---');
    const resHealth = await request('GET', '/api/health');
    record('GET /api/health returns 200 and JSON envelope', resHealth.status === 200 && resHealth.data?.success === true);

    const resRoot = await request('GET', '/');
    record('GET / returns 200 API Status', resRoot.status === 200);

    // 2. PUBLIC API RETRIEVAL
    console.log('\n--- 2. Public Catalog & Content Retrieval ---');
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
    record('GET /api/settings returns site configuration', resSettings.status === 200 && resSettings.data?.data?.settings?.brandName === 'Veloura Lighting');

    const resSitemap = await request('GET', '/api/sitemap.xml');
    record('GET /api/sitemap.xml returns application/xml with urlset', resSitemap.status === 200 && typeof resSitemap.data === 'string' && resSitemap.data.includes('<urlset'));

    // 3. AUTHENTICATION & SECURITY
    console.log('\n--- 3. Authentication & Security ---');
    // Valid login
    const resLogin = await request('POST', '/api/auth/login', {
      email: 'admin@veloura-lighting.com',
      password: 'VelouraAdmin2026!',
    });
    adminToken = resLogin.data?.data?.token;
    record('POST /api/auth/login with valid credentials returns JWT token', resLogin.status === 200 && Boolean(adminToken));

    // Invalid password
    const resBadLogin = await request('POST', '/api/auth/login', {
      email: 'admin@veloura-lighting.com',
      password: 'WrongPassword123!',
    });
    record('POST /api/auth/login with wrong password returns 401', resBadLogin.status === 401);

    // Missing fields
    const resEmptyLogin = await request('POST', '/api/auth/login', {});
    record('POST /api/auth/login with missing fields returns 400 validation error', resEmptyLogin.status === 400 && resEmptyLogin.data?.errors?.length > 0);

    // Protected /me
    const resMe = await request('GET', '/api/auth/me', null, { Authorization: `Bearer ${adminToken}` });
    record('GET /api/auth/me with Bearer token returns admin profile', resMe.status === 200 && resMe.data?.data?.admin?.email === 'admin@veloura-lighting.com');

    // Anonymous to protected
    const resAnonStats = await request('GET', '/api/stats/dashboard');
    record('GET /api/stats/dashboard without token rejected with 401', resAnonStats.status === 401);

    // Invalid token
    const resFakeToken = await request('GET', '/api/stats/dashboard', null, { Authorization: 'Bearer fake_invalid_jwt_token' });
    record('GET /api/stats/dashboard with malformed token rejected with 401', resFakeToken.status === 401);

    // 4. PRODUCT CRUD LIFECYCLE
    console.log('\n--- 4. Product CRUD Lifecycle ---');
    const resCreateProd = await request(
      'POST',
      '/api/products',
      {
        name: 'E2E Test Luminaire',
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
    record('Public GET /api/products/:slug retrieves created product', resGetProdBySlug.status === 200 && resGetProdBySlug.data?.data?.product?.name === 'E2E Test Luminaire');

    // Update
    const resUpdateProd = await request(
      'PUT',
      `/api/products/${createdProductId}`,
      {
        name: 'E2E Test Luminaire',
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

    // 5. CONSULTATION CRM & DATA PRIVACY
    console.log('\n--- 5. Consultation CRM & Privacy ---');
    // Public visitor submits
    const resSubmitConsult = await request('POST', '/api/consultations', {
      fullName: 'VIP Test Client',
      email: 'vip.client@example.com',
      phone: '+971 50 111 2233',
      projectLocation: 'Palm Jumeirah Villa',
      projectType: 'Residential Villa',
      projectStage: 'Under Construction',
      estimatedBudget: '$100,000+',
      lightingRequirements: 'Full Architectural & Custom Chandelier Scheme',
      message: 'Looking for turnkey lighting consultation for a 6-bedroom villa.',
    });
    createdConsultationId = resSubmitConsult.data?.data?.consultation?._id;
    record('Public visitor POST /api/consultations creates consultation lead', resSubmitConsult.status === 201 && Boolean(createdConsultationId));

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
      { adminNotes: 'CONFIDENTIAL: Client meeting scheduled with Principal Architect for Thursday 2 PM.' },
      { Authorization: `Bearer ${adminToken}` }
    );
    record('Admin PATCH /api/consultations/:id/notes stores confidential notes', resNotesUpdate.status === 200 && resNotesUpdate.data?.data?.consultation?.adminNotes?.includes('CONFIDENTIAL'));

    // Verify public cannot access consultations
    const resAnonConsult = await request('GET', `/api/consultations/${createdConsultationId}`);
    record('Anonymous GET /api/consultations/:id rejected with 401 (Admin notes isolated)', resAnonConsult.status === 401);

    // Admin clean up
    await request('DELETE', `/api/consultations/${createdConsultationId}`, null, { Authorization: `Bearer ${adminToken}` });

    // 6. CONTACT ENQUIRIES
    console.log('\n--- 6. Contact Enquiry Flow ---');
    const resSubmitContact = await request('POST', '/api/contact', {
      name: 'Architect Hassan',
      email: 'hassan@archstudio.ae',
      phone: '+971 4 222 3344',
      projectType: 'Hospitality',
      location: 'Downtown Dubai',
      message: 'Requesting CAD specification drawings for cove lighting.',
    });
    createdContactId = resSubmitContact.data?.data?.enquiry?._id || resSubmitContact.data?.data?.contact?._id;
    record('Public POST /api/contact submits contact enquiry', resSubmitContact.status === 201 && Boolean(createdContactId));

    const resGetContacts = await request('GET', '/api/contact', null, { Authorization: `Bearer ${adminToken}` });
    record('Admin GET /api/contact lists contact enquiries', resGetContacts.status === 200 && Array.isArray(resGetContacts.data?.data));

    // Admin clean up
    if (createdContactId) {
      await request('DELETE', `/api/contact/${createdContactId}`, null, { Authorization: `Bearer ${adminToken}` });
    }

    // 7. NEWSLETTER READERSHIP & DUPLICATE SUPPRESSION
    console.log('\n--- 7. Newsletter Readership & Normalization ---');
    const testNewsletterEmail = 'test.subscriber@luxuryinteriors.com';
    const resSub1 = await request('POST', '/api/newsletter/subscribe', { email: testNewsletterEmail });
    record('POST /api/newsletter/subscribe accepts new email', resSub1.status === 201 || resSub1.status === 200);

    // Duplicate email with whitespace and uppercase
    const resSubDup = await request('POST', '/api/newsletter/subscribe', { email: '  TEST.SUBSCRIBER@LUXURYINTERIORS.COM  ' });
    record('POST /api/newsletter/subscribe handles uppercase/whitespace duplicate gracefully', resSubDup.status === 200 && resSubDup.data?.message?.includes('already subscribed'));

    // Invalid email
    const resSubBad = await request('POST', '/api/newsletter/subscribe', { email: 'invalid-email-string' });
    record('POST /api/newsletter/subscribe rejects invalid email format with 400', resSubBad.status === 400);

    // 8. SETTINGS SINGLETON & LIVE WHATSAPP SYNC
    console.log('\n--- 8. Settings Singleton & WhatsApp Sync ---');
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

    // 9. API ERROR HANDLING & ISOLATION
    console.log('\n--- 9. Error Handling & API Isolation ---');
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
