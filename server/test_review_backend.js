import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Review from './src/models/Review.js';
import * as reviewService from './src/services/reviewService.js';
import * as reviewController from './src/controllers/reviewController.js';
import { updateReviewNotesValidator } from './src/validators/reviewValidator.js';
import { validationResult } from 'express-validator';
import { uploadReviewImages } from './src/middleware/uploadMiddleware.js';
import router from './src/routes/reviewRoutes.js';
import { getDashboardStats } from './src/services/statsService.js';
import Product from './src/models/Product.js';
import Collection from './src/models/Collection.js';
import Project from './src/models/Project.js';
import Consultation from './src/models/Consultation.js';
import ContactEnquiry from './src/models/ContactEnquiry.js';
import NewsletterSubscriber from './src/models/NewsletterSubscriber.js';

console.log('========================================================');
console.log('  LUX BASED INDUSTRY: REVIEW SYSTEM BACKEND TEST SUITE');
console.log('========================================================\n');

let passCount = 0;
let failCount = 0;

async function test(name, fn) {
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

async function runTests() {
  // ----------------------------------------------------
  // 1. Review Mongoose Schema & Defaults
  // ----------------------------------------------------
  await test('TEST 1: Review model schema defines all required fields, constraints, and defaults', () => {
    const paths = Review.schema.paths;

    assert.ok(paths.name, 'name path must exist');
    assert.equal(paths.name.isRequired, true, 'name must be required');

    assert.ok(paths.email, 'email path must exist');
    assert.equal(paths.email.isRequired, true, 'email must be required');
    assert.equal(paths.email.options.select, false, 'email must be select: false (private)');

    assert.ok(paths.phone, 'phone path must exist');
    assert.equal(paths.phone.isRequired, true, 'phone must be required');
    assert.equal(paths.phone.options.select, false, 'phone must be select: false (private)');

    assert.ok(paths.rating, 'rating path must exist');
    assert.equal(paths.rating.isRequired, true, 'rating must be required');
    assert.equal(paths.rating.options.default, 5, 'rating default must be 5');

    assert.ok(paths.content, 'content path must exist');
    assert.equal(paths.content.isRequired, true, 'content must be required');

    // CRITICAL REQUIREMENT: projectLocation must NOT default to fake/sample 'Dubai, UAE'
    assert.ok(paths.projectLocation, 'projectLocation path must exist');
    assert.equal(paths.projectLocation.options.default, '', 'projectLocation must default to empty string, not fake data');

    assert.ok(paths.status, 'status path must exist');
    assert.equal(paths.status.options.default, 'Pending', 'status default must be Pending');
    assert.deepEqual(paths.status.options.enum, ['Pending', 'Approved', 'Rejected'], 'status must be enum');

    assert.ok(paths.adminNotes, 'adminNotes path must exist');
    assert.equal(paths.adminNotes.options.select, false, 'adminNotes must be select: false');

    assert.ok(paths.ipAddress, 'ipAddress path must exist');
    assert.equal(paths.ipAddress.options.select, false, 'ipAddress must be select: false');
  });

  await test('TEST 2: Review model indexes include status compound index', () => {
    const indexes = Review.schema.indexes();
    const hasCompound = indexes.some(
      ([spec]) => spec.status === 1 && spec.rating === -1 && spec.createdAt === -1
    );
    assert.ok(hasCompound, 'Review schema must define { status: 1, rating: -1, createdAt: -1 } compound index');
  });

  // ----------------------------------------------------
  // 2. Review Creation Service & Pending Queue
  // ----------------------------------------------------
  await test('TEST 3: reviewService.createReview creates pending review with processed images', async () => {
    const originalCreate = Review.create;
    let createdPayload = null;

    Review.create = async (payload) => {
      createdPayload = payload;
      return { _id: 'mock-review-id-123', ...payload };
    };

    try {
      const mockData = {
        name: '  Rashid Al-Nuaimi  ',
        email: '  RASHID@EXAMPLE.COM  ',
        phone: '  +971 50 123 4567  ',
        rating: 5,
        title: 'Bespoke Chandelier',
        content: 'Extraordinary optical dispersion and luminaire finishing.',
        projectLocation: 'Emirates Hills',
      };

      const mockFiles = [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/v1/chandelier1.jpg',
          publicId: 'veloura_lighting/reviews/rev1',
          filename: 'chandelier1.jpg',
          mimeType: 'image/jpeg',
        },
      ];

      const mockMeta = { ip: '192.168.1.50' };

      const result = await reviewService.createReview(mockData, mockFiles, mockMeta);

      assert.equal(createdPayload.name, 'Rashid Al-Nuaimi', 'Name should be trimmed');
      assert.equal(createdPayload.email, 'rashid@example.com', 'Email should be trimmed and lowercased');
      assert.equal(createdPayload.phone, '+971 50 123 4567', 'Phone should be trimmed');
      assert.equal(createdPayload.status, 'Pending', 'Status must be Pending');
      assert.equal(createdPayload.projectLocation, 'Emirates Hills', 'Location preserved');
      assert.equal(createdPayload.images.length, 1, '1 image preserved');
      assert.equal(createdPayload.images[0].publicId, 'veloura_lighting/reviews/rev1');
      assert.equal(createdPayload.ipAddress, '192.168.1.50', 'IP address logged');
      assert.equal(result._id, 'mock-review-id-123');
    } finally {
      Review.create = originalCreate;
    }
  });

  // ----------------------------------------------------
  // 3. Public Review Retrieval & Privacy Projection
  // ----------------------------------------------------
  await test('TEST 4: reviewService.getPublicReviews queries only Approved reviews and excludes PII', async () => {
    const originalFind = Review.find;
    const originalCount = Review.countDocuments;
    let queryFilter = null;
    let projectedFields = null;

    Review.countDocuments = async (filter) => 1;
    Review.find = (filter) => {
      queryFilter = filter;
      return {
        select: (fields) => {
          projectedFields = fields;
          return {
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: async () => [
                    {
                      _id: 'mock-1',
                      name: 'Fatima Al-Sabah',
                      rating: 5,
                      title: 'Dining Chandelier',
                      content: 'Incredible craftsmanship.',
                      projectLocation: 'Palm Jumeirah',
                      images: [{ url: 'https://cloudinary.com/img1.jpg' }],
                      createdAt: new Date(),
                    },
                  ],
                }),
              }),
            }),
          };
        },
      };
    };

    try {
      const result = await reviewService.getPublicReviews({ rating: 5, page: 1, limit: 10 });
      assert.equal(queryFilter.status, 'Approved', 'Filter must enforce status: Approved');
      assert.equal(queryFilter.rating, 5, 'Rating filter applied');
      assert.ok(!projectedFields.includes('email'), 'email must NOT be projected in public queries');
      assert.ok(!projectedFields.includes('phone'), 'phone must NOT be projected in public queries');
      assert.ok(!projectedFields.includes('adminNotes'), 'adminNotes must NOT be projected in public queries');
      assert.ok(!projectedFields.includes('ipAddress'), 'ipAddress must NOT be projected in public queries');
      assert.equal(result.reviews.length, 1);
      assert.equal(result.reviews[0].email, undefined, 'Public result must not expose email');
      assert.equal(result.reviews[0].phone, undefined, 'Public result must not expose phone');
    } finally {
      Review.find = originalFind;
      Review.countDocuments = originalCount;
    }
  });

  // ----------------------------------------------------
  // 4. Admin Review Moderation Lifecycle
  // ----------------------------------------------------
  await test('TEST 5: reviewService.updateReviewStatus transitions status and records audit timestamps', async () => {
    const originalFindById = Review.findById;
    let savedDoc = null;

    const mockDoc = {
      _id: 'rev-456',
      status: 'Pending',
      moderatedAt: null,
      moderatedBy: null,
      save: async function () {
        savedDoc = this;
        return this;
      },
    };

    Review.findById = () => ({
      select: () => mockDoc,
    });

    try {
      const adminId = 'admin-user-789';
      await reviewService.updateReviewStatus('rev-456', 'Approved', adminId);

      assert.equal(savedDoc.status, 'Approved', 'Status must be updated to Approved');
      assert.ok(savedDoc.moderatedAt instanceof Date, 'moderatedAt must be recorded');
      assert.equal(savedDoc.moderatedBy, adminId, 'moderatedBy admin ID must be stamped');
    } finally {
      Review.findById = originalFindById;
    }
  });

  // ----------------------------------------------------
  // 5. Admin Deletion & Cloudinary Asset Destruction
  // ----------------------------------------------------
  await test('TEST 6: reviewService.deleteReview deletes document and destroys attached Cloudinary assets', async () => {
    const originalFindById = Review.findById;
    const originalFindByIdAndDelete = Review.findByIdAndDelete;
    let deletedId = null;

    const mockDoc = {
      _id: 'rev-delete-1',
      images: [
        { publicId: 'veloura_lighting/reviews/photo_1' },
        { publicId: 'veloura_lighting/reviews/photo_2' },
      ],
    };

    Review.findById = async (id) => mockDoc;
    Review.findByIdAndDelete = async (id) => {
      deletedId = id;
      return mockDoc;
    };

    try {
      await reviewService.deleteReview('rev-delete-1');
      assert.equal(deletedId, 'rev-delete-1', 'Document must be deleted by ID');
    } finally {
      Review.findById = originalFindById;
      Review.findByIdAndDelete = originalFindByIdAndDelete;
    }
  });

  // ----------------------------------------------------
  // 6. Review Upload File Filter Security
  // ----------------------------------------------------
  await test('TEST 7: uploadReviewImages fileFilter accepts image extensions and strictly rejects dangerous formats', () => {
    const filter = uploadReviewImages.fileFilter;

    let acceptedJpg = false;
    filter({}, { originalname: 'installed_light.jpg', mimetype: 'image/jpeg' }, (err, allowed) => {
      acceptedJpg = !err && allowed === true;
    });
    assert.equal(acceptedJpg, true, 'JPG image must be accepted');

    let acceptedPng = false;
    filter({}, { originalname: 'fixture.PNG', mimetype: 'image/png' }, (err, allowed) => {
      acceptedPng = !err && allowed === true;
    });
    assert.equal(acceptedPng, true, 'PNG image must be accepted');

    let acceptedWebp = false;
    filter({}, { originalname: 'villa.webp', mimetype: 'image/webp' }, (err, allowed) => {
      acceptedWebp = !err && allowed === true;
    });
    assert.equal(acceptedWebp, true, 'WEBP image must be accepted');

    // Reject dangerous formats
    let rejectedSvg = false;
    filter({}, { originalname: 'xss_payload.svg', mimetype: 'image/svg+xml' }, (err, allowed) => {
      rejectedSvg = Boolean(err) && allowed === false;
    });
    assert.equal(rejectedSvg, true, 'SVG must be rejected to prevent Stored XSS');

    let rejectedPdf = false;
    filter({}, { originalname: 'specs.pdf', mimetype: 'application/pdf' }, (err, allowed) => {
      rejectedPdf = Boolean(err) && allowed === false;
    });
    assert.equal(rejectedPdf, true, 'PDF must be rejected for reviews');

    let rejectedMp4 = false;
    filter({}, { originalname: 'video.mp4', mimetype: 'video/mp4' }, (err, allowed) => {
      rejectedMp4 = Boolean(err) && allowed === false;
    });
    assert.equal(rejectedMp4, true, 'MP4 video must be rejected for reviews');
  });

  // ----------------------------------------------------
  // 7. Express Router Structure
  // ----------------------------------------------------
  await test('TEST 8: reviewRoutes mounts public submission and protected admin routes', () => {
    const routes = router.stack.map((layer) => ({
      path: layer.route?.path,
      methods: Object.keys(layer.route?.methods || {}),
    })).filter((r) => r.path);

    const postRoot = routes.find((r) => r.path === '/' && r.methods.includes('post'));
    assert.ok(postRoot, 'Must expose POST / for public review submission');

    const getPublic = routes.find((r) => r.path === '/public' && r.methods.includes('get'));
    assert.ok(getPublic, 'Must expose GET /public for approved reviews');

    const getAdmin = routes.find((r) => r.path === '/' && r.methods.includes('get'));
    assert.ok(getAdmin, 'Must expose GET / for admin list');

    const patchStatus = routes.find((r) => r.path === '/:id/status' && r.methods.includes('patch'));
    assert.ok(patchStatus, 'Must expose PATCH /:id/status for moderation');

    const deleteRoute = routes.find((r) => r.path === '/:id' && r.methods.includes('delete'));
    assert.ok(deleteRoute, 'Must expose DELETE /:id');
  });

  // ----------------------------------------------------
  // 8. Stats Service Integration
  // ----------------------------------------------------
  await test('TEST 9: statsService includes pendingReviews and totalReviews counts', async () => {
    const origProduct = Product.countDocuments;
    const origCol = Collection.countDocuments;
    const origProj = Project.countDocuments;
    const origConsult = Consultation.countDocuments;
    const origConsultFind = Consultation.find;
    const origContact = ContactEnquiry.countDocuments;
    const origContactFind = ContactEnquiry.find;
    const origNews = NewsletterSubscriber.countDocuments;
    const origReview = Review.countDocuments;

    Product.countDocuments = async () => 10;
    Collection.countDocuments = async () => 5;
    Project.countDocuments = async () => 8;
    Consultation.countDocuments = async () => 3;
    Consultation.find = () => ({ sort: () => ({ limit: async () => [] }) });
    ContactEnquiry.countDocuments = async () => 4;
    ContactEnquiry.find = () => ({ sort: () => ({ limit: async () => [] }) });
    NewsletterSubscriber.countDocuments = async () => 20;

    let reviewQueryCount = 0;
    Review.countDocuments = async (filter) => {
      reviewQueryCount++;
      if (filter && filter.status === 'Pending') {
        return 7; // 7 pending reviews
      }
      return 15; // 15 total reviews
    };

    try {
      const stats = await getDashboardStats();
      assert.equal(stats.counts.totalReviews, 15, 'totalReviews must be 15');
      assert.equal(stats.counts.pendingReviews, 7, 'pendingReviews must be 7');
      assert.ok(reviewQueryCount >= 2, 'Review.countDocuments called for total and pending');
    } finally {
      Product.countDocuments = origProduct;
      Collection.countDocuments = origCol;
      Project.countDocuments = origProj;
      Consultation.countDocuments = origConsult;
      Consultation.find = origConsultFind;
      ContactEnquiry.countDocuments = origContact;
      ContactEnquiry.find = origContactFind;
      NewsletterSubscriber.countDocuments = origNews;
      Review.countDocuments = origReview;
    }
  });

  // ----------------------------------------------------
  // 9. Transactional Cloudinary Rollback
  // ----------------------------------------------------
  await test('TEST 10: Cloudinary rollback: when Review.create fails, all uploaded Cloudinary assets are deleted', async () => {
    const origProcess = reviewController._deps.processUploadedFile;
    const origDelete = reviewController._deps.deleteCloudinaryAsset;
    const origCreate = reviewController._deps.createReview;

    const deletedAssets = [];
    reviewController._deps.processUploadedFile = async (file) => ({
      url: `https://res.cloudinary.com/${file.name}`,
      publicId: `veloura_lighting/reviews/${file.name}`,
      filename: `${file.name}.jpg`,
      mimeType: 'image/jpeg',
    });
    reviewController._deps.deleteCloudinaryAsset = async (publicId) => {
      deletedAssets.push(publicId);
    };
    reviewController._deps.createReview = async () => {
      throw new Error('Database write failure');
    };

    let errorCaught = null;
    const req = {
      files: [{ name: 'img1' }, { name: 'img2' }, { name: 'img3' }],
      body: { name: 'Rashid' },
      headers: {},
    };
    const res = {};
    const next = (err) => {
      errorCaught = err;
    };

    try {
      await reviewController.createReview(req, res, next);
      assert.ok(errorCaught, 'Error must be passed to next()');
      assert.equal(errorCaught.message, 'Database write failure');
      assert.equal(deletedAssets.length, 3, 'All 3 assets must be rolled back');
      assert.deepEqual(deletedAssets, [
        'veloura_lighting/reviews/img1',
        'veloura_lighting/reviews/img2',
        'veloura_lighting/reviews/img3',
      ]);
    } finally {
      reviewController._deps.processUploadedFile = origProcess;
      reviewController._deps.deleteCloudinaryAsset = origDelete;
      reviewController._deps.createReview = origCreate;
    }
  });

  await test('TEST 11: Cloudinary rollback: when a later image upload fails, earlier uploaded assets are deleted', async () => {
    const origProcess = reviewController._deps.processUploadedFile;
    const origDelete = reviewController._deps.deleteCloudinaryAsset;
    const origCreate = reviewController._deps.createReview;

    const deletedAssets = [];
    let callCount = 0;
    reviewController._deps.processUploadedFile = async (file) => {
      callCount++;
      if (callCount === 2) {
        throw new Error('Cloudinary timeout on img2');
      }
      return {
        url: `https://res.cloudinary.com/${file.name}`,
        publicId: `veloura_lighting/reviews/${file.name}`,
      };
    };
    reviewController._deps.deleteCloudinaryAsset = async (publicId) => {
      deletedAssets.push(publicId);
    };

    let errorCaught = null;
    const req = {
      files: [{ name: 'img1' }, { name: 'img2' }],
      body: { name: 'Fatima' },
      headers: {},
    };
    const res = {};
    const next = (err) => {
      errorCaught = err;
    };

    try {
      await reviewController.createReview(req, res, next);
      assert.ok(errorCaught, 'Error must be passed to next()');
      assert.equal(errorCaught.message, 'Cloudinary timeout on img2');
      assert.equal(deletedAssets.length, 1, 'Only successfully uploaded assets before failure should be rolled back');
      assert.equal(deletedAssets[0], 'veloura_lighting/reviews/img1');
    } finally {
      reviewController._deps.processUploadedFile = origProcess;
      reviewController._deps.deleteCloudinaryAsset = origDelete;
      reviewController._deps.createReview = origCreate;
    }
  });

  await test('TEST 12: Cloudinary rollback: cleanup failure does NOT mask original error', async () => {
    const origProcess = reviewController._deps.processUploadedFile;
    const origDelete = reviewController._deps.deleteCloudinaryAsset;
    const origCreate = reviewController._deps.createReview;

    reviewController._deps.processUploadedFile = async () => ({
      publicId: 'asset-1',
    });
    reviewController._deps.deleteCloudinaryAsset = async () => {
      throw new Error('Network error deleting from Cloudinary');
    };
    reviewController._deps.createReview = async () => {
      throw new Error('Original Database Failure');
    };

    let errorCaught = null;
    const req = {
      files: [{ name: 'img1' }],
      body: { name: 'Test' },
      headers: {},
    };
    const res = {};
    const next = (err) => {
      errorCaught = err;
    };

    try {
      await reviewController.createReview(req, res, next);
      assert.ok(errorCaught, 'Error must be passed to next()');
      assert.equal(errorCaught.message, 'Original Database Failure', 'Original error must not be replaced by cleanup error');
    } finally {
      reviewController._deps.processUploadedFile = origProcess;
      reviewController._deps.deleteCloudinaryAsset = origDelete;
      reviewController._deps.createReview = origCreate;
    }
  });

  await test('TEST 13: Successful review creation preserves uploaded assets without deletion', async () => {
    const origProcess = reviewController._deps.processUploadedFile;
    const origDelete = reviewController._deps.deleteCloudinaryAsset;
    const origCreate = reviewController._deps.createReview;

    const deletedAssets = [];
    reviewController._deps.processUploadedFile = async () => ({
      publicId: 'asset-keep',
    });
    reviewController._deps.deleteCloudinaryAsset = async (publicId) => {
      deletedAssets.push(publicId);
    };
    reviewController._deps.createReview = async () => ({
      _id: 'new-review-123',
    });

    let statusCode = null;
    let jsonResponse = null;
    const req = {
      files: [{ name: 'img1' }],
      body: { name: 'Happy Client' },
      headers: {},
    };
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResponse = data;
          },
        };
      },
    };
    const next = () => {};

    try {
      await reviewController.createReview(req, res, next);
      assert.equal(statusCode, 201, 'Status code must be 201');
      assert.equal(deletedAssets.length, 0, 'No assets should be deleted on success');
    } finally {
      reviewController._deps.processUploadedFile = origProcess;
      reviewController._deps.deleteCloudinaryAsset = origDelete;
      reviewController._deps.createReview = origCreate;
    }
  });

  // ----------------------------------------------------
  // 10. Admin Status Filter Whitelisting
  // ----------------------------------------------------
  await test('TEST 14: getAllReviews status filter: Pending maps to filter.status = "Pending"', async () => {
    let capturedFilter = null;
    const origCount = Review.countDocuments;
    const origFind = Review.find;

    Review.countDocuments = async (filter) => {
      capturedFilter = filter;
      return 1;
    };
    Review.find = () => ({
      select: () => ({
        populate: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => [],
              }),
            }),
          }),
        }),
      }),
    });

    try {
      await reviewService.getAllReviews({ status: 'Pending' });
      assert.equal(capturedFilter.status, 'Pending');
    } finally {
      Review.countDocuments = origCount;
      Review.find = origFind;
    }
  });

  await test('TEST 15: getAllReviews status filter: Approved maps to filter.status = "Approved"', async () => {
    let capturedFilter = null;
    const origCount = Review.countDocuments;
    const origFind = Review.find;

    Review.countDocuments = async (filter) => {
      capturedFilter = filter;
      return 1;
    };
    Review.find = () => ({
      select: () => ({
        populate: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => [],
              }),
            }),
          }),
        }),
      }),
    });

    try {
      await reviewService.getAllReviews({ status: 'Approved' });
      assert.equal(capturedFilter.status, 'Approved');
    } finally {
      Review.countDocuments = origCount;
      Review.find = origFind;
    }
  });

  await test('TEST 16: getAllReviews status filter: Rejected maps to filter.status = "Rejected"', async () => {
    let capturedFilter = null;
    const origCount = Review.countDocuments;
    const origFind = Review.find;

    Review.countDocuments = async (filter) => {
      capturedFilter = filter;
      return 1;
    };
    Review.find = () => ({
      select: () => ({
        populate: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => [],
              }),
            }),
          }),
        }),
      }),
    });

    try {
      await reviewService.getAllReviews({ status: 'Rejected' });
      assert.equal(capturedFilter.status, 'Rejected');
    } finally {
      Review.countDocuments = origCount;
      Review.find = origFind;
    }
  });

  await test('TEST 17: getAllReviews status filter: ALL leaves filter.status undefined', async () => {
    let capturedFilter = null;
    const origCount = Review.countDocuments;
    const origFind = Review.find;

    Review.countDocuments = async (filter) => {
      capturedFilter = filter;
      return 1;
    };
    Review.find = () => ({
      select: () => ({
        populate: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => [],
              }),
            }),
          }),
        }),
      }),
    });

    try {
      await reviewService.getAllReviews({ status: 'ALL' });
      assert.equal(capturedFilter.status, undefined, 'Status filter should not be set for ALL');
    } finally {
      Review.countDocuments = origCount;
      Review.find = origFind;
    }
  });

  await test('TEST 18: getAllReviews status filter: invalid string rejects with 400 error', async () => {
    await assert.rejects(
      async () => {
        await reviewService.getAllReviews({ status: 'BOGUS_STATUS' });
      },
      (err) => err.statusCode === 400 && err.message.includes('Invalid status filter')
    );
  });

  await test('TEST 19: getAllReviews status filter: object operator { $ne: "Approved" } rejects with 400 error', async () => {
    await assert.rejects(
      async () => {
        await reviewService.getAllReviews({ status: { $ne: 'Approved' } });
      },
      (err) => err.statusCode === 400 && err.message.includes('Invalid status filter')
    );
  });

  // ----------------------------------------------------
  // 11. Admin Notes Validation (Max 1000 characters)
  // ----------------------------------------------------
  await test('TEST 20: updateReviewNotesValidator enforces max 1000 characters limit', async () => {
    // 1001 characters should fail
    const reqFail = { body: { adminNotes: 'x'.repeat(1001) } };
    for (const middleware of updateReviewNotesValidator) {
      await middleware(reqFail, {}, () => {});
    }
    const errorsFail = validationResult(reqFail);
    assert.ok(!errorsFail.isEmpty(), 'Validation must fail for 1001 characters');
    const msg = errorsFail.array().find((e) => e.path === 'adminNotes')?.msg;
    assert.equal(msg, 'Admin notes cannot exceed 1000 characters');

    // 1000 characters should pass
    const reqPass = { body: { adminNotes: 'x'.repeat(1000) } };
    for (const middleware of updateReviewNotesValidator) {
      await middleware(reqPass, {}, () => {});
    }
    const errorsPass = validationResult(reqPass);
    assert.ok(errorsPass.isEmpty(), 'Validation must pass for 1000 characters');
  });

  console.log('\n========================================================');
  console.log(`  BACKEND TESTS COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('========================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
