/**
 * PHASE 5B-CATALOGUE LIFECYCLE & INTEGRITY AUTOMATED TEST SUITE
 * 
 * Verifies:
 * 1. Memory buffer PDF magic bytes validation (%PDF-)
 * 2. Cloudinary stream upload & accurate resourceType capture
 * 3. Service-level transactional upload, replacement, and rollback
 * 4. Safe deletion with exact stored resourceType and idempotency
 * 5. SiteSetting auto-healing & backward compatibility (catalogueUrl)
 * 6. Controller endpoints (GET /catalogue, POST /catalogue, DELETE /catalogue)
 * 7. Frontend forced download URL generation & WhatsApp fallback authority
 */

// Configure mock environment for testing Cloudinary integration BEFORE importing modules
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = 'test_key';
process.env.CLOUDINARY_API_SECRET = 'test_secret';

import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import {
  validatePdfBuffer,
  uploadCatalogueStreamToCloudinary,
  _uploadDeps,
} from './src/middleware/uploadMiddleware.js';
import * as settingService from './src/services/settingService.js';
import * as settingController from './src/controllers/settingController.js';
import SiteSetting from './src/models/SiteSetting.js';
import {
  getCatalogueDownloadUrl,
  getCatalogueWhatsAppMessage,
} from '../client/src/seo/seoConfig.js';

console.log('========================================================');
console.log('   PHASE 5B CATALOGUE LIFECYCLE & INTEGRITY TESTS');
console.log('========================================================\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
  }
}

