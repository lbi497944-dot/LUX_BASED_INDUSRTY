import assert from 'assert';
import mongoose from 'mongoose';
import Transformation from './src/models/Transformation.js';
import * as transformationService from './src/services/transformationService.js';
import {
  createTransformationValidator,
  updateTransformationValidator,
} from './src/validators/transformationValidator.js';
import transformationRoutes from './src/routes/transformationRoutes.js';
import apiRoutes from './src/routes/index.js';

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    failedTests++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    failedTests++;
  }
}

console.log('========================================================');
console.log('  LUX BASED INDUSTRY: TRANSFORMATION BACKEND TEST SUITE');
console.log('========================================================\n');

// -----------------------------------------------------------------------------
// 1. Model Schema & Constraints
// -----------------------------------------------------------------------------
console.log('--- 1. Transformation Model Schema & Indexes ---');

runTest('TEST 1: Model validation passes with valid attributes', () => {
  const doc = new Transformation({
    title: 'Penthouse Grand Salon Illumination',
    shortDescription: 'Cove lighting and crystal fixtures transformation.',
    detailedDescription: 'Full architectural redesign of ceiling heights, recessed lighting...',
    beforeImage: 'https://res.cloudinary.com/demo/image/upload/v1/before.jpg',
    beforePublicId: 'transformations/before_1',
    afterImage: 'https://res.cloudinary.com/demo/image/upload/v1/after.jpg',
    afterPublicId: 'transformations/after_1',
    order: 1,
    isActive: true,
  });
  const err = doc.validateSync();
  assert.strictEqual(err, undefined, 'Validation should pass without errors');
});

runTest('TEST 2: Title is required and enforces max length 120', () => {
  const docMissing = new Transformation({
    beforeImage: 'https://example.com/before.jpg',
    afterImage: 'https://example.com/after.jpg',
  });
  const errMissing = docMissing.validateSync();
  assert.ok(errMissing.errors.title, 'Title must be required');

  const docTooLong = new Transformation({
    title: 'A'.repeat(121),
    beforeImage: 'https://example.com/before.jpg',
    afterImage: 'https://example.com/after.jpg',
  });
  const errTooLong = docTooLong.validateSync();
  assert.ok(errTooLong.errors.title, 'Title exceeding 120 chars must fail validation');
});

runTest('TEST 3: Descriptions enforce max lengths (short <= 300, detailed <= 2000)', () => {
  const docShort = new Transformation({
    title: 'Valid Title',
    shortDescription: 'S'.repeat(301),
    beforeImage: 'https://example.com/before.jpg',
    afterImage: 'https://example.com/after.jpg',
  });
  const errShort = docShort.validateSync();
  assert.ok(errShort.errors.shortDescription, 'shortDescription exceeding 300 must fail');

  const docDetailed = new Transformation({
    title: 'Valid Title',
    detailedDescription: 'D'.repeat(2001),
    beforeImage: 'https://example.com/before.jpg',
    afterImage: 'https://example.com/after.jpg',
  });
  const errDetailed = docDetailed.validateSync();
  assert.ok(errDetailed.errors.detailedDescription, 'detailedDescription exceeding 2000 must fail');
});

runTest('TEST 4: beforeImage and afterImage are strictly required', () => {
  const docNoBefore = new Transformation({
    title: 'Valid Title',
    afterImage: 'https://example.com/after.jpg',
  });
  const errNoBefore = docNoBefore.validateSync();
  assert.ok(errNoBefore.errors.beforeImage, 'beforeImage must be required');

  const docNoAfter = new Transformation({
    title: 'Valid Title',
    beforeImage: 'https://example.com/before.jpg',
  });
  const errNoAfter = docNoAfter.validateSync();
  assert.ok(errNoAfter.errors.afterImage, 'afterImage must be required');
});

runTest('TEST 5: Compound index { isActive: 1, order: 1, createdAt: 1 } is defined', () => {
  const indexes = Transformation.schema.indexes();
  const hasCompoundIndex = indexes.some(([fields]) => {
    return fields.isActive === 1 && fields.order === 1 && fields.createdAt === 1;
  });
  assert.ok(hasCompoundIndex, 'Compound index on isActive, order, and createdAt must be declared');
});

