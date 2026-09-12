import SiteSetting from './src/models/SiteSetting.js';
import { ALLOWED_SETTING_FIELDS, updateSettings } from './src/controllers/settingController.js';

async function runSettingsWhitelistTests() {
  console.log('========================================================');
  console.log('  SETTINGS CONTROLLER MASS-ASSIGNMENT HARDENING TESTS');
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

  // Backup original Mongoose model methods
  const originalFindOne = SiteSetting.findOne;
  const originalFindByIdAndUpdate = SiteSetting.findByIdAndUpdate;

  const mockExistingSettings = {
    _id: 'setting-id-001',
    brandName: 'LUX BASED INDUSTRY',
    tagline: 'Illuminating Luxury Spaces',
    email: 'info@luxbasedindustry.com',
    phone: '+971 4 340 8899',
    whatsapp: '+971 50 892 4411',
    whatsappNumberClean: '971508924411',
    address: 'Alserkal Avenue, Building 42',
    city: 'Dubai',
    country: 'United Arab Emirates',
    businessHours: 'Monday - Saturday: 09:00 - 19:00',
    catalogueUrl: 'https://cdn.example.com/cat.pdf',
    locations: [],
    socialLinks: {},
    defaultSeo: {},
    coordinates: {},
    logo: '',
    logoPublicId: '',
  };

  try {
    // -------------------------------------------------------------------------
    // TEST A: Allowed fields are preserved and reach updateSiteSettings -> DB
    // -------------------------------------------------------------------------
    {
      let capturedPayload = null;

      SiteSetting.findOne = async () => ({ ...mockExistingSettings });
      SiteSetting.findByIdAndUpdate = async (id, data) => {
        capturedPayload = data;
        return { ...mockExistingSettings, ...data };
      };

      const req = {
        body: {
          brandName: 'LUX BASED INDUSTRY NEW',
          email: 'concierge@luxbasedindustry.com',
          locations: [],
        },
      };

      let responseData = null;
      let responseStatus = 200;
      const res = {
        status: (code) => {
          responseStatus = code;
          return res;
        },
        json: (data) => {
          responseData = data;
          return res;
        },
      };

      await updateSettings(req, res, () => {});

      const pass =
        capturedPayload?.brandName === 'LUX BASED INDUSTRY NEW' &&
        capturedPayload?.email === 'concierge@luxbasedindustry.com' &&
        Array.isArray(capturedPayload?.locations) &&
        capturedPayload?.locations.length === 0 &&
        responseData?.success === true;

      record(
        'TEST A: Allowed fields reach setting update flow unchanged',
        pass,
        `payload: ${JSON.stringify(capturedPayload)}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST B: Unknown / malicious fields are completely stripped
    // -------------------------------------------------------------------------
    {
      let capturedPayload = null;

      SiteSetting.findOne = async () => ({ ...mockExistingSettings });
      SiteSetting.findByIdAndUpdate = async (id, data) => {
        capturedPayload = data;
        return { ...mockExistingSettings, ...data };
      };

      const req = {
        body: {
          brandName: 'LUX BASED INDUSTRY',
          unexpectedField: 'should-not-persist',
          role: 'superadmin',
          __v: 99,
          _id: 'malicious-id',
          createdAt: '2020-01-01',
          isAdmin: true,
        },
      };

      const res = {
        status: () => res,
        json: () => res,
      };

      await updateSettings(req, res, () => {});

      const pass =
        capturedPayload?.brandName === 'LUX BASED INDUSTRY' &&
        !('unexpectedField' in capturedPayload) &&
        !('role' in capturedPayload) &&
        !('__v' in capturedPayload) &&
        !('_id' in capturedPayload) &&
        !('createdAt' in capturedPayload) &&
        !('isAdmin' in capturedPayload);

      record(
        'TEST B: Unknown and unauthorized fields are stripped from payload',
        pass,
        `keys: ${Object.keys(capturedPayload || {})}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST C: Falsey values ('', false, 0, [], {}) are strictly preserved
    // -------------------------------------------------------------------------
    {
      let capturedPayload = null;

      SiteSetting.findOne = async () => ({ ...mockExistingSettings });
      SiteSetting.findByIdAndUpdate = async (id, data) => {
        capturedPayload = data;
        return { ...mockExistingSettings, ...data };
      };

      const req = {
        body: {
          tagline: '',
          catalogueUrl: '',
          locations: [],
        },
      };

      const res = {
        status: () => res,
        json: () => res,
      };

      await updateSettings(req, res, () => {});

      const pass =
        capturedPayload?.tagline === '' &&
        capturedPayload?.catalogueUrl === '' &&
        Array.isArray(capturedPayload?.locations) &&
        capturedPayload?.locations.length === 0;

      record(
        'TEST C: Intentional falsey values (\'\', []) are preserved',
        pass,
        `payload: ${JSON.stringify(capturedPayload)}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST D: Undefined properties are omitted and do not overwrite DB values
    // -------------------------------------------------------------------------
    {
      let capturedPayload = null;

      SiteSetting.findOne = async () => ({ ...mockExistingSettings });
      SiteSetting.findByIdAndUpdate = async (id, data) => {
        capturedPayload = data;
        return { ...mockExistingSettings, ...data };
      };

      const req = {
        body: {
          brandName: 'LUX BASED INDUSTRY',
          tagline: undefined,
          email: undefined,
        },
      };

      const res = {
        status: () => res,
        json: () => res,
      };

      await updateSettings(req, res, () => {});

      const pass =
        capturedPayload?.brandName === 'LUX BASED INDUSTRY' &&
        !('tagline' in capturedPayload) &&
        !('email' in capturedPayload);

      record(
        'TEST D: Explicit undefined values are safely excluded',
        pass,
        `keys: ${Object.keys(capturedPayload || {})}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST E: Empty, null, or non-object body is handled gracefully
    // -------------------------------------------------------------------------
    {
      let capturedPayload1 = null;
      let capturedPayload2 = null;

      SiteSetting.findOne = async () => ({ ...mockExistingSettings });
      SiteSetting.findByIdAndUpdate = async (id, data) => {
        capturedPayload1 = data;
        return { ...mockExistingSettings, ...data };
      };

      const res = {
        status: () => res,
        json: () => res,
      };

      await updateSettings({ body: {} }, res, () => {});

      SiteSetting.findByIdAndUpdate = async (id, data) => {
        capturedPayload2 = data;
        return { ...mockExistingSettings, ...data };
      };
      await updateSettings({ body: null }, res, () => {});

      const pass =
        typeof capturedPayload1 === 'object' &&
        Object.keys(capturedPayload1).length === 0 &&
        typeof capturedPayload2 === 'object' &&
        Object.keys(capturedPayload2).length === 0;

      record('TEST E: Empty and non-object bodies produce empty updateData', pass);
    }

    // -------------------------------------------------------------------------
    // TEST F: Complete whitelist coverage matches expected 17 supported fields
    // -------------------------------------------------------------------------
    {
      const expectedFields = [
        'brandName',
        'tagline',
        'email',
        'phone',
        'whatsapp',
        'whatsappNumberClean',
        'address',
        'city',
        'country',
        'businessHours',
        'catalogueUrl',
        'socialLinks',
        'defaultSeo',
        'coordinates',
        'logo',
        'logoPublicId',
        'locations',
      ];

      const allPresent = expectedFields.every((f) => ALLOWED_SETTING_FIELDS.includes(f));
      const noExtras = ALLOWED_SETTING_FIELDS.length === expectedFields.length;

      record(
        'TEST F: ALLOWED_SETTING_FIELDS contains exactly all 17 supported schema fields',
        allPresent && noExtras,
        `count: ${ALLOWED_SETTING_FIELDS.length}`
      );
    }
  } finally {
    SiteSetting.findOne = originalFindOne;
    SiteSetting.findByIdAndUpdate = originalFindByIdAndUpdate;
  }

  console.log('\n========================================================');
  console.log(`  TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('========================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runSettingsWhitelistTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
