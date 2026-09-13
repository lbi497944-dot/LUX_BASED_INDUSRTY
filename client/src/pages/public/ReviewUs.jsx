import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Camera,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { images } from '../../data/site';
import PageHero from '../../components/sections/PageHero';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/pjpeg'];

const RATING_DESCRIPTIONS = {
  1: '1 Star - Unsatisfactory',
  2: '2 Stars - Fair',
  3: '3 Stars - Good',
  4: '4 Stars - Very Good',
  5: '5 Stars - Exceptional',
};

export default function ReviewUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rating: 5,
    title: '',
    content: '',
    projectLocation: '',
  });

  const [honeypot, setHoneypot] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [fileError, setFileError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => {
        if (preview.url) URL.revokeObjectURL(preview.url);
      });
    };
  }, [filePreviews]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Keyboard navigation for star rating
  const handleRatingKeyDown = (e, star) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(5, star + 1);
      setFormData((prev) => ({ ...prev, rating: next }));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(1, star - 1);
      setFormData((prev) => ({ ...prev, rating: prev }));
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setFormData((prev) => ({ ...prev, rating: star }));
    }
  };

  // File selection and instant thumbnail generation
  const handleFileSelect = (e) => {
    setFileError('');
    const incomingFiles = Array.from(e.target.files || []);
    if (!incomingFiles.length) return;

    const currentTotal = selectedFiles.length;
    if (currentTotal + incomingFiles.length > MAX_IMAGES) {
      setFileError(`You can upload a maximum of ${MAX_IMAGES} photographs per review.`);
    }

    const availableSlots = Math.max(0, MAX_IMAGES - currentTotal);
    const filesToProcess = incomingFiles.slice(0, availableSlots);

    const validFiles = [];
    const newPreviews = [];

    for (const file of filesToProcess) {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext) || (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()))) {
        setFileError(`File "${file.name}" has an unsupported format. Only JPG, PNG, and WEBP images are permitted.`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setFileError(`File "${file.name}" exceeds the 5MB size limit.`);
        continue;
      }

      validFiles.push(file);
      newPreviews.push({
        file,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setFilePreviews((prev) => [...prev, ...newPreviews]);
    }

    // Reset native input so the user can select more or re-add
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index) => {
    setFileError('');
    const targetPreview = filePreviews[index];
    if (targetPreview && targetPreview.url) {
      URL.revokeObjectURL(targetPreview.url);
    }

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form client-side
  const validateForm = () => {
    const errors = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      errors.name = 'Full name is required';
    } else if (trimmedName.length < 2 || trimmedName.length > 100) {
      errors.name = 'Full name must be between 2 and 100 characters';
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address';
    }

    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      errors.phone = 'Phone number is required';
    } else if (trimmedPhone.length < 7 || trimmedPhone.length > 25) {
      errors.phone = 'Phone number must be between 7 and 25 characters';
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      errors.rating = 'Please select a rating between 1 and 5 stars';
    }

    if (formData.title && formData.title.trim().length > 120) {
      errors.title = 'Headline cannot exceed 120 characters';
    }

    const trimmedContent = formData.content.trim();
    if (!trimmedContent) {
      errors.content = 'Review text is required';
    } else if (trimmedContent.length < 10) {
      errors.content = 'Review text must be at least 10 characters';
    } else if (trimmedContent.length > 2000) {
      errors.content = 'Review text cannot exceed 2000 characters';
    }

    if (formData.projectLocation && formData.projectLocation.trim().length > 100) {
      errors.projectLocation = 'Location cannot exceed 100 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || isSubmittingRef.current) return;

    // Honeypot anti-spam check: silently abort if bot filled the field
    if (honeypot && honeypot.trim() !== '') {
      setIsSuccess(true);
      return;
    }

    if (!validateForm()) {
      setToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please resolve the highlighted issues before submitting.',
      });
      return;
    }

    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('email', formData.email.trim());
      payload.append('phone', formData.phone.trim());
      payload.append('rating', String(formData.rating));
      if (formData.title.trim()) {
        payload.append('title', formData.title.trim());
      }
      payload.append('content', formData.content.trim());
      if (formData.projectLocation.trim()) {
        payload.append('projectLocation', formData.projectLocation.trim());
      }

      // Attach selected photos
      selectedFiles.forEach((file) => {
        payload.append('images', file);
      });

      const res = await reviewService.submitReview(payload);

      // Clean up object URLs upon successful submission
      filePreviews.forEach((preview) => {
        if (preview.url) URL.revokeObjectURL(preview.url);
      });

      setIsSuccess(true);
      setToast({
        type: 'success',
        title: 'Review Received',
        message: res.message || 'Your review has been submitted for verification.',
      });

      // Clear form state only on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        rating: 5,
        title: '',
        content: '',
        projectLocation: '',
      });
      setSelectedFiles([]);
      setFilePreviews([]);
      setFieldErrors({});
    } catch (err) {
      // PRESERVE user data and files on error
      setToast({
        type: 'error',
        title: 'Submission Failed',
        message: err?.message || 'Unable to submit review at this time. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResetForAnother = () => {
    setIsSuccess(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      rating: 5,
      title: '',
      content: '',
      projectLocation: '',
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setFieldErrors({});
    setFileError('');
  };

  const displayRating = hoveredRating || formData.rating;

  return (
    <main className="review-us-page">
      <SEO
        title="Client Review | Share Your Experience | LUX BASED INDUSTRY"
        description="Share your experience with LUX BASED INDUSTRY bespoke architectural lighting and custom luxury luminaires."
        canonical="/review"
      />

      <Toast toast={toast} onClose={() => setToast(null)} />

      <PageHero
        eyebrow="CLIENT VOICES"
        title="Share Your Experience"
        description="We invite our clients, architects, and designers to reflect on their architectural lighting collaboration with LUX BASED INDUSTRY."
        image={images.living}
      />

      <section className="section review-form-section">
        <div className="container">
          <div className="review-form-wrapper">
            {/* SUCCESS CONFIRMATION STATE */}
            {isSuccess ? (
              <div className="review-success-panel" role="status" aria-live="polite">
                <div className="review-success-icon-box">
                  <CheckCircle2 size={48} className="review-gold-icon" />
                </div>
                <h2>Thank you for sharing your experience.</h2>
                <h3 className="review-success-subheading">
                  Your review has been submitted for verification.
                </h3>
                <p className="review-success-description">
                  To preserve the authentic prestige of our architectural portfolio, all reviews are verified by our concierge before appearing publicly on the website.
                </p>

                <div className="review-success-actions">
                  <button
                    type="button"
                    onClick={handleResetForAnother}
                    className="btn btn-outline"
                  >
                    Submit Another Review
                  </button>
                  <Link to="/" className="btn btn-gold">
                    Return to Home
                  </Link>
                </div>
              </div>
            ) : (
              /* REVIEW SUBMISSION FORM */
              <form
                className="form-luxury review-form"
                onSubmit={handleSubmit}
                noValidate
                aria-label="Submit Customer Review"
              >
                {/* Honeypot anti-spam field */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <label htmlFor="website_hp">Leave this field blank</label>
                  <input
                    type="text"
                    id="website_hp"
                    name="website_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="form-header">
                  <span className="eyebrow gold-label">AUTHENTIC FEEDBACK</span>
                  <h2>Bespoke Client Review</h2>
                  <p>
                    Please take a moment to evaluate the design, execution, and atmosphere created by our lighting architecture.
                  </p>
                </div>

                {/* 1. OVERALL RATING SELECTOR */}
                <div className="form-group review-rating-group">
                  <label id="rating-label" className="field-label">
                    OVERALL RATING *
                  </label>
                  <div
                    className="review-star-selector"
                    role="radiogroup"
                    aria-labelledby="rating-label"
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= displayRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          role="radio"
                          aria-checked={formData.rating === star}
                          aria-label={RATING_DESCRIPTIONS[star]}
                          className={`star-btn ${isFilled ? 'filled' : ''} ${formData.rating === star ? 'selected' : ''}`}
                          onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onKeyDown={(e) => handleRatingKeyDown(e, star)}
                        >
                          <Star
                            size={28}
                            fill={isFilled ? 'var(--gold, #e6c77a)' : 'none'}
                            color={isFilled ? 'var(--gold, #e6c77a)' : 'rgba(243, 243, 235, 0.3)'}
                          />
                        </button>
                      );
                    })}
                    <span className="rating-descriptor" aria-live="polite">
                      {RATING_DESCRIPTIONS[displayRating]}
                    </span>
                  </div>
                  {fieldErrors.rating && (
                    <span className="field-error" role="alert">
                      {fieldErrors.rating}
                    </span>
                  )}
                </div>

                {/* 2. NAME & EMAIL ROW */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="review-name" className="field-label">
                      FULL NAME *
                    </label>
                    <input
                      id="review-name"
                      type="text"
                      name="name"
                      placeholder="e.g. Tariq Al-Mansoor"
                      value={formData.name}
                      onChange={handleInputChange}
                      maxLength={100}
                      className={fieldErrors.name ? 'input-error' : ''}
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.name)}
                    />
                    {fieldErrors.name && (
                      <span className="field-error" role="alert">
                        {fieldErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-email" className="field-label">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      id="review-email"
                      type="email"
                      name="email"
                      placeholder="e.g. tariq@studio.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={fieldErrors.email ? 'input-error' : ''}
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                    <small className="field-hint">
                      Your email is protected and will never be published.
                    </small>
                    {fieldErrors.email && (
                      <span className="field-error" role="alert">
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. PHONE & PROJECT LOCATION ROW */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="review-phone" className="field-label">
                      PHONE NUMBER *
                    </label>
                    <input
                      id="review-phone"
                      type="tel"
                      name="phone"
                      placeholder="+971 50 000 0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={25}
                      className={fieldErrors.phone ? 'input-error' : ''}
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.phone)}
                    />
                    <small className="field-hint">
                      Used solely by our concierge to verify submission authenticity.
                    </small>
                    {fieldErrors.phone && (
                      <span className="field-error" role="alert">
                        {fieldErrors.phone}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-location" className="field-label">
                      PROJECT LOCATION <span className="optional-tag">(OPTIONAL)</span>
                    </label>
                    <input
                      id="review-location"
                      type="text"
                      name="projectLocation"
                      placeholder="e.g. Emirates Hills, Dubai"
                      value={formData.projectLocation}
                      onChange={handleInputChange}
                      maxLength={100}
                      className={fieldErrors.projectLocation ? 'input-error' : ''}
                    />
                    {fieldErrors.projectLocation && (
                      <span className="field-error" role="alert">
                        {fieldErrors.projectLocation}
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. REVIEW HEADLINE */}
                <div className="form-group">
                  <label htmlFor="review-title" className="field-label">
                    REVIEW HEADLINE <span className="optional-tag">(OPTIONAL)</span>
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    name="title"
                    placeholder="e.g. Masterful lighting design and exceptional execution"
                    value={formData.title}
                    onChange={handleInputChange}
                    maxLength={120}
                    className={fieldErrors.title ? 'input-error' : ''}
                  />
                  {fieldErrors.title && (
                    <span className="field-error" role="alert">
                      {fieldErrors.title}
                    </span>
                  )}
                </div>

                {/* 5. REVIEW TEXT WITH LIVE CHARACTER COUNTER */}
                <div className="form-group">
                  <div className="field-label-row">
                    <label htmlFor="review-content" className="field-label">
                      YOUR REVIEW *
                    </label>
                    <span
                      className={`character-counter ${formData.content.length > 2000 ? 'counter-overflow' : ''}`}
                    >
                      {formData.content.length} / 2000 characters
                    </span>
                  </div>
                  <textarea
                    id="review-content"
                    name="content"
                    rows={6}
                    placeholder="Describe your architectural lighting experience, fixture craftsmanship, illumination atmosphere, and overall collaboration..."
                    value={formData.content}
                    onChange={handleInputChange}
                    maxLength={2000}
                    className={fieldErrors.content ? 'input-error' : ''}
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.content)}
                  />
                  {fieldErrors.content && (
                    <span className="field-error" role="alert">
                      {fieldErrors.content}
                    </span>
                  )}
                </div>

                {/* 6. PROJECT PHOTOGRAPHS (UP TO 3) */}
                <div className="form-group review-upload-group">
                  <div className="field-label-row">
                    <label className="field-label">
                      PROJECT PHOTOGRAPHS <span className="optional-tag">(OPTIONAL - UP TO 3)</span>
                    </label>
                    <span className="character-counter">
                      {selectedFiles.length} / {MAX_IMAGES} selected
                    </span>
                  </div>

                  <div className="review-dropzone">
                    <input
                      ref={fileInputRef}
                      id="review-photos-input"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      multiple
                      onChange={handleFileSelect}
                      disabled={selectedFiles.length >= MAX_IMAGES || isSubmitting}
                      className="visually-hidden-input"
                    />
                    <label
                      htmlFor="review-photos-input"
                      className={`dropzone-label ${selectedFiles.length >= MAX_IMAGES || isSubmitting ? 'disabled' : ''}`}
                    >
                      <Camera size={24} className="dropzone-icon" />
                      <div>
                        <strong>Click to upload photographs</strong> or drag and drop
                        <p className="dropzone-sub">
                          High-resolution JPEG, PNG, or WEBP (Max 5MB each)
                        </p>
                      </div>
                    </label>
                  </div>

                  {fileError && (
                    <div className="field-error file-error" role="alert">
                      <AlertCircle size={14} />
                      <span>{fileError}</span>
                    </div>
                  )}

                  {/* THUMBNAIL PREVIEWS */}
                  {filePreviews.length > 0 && (
                    <div className="review-thumbnails-grid">
                      {filePreviews.map((preview, idx) => (
                        <div key={preview.url || idx} className="review-thumbnail-card">
                          <img
                            src={preview.url}
                            alt={`Selected review photograph ${idx + 1}`}
                            className="thumbnail-img"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="thumbnail-remove-btn"
                            aria-label={`Remove photo ${idx + 1}`}
                            disabled={isSubmitting}
                            title="Remove photo"
                          >
                            <X size={14} />
                          </button>
                          <span className="thumbnail-size">
                            {(preview.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 7. PRIVACY & SECURITY ADVISORY */}
                <div className="review-privacy-note">
                  <ShieldCheck size={18} className="shield-icon" />
                  <span>
                    Your contact details are held in strict confidence and are never shared. Submissions undergo concierge verification before publication.
                  </span>
                </div>

                {/* 8. ACTIONS */}
                <div className="form-actions-row">
                  <button
                    type="submit"
                    className="btn btn-gold btn-submit-review"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>TRANSMITTING REVIEW...</span>
                      </>
                    ) : (
                      <span>SUBMIT VERIFIED REVIEW</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