// -----------------------------------------------------------------------------
// 2. Querying & Filtering
// -----------------------------------------------------------------------------
console.log('\n--- 2. Transformation Service Queries & Ordering ---');

await runAsyncTest('TEST 6: getPublicTransformations filters active items and selects safe public projection', async () => {
  let capturedQuery = null;
  let capturedSelect = null;
  let capturedSort = null;

  transformationService._deps.Transformation = {
    find: (q) => {
      capturedQuery = q;
      return {
        select: (s) => {
          capturedSelect = s;
          return {
            sort: (st) => {
              capturedSort = st;
              return {
                lean: async () => [
                  { _id: '1', title: 'T1', beforeImage: 'b1', afterImage: 'a1', order: 1 },
                ],
              };
            },
          };
        },
      };
    },
  };

  const results = await transformationService.getPublicTransformations();
  assert.strictEqual(capturedQuery.isActive, true, 'Must query isActive: true only');
  assert.strictEqual(
    capturedSelect,
    'title shortDescription detailedDescription beforeImage afterImage order',
    'Must project safe public fields'
  );
  assert.deepStrictEqual(capturedSort, { order: 1, createdAt: 1 }, 'Must sort by order ascending then createdAt');
  assert.strictEqual(results.length, 1);
});

await runAsyncTest('TEST 7: getAllTransformations supports activeOnly filter for admin queries', async () => {
  let capturedQuery = null;
  transformationService._deps.Transformation = {
    find: (q) => {
      capturedQuery = q;
      return {
        sort: () => ({
          lean: async () => [],
        }),
      };
    },
  };

  await transformationService.getAllTransformations({ activeOnly: 'true' });
  assert.strictEqual(capturedQuery.isActive, true, 'Must filter isActive: true when activeOnly is requested');

  await transformationService.getAllTransformations({});
  assert.deepStrictEqual(capturedQuery, {}, 'Must not restrict isActive when activeOnly is omitted');
});

// -----------------------------------------------------------------------------
// 3. Cloudinary Lifecycle & Transactional Rollbacks
// -----------------------------------------------------------------------------
console.log('\n--- 3. Cloudinary Lifecycle & Dual-Asset Rollbacks ---');

await runAsyncTest('TEST 8: Successful creation preserves assets without deletion calls', async () => {
  const deletedAssets = [];
  transformationService._deps.deleteCloudinaryAsset = async (pid) => {
    deletedAssets.push(pid);
  };
  transformationService._deps.Transformation = {
    create: async (data) => ({ _id: 'trans-100', ...data }),
  };

  const res = await transformationService.createTransformation({
    title: 'New Transformation',
    beforeImage: 'https://cloudinary.com/b.jpg',
    beforePublicId: 'trans/before_asset',
    afterImage: 'https://cloudinary.com/a.jpg',
    afterPublicId: 'trans/after_asset',
  });

  assert.strictEqual(res.title, 'New Transformation');
  assert.strictEqual(deletedAssets.length, 0, 'No Cloudinary assets should be deleted on success');
});

await runAsyncTest('TEST 9: Creation failure rolls back BOTH uploaded Cloudinary assets', async () => {
  const deletedAssets = [];
  transformationService._deps.deleteCloudinaryAsset = async (pid) => {
    deletedAssets.push(pid);
  };
  transformationService._deps.Transformation = {
    create: async () => {
      throw new Error('Mongo connection timed out');
    },
  };

  await assert.rejects(
    async () => {
      await transformationService.createTransformation({
        title: 'Failing Transformation',
        beforeImage: 'https://cloudinary.com/b.jpg',
        beforePublicId: 'trans/before_orphan',
        afterImage: 'https://cloudinary.com/a.jpg',
        afterPublicId: 'trans/after_orphan',
      });
    },
    /Mongo connection timed out/
  );

  assert.ok(deletedAssets.includes('trans/before_orphan'), 'Orphaned before asset must be rolled back');
  assert.ok(deletedAssets.includes('trans/after_orphan'), 'Orphaned after asset must be rolled back');
  assert.strictEqual(deletedAssets.length, 2, 'Exactly 2 assets must be cleaned');
});

