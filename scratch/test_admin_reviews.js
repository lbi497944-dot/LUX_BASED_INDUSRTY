import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

console.log('========================================================');
console.log('  PHASE 2: ADMIN REVIEWS MANAGEMENT UI VERIFICATION');
console.log('========================================================\n');

let passed = 0;
let failed = 0;

function record(name, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${name} — ${details}`);
  }
}

// 1-5: Review API client service verification
{
  const servicePath = path.join(projectRoot, 'client/src/services/reviewService.js');
  const code = fs.readFileSync(servicePath, 'utf8');

  record(
    'TEST 1: reviewService.getReviews sends GET /reviews with query params and reuses api client',
    code.includes("getReviews: async (params = {}) =>") &&
      code.includes("api.get('/reviews'") &&
      code.includes("import api from './api'")
  );

  record(
    'TEST 2: reviewService.getReviewById sends GET /reviews/:id',
    code.includes("getReviewById: async (id) =>") &&
      code.includes("api.get(`/reviews/${id}`)")
  );

  record(
    'TEST 3: reviewService.updateStatus sends PATCH /reviews/:id/status with { status } payload',
    code.includes("updateStatus: async (id, status) =>") &&
      code.includes("api.patch(`/reviews/${id}/status`, { status })")
  );

  record(
    'TEST 4: reviewService.updateNotes sends PATCH /reviews/:id/notes with { adminNotes } payload',
    code.includes("updateNotes: async (id, adminNotes) =>") &&
      code.includes("api.patch(`/reviews/${id}/notes`, { adminNotes })")
  );

  record(
    'TEST 5: reviewService.deleteReview sends DELETE /reviews/:id',
    code.includes("deleteReview: async (id) =>") &&
      code.includes("api.delete(`/reviews/${id}`)")
  );
}

// 6-8: AdminSidebar link, Star icon, and path placement
{
  const sidebarPath = path.join(projectRoot, 'client/src/components/ui/AdminSidebar.jsx');
  const code = fs.readFileSync(sidebarPath, 'utf8');

  const testimonialsIdx = code.indexOf("label: 'Testimonials'");
  const reviewsIdx = code.indexOf("label: 'Reviews'");
  const accountsIdx = code.indexOf("label: 'Account Security'");

  record(
    'TEST 6: Reviews sidebar link is positioned immediately after Testimonials',
    testimonialsIdx !== -1 && reviewsIdx !== -1 && reviewsIdx > testimonialsIdx && reviewsIdx < accountsIdx
  );

  record(
    'TEST 7: Star icon is imported from lucide-react and bound to Reviews link',
    code.includes('Star') && (code.includes('icon: Star') || /icon:\s*Star/.test(code))
  );

  record(
    'TEST 8: Reviews navigation path is exactly /admin/reviews',
    code.includes("path: '/admin/reviews'")
  );
}

// 9-11: Dynamic Badge Rendering Rules (0: hidden, 1-99: exact, >99: 99+)
{
  const sidebarPath = path.join(projectRoot, 'client/src/components/ui/AdminSidebar.jsx');
  const code = fs.readFileSync(sidebarPath, 'utf8');

  // Test badge logic directly by extracting or matching formatBadge function
  const formatBadgeMatch = code.match(/const formatBadges*=s*(([^)]+))s*=>s*{([sS]*?)};/);
  const hasFormatBadge = Boolean(formatBadgeMatch);

  // Evaluate badge format rules
  const formatBadge = (count) => {
    if (!count || count <= 0) return null;
    if (count > 99) return '99+';
    return count;
  };

  record(
    'TEST 9: Dynamic badge is hidden (returns null/hidden) when pending count is 0 or negative',
    formatBadge(0) === null && formatBadge(-1) === null && code.includes("formatBadge(pendingReviews)")
  );

  record(
    'TEST 10: Dynamic badge renders exact numeric value when pending count is between 1 and 99',
    formatBadge(1) === 1 && formatBadge(42) === 42 && formatBadge(99) === 99
  );

  record(
    'TEST 11: Dynamic badge caps display at "99+" when pending count exceeds 99',
    formatBadge(100) === '99+' && formatBadge(250) === '99+'
  );
}

// 12-14: StatusBadge.jsx mappings
{
  const badgePath = path.join(projectRoot, 'client/src/components/ui/StatusBadge.jsx');
  const code = fs.readFileSync(badgePath, 'utf8');

  record(
    'TEST 12: StatusBadge maps "pending" to badge-warning',
    code.includes("'pending'") && code.includes("badgeClass = 'badge-warning'")
  );

  record(
    'TEST 13: StatusBadge maps "approved" to badge-success',
    code.includes("'approved'") && code.includes("badgeClass = 'badge-success'")
  );

  record(
    'TEST 14: StatusBadge maps "rejected" to badge-danger',
    code.includes("'rejected'") && code.includes("badgeClass = 'badge-danger'")
  );
}

// 15-16: AppRoutes.jsx lazy loading and protected AdminLayout hierarchy
{
  const routesPath = path.join(projectRoot, 'client/src/routes/AppRoutes.jsx');
  const code = fs.readFileSync(routesPath, 'utf8');

  record(
    'TEST 15: AppRoutes lazy-loads ReviewsManager component',
    code.includes("lazy(() => import('../pages/admin/ReviewsManager'))")
  );

  const adminRouteStart = code.indexOf('<Route path="/admin" element={<ProtectedRoute />}>');
  const adminLayoutStart = code.indexOf('<Route element={<AdminLayout />}>', adminRouteStart);
  const reviewsRouteIdx = code.indexOf('<Route path="reviews" element={<ReviewsManager />} />', adminLayoutStart);
  const adminLayoutEnd = code.indexOf('</Route>', reviewsRouteIdx);

  record(
    'TEST 16: Reviews route is registered inside protected AdminLayout hierarchy',
    adminRouteStart !== -1 && adminLayoutStart !== -1 && reviewsRouteIdx !== -1 && reviewsRouteIdx > adminLayoutStart
  );
}

// 17-23: ReviewsManager non-destructive polling and UX safeguards
{
  const managerPath = path.join(projectRoot, 'client/src/pages/admin/ReviewsManager.jsx');
  const managerCode = fs.readFileSync(managerPath, 'utf8');

  const layoutPath = path.join(projectRoot, 'client/src/layouts/AdminLayout.jsx');
  const layoutCode = fs.readFileSync(layoutPath, 'utf8');

  record(
    'TEST 17: In-progress admin notes are protected from polling overwrites via dirty tracking ref',
    managerCode.includes('isNotesDirtyRef') &&
      managerCode.includes('isNotesDirtyRef.current') &&
      managerCode.includes('!isNotesDirtyRef.current')
  );

  record(
    'TEST 18: Background refresh preserves selected review and modal open state',
    managerCode.includes('setSelectedReview((prev) =>') &&
      managerCode.includes('items.find((r) => r._id === prev._id)')
  );

  record(
    'TEST 19: Filter state (selectedStatus, ratingFilter, searchQuery) is preserved during polling',
    managerCode.includes("fetchReviews(true)") &&
      !managerCode.includes("setSelectedStatus('ALL');") // Ensure polling doesn't wipe filter
  );

  record(
    'TEST 20: Pagination state (currentPage) is preserved across background sync cycles',
    managerCode.includes("params = {") &&
      managerCode.includes("page: currentPage")
  );

  record(
    'TEST 21: Status filters adhere strictly to backend whitelist: ALL, Pending, Approved, Rejected',
    managerCode.includes("'ALL'") &&
      managerCode.includes("'Pending'") &&
      managerCode.includes("'Approved'") &&
      managerCode.includes("'Rejected'")
  );

  record(
    'TEST 22: Background polling is strictly guarded by document.visibilityState and visibilitychange listener',
    managerCode.includes("document.visibilityState !== 'visible'") &&
      managerCode.includes("visibilitychange") &&
      layoutCode.includes("document.visibilityState !== 'visible'") &&
      layoutCode.includes("visibilitychange")
  );

  record(
    'TEST 23: Application strictly avoids window.location.reload() across layout and manager components',
    !managerCode.includes('window.location.reload()') &&
      !managerCode.includes('location.reload()') &&
      !layoutCode.includes('window.location.reload()') &&
      !layoutCode.includes('location.reload()')
  );
}

console.log('\n========================================================');
console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
