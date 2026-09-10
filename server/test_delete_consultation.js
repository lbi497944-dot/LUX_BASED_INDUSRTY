// Configure mock environment for testing Cloudinary integration BEFORE importing modules
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = 'test_key';
process.env.CLOUDINARY_API_SECRET = 'test_secret';

const { v2: cloudinary } = await import('cloudinary');
const { default: Consultation } = await import('./src/models/Consultation.js');
const { deleteConsultation } = await import('./src/services/consultationService.js');

async function runConsultationDeletionTests() {
  console.log('========================================================');
  console.log('  CONSULTATION DELETION & CLOUDINARY CLEANUP TESTS');
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

  // Backup original methods
  const originalFindById = Consultation.findById;
  const originalFindByIdAndDelete = Consultation.findByIdAndDelete;
  const originalDestroy = cloudinary.uploader.destroy;

  try {
    // ----------------------------------------------------
    // TEST 1: Consultation has one attachment with publicId
    // Expected: deleteCloudinaryAsset called once with that publicId, consultation deleted
    // ----------------------------------------------------
    {
      const destroyedAssets = [];
      let deletedId = null;

      Consultation.findById = async (id) => ({
        _id: id,
        fullName: 'VIP Client 1',
        attachments: [
          { url: 'https://res.cloudinary.com/demo/image/upload/v1/blueprints/floorplan1.pdf', publicId: 'blueprints/floorplan1' }
        ]
      });

      Consultation.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await deleteConsultation('consult-123');

      const pass = (
        destroyedAssets.length === 1 &&
        destroyedAssets[0] === 'blueprints/floorplan1' &&
        deletedId === 'consult-123' &&
        result._id === 'consult-123'
      );
      record('TEST 1: Single attachment with publicId triggers Cloudinary destroy and deletes DB record', pass, `destroyed: ${JSON.stringify(destroyedAssets)}, deletedId: ${deletedId}`);
    }

    // ----------------------------------------------------
    // TEST 2: Consultation has multiple attachments with publicIds
    // Expected: cleanup called for each publicId, consultation deleted
    // ----------------------------------------------------
    {
      const destroyedAssets = [];
      let deletedId = null;

      Consultation.findById = async (id) => ({
        _id: id,
        fullName: 'VIP Client 2',
        attachments: [
          { url: 'https://res.cloudinary.com/demo/image/upload/v1/blueprints/f1.pdf', publicId: 'blueprints/f1' },
          { url: 'https://res.cloudinary.com/demo/image/upload/v1/blueprints/f2.pdf', publicId: 'blueprints/f2' },
          { url: 'https://res.cloudinary.com/demo/image/upload/v1/blueprints/f3.pdf', publicId: 'blueprints/f3' },
        ]
      });

      Consultation.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await deleteConsultation('consult-456');

      const pass = (
        destroyedAssets.length === 3 &&
        destroyedAssets[0] === 'blueprints/f1' &&
        destroyedAssets[1] === 'blueprints/f2' &&
        destroyedAssets[2] === 'blueprints/f3' &&
        deletedId === 'consult-456' &&
        result._id === 'consult-456'
      );
      record('TEST 2: Multiple attachments with publicIds trigger Cloudinary cleanup for each and delete DB record', pass, `destroyed: ${JSON.stringify(destroyedAssets)}, deletedId: ${deletedId}`);
    }

    // ----------------------------------------------------
    // TEST 3: Consultation has attachments without publicId
    // Expected: Cloudinary cleanup is NOT called, consultation deleted
    // ----------------------------------------------------
    {
      const destroyedAssets = [];
      let deletedId = null;

      Consultation.findById = async (id) => ({
        _id: id,
        fullName: 'VIP Client 3',
        attachments: [
          { url: 'https://external-cdn.com/legacy_floorplan.pdf', publicId: '' },
          { url: 'https://unsplash.com/photos/123.jpg' }, // missing publicId entirely
          { url: 'https://external.com/empty_public_id.pdf', publicId: '   ' } // whitespace
        ]
      });

      Consultation.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await deleteConsultation('consult-789');

      const pass = (
        destroyedAssets.length === 0 &&
        deletedId === 'consult-789' &&
        result._id === 'consult-789'
      );
      record('TEST 3: Attachments without publicId bypass Cloudinary cleanup and delete DB record', pass, `destroyed: ${JSON.stringify(destroyedAssets)}, deletedId: ${deletedId}`);
    }

    // ----------------------------------------------------
    // TEST 4: Consultation has no attachments
    // Expected: consultation deleted, no Cloudinary call
    // ----------------------------------------------------
    {
      const destroyedAssets = [];
      let deletedId = null;

      Consultation.findById = async (id) => ({
        _id: id,
        fullName: 'VIP Client 4',
        attachments: []
      });

      Consultation.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await deleteConsultation('consult-empty');

      const pass = (
        destroyedAssets.length === 0 &&
        deletedId === 'consult-empty' &&
        result._id === 'consult-empty'
      );
      record('TEST 4: Consultation with empty attachments deletes DB record with no Cloudinary call', pass, `destroyed: ${JSON.stringify(destroyedAssets)}, deletedId: ${deletedId}`);
    }

    // ----------------------------------------------------
    // TEST 5: Consultation does not exist
    // Expected: preserve existing not-found behavior (throw 404), no Cloudinary call
    // ----------------------------------------------------
    {
      const destroyedAssets = [];
      let findByIdAndDeleteCalled = false;
      let caughtError = null;

      Consultation.findById = async () => null;

      Consultation.findByIdAndDelete = async () => {
        findByIdAndDeleteCalled = true;
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      try {
        await deleteConsultation('non-existent-id');
      } catch (err) {
        caughtError = err;
      }

      const pass = (
        destroyedAssets.length === 0 &&
        findByIdAndDeleteCalled === false &&
        caughtError !== null &&
        caughtError.statusCode === 404 &&
        caughtError.message.includes('Consultation request not found with id: non-existent-id')
      );
      record('TEST 5: Non-existent consultation throws 404 without Cloudinary or DB delete call', pass, `error: ${caughtError?.message}, statusCode: ${caughtError?.statusCode}`);
    }

    // ----------------------------------------------------
    // TEST 6: Cloudinary cleanup fails
    // Expected: consultation still gets deleted, API does not fail solely because of Cloudinary cleanup
    // ----------------------------------------------------
    {
      const destroyedAttempts = [];
      let deletedId = null;
      let deleteConsultationThrew = false;

      Consultation.findById = async (id) => ({
        _id: id,
        fullName: 'VIP Client 6',
        attachments: [
          { url: 'https://res.cloudinary.com/demo/image/upload/v1/blueprint.pdf', publicId: 'blueprint_fail_test' }
        ]
      });

      Consultation.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      // Force destroy to fail / throw network error
      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAttempts.push(publicId);
        throw new Error('ECONNRESET: Cloudinary API unreachable');
      };

      let result = null;
      try {
        result = await deleteConsultation('consult-error-id');
      } catch {
        deleteConsultationThrew = true;
      }

      const pass = (
        destroyedAttempts.length === 1 &&
        destroyedAttempts[0] === 'blueprint_fail_test' &&
        deleteConsultationThrew === false &&
        deletedId === 'consult-error-id' &&
        result?._id === 'consult-error-id'
      );
      record('TEST 6: Cloudinary cleanup failure does not prevent DB deletion or throw 500', pass, `threw: ${deleteConsultationThrew}, deletedId: ${deletedId}`);
    }

    // ----------------------------------------------------
    // TEST 7 (Bonus Edge Case): Mixed attachments (some with publicId, some without)
    // ----------------------------------------------------
    {
      const destroyedAssets = [];
      let deletedId = null;

      Consultation.findById = async (id) => ({
        _id: id,
        fullName: 'VIP Client 7',
        attachments: [
          { url: 'https://external.com/ref.jpg', publicId: '' },
          { url: 'https://res.cloudinary.com/demo/image/upload/v1/valid.pdf', publicId: 'valid_asset_1' },
          null, // null attachment in array
          { url: 'https://res.cloudinary.com/demo/image/upload/v1/valid2.pdf', publicId: 'valid_asset_2' },
        ]
      });

      Consultation.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await deleteConsultation('consult-mixed');

      const pass = (
        destroyedAssets.length === 2 &&
        destroyedAssets[0] === 'valid_asset_1' &&
        destroyedAssets[1] === 'valid_asset_2' &&
        deletedId === 'consult-mixed' &&
        result._id === 'consult-mixed'
      );
      record('TEST 7: Mixed attachments cleanly filters only valid publicIds and deletes DB record', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

  } finally {
    // Restore original methods
    Consultation.findById = originalFindById;
    Consultation.findByIdAndDelete = originalFindByIdAndDelete;
    cloudinary.uploader.destroy = originalDestroy;
  }

  console.log('\n========================================================');
  console.log(`  TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('========================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runConsultationDeletionTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
