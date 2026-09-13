import Partner from './src/models/Partner.js';
import * as partnerService from './src/services/partnerService.js';
import * as partnerValidator from './src/validators/partnerValidator.js';
import partnerRoutes from './src/routes/partnerRoutes.js';
import apiRoutes from './src/routes/index.js';

async function runPartnerBackendTests() {
  console.log('========================================================');
  console.log('  LUX BASED INDUSTRY: PARTNER BACKEND TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, errorMsg = '') {
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      failed++;
      console.error(`  ❌ [FAIL] ${name} -- ${errorMsg}`);
    }
  }

  // Backup original dependencies
  const origPartner = partnerService._deps.Partner;
  const origDeleteCloudinary = partnerService._deps.deleteCloudinaryAsset;

  try {
    // -------------------------------------------------------------------------
    // 1. MODEL SCHEMA & VALIDATION
    // -------------------------------------------------------------------------
    console.log('--- 1. Partner Model Schema & Indexes ---');

    // TEST 1: Model schema definition
    {
      const paths = Partner.schema.paths;
      const hasName = paths.name && paths.name.isRequired;
      const hasLogo = paths.logo && paths.logo.isRequired;
      const hasLogoPublicId = paths.logoPublicId && paths.logoPublicId.options.default === '';
      const hasWebsite = paths.website && (paths.website.options.maxlength === 500 || paths.website.options.maxlength?.[0] === 500);
      const hasOrder = paths.order && paths.order.options.default === 0;
      const hasIsActive = paths.isActive && paths.isActive.options.default === true;

      assert(
        'TEST 1: Partner model schema defines required fields, types, and constraints',
        hasName && hasLogo && hasLogoPublicId && hasWebsite && hasOrder && hasIsActive,
        'Partner schema paths missing or misconfigured'
      );
    }

    // TEST 2: Compound index
    {
      const indexes = Partner.schema.indexes();
      const hasCompound = indexes.some(([idx]) => idx.isActive === 1 && idx.order === 1 && idx.createdAt === 1);
      assert(
        'TEST 2: Partner schema includes compound index { isActive: 1, order: 1, createdAt: 1 }',
        hasCompound,
        'Compound index not found on Partner schema'
      );
    }

    // -------------------------------------------------------------------------
    // 2. PARTNER SERVICE QUERIES
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Partner Service Queries ---');

    // TEST 3: getPublicPartners queries active partners only
    {
      let capturedFilter = null;
      let capturedSort = null;
      let capturedSelect = null;

      partnerService._deps.Partner = {
        find: (filter) => {
          capturedFilter = filter;
          return {
            select: (sel) => {
              capturedSelect = sel;
              return {
                sort: (s) => {
                  capturedSort = s;
                  return {
                    lean: async () => [{ name: 'Studio A', logo: 'http://a.com/logo.png', order: 1 }],
                  };
                },
              };
            },
          };
        },
      };

      const result = await partnerService.getPublicPartners();
      const filterOk = capturedFilter && capturedFilter.isActive === true;
      const sortOk = capturedSort && capturedSort.order === 1 && capturedSort.createdAt === 1;
      const selectOk = capturedSelect && capturedSelect.includes('name') && capturedSelect.includes('logo');

      assert(
        'TEST 3: getPublicPartners filters isActive: true, sorts by order, and selects public fields',
        filterOk && sortOk && selectOk && result.length === 1,
        `Filter: ${JSON.stringify(capturedFilter)}, Sort: ${JSON.stringify(capturedSort)}`
      );
    }

    // TEST 4: getAllPartners supports adminView
    {
      let capturedFilter = null;
      partnerService._deps.Partner = {
        find: (filter) => {
          capturedFilter = filter;
          return {
            sort: () => ({
              lean: async () => [
                { name: 'P1', isActive: true },
                { name: 'P2', isActive: false },
              ],
            }),
          };
        },
      };

      const resAll = await partnerService.getAllPartners({});
      const filterAllOk = Object.keys(capturedFilter).length === 0;

      await partnerService.getAllPartners({ activeOnly: 'true' });
      const filterActiveOk = capturedFilter && capturedFilter.isActive === true;

      assert(
        'TEST 4: getAllPartners returns all partners for admin and supports activeOnly filtering',
        filterAllOk && filterActiveOk && resAll.length === 2,
        'Admin query filtering failed'
      );
    }

    // -------------------------------------------------------------------------
    // 3. CLOUDINARY TRANSACTIONAL LIFECYCLE
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Cloudinary Lifecycle & Rollbacks ---');

    // TEST 5: Successful creation preserves uploaded asset
    {
      const deletedAssets = [];
      partnerService._deps.deleteCloudinaryAsset = async (id) => {
        deletedAssets.push(id);
      };
      partnerService._deps.Partner = {
        create: async (data) => ({ _id: 'partner-123', ...data }),
      };

      const partner = await partnerService.createPartner({
        name: 'Foster & Partners',
        logo: 'https://cloudinary.com/foster.png',
        logoPublicId: 'foster_logo_1',
      });

      assert(
        'TEST 5: Successful creation preserves Cloudinary assets without deletion',
        partner._id === 'partner-123' && deletedAssets.length === 0,
        `Assets deleted unexpectedly: ${deletedAssets.join(', ')}`
      );
    }

    // TEST 6: Creation failure triggers Cloudinary rollback
    {
      const deletedAssets = [];
      partnerService._deps.deleteCloudinaryAsset = async (id) => {
        deletedAssets.push(id);
      };
      partnerService._deps.Partner = {
        create: async () => {
          throw new Error('Mongo connection dropped');
        },
      };

      let errorThrown = false;
      try {
        await partnerService.createPartner({
          name: 'Zaha Hadid Architects',
          logo: 'https://cloudinary.com/zaha.png',
          logoPublicId: 'zaha_logo_orphan',
        });
      } catch (err) {
        errorThrown = true;
      }

      assert(
        'TEST 6: Creation failure deletes orphaned Cloudinary asset (rollback)',
        errorThrown && deletedAssets.includes('zaha_logo_orphan'),
        `Asset not rolled back. Deleted: ${deletedAssets.join(', ')}`
      );
    }

    // TEST 7: Creation cleanup failure does not mask primary DB error
    {
      partnerService._deps.deleteCloudinaryAsset = async () => {
        throw new Error('Cloudinary delete timeout');
      };
      partnerService._deps.Partner = {
        create: async () => {
          throw new Error('Primary MongoDB duplicate key error');
        },
      };

      let caughtMsg = '';
      try {
        await partnerService.createPartner({
          name: 'Test Studio',
          logo: 'https://test.com/logo.png',
          logoPublicId: 'asset_fail',
        });
      } catch (err) {
        caughtMsg = err.message;
      }

      assert(
        'TEST 7: Cleanup error during creation does NOT mask primary database error',
        caughtMsg === 'Primary MongoDB duplicate key error',
        `Unexpected error masked: ${caughtMsg}`
      );
    }

    // TEST 8: Replacement cleanup destroys old asset AFTER successful update
    {
      const deletedAssets = [];
      partnerService._deps.deleteCloudinaryAsset = async (id) => {
        deletedAssets.push(id);
      };
      partnerService._deps.Partner = {
        findById: async () => ({
          _id: 'partner-99',
          name: 'Studio X',
          logo: 'https://old.com/logo.png',
          logoPublicId: 'old_logo_asset',
        }),
        findByIdAndUpdate: async (id, update) => ({
          _id: id,
          ...update,
        }),
      };

      const updated = await partnerService.updatePartner('partner-99', {
        name: 'Studio X Renamed',
        logo: 'https://new.com/logo.png',
        logoPublicId: 'new_logo_asset',
      });

      assert(
        'TEST 8: Replacing partner logo safely deletes OLD Cloudinary asset after DB update',
        updated && deletedAssets.includes('old_logo_asset') && !deletedAssets.includes('new_logo_asset'),
        `Expected old_logo_asset deleted. Got: ${deletedAssets.join(', ')}`
      );
    }

    // TEST 9: Replacement DB failure rolls back NEW asset
    {
      const deletedAssets = [];
      partnerService._deps.deleteCloudinaryAsset = async (id) => {
        deletedAssets.push(id);
      };
      partnerService._deps.Partner = {
        findById: async () => ({
          _id: 'partner-99',
          name: 'Studio X',
          logo: 'https://old.com/logo.png',
          logoPublicId: 'old_logo_asset',
        }),
        findByIdAndUpdate: async () => {
          throw new Error('DB write conflict');
        },
      };

      let errThrown = false;
      try {
        await partnerService.updatePartner('partner-99', {
          logo: 'https://new.com/logo.png',
          logoPublicId: 'new_logo_asset_rollback',
        });
      } catch (err) {
        errThrown = true;
      }

      assert(
        'TEST 9: Update DB failure rolls back the NEW asset without touching old asset',
        errThrown && deletedAssets.includes('new_logo_asset_rollback') && !deletedAssets.includes('old_logo_asset'),
        `Expected new asset rollback. Got: ${deletedAssets.join(', ')}`
      );
    }

    // TEST 10: Deletion deletes document and cleans attached Cloudinary asset
    {
      const deletedAssets = [];
      let docDeleted = false;
      partnerService._deps.deleteCloudinaryAsset = async (id) => {
        deletedAssets.push(id);
      };
      partnerService._deps.Partner = {
        findById: async () => ({
          _id: 'partner-to-delete',
          logoPublicId: 'asset_to_delete_public_id',
        }),
        findByIdAndDelete: async (id) => {
          if (id === 'partner-to-delete') docDeleted = true;
        },
      };

      await partnerService.deletePartner('partner-to-delete');

      assert(
        'TEST 10: Deleting partner removes MongoDB document and destroys Cloudinary asset',
        docDeleted && deletedAssets.includes('asset_to_delete_public_id'),
        `Doc deleted: ${docDeleted}, Deleted assets: ${deletedAssets.join(', ')}`
      );
    }

    // -------------------------------------------------------------------------
    // 4. URL & INPUT VALIDATION
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Partner URL & Input Validation ---');

    // Extract custom validator from validator chain
    const createValidators = partnerValidator.createPartnerValidator;
    const websiteVal = createValidators.find((v) => v.builder?.fields?.includes('website'));
    const isSafeWebUrl = websiteVal?.builder?.stack?.find((s) => s.validator?.name === 'isSafeWebUrl')?.validator;

    // Helper to test website URL safety
    const checkUrl = (url) => {
      try {
        return isSafeWebUrl ? isSafeWebUrl(url) : false;
      } catch (err) {
        return false;
      }
    };

    // TEST 11: Valid http and https URLs pass
    {
      const httpsValid = checkUrl('https://www.architects-firm.com');
      const httpValid = checkUrl('http://interior-design-studio.ae/projects');
      assert(
        'TEST 11: Safe HTTP and HTTPS website URLs pass validation',
        httpsValid === true && httpValid === true,
        'Valid HTTP/HTTPS rejected'
      );
    }

    // TEST 12: Malicious schemes are strictly rejected
    {
      const jsUrl = checkUrl('javascript:alert(document.cookie)');
      const dataUrl = checkUrl('data:text/html,<script>alert(1)</script>');
      const vbUrl = checkUrl('vbscript:msgbox(1)');
      const fileUrl = checkUrl('file:///etc/passwd');

      assert(
        'TEST 12: Unsafe schemes (javascript:, data:, vbscript:, file:) are strictly rejected',
        !jsUrl && !dataUrl && !vbUrl && !fileUrl,
        'Unsafe URL scheme was allowed'
      );
    }

    // TEST 13: Optional empty website passes
    {
      const emptyValid = checkUrl('');
      const nullValid = checkUrl(null);
      const undefValid = checkUrl(undefined);

      assert(
        'TEST 13: Empty or omitted website URL passes validation as optional',
        emptyValid === true && nullValid === true && undefValid === true,
        'Empty website was rejected'
      );
    }

    // -------------------------------------------------------------------------
    // 5. ROUTE SECURITY & MOUNTING
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Route Security & Mounting ---');

    // TEST 14: Partner routes mount on router stack
    {
      const routes = partnerRoutes.stack.map((layer) => ({
        path: layer.route?.path,
        methods: layer.route?.methods,
      }));

      const hasGetPublic = routes.some((r) => r.path === '/' && r.methods.get);
      const hasPostAdmin = routes.some((r) => r.path === '/' && r.methods.post);
      const hasPutAdmin = routes.some((r) => r.path === '/:id' && r.methods.put);
      const hasDeleteAdmin = routes.some((r) => r.path === '/:id' && r.methods.delete);

      assert(
        'TEST 14: partnerRoutes defines GET /, POST /, PUT /:id, and DELETE /:id',
        hasGetPublic && hasPostAdmin && hasPutAdmin && hasDeleteAdmin,
        `Routes defined: ${JSON.stringify(routes)}`
      );
    }

    // TEST 15: Post, Put, and Delete routes have admin authorization guards
    {
      const postLayer = partnerRoutes.stack.find((l) => l.route?.path === '/' && l.route?.methods?.post);
      const putLayer = partnerRoutes.stack.find((l) => l.route?.path === '/:id' && l.route?.methods?.put);
      const deleteLayer = partnerRoutes.stack.find((l) => l.route?.path === '/:id' && l.route?.methods?.delete);

      // Verify each layer has multiple handlers (protect, authorize, validators, controller)
      const postGuarded = postLayer && postLayer.route.stack.length >= 3;
      const putGuarded = putLayer && putLayer.route.stack.length >= 3;
      const deleteGuarded = deleteLayer && deleteLayer.route.stack.length >= 3;

      assert(
        'TEST 15: POST, PUT, and DELETE partner routes are protected with auth and authorization guards',
        postGuarded && putGuarded && deleteGuarded,
        'Admin routes missing middleware guards'
      );
    }

    // TEST 16: API root index mounts /partners
    {
      const mounted = apiRoutes.stack.some((layer) => layer.regexp && layer.regexp.test('/partners'));
      assert(
        'TEST 16: apiRoutes mounts /partners endpoint into application router',
        mounted,
        'partnerRoutes not mounted in apiRoutes'
      );
    }

  } finally {
    // Restore original dependencies
    partnerService._deps.Partner = origPartner;
    partnerService._deps.deleteCloudinaryAsset = origDeleteCloudinary;
  }

  console.log('\n========================================================');
  console.log(`  PARTNER BACKEND TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPartnerBackendTests().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
