// Configure mock environment for testing Cloudinary integration BEFORE importing modules
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = 'test_key';
process.env.CLOUDINARY_API_SECRET = 'test_secret';

const { v2: cloudinary } = await import('cloudinary');
const { default: Collection } = await import('./src/models/Collection.js');
const { default: Product } = await import('./src/models/Product.js');
const { updateCollection, deleteCollection } = await import('./src/services/collectionService.js');

async function runCollectionIntegrityTests() {
  console.log('========================================================');
  console.log('  COLLECTION INTEGRITY & CASCADE / DELETION TESTS');
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
  const originalCollectionFindById = Collection.findById;
  const originalCollectionFindByIdAndUpdate = Collection.findByIdAndUpdate;
  const originalCollectionFindByIdAndDelete = Collection.findByIdAndDelete;
  const originalProductCountDocuments = Product.countDocuments;
  const originalProductUpdateMany = Product.updateMany;
  const originalCloudinaryDestroy = cloudinary.uploader.destroy;

  try {
    // -------------------------------------------------------------------------
    // TEST A: Collection rename cascades collectionSlug across associated products
    // -------------------------------------------------------------------------
    {
      const mockProducts = [
        { _id: 'prod-1', name: 'Luminaire 1', collectionSlug: 'old-collection' },
        { _id: 'prod-2', name: 'Luminaire 2', collectionSlug: 'old-collection' },
        { _id: 'prod-3', name: 'Luminaire 3', collectionSlug: 'another-collection' },
      ];

      let collectionDoc = {
        _id: 'col-123',
        name: 'Old Collection',
        slug: 'old-collection',
        tagline: 'Timeless Elegance',
      };

      let updateManyFilter = null;
      let updateManyUpdate = null;

      Collection.findById = async (id) => {
        if (id === 'col-123') return { ...collectionDoc };
        return null;
      };

      Collection.findByIdAndUpdate = async (id, data, options) => {
        collectionDoc = { ...collectionDoc, ...data };
        return { ...collectionDoc };
      };

      Product.updateMany = async (filter, update) => {
        updateManyFilter = filter;
        updateManyUpdate = update;

        // Apply update to mock products matching filter
        for (const p of mockProducts) {
          if (p.collectionSlug === filter.collectionSlug) {
            p.collectionSlug = update.$set.collectionSlug;
          }
        }
        return { acknowledged: true, modifiedCount: 2 };
      };

      const result = await updateCollection('col-123', {
        name: 'New Collection',
        slug: 'new-collection',
      });

      const filterMatches = updateManyFilter?.collectionSlug === 'old-collection';
      const updateMatches = updateManyUpdate?.$set?.collectionSlug === 'new-collection';
      const prod1Updated = mockProducts[0].collectionSlug === 'new-collection';
      const prod2Updated = mockProducts[1].collectionSlug === 'new-collection';
      const prod3Untouched = mockProducts[2].collectionSlug === 'another-collection';
      const collectionSlugUpdated = result.slug === 'new-collection';

      const pass =
        filterMatches &&
        updateMatches &&
        prod1Updated &&
        prod2Updated &&
        prod3Untouched &&
        collectionSlugUpdated;

      record(
        'TEST A: Collection rename cascades collectionSlug to matching products, preserving unrelated products',
        pass,
        `filter: ${JSON.stringify(updateManyFilter)}, update: ${JSON.stringify(updateManyUpdate)}, products: ${JSON.stringify(mockProducts)}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST A2: Collection update WITHOUT slug change does NOT trigger Product.updateMany
    // -------------------------------------------------------------------------
    {
      let updateManyCalled = false;

      Collection.findById = async (id) => ({
        _id: 'col-123',
        name: 'Collection Name',
        slug: 'same-slug',
        tagline: 'Original Tagline',
      });

      Collection.findByIdAndUpdate = async (id, data) => ({
        _id: id,
        name: 'Collection Name',
        slug: 'same-slug',
        ...data,
      });

      Product.updateMany = async () => {
        updateManyCalled = true;
        return { acknowledged: true, modifiedCount: 0 };
      };

      await updateCollection('col-123', {
        tagline: 'Updated Tagline',
      });

      record(
        'TEST A2: Collection update without slug change does NOT trigger Product.updateMany',
        updateManyCalled === false,
        `updateManyCalled: ${updateManyCalled}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST B: Collection deletion blocked when products reference the collection
    // -------------------------------------------------------------------------
    {
      const mockCollection = {
        _id: 'col-protected',
        name: 'Protected Collection',
        slug: 'protected-collection',
        heroImagePublicId: 'collections/hero_protected',
        galleryPublicIds: ['collections/gallery_protected_1'],
      };

      let countFilter = null;
      let deleteCalled = false;
      const destroyedAssets = [];

      Collection.findById = async (id) => {
        if (id === 'col-protected') return { ...mockCollection };
        return null;
      };

      Collection.findByIdAndDelete = async () => {
        deleteCalled = true;
      };

      Product.countDocuments = async (filter) => {
        countFilter = filter;
        return 3; // 3 products assigned
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      let caughtError = null;
      try {
        await deleteCollection('col-protected');
      } catch (err) {
        caughtError = err;
      }

      const countFilterCorrect = countFilter?.collectionSlug === 'protected-collection';
      const errorThrown = caughtError !== null;
      const statusCodeCorrect = caughtError?.statusCode === 400;
      const messageCorrect =
        caughtError?.message ===
        'Cannot delete collection with assigned products. Please reassign or delete products first.';
      const deleteNotCalled = deleteCalled === false;
      const cloudinaryNotCalled = destroyedAssets.length === 0;

      const pass =
        countFilterCorrect &&
        errorThrown &&
        statusCodeCorrect &&
        messageCorrect &&
        deleteNotCalled &&
        cloudinaryNotCalled;

      record(
        'TEST B: Collection deletion blocked with 400 and leaves Cloudinary / DB untouched when products exist',
        pass,
        `statusCode: ${caughtError?.statusCode}, message: "${caughtError?.message}", deleted: ${deleteCalled}, cloudinary: ${JSON.stringify(destroyedAssets)}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST C: Collection deletion succeeds when zero products are assigned
    // -------------------------------------------------------------------------
    {
      const mockCollection = {
        _id: 'col-empty',
        name: 'Empty Collection',
        slug: 'empty-collection',
        heroImagePublicId: 'collections/hero_empty',
        galleryPublicIds: ['collections/gallery_empty_1', 'collections/gallery_empty_2'],
      };

      let countFilter = null;
      let deletedId = null;
      const destroyedAssets = [];

      Collection.findById = async (id) => {
        if (id === 'col-empty') return { ...mockCollection };
        return null;
      };

      Collection.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { ...mockCollection };
      };

      Product.countDocuments = async (filter) => {
        countFilter = filter;
        return 0; // zero products assigned
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await deleteCollection('col-empty');

      const countFilterCorrect = countFilter?.collectionSlug === 'empty-collection';
      const deletedIdCorrect = deletedId === 'col-empty';
      const heroDestroyed = destroyedAssets.includes('collections/hero_empty');
      const gallery1Destroyed = destroyedAssets.includes('collections/gallery_empty_1');
      const gallery2Destroyed = destroyedAssets.includes('collections/gallery_empty_2');
      const totalDestroyed = destroyedAssets.length === 3;
      const resultReturned = result._id === 'col-empty';

      const pass =
        countFilterCorrect &&
        deletedIdCorrect &&
        heroDestroyed &&
        gallery1Destroyed &&
        gallery2Destroyed &&
        totalDestroyed &&
        resultReturned;

      record(
        'TEST C: Collection deletion succeeds with Cloudinary cleanup when zero products are assigned',
        pass,
        `deletedId: ${deletedId}, destroyed: ${JSON.stringify(destroyedAssets)}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST D: Non-existent collection throws 404 on update and delete
    // -------------------------------------------------------------------------
    {
      Collection.findById = async () => null;

      let updateErr = null;
      try {
        await updateCollection('non-existent-id', { name: 'Test' });
      } catch (err) {
        updateErr = err;
      }

      let deleteErr = null;
      try {
        await deleteCollection('non-existent-id');
      } catch (err) {
        deleteErr = err;
      }

      const pass = updateErr?.statusCode === 404 && deleteErr?.statusCode === 404;
      record(
        'TEST D: Non-existent collection throws 404 on both update and delete',
        pass,
        `updateErr: ${updateErr?.statusCode}, deleteErr: ${deleteErr?.statusCode}`
      );
    }
  } finally {
    // Restore original methods
    Collection.findById = originalCollectionFindById;
    Collection.findByIdAndUpdate = originalCollectionFindByIdAndUpdate;
    Collection.findByIdAndDelete = originalCollectionFindByIdAndDelete;
    Product.countDocuments = originalProductCountDocuments;
    Product.updateMany = originalProductUpdateMany;
    cloudinary.uploader.destroy = originalCloudinaryDestroy;
  }

  console.log('\n========================================================');
  console.log(`  TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('========================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runCollectionIntegrityTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