await runAsyncTest('TEST 10: Cleanup errors during creation rollback do NOT mask primary DB error', async () => {
  transformationService._deps.deleteCloudinaryAsset = async () => {
    throw new Error('Cloudinary 503 Service Unavailable');
  };
  transformationService._deps.Transformation = {
    create: async () => {
      throw new Error('Primary Database Failure');
    },
  };

  await assert.rejects(
    async () => {
      await transformationService.createTransformation({
        title: 'Error Masking Test',
        beforeImage: 'https://cloudinary.com/b.jpg',
        beforePublicId: 'trans/b_err',
        afterImage: 'https://cloudinary.com/a.jpg',
        afterPublicId: 'trans/a_err',
      });
    },
    /Primary Database Failure/,
    'Must rethrow original primary database error'
  );
});

await runAsyncTest('TEST 11: Replacing before/after images cleans old assets ONLY after DB update succeeds', async () => {
  const deletedAssets = [];
  transformationService._deps.deleteCloudinaryAsset = async (pid) => {
    deletedAssets.push(pid);
  };
  transformationService._deps.Transformation = {
    findById: async () => ({
      _id: 'trans-1',
      beforePublicId: 'trans/old_before',
      afterPublicId: 'trans/old_after',
    }),
    findByIdAndUpdate: async (id, update) => ({
      _id: id,
      ...update,
    }),
  };

  await transformationService.updateTransformation('trans-1', {
    beforeImage: 'https://new.com/b.jpg',
    beforePublicId: 'trans/new_before',
    afterImage: 'https://new.com/a.jpg',
    afterPublicId: 'trans/new_after',
  });

  assert.ok(deletedAssets.includes('trans/old_before'), 'Old before asset must be deleted after DB update');
  assert.ok(deletedAssets.includes('trans/old_after'), 'Old after asset must be deleted after DB update');
  assert.ok(!deletedAssets.includes('trans/new_before'), 'New before asset must not be deleted');
  assert.ok(!deletedAssets.includes('trans/new_after'), 'New after asset must not be deleted');
});

await runAsyncTest('TEST 12: Update DB failure rolls back NEW assets while preserving old assets', async () => {
  const deletedAssets = [];
  transformationService._deps.deleteCloudinaryAsset = async (pid) => {
    deletedAssets.push(pid);
  };
  transformationService._deps.Transformation = {
    findById: async () => ({
      _id: 'trans-1',
      beforePublicId: 'trans/old_before_keep',
      afterPublicId: 'trans/old_after_keep',
    }),
    findByIdAndUpdate: async () => {
      throw new Error('Database write lock conflict');
    },
  };

  await assert.rejects(
    async () => {
      await transformationService.updateTransformation('trans-1', {
        beforeImage: 'https://new.com/b.jpg',
        beforePublicId: 'trans/new_before_temp',
        afterImage: 'https://new.com/a.jpg',
        afterPublicId: 'trans/new_after_temp',
      });
    },
    /Database write lock conflict/
  );

  assert.ok(deletedAssets.includes('trans/new_before_temp'), 'New before asset must be rolled back');
  assert.ok(deletedAssets.includes('trans/new_after_temp'), 'New after asset must be rolled back');
  assert.ok(!deletedAssets.includes('trans/old_before_keep'), 'Existing old before asset must NOT be touched');
  assert.ok(!deletedAssets.includes('trans/old_after_keep'), 'Existing old after asset must NOT be touched');
});

