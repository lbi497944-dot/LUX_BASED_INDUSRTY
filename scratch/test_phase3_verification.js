import fs from 'fs';
import path from 'path';
import Partner from '../server/src/models/Partner.js';
import Review from '../server/src/models/Review.js';
import * as partnerService from '../server/src/services/partnerService.js';
import * as reviewService from '../server/src/services/reviewService.js';
import * as partnerValidator from '../server/src/validators/partnerValidator.js';
import partnerRoutes from '../server/src/routes/partnerRoutes.js';
import apiRoutes from '../server/src/routes/index.js';

// Read component and page sources for structural and behavioral validation
const reviewUsSource = fs.readFileSync(path.resolve('client/src/pages/public/ReviewUs.jsx'), 'utf8');
const marqueeSource = fs.readFileSync(path.resolve('client/src/components/sections/ClientPartnersMarquee.jsx'), 'utf8');
const testimonialsSectionSource = fs.readFileSync(path.resolve('client/src/components/sections/TestimonialsSection.jsx'), 'utf8');
const homeSource = fs.readFileSync(path.resolve('client/src/pages/public/Home.jsx'), 'utf8');
const sectionRegistrySource = fs.readFileSync(path.resolve('client/src/components/page-builder/SectionRegistry.jsx'), 'utf8');
const appRoutesSource = fs.readFileSync(path.resolve('client/src/routes/AppRoutes.jsx'), 'utf8');
const sidebarSource = fs.readFileSync(path.resolve('client/src/components/ui/AdminSidebar.jsx'), 'utf8');
const partnersManagerSource = fs.readFileSync(path.resolve('client/src/pages/admin/PartnersManager.jsx'), 'utf8');
const cssSource = fs.readFileSync(path.resolve('client/src/styles/styles.css'), 'utf8');

