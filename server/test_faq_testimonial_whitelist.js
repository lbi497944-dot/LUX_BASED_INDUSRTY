import FAQ from './src/models/FAQ.js';
import Testimonial from './src/models/Testimonial.js';
import {
  ALLOWED_FAQ_FIELDS,
  filterFaqFields,
  createFaq,
  updateFaq,
} from './src/controllers/faqController.js';
import {
  ALLOWED_TESTIMONIAL_FIELDS,
  filterTestimonialFields,
  createTestimonial,
  updateTestimonial,
} from './src/controllers/testimonialController.js';

async function runFaqAndTestimonialWhitelistTests() {
  console.log('========================================================');
  console.log('  FAQ & TESTIMONIAL CONTROLLER WHITELIST HARDENING TESTS');
  console.log('========================================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  function record(name, passed, details = '') {
    if (passed) {
      results.passed++;
      console.log(`  [PASS] ${name}`);
    } else {
      results.failed++;
      console.error(`  [FAIL] ${name} -- ${details}`);
    }
    results.tests.push({ name, passed, details });
  }

  // Backup original model methods
  const originalFaqCreate = FAQ.create;
  const originalFaqFindByIdAndUpdate = FAQ.findByIdAndUpdate;
  const originalTestimonialCreate = Testimonial.create;
  const originalTestimonialFindByIdAndUpdate = Testimonial.findByIdAndUpdate;

  const mockRes = () => {
    const res = {
      statusCode: 200,
      data: null,
      status: (code) => {
        res.statusCode = code;
        return res;
      },
      json: (d) => {
        res.data = d;
        return res;
      },
    };
    return res;
  };

  try {
    // =========================================================================
    // SECTION 1: FAQ CONTROLLER WHITELIST
    // =========================================================================

    // TEST 1: FAQ Create passes legitimate fields to service -> DB
    {
      let captured = null;
      FAQ.create = async (data) => {
        captured = data;
        return { _id: 'faq-1', ...data };
      };

      const req = {
        body: {
          question: 'What is architectural lighting?',
          answer: 'Layered illumination tailored to room geometry.',
          category: 'General',
          order: 1,
          isActive: true,
        },
      };
      const res = mockRes();

      await createFaq(req, res, () => {});

      const pass =
        captured?.question === req.body.question &&
        captured?.answer === req.body.answer &&
        captured?.category === req.body.category &&
        captured?.order === 1 &&
        captured?.isActive === true &&
        res.statusCode === 201;

      record('FAQ TEST 1: Legitimate fields survive on createFaq', pass, `payload: ${JSON.stringify(captured)}`);
    }

    // TEST 2: FAQ Update strips unknown, internal, and malicious fields
    {
      let captured = null;
      FAQ.findByIdAndUpdate = async (id, data) => {
        captured = data;
        return { _id: id, ...data };
      };

      const req = {
        params: { id: 'faq-123' },
        body: {
          question: 'Updated Question?',
          unexpectedField: 'malicious',
          _id: 'overwrite-id',
          __v: 5,
          createdAt: '1970-01-01',
          role: 'admin',
          isAdmin: true,
        },
      };
      const res = mockRes();

      await updateFaq(req, res, () => {});

      const pass =
        captured?.question === 'Updated Question?' &&
        !('unexpectedField' in captured) &&
        !('_id' in captured) &&
        !('__v' in captured) &&
        !('createdAt' in captured) &&
        !('role' in captured) &&
        !('isAdmin' in captured);

      record('FAQ TEST 2: Unknown and internal fields are stripped on updateFaq', pass, `keys: ${Object.keys(captured || {})}`);
    }

    // TEST 3: FAQ falsey values ('', false, 0) are strictly preserved
    {
      let captured = null;
      FAQ.findByIdAndUpdate = async (id, data) => {
        captured = data;
        return { _id: id, ...data };
      };

      const req = {
        params: { id: 'faq-456' },
        body: {
          category: '',
          order: 0,
          isActive: false,
        },
      };
      const res = mockRes();

      await updateFaq(req, res, () => {});

      const pass =
        captured?.category === '' &&
        captured?.order === 0 &&
        captured?.isActive === false;

      record("FAQ TEST 3: Falsey values ('', 0, false) are preserved", pass, `payload: ${JSON.stringify(captured)}`);
    }

    // TEST 4: FAQ undefined properties are excluded and do not overwrite DB
    {
      let captured = null;
      FAQ.findByIdAndUpdate = async (id, data) => {
        captured = data;
        return { _id: id, ...data };
      };

      const req = {
        params: { id: 'faq-789' },
        body: {
          question: 'Valid Question',
          answer: undefined,
          order: undefined,
        },
      };
      const res = mockRes();

      await updateFaq(req, res, () => {});

      const pass =
        captured?.question === 'Valid Question' &&
        !('answer' in captured) &&
        !('order' in captured);

      record('FAQ TEST 4: Undefined properties are excluded from update payload', pass, `keys: ${Object.keys(captured || {})}`);
    }

    // TEST 5: FAQ ALLOWED_FAQ_FIELDS contains exactly all 5 schema fields
    {
      const expected = ['question', 'answer', 'category', 'order', 'isActive'];
      const allPresent = expected.every((f) => ALLOWED_FAQ_FIELDS.includes(f));
      const noExtras = ALLOWED_FAQ_FIELDS.length === expected.length;

      record('FAQ TEST 5: ALLOWED_FAQ_FIELDS contains exactly 5 schema fields', allPresent && noExtras, `count: ${ALLOWED_FAQ_FIELDS.length}`);
    }

    // =========================================================================
    // SECTION 2: TESTIMONIAL CONTROLLER WHITELIST
    // =========================================================================

    // TEST 6: Testimonial Create passes legitimate fields to service -> DB
    {
      let captured = null;
      Testimonial.create = async (data) => {
        captured = data;
        return { _id: 'test-1', ...data };
      };

      const req = {
        body: {
          name: 'Sarah Jenkins',
          role: 'Design Principal',
          company: 'Studio Form',
          content: 'Flawless optical engineering and finish quality.',
          image: 'https://cdn.example.com/avatar.jpg',
          rating: 5,
          featured: true,
          isActive: true,
          order: 2,
        },
      };
      const res = mockRes();

      await createTestimonial(req, res, () => {});

      const pass =
        captured?.name === req.body.name &&
        captured?.role === req.body.role &&
        captured?.company === req.body.company &&
        captured?.content === req.body.content &&
        captured?.image === req.body.image &&
        captured?.rating === 5 &&
        captured?.featured === true &&
        captured?.isActive === true &&
        captured?.order === 2 &&
        res.statusCode === 201;

      record('TESTIMONIAL TEST 1: Legitimate fields survive on createTestimonial', pass, `payload: ${JSON.stringify(captured)}`);
    }

    // TEST 7: Testimonial Update strips unknown, internal, and malicious fields
    {
      let captured = null;
      Testimonial.findByIdAndUpdate = async (id, data) => {
        captured = data;
        return { _id: id, ...data };
      };

      const req = {
        params: { id: 'test-123' },
        body: {
          name: 'Updated Name',
          injectedAttr: 'malicious',
          _id: 'overwrite-id',
          __v: 12,
          createdAt: '2021-01-01',
          roleAdmin: true,
        },
      };
      const res = mockRes();

      await updateTestimonial(req, res, () => {});

      const pass =
        captured?.name === 'Updated Name' &&
        !('injectedAttr' in captured) &&
        !('_id' in captured) &&
        !('__v' in captured) &&
        !('createdAt' in captured) &&
        !('roleAdmin' in captured);

      record('TESTIMONIAL TEST 2: Unknown and internal fields are stripped on updateTestimonial', pass, `keys: ${Object.keys(captured || {})}`);
    }

    // TEST 8: Testimonial falsey values ('', false, 0) are strictly preserved
    {
      let captured = null;
      Testimonial.findByIdAndUpdate = async (id, data) => {
        captured = data;
        return { _id: id, ...data };
      };

      const req = {
        params: { id: 'test-456' },
        body: {
          role: '',
          company: '',
          featured: false,
          isActive: false,
          order: 0,
        },
      };
      const res = mockRes();

      await updateTestimonial(req, res, () => {});

      const pass =
        captured?.role === '' &&
        captured?.company === '' &&
        captured?.featured === false &&
        captured?.isActive === false &&
        captured?.order === 0;

      record("TESTIMONIAL TEST 3: Falsey values ('', 0, false) are preserved", pass, `payload: ${JSON.stringify(captured)}`);
    }

    // TEST 9: Testimonial undefined properties are excluded
    {
      let captured = null;
      Testimonial.findByIdAndUpdate = async (id, data) => {
        captured = data;
        return { _id: id, ...data };
      };

      const req = {
        params: { id: 'test-789' },
        body: {
          name: 'Sarah',
          role: undefined,
          rating: undefined,
        },
      };
      const res = mockRes();

      await updateTestimonial(req, res, () => {});

      const pass =
        captured?.name === 'Sarah' &&
        !('role' in captured) &&
        !('rating' in captured);

      record('TESTIMONIAL TEST 4: Undefined properties are excluded from update payload', pass, `keys: ${Object.keys(captured || {})}`);
    }

    // TEST 10: Testimonial ALLOWED_TESTIMONIAL_FIELDS contains exactly all 9 schema fields
    {
      const expected = [
        'name',
        'role',
        'company',
        'content',
        'image',
        'rating',
        'featured',
        'isActive',
        'order',
      ];
      const allPresent = expected.every((f) => ALLOWED_TESTIMONIAL_FIELDS.includes(f));
      const noExtras = ALLOWED_TESTIMONIAL_FIELDS.length === expected.length;

      record('TESTIMONIAL TEST 5: ALLOWED_TESTIMONIAL_FIELDS contains exactly 9 schema fields', allPresent && noExtras, `count: ${ALLOWED_TESTIMONIAL_FIELDS.length}`);
    }

    // TEST 11: Empty, null, or non-object body handling
    {
      let capturedFaq = null;
      let capturedTest = null;
      FAQ.create = async (d) => { capturedFaq = d; return { _id: 'f1', ...d }; };
      Testimonial.create = async (d) => { capturedTest = d; return { _id: 't1', ...d }; };

      await createFaq({ body: null }, mockRes(), () => {});
      await createTestimonial({ body: undefined }, mockRes(), () => {});

      const pass =
        typeof capturedFaq === 'object' && Object.keys(capturedFaq).length === 0 &&
        typeof capturedTest === 'object' && Object.keys(capturedTest).length === 0;

      record('TEST 11: Null and undefined bodies produce clean empty objects', pass);
    }
  } finally {
    // Restore model methods
    FAQ.create = originalFaqCreate;
    FAQ.findByIdAndUpdate = originalFaqFindByIdAndUpdate;
    Testimonial.create = originalTestimonialCreate;
    Testimonial.findByIdAndUpdate = originalTestimonialFindByIdAndUpdate;
  }

  console.log('\n========================================================');
  console.log(`  TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('========================================================\n');

  if (results.failed > 0) {
    return false;
  }
  return true;
}

runFaqAndTestimonialWhitelistTests().then((ok) => {
  if (!ok) process.exit(1);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