async function runAll() {
  // =========================================================================
  // SECTION 1: Memory Buffer & PDF Magic Bytes Validation (%PDF-)
  // =========================================================================
  console.log('--- SECTION 1: Buffer & Magic Bytes Validation ---');

  test('1. validatePdfBuffer throws if buffer is null, undefined, or empty', () => {
    assert.throws(() => validatePdfBuffer(null), /too small or missing/i);
    assert.throws(() => validatePdfBuffer(undefined), /too small or missing/i);
    assert.throws(() => validatePdfBuffer(Buffer.alloc(0)), /too small or missing/i);
  });

  test('2. validatePdfBuffer throws if buffer length < 5 bytes', () => {
    assert.throws(() => validatePdfBuffer(Buffer.from('%PDF')), /too small or missing/i);
  });

  test('3. validatePdfBuffer throws if file signature is not %PDF- (e.g. PNG)', () => {
    const fakePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.throws(() => validatePdfBuffer(fakePng), /File signature does not match PDF specification/i);
  });

  test('4. validatePdfBuffer throws if file signature is plain text', () => {
    const fakeTxt = Buffer.from('Hello, I am a plain text file pretending to be a PDF');
    assert.throws(() => validatePdfBuffer(fakeTxt), /File signature does not match PDF specification/i);
  });

  test('5. validatePdfBuffer accepts valid buffer starting with %PDF-', () => {
    const validPdfBuffer = Buffer.from('%PDF-1.7\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
    const result = validatePdfBuffer(validPdfBuffer);
    assert.equal(result, true);
  });

  // =========================================================================
  // SECTION 2: Cloudinary Upload Stream & Resource Type Capture
  // =========================================================================
  console.log('\n--- SECTION 2: Cloudinary Stream & Resource Type Capture ---');

  await asyncTest('6. uploadCatalogueStreamToCloudinary captures returned resource_type (e.g. "image")', async () => {
    const validPdfBuffer = Buffer.from('%PDF-1.7 Test PDF');
    const originalUploader = _uploadDeps.cloudinary.uploader;

    let capturedOptions = null;
    _uploadDeps.cloudinary.uploader = {
      upload_stream: (options, callback) => {
        capturedOptions = options;
        const writable = new PassThrough();
        setImmediate(() => {
          callback(null, {
            secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234/test.pdf',
            public_id: 'test_public_id',
            resource_type: 'image',
            bytes: validPdfBuffer.length,
            format: 'pdf',
          });
        });
        return writable;
      }
    };

    const res = await uploadCatalogueStreamToCloudinary(validPdfBuffer, 'test.pdf', 'application/pdf');
    assert.equal(res.resourceType, 'image');
    assert.equal(res.url, 'https://res.cloudinary.com/demo/image/upload/v1234/test.pdf');
    assert.equal(res.publicId, 'test_public_id');
    assert.equal(capturedOptions.resource_type, 'auto');

    _uploadDeps.cloudinary.uploader = originalUploader;
  });

  await asyncTest('7. uploadCatalogueStreamToCloudinary captures returned resource_type if Cloudinary assigns "raw"', async () => {
    const validPdfBuffer = Buffer.from('%PDF-1.7 Test PDF');
    const originalUploader = _uploadDeps.cloudinary.uploader;

    _uploadDeps.cloudinary.uploader = {
      upload_stream: (options, callback) => {
        const writable = new PassThrough();
        setImmediate(() => {
          callback(null, {
            secure_url: 'https://res.cloudinary.com/demo/raw/upload/v1234/test.pdf',
            public_id: 'test_raw_public_id',
            resource_type: 'raw',
            bytes: validPdfBuffer.length,
            format: 'pdf',
          });
        });
        return writable;
      }
    };

    const res = await uploadCatalogueStreamToCloudinary(validPdfBuffer, 'raw.pdf', 'application/pdf');
    assert.equal(res.resourceType, 'raw');
    assert.equal(res.publicId, 'test_raw_public_id');

    _uploadDeps.cloudinary.uploader = originalUploader;
  });

  await asyncTest('8. uploadCatalogueStreamToCloudinary rejects when uploadStream emits error', async () => {
    const validPdfBuffer = Buffer.from('%PDF-1.7 Test PDF');
    const originalUploader = _uploadDeps.cloudinary.uploader;

    _uploadDeps.cloudinary.uploader = {
      upload_stream: (options, callback) => {
        const writable = new PassThrough();
        setImmediate(() => {
          callback(new Error('Cloudinary socket timeout'));
        });
        return writable;
      }
    };

    await assert.rejects(
      async () => uploadCatalogueStreamToCloudinary(validPdfBuffer, 'err.pdf', 'application/pdf'),
      /Cloudinary socket timeout/
    );

    _uploadDeps.cloudinary.uploader = originalUploader;
  });

  // =========================================================================
  // SECTION 3: Catalogue Service Lifecycle & Transactional Integrity
  // =========================================================================
  console.log('\n--- SECTION 3: Service Lifecycle & Transactional Integrity ---');

  await asyncTest('9. uploadCataloguePdf rejects when file object or buffer is missing', async () => {
    await assert.rejects(
      async () => settingService.uploadCataloguePdf(null),
      /No PDF file was provided/i
    );
    await assert.rejects(
      async () => settingService.uploadCataloguePdf({}),
      /No PDF file was provided/i
    );
  });

  await asyncTest('10. uploadCataloguePdf rejects when buffer fails magic byte check', async () => {
    const invalidFile = {
      buffer: Buffer.from('NOT_A_PDF_FILE'),
      originalname: 'fake.pdf',
      mimetype: 'application/pdf',
      size: 14,
    };
    await assert.rejects(
      async () => settingService.uploadCataloguePdf(invalidFile),
      /File signature does not match PDF specification/i
    );
  });

  await asyncTest('11. uploadCataloguePdf uploads to cloudinary stream passing folder "lux-based-industry/catalogues"', async () => {
    const validPdfFile = {
      buffer: Buffer.from('%PDF-1.7\nSample content'),
      originalname: 'lbi_catalogue_2026.pdf',
      mimetype: 'application/pdf',
      size: 25,
    };

    const origUploadStream = settingService._deps.uploadCatalogueStreamToCloudinary;
    const origSiteSetting = settingService._deps.SiteSetting;

    settingService._deps.uploadCatalogueStreamToCloudinary = async (buf, name, mime) => ({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/catalogue.pdf',
      publicId: 'lux-based-industry/catalogues/test_id',
      resourceType: 'image',
      bytes: buf.length,
      format: 'pdf',
      filename: name,
      mimeType: mime,
    });

    settingService._deps.SiteSetting = {
      findOne: async () => ({
        _id: 'setting-1',
        brandName: 'LUX BASED INDUSTRY',
        catalogue: null,
        catalogueUrl: '',
      }),
      findByIdAndUpdate: async (id, update) => ({
        _id: id,
        ...update.$set,
      }),
    };

    const result = await settingService.uploadCataloguePdf(validPdfFile);
    assert.equal(result.publicId, 'lux-based-industry/catalogues/test_id');
    assert.equal(result.resourceType, 'image');

    // Restore
    settingService._deps.uploadCatalogueStreamToCloudinary = origUploadStream;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  await asyncTest('12. uploadCataloguePdf updates SiteSetting with complete catalogue metadata', async () => {
    const validPdfFile = {
      buffer: Buffer.from('%PDF-1.7\nSample content'),
      originalname: 'lbi_2026.pdf',
      mimetype: 'application/pdf',
      size: 1000,
    };

    const origUploadStream = settingService._deps.uploadCatalogueStreamToCloudinary;
    const origSiteSetting = settingService._deps.SiteSetting;

    let savedData = null;

    settingService._deps.uploadCatalogueStreamToCloudinary = async (buf, name, mime) => ({
      url: 'https://res.cloudinary.com/demo/image/upload/v123/lbi_2026.pdf',
      publicId: 'lux-based-industry/catalogues/lbi_2026',
      resourceType: 'image',
      bytes: 1000,
      format: 'pdf',
      filename: name,
      mimeType: mime,
    });

    settingService._deps.SiteSetting = {
      findOne: async () => ({
        _id: 'setting-1',
        brandName: 'LUX BASED INDUSTRY',
        catalogue: null,
        catalogueUrl: '',
      }),
      findByIdAndUpdate: async (id, update) => {
        savedData = update.$set;
        return { _id: id, ...update.$set };
      },
    };

    const result = await settingService.uploadCataloguePdf(validPdfFile);

    assert.ok(savedData.catalogue, 'catalogue subdoc should be set');
    assert.equal(savedData.catalogue.url, 'https://res.cloudinary.com/demo/image/upload/v123/lbi_2026.pdf');
    assert.equal(savedData.catalogue.publicId, 'lux-based-industry/catalogues/lbi_2026');
    assert.equal(savedData.catalogue.resourceType, 'image');
    assert.equal(savedData.catalogue.originalFilename, 'lbi_2026.pdf');
    assert.equal(savedData.catalogue.bytes, 1000);
    assert.equal(savedData.catalogue.mimeType, 'application/pdf');
    assert.ok(savedData.catalogue.updatedAt instanceof Date);

    // Restore
    settingService._deps.uploadCatalogueStreamToCloudinary = origUploadStream;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  await asyncTest('13. uploadCataloguePdf maintains backward compatibility by synchronizing catalogueUrl', async () => {
    const validPdfFile = {
      buffer: Buffer.from('%PDF-1.7\nSample content'),
      originalname: 'cat.pdf',
      mimetype: 'application/pdf',
      size: 50,
    };

    const origUploadStream = settingService._deps.uploadCatalogueStreamToCloudinary;
    const origSiteSetting = settingService._deps.SiteSetting;

    let savedData = null;
    settingService._deps.uploadCatalogueStreamToCloudinary = async () => ({
      url: 'https://cdn.example.com/sync_test.pdf',
      publicId: 'sync_test_id',
      resourceType: 'image',
    });

    settingService._deps.SiteSetting = {
      findOne: async () => ({ _id: 'setting-1' }),
      findByIdAndUpdate: async (id, update) => {
        savedData = update.$set;
        return { _id: id, ...update.$set };
      },
    };

    await settingService.uploadCataloguePdf(validPdfFile);
    assert.equal(savedData.catalogueUrl, 'https://cdn.example.com/sync_test.pdf');

    // Restore
    settingService._deps.uploadCatalogueStreamToCloudinary = origUploadStream;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  await asyncTest('14. uploadCataloguePdf destroys old Cloudinary asset with its exact stored resourceType upon DB save success', async () => {
    const validPdfFile = {
      buffer: Buffer.from('%PDF-1.7\nReplacement PDF'),
      originalname: 'new.pdf',
      mimetype: 'application/pdf',
      size: 80,
    };

    const origUploadStream = settingService._deps.uploadCatalogueStreamToCloudinary;
    const origDeleteCloudinaryAsset = settingService._deps.deleteCloudinaryAsset;
    const origSiteSetting = settingService._deps.SiteSetting;

    let destroyedPublicId = null;
    let destroyedOptions = null;

    settingService._deps.deleteCloudinaryAsset = async (publicId, options) => {
      destroyedPublicId = publicId;
      destroyedOptions = options;
    };

    settingService._deps.uploadCatalogueStreamToCloudinary = async () => ({
      url: 'https://cdn.example.com/new.pdf',
      publicId: 'new_public_id',
      resourceType: 'image',
    });

    // Existing catalogue had resourceType: 'raw'
    settingService._deps.SiteSetting = {
      findOne: async () => ({
        _id: 'setting-1',
        catalogue: {
          publicId: 'old_legacy_catalogue_id',
          resourceType: 'raw',
          url: 'https://cdn.example.com/old.pdf',
        },
        catalogueUrl: 'https://cdn.example.com/old.pdf',
      }),
      findByIdAndUpdate: async (id, update) => ({
        _id: id,
        ...update.$set,
      }),
    };

    await settingService.uploadCataloguePdf(validPdfFile);

    assert.equal(destroyedPublicId, 'old_legacy_catalogue_id');
    assert.deepEqual(destroyedOptions, { resource_type: 'raw' });

    // Restore
    settingService._deps.uploadCatalogueStreamToCloudinary = origUploadStream;
    settingService._deps.deleteCloudinaryAsset = origDeleteCloudinaryAsset;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  await asyncTest('15. uploadCataloguePdf does not attempt to destroy old asset if none existed previously', async () => {
    const validPdfFile = {
      buffer: Buffer.from('%PDF-1.7\nFresh PDF'),
      originalname: 'fresh.pdf',
      mimetype: 'application/pdf',
      size: 80,
    };

    const origUploadStream = settingService._deps.uploadCatalogueStreamToCloudinary;
    const origDeleteCloudinaryAsset = settingService._deps.deleteCloudinaryAsset;
    const origSiteSetting = settingService._deps.SiteSetting;

    let destroyCalled = false;
    settingService._deps.deleteCloudinaryAsset = async () => {
      destroyCalled = true;
    };

    settingService._deps.uploadCatalogueStreamToCloudinary = async () => ({
      url: 'https://cdn.example.com/fresh.pdf',
      publicId: 'fresh_id',
      resourceType: 'image',
    });

    settingService._deps.SiteSetting = {
      findOne: async () => ({
        _id: 'setting-1',
        catalogue: null,
        catalogueUrl: '',
      }),
      findByIdAndUpdate: async (id, update) => ({ _id: id, ...update.$set }),
    };

    await settingService.uploadCataloguePdf(validPdfFile);
    assert.equal(destroyCalled, false, 'deleteCloudinaryAsset should not be called when no old catalogue existed');

    // Restore
    settingService._deps.uploadCatalogueStreamToCloudinary = origUploadStream;
    settingService._deps.deleteCloudinaryAsset = origDeleteCloudinaryAsset;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  await asyncTest('16. uploadCataloguePdf transactional rollback: if DB save fails, immediately destroys newly uploaded asset', async () => {
    const validPdfFile = {
      buffer: Buffer.from('%PDF-1.7\nRollback PDF'),
      originalname: 'rollback.pdf',
      mimetype: 'application/pdf',
      size: 90,
    };

    const origUploadStream = settingService._deps.uploadCatalogueStreamToCloudinary;
    const origDeleteCloudinaryAsset = settingService._deps.deleteCloudinaryAsset;
    const origSiteSetting = settingService._deps.SiteSetting;

    let rolledBackId = null;
    let rolledBackOpts = null;

    settingService._deps.uploadCatalogueStreamToCloudinary = async () => ({
      url: 'https://cdn.example.com/rollback.pdf',
      publicId: 'new_orphan_to_cleanup',
      resourceType: 'image',
    });

    settingService._deps.deleteCloudinaryAsset = async (publicId, opts) => {
      rolledBackId = publicId;
      rolledBackOpts = opts;
    };

    settingService._deps.SiteSetting = {
      findOne: async () => ({
        _id: 'setting-1',
        catalogue: { publicId: 'safe_old_id', resourceType: 'image' },
      }),
      findByIdAndUpdate: async () => {
        throw new Error('Mongo write error: disk full');
      },
    };

    await assert.rejects(
      async () => settingService.uploadCataloguePdf(validPdfFile),
      /Mongo write error: disk full/
    );

    assert.equal(rolledBackId, 'new_orphan_to_cleanup', 'Newly uploaded asset must be destroyed if DB save fails');
    assert.deepEqual(rolledBackOpts, { resource_type: 'image' });

    // Restore
    settingService._deps.uploadCatalogueStreamToCloudinary = origUploadStream;
    settingService._deps.deleteCloudinaryAsset = origDeleteCloudinaryAsset;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  await asyncTest('17. uploadCataloguePdf transactional rollback: if DB save fails, old asset remains untouched (NOT destroyed)', async () => {
    const validPdfFile = {
      buffer: Buffer.from('%PDF-1.7\nRollback Test'),
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 50,
    };

    const origUploadStream = settingService._deps.uploadCatalogueStreamToCloudinary;
    const origDeleteCloudinaryAsset = settingService._deps.deleteCloudinaryAsset;
    const origSiteSetting = settingService._deps.SiteSetting;

    const destroyedIds = [];
    settingService._deps.uploadCatalogueStreamToCloudinary = async () => ({
      url: 'https://cdn.example.com/new.pdf',
      publicId: 'new_id',
      resourceType: 'image',
    });

    settingService._deps.deleteCloudinaryAsset = async (publicId) => {
      destroyedIds.push(publicId);
    };

    settingService._deps.SiteSetting = {
      findOne: async () => ({
        _id: 'setting-1',
        catalogue: { publicId: 'old_precious_asset_id', resourceType: 'image' },
      }),
      findByIdAndUpdate: async () => {
        throw new Error('Database connection timed out');
      },
    };

    await assert.rejects(
      async () => settingService.uploadCataloguePdf(validPdfFile),
      /Database connection timed out/
    );

    assert.ok(destroyedIds.includes('new_id'), 'new_id should be rolled back');
    assert.equal(destroyedIds.includes('old_precious_asset_id'), false, 'old asset MUST NOT be destroyed if DB save fails');

    // Restore
    settingService._deps.uploadCatalogueStreamToCloudinary = origUploadStream;
    settingService._deps.deleteCloudinaryAsset = origDeleteCloudinaryAsset;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  await asyncTest('18. uploadCataloguePdf propagates DB error properly after rolling back new asset', async () => {
    const validPdfFile = {
      buffer: Buffer.from('%PDF-1.7\nSample'),
      originalname: 'sample.pdf',
      mimetype: 'application/pdf',
      size: 30,
    };

    const origUploadStream = settingService._deps.uploadCatalogueStreamToCloudinary;
    const origDeleteCloudinaryAsset = settingService._deps.deleteCloudinaryAsset;
    const origSiteSetting = settingService._deps.SiteSetting;

    settingService._deps.uploadCatalogueStreamToCloudinary = async () => ({
      url: 'https://cdn.example.com/sample.pdf',
      publicId: 'sample_id',
      resourceType: 'image',
    });
    settingService._deps.deleteCloudinaryAsset = async () => {};

    settingService._deps.SiteSetting = {
      findOne: async () => ({ _id: 'setting-1' }),
      findByIdAndUpdate: async () => {
        throw new Error('E11000 duplicate key error');
      },
    };

    await assert.rejects(
      async () => settingService.uploadCataloguePdf(validPdfFile),
      /E11000 duplicate key error/
    );

    // Restore
    settingService._deps.uploadCatalogueStreamToCloudinary = origUploadStream;
    settingService._deps.deleteCloudinaryAsset = origDeleteCloudinaryAsset;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  // =========================================================================
  // SECTION 4: Catalogue Deletion & Idempotency
  // =========================================================================
  console.log('\n--- SECTION 4: Catalogue Deletion & Idempotency ---');

  await asyncTest('19. deleteCataloguePdf resets catalogue subdocument fields to null/empty in DB', async () => {
    const origDeleteCloudinaryAsset = settingService._deps.deleteCloudinaryAsset;
    const origSiteSetting = settingService._deps.SiteSetting;

    let updatedFields = null;

    settingService._deps.deleteCloudinaryAsset = async () => {};
    settingService._deps.SiteSetting = {
      findOne: async () => ({
        _id: 'setting-1',
        catalogue: {
          url: 'https://cdn.example.com/cat.pdf',
          publicId: 'del_id',
          resourceType: 'image',
        },
      }),
      findByIdAndUpdate: async (id, update) => {
        updatedFields = update.$set;
        return { _id: id, ...update.$set };
      },
    };

    await settingService.deleteCataloguePdf();

    assert.ok(updatedFields.catalogue);
    assert.equal(updatedFields.catalogue.url, '');
    assert.equal(updatedFields.catalogue.publicId, '');
    assert.equal(updatedFields.catalogue.resourceType, 'image');
    assert.equal(updatedFields.catalogue.originalFilename, '');
    assert.equal(updatedFields.catalogue.bytes, 0);

    // Restore
    settingService._deps.deleteCloudinaryAsset = origDeleteCloudinaryAsset;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  await asyncTest('20. deleteCataloguePdf resets legacy catalogueUrl to empty string', async () => {
    const origDeleteCloudinaryAsset = settingService._deps.deleteCloudinaryAsset;
    const origSiteSetting = settingService._deps.SiteSetting;

    let updatedFields = null;
    settingService._deps.deleteCloudinaryAsset = async () => {};
    settingService._deps.SiteSetting = {
      findOne: async () => ({
        _id: 'setting-1',
        catalogue: { publicId: 'cat_id' },
        catalogueUrl: 'https://cdn.example.com/cat.pdf',
      }),
      findByIdAndUpdate: async (id, update) => {
        updatedFields = update.$set;
        return { _id: id, ...update.$set };
      },
    };

    await settingService.deleteCataloguePdf();
    assert.equal(updatedFields.catalogueUrl, '');

    // Restore
    settingService._deps.deleteCloudinaryAsset = origDeleteCloudinaryAsset;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  await asyncTest('21. deleteCataloguePdf destroys Cloudinary asset using its exact stored resourceType', async () => {
    const origDeleteCloudinaryAsset = settingService._deps.deleteCloudinaryAsset;
    const origSiteSetting = settingService._deps.SiteSetting;

    let destroyedPublicId = null;
    let destroyedOpts = null;

    settingService._deps.deleteCloudinaryAsset = async (id, opts) => {
      destroyedPublicId = id;
      destroyedOpts = opts;
    };

    settingService._deps.SiteSetting = {
      findOne: async () => ({
        _id: 'setting-1',
        catalogue: {
          publicId: 'stored_raw_public_id',
          resourceType: 'raw',
        },
      }),
      findByIdAndUpdate: async (id, update) => ({ _id: id, ...update.$set }),
    };

    await settingService.deleteCataloguePdf();

    assert.equal(destroyedPublicId, 'stored_raw_public_id');
    assert.deepEqual(destroyedOpts, { resource_type: 'raw' });

    // Restore
    settingService._deps.deleteCloudinaryAsset = origDeleteCloudinaryAsset;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  await asyncTest('22. deleteCataloguePdf is idempotent: succeeds with no error and does not call destroyAsset if no catalogue exists', async () => {
    const origDeleteCloudinaryAsset = settingService._deps.deleteCloudinaryAsset;
    const origSiteSetting = settingService._deps.SiteSetting;

    let destroyCalled = false;
    settingService._deps.deleteCloudinaryAsset = async () => {
      destroyCalled = true;
    };

    settingService._deps.SiteSetting = {
      findOne: async () => ({
        _id: 'setting-1',
        catalogue: null,
        catalogueUrl: '',
      }),
      findByIdAndUpdate: async (id, update) => ({ _id: id, ...update.$set }),
    };

    const result = await settingService.deleteCataloguePdf();
    assert.equal(destroyCalled, false);
    assert.equal(result.success, true);

    // Restore
    settingService._deps.deleteCloudinaryAsset = origDeleteCloudinaryAsset;
    settingService._deps.SiteSetting = origSiteSetting;
  });

  // =========================================================================
  // SECTION 5: SiteSetting Auto-healing & Legacy Compatibility
  // =========================================================================
  console.log('\n--- SECTION 5: SiteSetting Auto-healing & Legacy Compatibility ---');

  await asyncTest('23. getSiteSettings auto-heals missing catalogue subdocument with default schema structure', async () => {
    const origFindOne = SiteSetting.findOne;

    // Simulate record in DB with null catalogue
    SiteSetting.findOne = async () => ({
      _id: 'setting-1',
      brandName: 'LUX BASED INDUSTRY',
      email: 'luxbasedindustries@gmail.com',
      catalogue: null,
      catalogueUrl: '',
      toObject: function() { return { ...this }; },
    });

    const settings = await settingService.getSiteSettings();
    assert.ok(settings.catalogue !== null && typeof settings.catalogue === 'object');
    assert.equal(settings.catalogue.url, '');
    assert.equal(settings.catalogue.publicId, '');
    assert.equal(settings.catalogue.resourceType, 'image');

    // Restore
    SiteSetting.findOne = origFindOne;
  });

  await asyncTest('24. getSiteSettings synchronizes legacy catalogueUrl when catalogue.url is present', async () => {
    const origFindOne = SiteSetting.findOne;

    SiteSetting.findOne = async () => ({
      _id: 'setting-1',
      brandName: 'LUX BASED INDUSTRY',
      catalogue: {
        url: 'https://cdn.example.com/authoritative.pdf',
        publicId: 'authoritative_id',
      },
      catalogueUrl: '',
      toObject: function() { return { ...this }; },
    });

    const settings = await settingService.getSiteSettings();
    assert.equal(settings.catalogueUrl, 'https://cdn.example.com/authoritative.pdf');

    // Restore
    SiteSetting.findOne = origFindOne;
  });

  await asyncTest('25. getSiteSettings sanitizes any legacy Veloura references in default settings', async () => {
    const origFindOne = SiteSetting.findOne;
    const origCreate = SiteSetting.create;

    // Simulate empty DB triggering default creation
    SiteSetting.findOne = async () => null;
    SiteSetting.create = async (doc) => ({ ...doc, toObject: () => ({ ...doc }) });

    const settings = await settingService.getSiteSettings();
    assert.equal(settings.brandName, 'LUX BASED INDUSTRY');
    assert.equal(settings.email, 'luxbasedindustries@gmail.com');
    assert.equal(/veloura/i.test(JSON.stringify(settings)), false, 'Default settings must not contain any Veloura string');

    // Restore
    SiteSetting.findOne = origFindOne;
    SiteSetting.create = origCreate;
  });

  // =========================================================================
  // SECTION 6: Controller Endpoints & API Responses
  // =========================================================================
  console.log('\n--- SECTION 6: Controller Endpoints & API Responses ---');

  await asyncTest('26. getCatalogue returns 200 with catalogue metadata when catalogue exists', async () => {
    const origSettingService = settingController._deps.settingService;

    settingController._deps.settingService = {
      getSiteSettings: async () => ({
        brandName: 'LUX BASED INDUSTRY',
        catalogue: {
          url: 'https://cdn.example.com/lbi_cat.pdf',
          originalFilename: 'lbi_cat.pdf',
          bytes: 12345,
          updatedAt: new Date(),
        },
        catalogueUrl: 'https://cdn.example.com/lbi_cat.pdf',
      }),
    };

    const req = {};
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status: (code) => {
        statusSent = code;
        return res;
      },
      json: (data) => {
        jsonSent = data;
        return res;
      },
    };

    await settingController.getCatalogue(req, res, () => {});

    assert.equal(statusSent, 200);
    assert.equal(jsonSent.success, true);
    assert.equal(jsonSent.data.available, true);
    assert.equal(jsonSent.data.url, 'https://cdn.example.com/lbi_cat.pdf');
    assert.equal(jsonSent.data.filename, 'lbi_cat.pdf');
    assert.equal(jsonSent.data.bytes, 12345);

    // Restore
    settingController._deps.settingService = origSettingService;
  });

  await asyncTest('27. getCatalogue returns 200 with available: false when catalogue is not configured', async () => {
    const origSettingService = settingController._deps.settingService;

    settingController._deps.settingService = {
      getSiteSettings: async () => ({
        brandName: 'LUX BASED INDUSTRY',
        catalogue: null,
        catalogueUrl: '',
      }),
    };

    const req = {};
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status: (code) => {
        statusSent = code;
        return res;
      },
      json: (data) => {
        jsonSent = data;
        return res;
      },
    };

    await settingController.getCatalogue(req, res, () => {});

    assert.equal(statusSent, 200);
    assert.equal(jsonSent.success, true);
    assert.equal(jsonSent.data.available, false);
    assert.equal(jsonSent.data.url, '');

    // Restore
    settingController._deps.settingService = origSettingService;
  });

  await asyncTest('28. uploadCatalogue returns 400 when no file is uploaded (req.file missing)', async () => {
    const req = { file: null };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status: (code) => {
        statusSent = code;
        return res;
      },
      json: (data) => {
        jsonSent = data;
        return res;
      },
    };

    await settingController.uploadCatalogue(req, res, () => {});

    assert.equal(statusSent, 400);
    assert.equal(jsonSent.success, false);
    assert.match(jsonSent.message, /No PDF file was provided in the upload request/i);
  });

  await asyncTest('29. uploadCatalogue calls uploadCataloguePdf and returns 200 with result', async () => {
    const origSettingService = settingController._deps.settingService;

    settingController._deps.settingService = {
      uploadCataloguePdf: async (file) => ({
        url: 'https://cdn.example.com/uploaded.pdf',
        originalFilename: file.originalname,
      }),
    };

    const req = {
      file: {
        originalname: 'architectural_2026.pdf',
        buffer: Buffer.from('%PDF-1.7'),
      },
    };

    let statusSent = null;
    let jsonSent = null;

    const res = {
      status: (code) => {
        statusSent = code;
        return res;
      },
      json: (data) => {
        jsonSent = data;
        return res;
      },
    };

    await settingController.uploadCatalogue(req, res, () => {});

    assert.equal(statusSent, 201);
    assert.equal(jsonSent.success, true);
    assert.equal(jsonSent.data.catalogue.originalFilename, 'architectural_2026.pdf');

    // Restore
    settingController._deps.settingService = origSettingService;
  });

  await asyncTest('30. deleteCatalogue calls deleteCataloguePdf and returns 200 with success message', async () => {
    const origSettingService = settingController._deps.settingService;

    settingController._deps.settingService = {
      deleteCataloguePdf: async () => ({
        success: true,
        message: 'Catalogue removed successfully.',
      }),
    };

    const req = {};
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status: (code) => {
        statusSent = code;
        return res;
      },
      json: (data) => {
        jsonSent = data;
        return res;
      },
    };

    await settingController.deleteCatalogue(req, res, () => {});

    assert.equal(statusSent, 200);
    assert.equal(jsonSent.success, true);
    assert.match(jsonSent.message, /removed successfully/i);

    // Restore
    settingController._deps.settingService = origSettingService;
  });

  // =========================================================================
  // SECTION 7: Frontend SEO Download URL & WhatsApp Fallback Authority
  // =========================================================================
  console.log('\n--- SECTION 7: Frontend Download URL & WhatsApp Fallback ---');

  test('31. getCatalogueDownloadUrl injects fl_attachment correctly into Cloudinary URLs', () => {
    const cdnUrl = 'https://res.cloudinary.com/demo/image/upload/v123456789/lux-based-industry/catalogues/official.pdf';
    const downloadUrl = getCatalogueDownloadUrl(cdnUrl);

    assert.ok(downloadUrl.includes('/upload/fl_attachment:'), `Should contain /upload/fl_attachment: but was: ${downloadUrl}`);
    assert.equal(
      downloadUrl,
      'https://res.cloudinary.com/demo/image/upload/fl_attachment:LUX_BASED_INDUSTRY_Catalogue_2026.pdf/v123456789/lux-based-industry/catalogues/official.pdf'
    );
  });

  test('32. getCatalogueDownloadUrl preserves custom filename in fl_attachment:filename', () => {
    const cdnUrl = 'https://res.cloudinary.com/demo/raw/upload/v123456789/official.pdf';
    const downloadUrl = getCatalogueDownloadUrl(cdnUrl, 'Custom_Catalogue.pdf');

    assert.ok(downloadUrl.includes('/upload/fl_attachment:Custom_Catalogue.pdf/'));
  });

  test('33. getCatalogueDownloadUrl returns raw URL without modification if not a Cloudinary URL', () => {
    const externalUrl = 'https://storage.googleapis.com/my-bucket/catalogue.pdf';
    const res = getCatalogueDownloadUrl(externalUrl);
    assert.equal(res, externalUrl);
  });

  test('34. getCatalogueDownloadUrl returns empty string if input URL is empty or null', () => {
    assert.equal(getCatalogueDownloadUrl(''), '');
    assert.equal(getCatalogueDownloadUrl(null), '');
    assert.equal(getCatalogueDownloadUrl(undefined), '');
  });

  test('35. getCatalogueWhatsAppMessage generates luxury LBI message and CTA fallback redirects to /contact if WhatsApp is unconfigured', () => {
    const msg = getCatalogueWhatsAppMessage('LUX BASED INDUSTRY');
    assert.ok(msg.includes('LUX BASED INDUSTRY'), 'WhatsApp message must include LUX BASED INDUSTRY');
    assert.ok(msg.includes('catalogue PDF'), 'WhatsApp message must request catalogue PDF');
    assert.equal(/veloura/i.test(msg), false, 'WhatsApp message must not contain Veloura');

    // Authority / Fallback logic simulation as implemented in CatalogueCTA.jsx:
    function resolveCtaLink(settings, pageBuilderBtnUrl) {
      const catalogueUrl = settings?.catalogue?.url || settings?.catalogueUrl || '';
      const hasCatalogue = Boolean(catalogueUrl);
      const whatsappNumber = settings?.whatsappNumberClean || '';
      const whatsappFallbackUrl = whatsappNumber 
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(getCatalogueWhatsAppMessage(settings?.brandName))}`
        : '/contact';

      // Authority: Global catalogue always takes precedence over page builder custom link
      return hasCatalogue ? getCatalogueDownloadUrl(catalogueUrl) : whatsappFallbackUrl;
    }

    // Case A: Catalogue present -> forced download URL (Page Builder cannot override)
    const linkWithCatalogue = resolveCtaLink(
      {
        catalogue: { url: 'https://res.cloudinary.com/demo/image/upload/v1/cat.pdf' },
        whatsappNumberClean: '971501234567',
      },
      'https://some-stale-link.com'
    );
    assert.ok(linkWithCatalogue.includes('/upload/fl_attachment:'), 'Must use download URL when catalogue exists');
    assert.equal(linkWithCatalogue.includes('some-stale-link.com'), false, 'Page Builder link cannot override official catalogue');

    // Case B: Catalogue absent, WhatsApp configured -> WhatsApp concierge link
    const linkWithWhatsApp = resolveCtaLink(
      {
        catalogue: null,
        brandName: 'LUX BASED INDUSTRY',
        whatsappNumberClean: '971501234567',
      },
      'https://some-stale-link.com'
    );
    assert.ok(linkWithWhatsApp.startsWith('https://wa.me/971501234567?text='), 'Must redirect to WhatsApp fallback');

    // Case C: Catalogue absent, WhatsApp UNCONFIGURED -> graceful /contact fallback (never #)
    const linkWithoutWhatsApp = resolveCtaLink(
      {
        catalogue: null,
        brandName: 'LUX BASED INDUSTRY',
        whatsappNumberClean: '',
      },
      '#'
    );
    assert.equal(linkWithoutWhatsApp, '/contact', 'Must fall back safely to /contact if WhatsApp is unconfigured');
  });

  // Summary
  console.log('\n========================================================');
  console.log(`   PHASE 5B CATALOGUE TESTS COMPLETED`);
  console.log(`   ${passCount} / ${passCount + failCount} tests passed`);
  console.log(`   FAILED: ${failCount}`);
  console.log('========================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runAll().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