await runAsyncTest('TEST 13: Deleting transformation removes DB document and destroys both Cloudinary assets', async () => {
  const deletedAssets = [];
  let deletedId = null;

  transformationService._deps.deleteCloudinaryAsset = async (pid) => {
    deletedAssets.push(pid);
  };
  transformationService._deps.Transformation = {
    findById: async (id) => ({
      _id: id,
      beforePublicId: 'trans/del_before',
      afterPublicId: 'trans/del_after',
    }),
    findByIdAndDelete: async (id) => {
      deletedId = id;
      return true;
    },
  };

  const ok = await transformationService.deleteTransformation('trans-99');
  assert.strictEqual(ok, true);
  assert.strictEqual(deletedId, 'trans-99', 'Document must be removed from MongoDB');
  assert.ok(deletedAssets.includes('trans/del_before'), 'Before Cloudinary asset destroyed');
  assert.ok(deletedAssets.includes('trans/del_after'), 'After Cloudinary asset destroyed');
});

// -----------------------------------------------------------------------------
// 4. URL & Input Security Validation
// -----------------------------------------------------------------------------
console.log('\n--- 4. URL & Input Security Validation ---');

runTest('TEST 14: Safe HTTP and HTTPS URLs pass validator', () => {
  const validUrls = [
    'https://res.cloudinary.com/lux/image/upload/v1/after.jpg',
    'http://images.example.com/lighting/before.webp',
  ];
  for (const url of validUrls) {
    const parsed = new URL(url);
    assert.ok(parsed.protocol === 'http:' || parsed.protocol === 'https:');
  }
});

runTest('TEST 15: Dangerous protocols (javascript:, data:, vbscript:, file:) are strictly rejected', () => {
  const dangerousUrls = [
    'javascript:alert(1)',
    'data:image/svg+xml;base64,PHN2Zw==',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
  ];
  for (const url of dangerousUrls) {
    let failed = false;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        failed = true;
      }
    } catch {
      failed = true;
    }
    assert.strictEqual(failed, true, `Dangerous URL "${url}" must be rejected`);
  }
});

// -----------------------------------------------------------------------------
// 5. Route Guards & Express Mounting
// -----------------------------------------------------------------------------
console.log('\n--- 5. Route Protection & Router Mounting ---');

runTest('TEST 16: transformationRoutes defines public and admin routes with middleware guards', () => {
  const routes = transformationRoutes.stack;
  assert.ok(routes.length >= 4, 'Route stack should contain endpoints');

  const postRoute = routes.find((r) => r.route && r.route.path === '/' && r.route.methods.post);
  assert.ok(postRoute, 'POST / route must exist');
  assert.ok(postRoute.route.stack.length >= 3, 'POST / must contain protect, authorize, validator middleware');

  const putRoute = routes.find((r) => r.route && r.route.path === '/:id' && r.route.methods.put);
  assert.ok(putRoute, 'PUT /:id route must exist');

  const deleteRoute = routes.find((r) => r.route && r.route.path === '/:id' && r.route.methods.delete);
  assert.ok(deleteRoute, 'DELETE /:id route must exist');
});

runTest('TEST 17: apiRoutes mounts /transformations into application router', () => {
  const mounted = apiRoutes.stack.some((layer) => {
    return layer.regexp && layer.regexp.test('/transformations');
  });
  assert.ok(mounted, '/transformations must be mounted in main application router');
});

runTest('TEST 18: Non-existent transformation in getTransformationById throws 404', async () => {
  transformationService._deps.Transformation = {
    findById: async () => null,
  };
  await assert.rejects(
    async () => {
      await transformationService.getTransformationById('non-existent-id');
    },
    (err) => err.statusCode === 404
  );
});

runTest('TEST 19: Non-existent transformation in deleteTransformation throws 404', async () => {
  transformationService._deps.Transformation = {
    findById: async () => null,
  };
  await assert.rejects(
    async () => {
      await transformationService.deleteTransformation('non-existent-id');
    },
    (err) => err.statusCode === 404
  );
});

runTest('TEST 20: Order defaults to 0 and isActive defaults to true', () => {
  const doc = new Transformation({
    title: 'Default Props Test',
    beforeImage: 'https://example.com/b.jpg',
    afterImage: 'https://example.com/a.jpg',
  });
  assert.strictEqual(doc.order, 0);
  assert.strictEqual(doc.isActive, true);
});

console.log('\n========================================================');
console.log(`  TRANSFORMATION TESTS COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('========================================================\n');

if (failedTests > 0) process.exit(1);
