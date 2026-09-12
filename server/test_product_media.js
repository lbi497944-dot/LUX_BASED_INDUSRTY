// Configure mock environment for testing Cloudinary integration BEFORE importing modules
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = 'test_key';
process.env.CLOUDINARY_API_SECRET = 'test_secret';

const { v2: cloudinary } = await import('cloudinary');
const { default: Product } = await import('./src/models/Product.js');
const { createProduct, updateProduct, deleteProduct } = await import('./src/services/productService.js');

async function runProductMediaTests() {
  console.log('========================================================');
  console.log('  PRODUCT MEDIA LIFECYCLE & CLOUDINARY CLEANUP TESTS');
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
  const originalFindById = Product.findById;
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;
  const originalFindByIdAndDelete = Product.findByIdAndDelete;
  const originalFindOne = Product.findOne;
  const originalCreate = Product.create;
  const originalDestroy = cloudinary.uploader.destroy;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Existing Product without publicId can still update
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let updatedData = null;

      Product.findById = async (id) => ({
        _id: id,
        name: 'Legacy Chandelier',
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5',
        imagePublicId: '',
        gallery: [],
        galleryPublicIds: [],
      });

      Product.findByIdAndUpdate = async (id, data) => {
        updatedData = data;
        return { _id: id, ...data };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await updateProduct('prod-1', {
        name: 'Legacy Chandelier Renamed',
        image: 'https://images.unsplash.com/photo-new',
        imagePublicId: '',
      });

      const pass = (
        result.name === 'Legacy Chandelier Renamed' &&
        updatedData.image === 'https://images.unsplash.com/photo-new' &&
        destroyedAssets.length === 0
      );
      record('TEST 1: Existing Product without publicId updates without calling Cloudinary destroy', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Existing external URL Product can still delete
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let deletedId = null;

      Product.findById = async (id) => ({
        _id: id,
        name: 'External URL Sconce',
        image: 'https://external-cdn.com/sconce.jpg',
        imagePublicId: '',
        gallery: ['https://external-cdn.com/gallery1.jpg'],
        galleryPublicIds: [],
      });

      Product.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await deleteProduct('prod-2');

      const pass = (
        destroyedAssets.length === 0 &&
        deletedId === 'prod-2' &&
        result._id === 'prod-2'
      );
      record('TEST 2: Existing external URL Product deletes cleanly without Cloudinary destroy', pass, `destroyed: ${JSON.stringify(destroyedAssets)}, deletedId: ${deletedId}`);
    }

    // -------------------------------------------------------------------------
    // TEST 3: Product with imagePublicId deletes its Cloudinary image
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let deletedId = null;

      Product.findById = async (id) => ({
        _id: id,
        name: 'Cloudinary Product',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/prod_img.jpg',
        imagePublicId: 'veloura_lighting/prod_img',
        gallery: [],
        galleryPublicIds: [],
      });

      Product.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await deleteProduct('prod-3');

      const pass = (
        destroyedAssets.length === 1 &&
        destroyedAssets[0] === 'veloura_lighting/prod_img' &&
        deletedId === 'prod-3' &&
        result._id === 'prod-3'
      );
      record('TEST 3: Product with imagePublicId destroys Cloudinary asset and deletes DB record', pass, `destroyed: ${JSON.stringify(destroyedAssets)}, deletedId: ${deletedId}`);
    }

    // -------------------------------------------------------------------------
    // TEST 4: Product with multiple galleryPublicIds deletes all valid IDs
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let deletedId = null;

      Product.findById = async (id) => ({
        _id: id,
        name: 'Multi-Gallery Luminaire',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/cover.jpg',
        imagePublicId: 'veloura_lighting/cover',
        gallery: [
          'https://res.cloudinary.com/demo/image/upload/v1/g1.jpg',
          'https://res.cloudinary.com/demo/image/upload/v1/g2.jpg',
          'https://res.cloudinary.com/demo/image/upload/v1/g3.jpg',
        ],
        galleryPublicIds: [
          'veloura_lighting/g1',
          'veloura_lighting/g2',
          'veloura_lighting/g3',
        ],
      });

      Product.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await deleteProduct('prod-4');

      const pass = (
        destroyedAssets.length === 4 &&
        destroyedAssets.includes('veloura_lighting/cover') &&
        destroyedAssets.includes('veloura_lighting/g1') &&
        destroyedAssets.includes('veloura_lighting/g2') &&
        destroyedAssets.includes('veloura_lighting/g3') &&
        deletedId === 'prod-4'
      );
      record('TEST 4: Product with multiple galleryPublicIds deletes cover and all gallery IDs', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Empty/missing publicIds are ignored
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let deletedId = null;

      Product.findById = async (id) => ({
        _id: id,
        name: 'Empty ID Product',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/cover.jpg',
        imagePublicId: '   ', // whitespace only
        gallery: ['https://res.cloudinary.com/demo/image/upload/v1/g1.jpg'],
        galleryPublicIds: ['', null, undefined],
      });

      Product.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      await deleteProduct('prod-5');

      const pass = destroyedAssets.length === 0 && deletedId === 'prod-5';
      record('TEST 5: Empty, whitespace, null, and undefined publicIds are safely ignored', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Product not found preserves existing behavior (throws 404)
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let findByIdAndDeleteCalled = false;
      let caughtError = null;

      Product.findById = async () => null;
      Product.findByIdAndDelete = async () => { findByIdAndDeleteCalled = true; };
      cloudinary.uploader.destroy = async (publicId) => { destroyedAssets.push(publicId); };

      try {
        await deleteProduct('non-existent-prod');
      } catch (err) {
        caughtError = err;
      }

      const pass = (
        caughtError !== null &&
        caughtError.statusCode === 404 &&
        caughtError.message.includes('Product not found with id: non-existent-prod') &&
        destroyedAssets.length === 0 &&
        findByIdAndDeleteCalled === false
      );
      record('TEST 6: Product not found throws 404 without Cloudinary or DB delete call', pass, `error: ${caughtError?.message}`);
    }

    // -------------------------------------------------------------------------
    // TEST 7: Cloudinary deletion failure does not prevent Product deletion
    // -------------------------------------------------------------------------
    {
      const destroyedAttempts = [];
      let deletedId = null;
      let deleteThrew = false;

      Product.findById = async (id) => ({
        _id: id,
        name: 'Product Cloudinary Error',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/cover.jpg',
        imagePublicId: 'veloura_lighting/error_cover',
        gallery: [],
        galleryPublicIds: [],
      });

      Product.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAttempts.push(publicId);
        throw new Error('Cloudinary timeout');
      };

      try {
        await deleteProduct('prod-7');
      } catch {
        deleteThrew = true;
      }

      const pass = (
        deleteThrew === false &&
        destroyedAttempts.length === 1 &&
        destroyedAttempts[0] === 'veloura_lighting/error_cover' &&
        deletedId === 'prod-7'
      );
      record('TEST 7: Cloudinary deletion failure does not prevent DB deletion or throw 500', pass, `threw: ${deleteThrew}, deletedId: ${deletedId}`);
    }

    // -------------------------------------------------------------------------
    // TEST 8: Replacing a Cloudinary image deletes the OLD publicId only after successful Product update
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let dbUpdated = false;
      let destroyedAfterDb = false;

      Product.findById = async (id) => ({
        _id: id,
        name: 'Aurelia Chandelier',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/old_aurelia.jpg',
        imagePublicId: 'veloura_lighting/old_aurelia',
      });

      Product.findByIdAndUpdate = async (id, data) => {
        dbUpdated = true;
        return { _id: id, ...data };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        if (dbUpdated) {
          destroyedAfterDb = true;
        }
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await updateProduct('prod-8', {
        image: 'https://res.cloudinary.com/demo/image/upload/v1/new_aurelia.jpg',
        imagePublicId: 'veloura_lighting/new_aurelia',
      });

      const pass = (
        dbUpdated === true &&
        destroyedAfterDb === true &&
        destroyedAssets.length === 1 &&
        destroyedAssets[0] === 'veloura_lighting/old_aurelia' &&
        result.imagePublicId === 'veloura_lighting/new_aurelia'
      );
      record('TEST 8: Replacing Cloudinary image deletes OLD publicId only AFTER successful update', pass, `destroyed: ${JSON.stringify(destroyedAssets)}, destroyedAfterDb: ${destroyedAfterDb}`);
    }

    // -------------------------------------------------------------------------
    // TEST 9: Updating without changing image does not delete anything
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];

      Product.findById = async (id) => ({
        _id: id,
        name: 'Static Image Product',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/same_img.jpg',
        imagePublicId: 'veloura_lighting/same_img',
      });

      Product.findByIdAndUpdate = async (id, data) => ({ _id: id, ...data });

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      await updateProduct('prod-9', {
        name: 'Updated Title Only',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/same_img.jpg',
        imagePublicId: 'veloura_lighting/same_img',
      });

      const pass = destroyedAssets.length === 0;
      record('TEST 9: Updating without changing image or publicId preserves asset without deletion', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 10: Product creation with normal external URL still works
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let createdProduct = null;

      Product.findOne = async () => null; // slug uniqueness check
      Product.create = async (data) => {
        createdProduct = data;
        return { _id: 'prod-10', ...data };
      };
      cloudinary.uploader.destroy = async (publicId) => { destroyedAssets.push(publicId); };

      const result = await createProduct({
        name: 'New External Fixture',
        image: 'https://images.unsplash.com/photo-fixture',
        imagePublicId: '',
        category: 'Pendant Light',
        collectionSlug: 'grand-chandeliers',
        description: 'Luxury pendant',
      });

      const pass = (
        result._id === 'prod-10' &&
        createdProduct.image === 'https://images.unsplash.com/photo-fixture' &&
        createdProduct.imagePublicId === '' &&
        destroyedAssets.length === 0
      );
      record('TEST 10: Product creation with external URL persists cleanly with no Cloudinary call', pass, `image: ${createdProduct?.image}`);
    }

    // -------------------------------------------------------------------------
    // TEST 11: Product creation with uploaded Cloudinary image stores both URL and publicId
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let createdProduct = null;

      Product.findOne = async () => null;
      Product.create = async (data) => {
        createdProduct = data;
        return { _id: 'prod-11', ...data };
      };
      cloudinary.uploader.destroy = async (publicId) => { destroyedAssets.push(publicId); };

      const result = await createProduct({
        name: 'New Cloudinary Fixture',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/new_fixture.jpg',
        imagePublicId: 'veloura_lighting/new_fixture',
        category: 'Grand Chandelier',
        collectionSlug: 'grand-chandeliers',
        description: 'Handcrafted fixture',
      });

      const pass = (
        result._id === 'prod-11' &&
        createdProduct.image === 'https://res.cloudinary.com/demo/image/upload/v1/new_fixture.jpg' &&
        createdProduct.imagePublicId === 'veloura_lighting/new_fixture' &&
        destroyedAssets.length === 0
      );
      record('TEST 11: Product creation with Cloudinary upload stores URL and publicId correctly', pass, `imagePublicId: ${createdProduct?.imagePublicId}`);
    }

    // -------------------------------------------------------------------------
    // TEST 12: Upload/save failure does not corrupt existing Product data (and rolls back newly uploaded asset on failure)
    // -------------------------------------------------------------------------
    {
      const rolledBackAssets = [];
      let createThrew = false;

      Product.findOne = async () => null;
      Product.create = async () => {
        throw new Error('Database validation failed');
      };

      cloudinary.uploader.destroy = async (publicId) => {
        rolledBackAssets.push(publicId);
        return { result: 'ok' };
      };

      try {
        await createProduct({
          name: 'Failed Product Creation',
          image: 'https://res.cloudinary.com/demo/image/upload/v1/orphan_candidate.jpg',
          imagePublicId: 'veloura_lighting/orphan_candidate',
        });
      } catch {
        createThrew = true;
      }

      const pass = (
        createThrew === true &&
        rolledBackAssets.length === 1 &&
        rolledBackAssets[0] === 'veloura_lighting/orphan_candidate'
      );
      record('TEST 12: DB save failure rolls back newly uploaded Cloudinary asset preventing orphan', pass, `rolledBack: ${JSON.stringify(rolledBackAssets)}, threw: ${createThrew}`);
    }

    // -------------------------------------------------------------------------
    // TEST 13: DB save failure rolls back newly uploaded cover AND gallery assets
    // -------------------------------------------------------------------------
    {
      const rolledBackAssets = [];
      let createThrew = false;

      Product.findOne = async () => null;
      Product.create = async () => {
        throw new Error('Database validation failed');
      };

      cloudinary.uploader.destroy = async (publicId) => {
        rolledBackAssets.push(publicId);
        return { result: 'ok' };
      };

      try {
        await createProduct({
          name: 'Failed Product Gallery Creation',
          image: 'https://res.cloudinary.com/demo/image/upload/v1/prod_cover.jpg',
          imagePublicId: 'veloura_lighting/prod_cover',
          gallery: ['https://res.cloudinary.com/demo/image/upload/v1/pg1.jpg', 'https://res.cloudinary.com/demo/image/upload/v1/pg2.jpg'],
          galleryPublicIds: ['veloura_lighting/pg1', 'veloura_lighting/pg2'],
        });
      } catch (err) {
        createThrew = err.message === 'Database validation failed';
      }

      const pass = (
        createThrew === true &&
        rolledBackAssets.length === 3 &&
        rolledBackAssets.includes('veloura_lighting/prod_cover') &&
        rolledBackAssets.includes('veloura_lighting/pg1') &&
        rolledBackAssets.includes('veloura_lighting/pg2')
      );
      record('TEST 13: DB save failure rolls back newly uploaded cover AND gallery assets', pass, `rolledBack: ${JSON.stringify(rolledBackAssets)}, threw: ${createThrew}`);
    }

  } finally {
    // Restore original methods
    Product.findById = originalFindById;
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
    Product.findByIdAndDelete = originalFindByIdAndDelete;
    Product.findOne = originalFindOne;
    Product.create = originalCreate;
    cloudinary.uploader.destroy = originalDestroy;
  }

  console.log('\n========================================================');
  console.log(`  TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('========================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runProductMediaTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