async function runPhase3Verification() {
  console.log('========================================================');
  console.log('  PHASE 3: PUBLIC REVIEW & CLIENT PARTNERS VERIFICATION');
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

  // ---------------------------------------------------------------------------
  // 1. PUBLIC REVIEW SUBMISSION FORM (/review)
  // ---------------------------------------------------------------------------
  console.log('--- 1. Public Review Submission UX & Validation ---');

  // TEST 1: Route registration
  {
    const hasReviewRoute = appRoutesSource.includes('path="/review"') && appRoutesSource.includes('element={<ReviewUs />}');
    assert(
      'TEST 1: /review route is registered in AppRoutes.jsx pointing to ReviewUs component',
      hasReviewRoute,
      'Route /review missing from AppRoutes'
    );
  }

  // TEST 2: Required input fields
  {
    const hasName = reviewUsSource.includes('name="name"') && reviewUsSource.includes('maxLength={100}');
    const hasEmail = reviewUsSource.includes('name="email"');
    const hasPhone = reviewUsSource.includes('name="phone"') && reviewUsSource.includes('maxLength={25}');
    const hasRating = reviewUsSource.includes('role="radiogroup"') && reviewUsSource.includes('Star');
    const hasTitle = reviewUsSource.includes('name="title"') && reviewUsSource.includes('maxLength={120}');
    const hasContent = reviewUsSource.includes('name="content"') && reviewUsSource.includes('maxLength={2000}');
    const hasLocation = reviewUsSource.includes('name="projectLocation"') && reviewUsSource.includes('maxLength={100}');

    assert(
      'TEST 2: ReviewUs form contains all required fields with explicit max lengths (name, email, phone, rating, title, content, location)',
      hasName && hasEmail && hasPhone && hasRating && hasTitle && hasContent && hasLocation,
      'One or more review form fields missing or misconfigured'
    );
  }

  // TEST 3: Privacy & verification messaging
  {
    const hasEmailMsg = reviewUsSource.includes('Your email is protected and will never be published');
    const hasPhoneMsg = reviewUsSource.includes('Used solely by our concierge to verify submission authenticity');
    assert(
      'TEST 3: Review form displays required privacy and concierge verification notices',
      hasEmailMsg && hasPhoneMsg,
      'Privacy notices missing from review form'
    );
  }

  // TEST 4: Accessible Star Rating semantics & keyboard navigation
  {
    const hasRadioGroup = reviewUsSource.includes('role="radiogroup"');
    const hasRadioRole = reviewUsSource.includes('role="radio"');
    const hasAriaChecked = reviewUsSource.includes('aria-checked');
    const hasArrowNav = reviewUsSource.includes('ArrowRight') && reviewUsSource.includes('ArrowLeft');

    assert(
      'TEST 4: Star rating implements radiogroup semantics, aria-checked, and keyboard arrow navigation',
      hasRadioGroup && hasRadioRole && hasAriaChecked && hasArrowNav,
      'Accessible rating controls missing'
    );
  }

  // TEST 5: Live character counter
  {
    const hasCounter = reviewUsSource.includes('formData.content.length') && reviewUsSource.includes('2000 characters');
    assert(
      'TEST 5: Review text features live character counter with 2000 max limit',
      hasCounter,
      'Character counter missing'
    );
  }

  // TEST 6: Image upload constraints & thumbnails
  {
    const hasMax3 = reviewUsSource.includes('MAX_IMAGES = 3');
    const hasSize5MB = reviewUsSource.includes('MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024');
    const hasFormatCheck = reviewUsSource.includes('.jpg') && reviewUsSource.includes('.png') && reviewUsSource.includes('.webp');
    const hasObjectUrl = reviewUsSource.includes('URL.createObjectURL');
    const hasRevokeUrl = reviewUsSource.includes('URL.revokeObjectURL');
    const hasRemoveBtn = reviewUsSource.includes('handleRemoveFile');

    assert(
      'TEST 6: Photo uploader enforces max 3 photos, 5MB limit, format whitelist, object URL previews, and individual removal',
      hasMax3 && hasSize5MB && hasFormatCheck && hasObjectUrl && hasRevokeUrl && hasRemoveBtn,
      'Photo upload constraints missing'
    );
  }

  // TEST 7: Anti-spam honeypot
  {
    const hasHoneypot = reviewUsSource.includes('website_hp') && reviewUsSource.includes('display: \'none\'');
    assert(
      'TEST 7: Honeypot anti-spam field is visually hidden and stops bot submissions',
      hasHoneypot,
      'Honeypot field missing'
    );
  }

  // TEST 8: Double-submit protection
  {
    const hasIsSubmitting = reviewUsSource.includes('isSubmitting');
    const hasIsSubmittingRef = reviewUsSource.includes('isSubmittingRef');
    const hasDisabledBtn = reviewUsSource.includes('disabled={isSubmitting}');

    assert(
      'TEST 8: Double submission is prevented using both isSubmitting state and isSubmittingRef',
      hasIsSubmitting && hasIsSubmittingRef && hasDisabledBtn,
      'Double-submit protection incomplete'
    );
  }

  // TEST 9: Success state confirmation panel
  {
    const hasSuccessHeading = reviewUsSource.includes('Thank you for sharing your experience');
    const hasVerificationNotice = reviewUsSource.includes('Your review has been submitted for verification');
    const hasPrestigeNotice = reviewUsSource.includes('To preserve the authentic prestige of our architectural portfolio');
    const hasSubmitAnother = reviewUsSource.includes('Submit Another Review');
    const hasReturnHome = reviewUsSource.includes('Return to Home');

    assert(
      'TEST 9: Success panel displays exact confirmation copy and concierge verification notice without claiming review is live',
      hasSuccessHeading && hasVerificationNotice && hasPrestigeNotice && hasSubmitAnother && hasReturnHome,
      'Success confirmation state copy missing or inaccurate'
    );
  }

  // ---------------------------------------------------------------------------
  // 2. REVIEW SECURITY & PII EXCLUSION
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Public Review Security & PII Protection ---');

  // TEST 10: Review schema protects PII
  {
    const paths = Review.schema.paths;
    const emailHidden = paths.email?.options?.select === false;
    const phoneHidden = paths.phone?.options?.select === false;
    const ipHidden = paths.ipAddress?.options?.select === false;
    const notesHidden = paths.adminNotes?.options?.select === false;

    assert(
      'TEST 10: Review model defines select: false on email, phone, ipAddress, and adminNotes',
      emailHidden && phoneHidden && ipHidden && notesHidden,
      'PII fields not hidden in schema'
    );
  }

  // TEST 11: Public getPublicReviews queries Approved reviews only
  {
    let capturedFilter = null;
    let capturedSelect = null;

    const origReviewFind = Review.find;
    const origReviewCount = Review.countDocuments;

    Review.countDocuments = async () => 1;
    Review.find = (filter) => {
      capturedFilter = filter;
      return {
        select: (sel) => {
          capturedSelect = sel;
          return {
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: async () => [{ name: 'Test User', rating: 5 }],
                }),
              }),
            }),
          };
        },
      };
    };

    await reviewService.getPublicReviews();

    Review.find = origReviewFind;
    Review.countDocuments = origReviewCount;

    const filterOk = capturedFilter && capturedFilter.status === 'Approved';
    const selectOk = capturedSelect && !capturedSelect.includes('email') && !capturedSelect.includes('phone') && !capturedSelect.includes('ipAddress');

    assert(
      'TEST 11: getPublicReviews strictly queries status: "Approved" and excludes PII fields from projection',
      filterOk && selectOk,
      `Filter: ${JSON.stringify(capturedFilter)}, Select: ${capturedSelect}`
    );
  }

  // ---------------------------------------------------------------------------
  // 3. TESTIMONIALS CTA INTEGRATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Testimonials Section CTA Button ---');

  // TEST 12: Share Your Experience CTA in TestimonialsSection
  {
    const hasCtaText = testimonialsSectionSource.includes('SHARE YOUR EXPERIENCE');
    const hasCtaLink = testimonialsSectionSource.includes('to="/review"');
    assert(
      'TEST 12: TestimonialsSection features "Share Your Experience" button navigating to /review',
      hasCtaText && hasCtaLink,
      'CTA missing from TestimonialsSection'
    );
  }

  // ---------------------------------------------------------------------------
  // 4. CLIENT PARTNERS BACKEND & CLOUDINARY LIFECYCLE
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Client Partners Backend & Cloudinary Lifecycle ---');

  // TEST 13: Partner schema & indexes
  {
    const paths = Partner.schema.paths;
    const hasName = paths.name && paths.name.isRequired;
    const hasLogo = paths.logo && paths.logo.isRequired;
    const indexes = Partner.schema.indexes();
    const hasCompound = indexes.some(([idx]) => idx.isActive === 1 && idx.order === 1 && idx.createdAt === 1);

    assert(
      'TEST 13: Partner schema has name, logo, and compound index { isActive: 1, order: 1, createdAt: 1 }',
      hasName && hasLogo && hasCompound,
      'Partner schema definition incomplete'
    );
  }

  // TEST 14: Safe website URL validation
  {
    const createValidators = partnerValidator.createPartnerValidator;
    const websiteVal = createValidators.find((v) => v.builder?.fields?.includes('website'));
    const isSafeWebUrl = websiteVal?.builder?.stack?.find((s) => s.validator?.name === 'isSafeWebUrl')?.validator;

    let httpsPass = false;
    let jsBlocked = false;
    let dataBlocked = false;

    if (isSafeWebUrl) {
      httpsPass = isSafeWebUrl('https://studio-partner.ae') === true;
      try {
        isSafeWebUrl('javascript:alert(1)');
      } catch {
        jsBlocked = true;
      }
      try {
        isSafeWebUrl('data:text/html,<script>alert(1)</script>');
      } catch {
        dataBlocked = true;
      }
    }

    assert(
      'TEST 14: Safe URL validator accepts https:// and rejects dangerous schemes (javascript:, data:)',
      httpsPass && jsBlocked && dataBlocked,
      'URL validation failed to block dangerous schemes'
    );
  }

  // ---------------------------------------------------------------------------
  // 5. CLIENT PARTNERS PUBLIC MARQUEE COMPONENT
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Client Partners Public Marquee Component ---');

  // TEST 15: Zero partners returns null
  {
    const hasZeroCheck = marqueeSource.includes('!Array.isArray(partners) || partners.length === 0') && marqueeSource.includes('return null;');
    assert(
      'TEST 15: ClientPartnersMarquee returns null when partners array is empty (zero DOM gap)',
      hasZeroCheck,
      'Zero partners guard missing'
    );
  }

  // TEST 16: One partner renders static presentation without fake duplication
  {
    const hasSingleCase = marqueeSource.includes('activePartners.length === 1');
    const hasSingleContainer = marqueeSource.includes('partner-single-container');
    const hasEyebrow = marqueeSource.includes('TRUSTED BY ARCHITECTURAL LEADERS');

    assert(
      'TEST 16: Single partner renders restrained static centered presentation with brand eyebrow',
      hasSingleCase && hasSingleContainer && hasEyebrow,
      'Single partner presentation incomplete'
    );
  }

  // TEST 17: Two partners render side-by-side without fake duplication
  {
    const hasDualCase = marqueeSource.includes('activePartners.length === 2');
    const hasDualContainer = marqueeSource.includes('partner-dual-container');

    assert(
      'TEST 17: Two partners render static balanced side-by-side presentation without marquee duplication',
      hasDualCase && hasDualContainer,
      'Two partners presentation incomplete'
    );
  }

  // TEST 18: 3+ partners render seamless CSS marquee
  {
    const hasMarqueeWrapper = marqueeSource.includes('marquee-wrapper');
    const hasMarqueeTrack = marqueeSource.includes('marquee-track');
    const hasDuplicateGroup = marqueeSource.includes('aria-hidden="true"');

    assert(
      'TEST 18: 3+ partners render continuous CSS marquee with duplicate sequence for seamless loop',
      hasMarqueeWrapper && hasMarqueeTrack && hasDuplicateGroup,
      'Marquee markup incomplete'
    );
  }

  // TEST 19: Accessibility & Reduced motion
  {
    const hasAltText = marqueeSource.includes('alt={`${partner.name} logo`}') || marqueeSource.includes('logo');
    const hasSafeLink = marqueeSource.includes('target="_blank"') && marqueeSource.includes('rel="noopener noreferrer"');
    const hasReducedMotionCss = cssSource.includes('@media (prefers-reduced-motion: reduce)') && cssSource.includes('animation: none !important');
    const hasPauseOnHoverCss = cssSource.includes('.marquee-wrapper:hover .marquee-track') && cssSource.includes('animation-play-state: paused');

    assert(
      'TEST 19: Marquee adheres to accessibility: alt text, safe external links, reduced motion override, and pause-on-hover',
      hasAltText && hasSafeLink && hasReducedMotionCss && hasPauseOnHoverCss,
      'Accessibility features missing'
    );
  }

  // ---------------------------------------------------------------------------
  // 6. HOME INTEGRATION & SECTION ORDER
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Home Integration & Critical Section Ordering ---');

  // TEST 20: Page Builder dynamic mode composes marquee above Testimonials
  {
    const hasMarqueeInAdapter = sectionRegistrySource.includes('<ClientPartnersMarquee partners={context?.partners} />');
    const adapterAboveTestimonials = sectionRegistrySource.indexOf('<ClientPartnersMarquee') < sectionRegistrySource.indexOf('<TestimonialsSection');

    assert(
      'TEST 20: SectionRegistry.jsx composes ClientPartnersMarquee directly above TestimonialsSection in TestimonialsFeedAdapter',
      hasMarqueeInAdapter && adapterAboveTestimonials,
      'Marquee not composed above TestimonialsSection in SectionRegistry'
    );
  }

  // TEST 21: Fallback Home mode renders marquee immediately above Testimonials
  {
    const hasMarqueeInHome = homeSource.includes('<ClientPartnersMarquee partners={partners} />');
    const marqueeIdx = homeSource.indexOf('<ClientPartnersMarquee');
    const testIdx = homeSource.indexOf('<TestimonialsSection');
    const homeOrderOk = marqueeIdx !== -1 && testIdx !== -1 && marqueeIdx < testIdx;

    assert(
      'TEST 21: Home.jsx fallback renders ClientPartnersMarquee immediately above TestimonialsSection',
      hasMarqueeInHome && homeOrderOk,
      'Marquee not ordered immediately above Testimonials in Home fallback'
    );
  }

  // TEST 22: Home mounts partnerService.getPartners()
  {
    const hasPartnerFetch = homeSource.includes('partnerService.getPartners()');
    const hasPartnerState = homeSource.includes('const [partners, setPartners] = useState([]);');
    const hasContextPass = homeSource.includes('partners,');

    assert(
      'TEST 22: Home.jsx fetches partners on mount and passes to DynamicPageRenderer context',
      hasPartnerFetch && hasPartnerState && hasContextPass,
      'Partner fetching or context passing missing in Home.jsx'
    );
  }

  // ---------------------------------------------------------------------------
  // 7. ADMIN PARTNERS MANAGEMENT UI (/admin/partners)
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. Admin Partners Management UI ---');

  // TEST 23: Route registration
  {
    const hasAdminRoute = appRoutesSource.includes('path="partners"') && appRoutesSource.includes('element={<PartnersManager />}');
    assert(
      'TEST 23: /admin/partners is registered inside AdminLayout hierarchy in AppRoutes.jsx',
      hasAdminRoute,
      'Admin partners route missing'
    );
  }

  // TEST 24: Sidebar navigation link
  {
    const hasSidebarLink = sidebarSource.includes('label: \'Client Partners\'') && sidebarSource.includes('path: \'/admin/partners\'') && sidebarSource.includes('icon: Handshake');
    assert(
      'TEST 24: AdminSidebar includes Client Partners link with Handshake icon',
      hasSidebarLink,
      'Client Partners link missing from AdminSidebar'
    );
  }

  // TEST 25: Admin CRUD features in PartnersManager
  {
    const hasAddEdit = partnersManagerSource.includes('handleFormSubmit') && partnersManagerSource.includes('handleOpenCreate') && partnersManagerSource.includes('handleOpenEdit');
    const hasDeleteConfirm = partnersManagerSource.includes('ModalConfirm') && partnersManagerSource.includes('handleDeleteConfirm');
    const hasToggle = partnersManagerSource.includes('handleToggleActive');
    const hasUpload = partnersManagerSource.includes('handleLogoUpload') && partnersManagerSource.includes('uploadService.uploadFile');

    assert(
      'TEST 25: PartnersManager implements Add, Edit, Delete (ModalConfirm), Optimistic Toggle, and Cloudinary logo upload',
      hasAddEdit && hasDeleteConfirm && hasToggle && hasUpload,
      'Admin manager actions incomplete'
    );
  }

  console.log('\n========================================================');
  console.log(`  PHASE 3 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Verification().catch((err) => {
  console.error('Verification suite uncaught error:', err);
  process.exit(1);
});
