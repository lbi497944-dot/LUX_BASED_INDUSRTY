// Configure mock environment for testing Cloudinary integration BEFORE importing modules
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = 'test_key';
process.env.CLOUDINARY_API_SECRET = 'test_secret';

const { v2: cloudinary } = await import('cloudinary');
const { default: Project } = await import('./src/models/Project.js');
const { createProject, updateProject, deleteProject } = await import('./src/services/projectService.js');

async function runProjectMediaTests() {
  console.log('========================================================');
  console.log('  PROJECT MEDIA LIFECYCLE & CLOUDINARY CLEANUP TESTS');
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
  const originalFindById = Project.findById;
  const originalFindByIdAndUpdate = Project.findByIdAndUpdate;
  const originalFindByIdAndDelete = Project.findByIdAndDelete;
  const originalFindOne = Project.findOne;
  const originalCreate = Project.create;
  const originalDestroy = cloudinary.uploader.destroy;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Project creation with external URL persists cleanly with no Cloudinary call
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let createdProject = null;

      Project.findOne = async () => null; // slug uniqueness check
      Project.create = async (data) => {
        createdProject = data;
        return { _id: 'proj-1', ...data };
      };
      cloudinary.uploader.destroy = async (publicId) => { destroyedAssets.push(publicId); };

      const result = await createProject({
        title: 'New External Villa',
        coverImage: 'https://images.unsplash.com/photo-villa',
        coverImagePublicId: '',
        location: 'Dubai, UAE',
        category: 'Residential',
        description: 'Luxury villa project',
      });

      const pass = (
        result._id === 'proj-1' &&
        createdProject.coverImage === 'https://images.unsplash.com/photo-villa' &&
        createdProject.coverImagePublicId === '' &&
        destroyedAssets.length === 0
      );
      record('TEST 1: Project creation with external URL persists cleanly with no Cloudinary call', pass, `coverImage: ${createdProject?.coverImage}`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Project creation with uploaded Cloudinary cover stores URL and publicId
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let createdProject = null;

      Project.findOne = async () => null;
      Project.create = async (data) => {
        createdProject = data;
        return { _id: 'proj-2', ...data };
      };
      cloudinary.uploader.destroy = async (publicId) => { destroyedAssets.push(publicId); };

      const result = await createProject({
        title: 'New Cloudinary Hotel',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/hotel.jpg',
        coverImagePublicId: 'veloura_lighting/hotel_cover',
        location: 'Doha, Qatar',
        category: 'Hospitality',
        description: '5-star hotel lighting',
      });

      const pass = (
        result._id === 'proj-2' &&
        createdProject.coverImage === 'https://res.cloudinary.com/demo/image/upload/v1/hotel.jpg' &&
        createdProject.coverImagePublicId === 'veloura_lighting/hotel_cover' &&
        destroyedAssets.length === 0
      );
      record('TEST 2: Project creation with Cloudinary upload stores URL and publicId correctly', pass, `coverImagePublicId: ${createdProject?.coverImagePublicId}`);
    }

    // -------------------------------------------------------------------------
    // TEST 3: DB save failure on create rolls back newly uploaded cover asset
    // -------------------------------------------------------------------------
    {
      const rolledBackAssets = [];
      let createThrew = false;

      Project.findOne = async () => null;
      Project.create = async () => {
        throw new Error('Database validation failed');
      };

      cloudinary.uploader.destroy = async (publicId) => {
        rolledBackAssets.push(publicId);
        return { result: 'ok' };
      };

      try {
        await createProject({
          title: 'Failed Project Creation',
          coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/orphan_cover.jpg',
          coverImagePublicId: 'veloura_lighting/orphan_cover',
        });
      } catch {
        createThrew = true;
      }

      const pass = (
        createThrew === true &&
        rolledBackAssets.length === 1 &&
        rolledBackAssets[0] === 'veloura_lighting/orphan_cover'
      );
      record('TEST 3: DB save failure rolls back newly uploaded cover asset preventing orphan', pass, `rolledBack: ${JSON.stringify(rolledBackAssets)}, threw: ${createThrew}`);
    }

    // -------------------------------------------------------------------------
    // TEST 4: DB save failure on create rolls back newly uploaded gallery assets
    // -------------------------------------------------------------------------
    {
      const rolledBackAssets = [];
      let createThrew = false;

      Project.findOne = async () => null;
      Project.create = async () => {
        throw new Error('Database validation failed');
      };

      cloudinary.uploader.destroy = async (publicId) => {
        rolledBackAssets.push(publicId);
        return { result: 'ok' };
      };

      try {
        await createProject({
          title: 'Failed Project Gallery Creation',
          coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/cover.jpg',
          coverImagePublicId: 'veloura_lighting/cover',
          gallery: ['https://res.cloudinary.com/demo/image/upload/v1/g1.jpg', 'https://res.cloudinary.com/demo/image/upload/v1/g2.jpg'],
          galleryPublicIds: ['veloura_lighting/g1', 'veloura_lighting/g2'],
        });
      } catch {
        createThrew = true;
      }

      const pass = (
        createThrew === true &&
        rolledBackAssets.length === 3 &&
        rolledBackAssets.includes('veloura_lighting/cover') &&
        rolledBackAssets.includes('veloura_lighting/g1') &&
        rolledBackAssets.includes('veloura_lighting/g2')
      );
      record('TEST 4: DB save failure rolls back newly uploaded cover AND gallery assets', pass, `rolledBack: ${JSON.stringify(rolledBackAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Existing Project without publicId updates without calling Cloudinary destroy
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let updatedData = null;

      Project.findById = async (id) => ({
        _id: id,
        title: 'Legacy Project',
        coverImage: 'https://images.unsplash.com/photo-legacy',
        coverImagePublicId: '',
        gallery: [],
        galleryPublicIds: [],
      });

      Project.findByIdAndUpdate = async (id, data) => {
        updatedData = data;
        return { _id: id, ...data };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await updateProject('proj-5', {
        title: 'Legacy Project Renamed',
        coverImage: 'https://images.unsplash.com/photo-new',
        coverImagePublicId: '',
      });

      const pass = (
        result.title === 'Legacy Project Renamed' &&
        updatedData.coverImage === 'https://images.unsplash.com/photo-new' &&
        destroyedAssets.length === 0
      );
      record('TEST 5: Existing Project without publicId updates without calling Cloudinary destroy', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Replacing Cloudinary cover image deletes OLD publicId only AFTER successful update
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let dbUpdated = false;
      let destroyedAfterDb = false;

      Project.findById = async (id) => ({
        _id: id,
        title: 'Penthouse Project',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/old_cover.jpg',
        coverImagePublicId: 'veloura_lighting/old_cover',
      });

      Project.findByIdAndUpdate = async (id, data) => {
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

      const result = await updateProject('proj-6', {
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/new_cover.jpg',
        coverImagePublicId: 'veloura_lighting/new_cover',
      });

      const pass = (
        dbUpdated === true &&
        destroyedAfterDb === true &&
        destroyedAssets.length === 1 &&
        destroyedAssets[0] === 'veloura_lighting/old_cover' &&
        result.coverImagePublicId === 'veloura_lighting/new_cover'
      );
      record('TEST 6: Replacing Cloudinary cover deletes OLD publicId only AFTER successful update', pass, `destroyed: ${JSON.stringify(destroyedAssets)}, destroyedAfterDb: ${destroyedAfterDb}`);
    }

    // -------------------------------------------------------------------------
    // TEST 7: Switching from Cloudinary cover to external URL deletes old Cloudinary asset
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];

      Project.findById = async (id) => ({
        _id: id,
        title: 'Resort Project',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/resort_cloud.jpg',
        coverImagePublicId: 'veloura_lighting/resort_cloud',
      });

      Project.findByIdAndUpdate = async (id, data) => ({ _id: id, ...data });

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      await updateProject('proj-7', {
        coverImage: 'https://images.unsplash.com/photo-resort-external',
        coverImagePublicId: '',
      });

      const pass = (
        destroyedAssets.length === 1 &&
        destroyedAssets[0] === 'veloura_lighting/resort_cloud'
      );
      record('TEST 7: Switching from Cloudinary to external URL deletes old Cloudinary asset', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 8: Updating without changing cover image or publicId preserves asset without deletion
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];

      Project.findById = async (id) => ({
        _id: id,
        title: 'Static Project',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/same_cover.jpg',
        coverImagePublicId: 'veloura_lighting/same_cover',
      });

      Project.findByIdAndUpdate = async (id, data) => ({ _id: id, ...data });

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      await updateProject('proj-8', {
        title: 'Renamed Title Only',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/same_cover.jpg',
        coverImagePublicId: 'veloura_lighting/same_cover',
      });

      const pass = destroyedAssets.length === 0;
      record('TEST 8: Updating without changing coverImage or publicId preserves asset without deletion', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 9: DB update failure rolls back newly uploaded cover asset, preserving old
    // -------------------------------------------------------------------------
    {
      const rolledBackAssets = [];
      let updateThrew = false;

      Project.findById = async (id) => ({
        _id: id,
        title: 'Villa Project',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/old_cover.jpg',
        coverImagePublicId: 'veloura_lighting/old_cover',
      });

      Project.findByIdAndUpdate = async () => {
        throw new Error('Database write error');
      };

      cloudinary.uploader.destroy = async (publicId) => {
        rolledBackAssets.push(publicId);
        return { result: 'ok' };
      };

      try {
        await updateProject('proj-9', {
          coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/new_candidate.jpg',
          coverImagePublicId: 'veloura_lighting/new_candidate',
        });
      } catch {
        updateThrew = true;
      }

      const pass = (
        updateThrew === true &&
        rolledBackAssets.length === 1 &&
        rolledBackAssets[0] === 'veloura_lighting/new_candidate'
      );
      record('TEST 9: DB update failure rolls back NEW publicId, leaving old publicId untouched', pass, `rolledBack: ${JSON.stringify(rolledBackAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 10: Gallery item removal deletes only the removed asset(s)
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];

      Project.findById = async (id) => ({
        _id: id,
        title: 'Gallery Project',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/cover.jpg',
        coverImagePublicId: 'veloura_lighting/cover',
        gallery: [
          'https://res.cloudinary.com/demo/image/upload/v1/g1.jpg',
          'https://res.cloudinary.com/demo/image/upload/v1/g2.jpg',
        ],
        galleryPublicIds: [
          'veloura_lighting/g1',
          'veloura_lighting/g2',
        ],
      });

      Project.findByIdAndUpdate = async (id, data) => ({ _id: id, ...data });

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      // Remove g2, keep g1
      await updateProject('proj-10', {
        gallery: ['https://res.cloudinary.com/demo/image/upload/v1/g1.jpg'],
        galleryPublicIds: ['veloura_lighting/g1'],
      });

      const pass = (
        destroyedAssets.length === 1 &&
        destroyedAssets[0] === 'veloura_lighting/g2'
      );
      record('TEST 10: Removing a gallery image destroys only the removed Cloudinary publicId', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 11: Gallery reordering causes NO deletions
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];

      Project.findById = async (id) => ({
        _id: id,
        title: 'Reordered Gallery Project',
        gallery: [
          'https://res.cloudinary.com/demo/image/upload/v1/g1.jpg',
          'https://res.cloudinary.com/demo/image/upload/v1/g2.jpg',
        ],
        galleryPublicIds: [
          'veloura_lighting/g1',
          'veloura_lighting/g2',
        ],
      });

      Project.findByIdAndUpdate = async (id, data) => ({ _id: id, ...data });

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      // Swap order: g2, g1
      await updateProject('proj-11', {
        gallery: [
          'https://res.cloudinary.com/demo/image/upload/v1/g2.jpg',
          'https://res.cloudinary.com/demo/image/upload/v1/g1.jpg',
        ],
        galleryPublicIds: [
          'veloura_lighting/g2',
          'veloura_lighting/g1',
        ],
      });

      const pass = destroyedAssets.length === 0;
      record('TEST 11: Reordering gallery items preserves all assets with 0 deletions', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 12: Existing external URL Project deletes cleanly without Cloudinary destroy
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let deletedId = null;

      Project.findById = async (id) => ({
        _id: id,
        title: 'External URL Project',
        coverImage: 'https://images.unsplash.com/photo-ext',
        coverImagePublicId: '',
        gallery: ['https://images.unsplash.com/photo-g1'],
        galleryPublicIds: ['', '   ', null],
      });

      Project.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await deleteProject('proj-12');

      const pass = (
        destroyedAssets.length === 0 &&
        deletedId === 'proj-12' &&
        result._id === 'proj-12'
      );
      record('TEST 12: Existing external URL Project deletes cleanly without Cloudinary destroy', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 13: Project with coverImagePublicId and galleryPublicIds deletes all assets
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let deletedId = null;

      Project.findById = async (id) => ({
        _id: id,
        title: 'Cloudinary Project Complete',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/cover.jpg',
        coverImagePublicId: 'veloura_lighting/cover',
        gallery: [
          'https://res.cloudinary.com/demo/image/upload/v1/g1.jpg',
          'https://res.cloudinary.com/demo/image/upload/v1/g2.jpg',
        ],
        galleryPublicIds: [
          'veloura_lighting/g1',
          'veloura_lighting/g2',
        ],
      });

      Project.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAssets.push(publicId);
        return { result: 'ok' };
      };

      const result = await deleteProject('proj-13');

      const pass = (
        destroyedAssets.length === 3 &&
        destroyedAssets.includes('veloura_lighting/cover') &&
        destroyedAssets.includes('veloura_lighting/g1') &&
        destroyedAssets.includes('veloura_lighting/g2') &&
        deletedId === 'proj-13' &&
        result._id === 'proj-13'
      );
      record('TEST 13: Project deletion destroys cover and all gallery Cloudinary assets and deletes DB record', pass, `destroyed: ${JSON.stringify(destroyedAssets)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 14: Cloudinary deletion failure does not prevent DB deletion or throw 500
    // -------------------------------------------------------------------------
    {
      const destroyedAttempts = [];
      let deletedId = null;
      let deleteThrew = false;

      Project.findById = async (id) => ({
        _id: id,
        title: 'Project Cloudinary Error',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/cover.jpg',
        coverImagePublicId: 'veloura_lighting/error_cover',
        gallery: [],
        galleryPublicIds: [],
      });

      Project.findByIdAndDelete = async (id) => {
        deletedId = id;
        return { _id: id };
      };

      cloudinary.uploader.destroy = async (publicId) => {
        destroyedAttempts.push(publicId);
        throw new Error('Cloudinary timeout');
      };

      try {
        await deleteProject('proj-14');
      } catch {
        deleteThrew = true;
      }

      const pass = (
        deleteThrew === false &&
        destroyedAttempts.length === 1 &&
        destroyedAttempts[0] === 'veloura_lighting/error_cover' &&
        deletedId === 'proj-14'
      );
      record('TEST 14: Cloudinary deletion failure does not prevent DB deletion or throw error', pass, `threw: ${deleteThrew}, deletedId: ${deletedId}`);
    }

    // -------------------------------------------------------------------------
    // TEST 15: Non-existent Project throws 404 without Cloudinary or DB delete call
    // -------------------------------------------------------------------------
    {
      const destroyedAssets = [];
      let findByIdAndDeleteCalled = false;
      let caughtError = null;

      Project.findById = async () => null;
      Project.findByIdAndDelete = async () => { findByIdAndDeleteCalled = true; };
      cloudinary.uploader.destroy = async (publicId) => { destroyedAssets.push(publicId); };

      try {
        await deleteProject('non-existent-proj');
      } catch (err) {
        caughtError = err;
      }

      const pass = (
        caughtError !== null &&
        caughtError.statusCode === 404 &&
        caughtError.message.includes('Project not found with id: non-existent-proj') &&
        destroyedAssets.length === 0 &&
        findByIdAndDeleteCalled === false
      );
      record('TEST 15: Non-existent Project throws 404 without Cloudinary destroy or DB delete', pass, `error: ${caughtError?.message}`);
    }

  } finally {
    // Restore original methods
    Project.findById = originalFindById;
    Project.findByIdAndUpdate = originalFindByIdAndUpdate;
    Project.findByIdAndDelete = originalFindByIdAndDelete;
    Project.findOne = originalFindOne;
    Project.create = originalCreate;
    cloudinary.uploader.destroy = originalDestroy;
  }

  console.log('\n========================================================');
  console.log(`  TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('========================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runProjectMediaTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
