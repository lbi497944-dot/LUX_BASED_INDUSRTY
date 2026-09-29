import { siteConfig } from '../seo/seoConfig.js';

export const REVIEW_PAGE_PATH = '/review';

/**
 * Returns the canonical public review page URL using the application's central site configuration.
 * e.g. https://lux-based-indusrty.vercel.app/review
 */
export function getReviewPageUrl() {
  const baseUrl = (siteConfig?.siteUrl || 'https://lux-based-indusrty.vercel.app').replace(/\/+$/, '');
  return `${baseUrl}${REVIEW_PAGE_PATH}`;
}

/**
 * Canonical professional review request message for LUX BASED INDUSTRY.
 * Free of false claims, discounts, rewards, incentives, or fabricated customer info.
 */
export function getReviewWhatsAppMessage(customUrl = null) {
  const reviewUrl = customUrl || getReviewPageUrl();
  return (
`Hello,

Thank you for choosing LUX BASED INDUSTRY.

We would appreciate it if you could share your experience with us.

Please take a moment to leave us a review:

${reviewUrl}

Thank you for your valuable feedback.

LUX BASED INDUSTRY`
  );
}

export const DEFAULT_REVIEW_MESSAGE = getReviewWhatsAppMessage();

/**
 * Normalizes any phone number input by extracting all digits.
 * Strips +, spaces, hyphens, brackets, dots, etc.
 * Example:
 * "+91 95621 27245"  -> "919562127245"
 * "+971 50 123 4567" -> "971501234567"
 * "09562127245"      -> "09562127245"
 */
export function normalizeWhatsAppPhone(phoneInput) {
  if (typeof phoneInput !== 'string') return '';
  return phoneInput.replace(/\D/g, '');
}

/**
 * Validates international phone input according to E.164 standard (7 to 15 digits).
 * Rejects empty, whitespace-only, single +, or numbers with insufficient/excessive digits.
 */
export function validateWhatsAppPhone(phoneInput) {
  if (typeof phoneInput !== 'string' || !phoneInput.trim()) {
    return {
      isValid: false,
      error: 'Please enter a valid WhatsApp number with country code.',
    };
  }

  // Reject input if it's only + or contains no digits
  const trimmed = phoneInput.trim();
  if (trimmed === '+' || !/\d/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid WhatsApp number with country code.',
    };
  }

  const normalized = normalizeWhatsAppPhone(trimmed);

  // E.164 international standard requires between 7 and 15 digits
  if (normalized.length < 7 || normalized.length > 15) {
    return {
      isValid: false,
      error: 'Please enter a valid WhatsApp number with country code.',
    };
  }

  return {
    isValid: true,
    normalized,
    error: null,
  };
}

/**
 * Builds the standard WhatsApp wa.me deep-link.
 * Format: https://wa.me/<digits>?text=<encodeURIComponent(message)>
 */
export function buildWhatsAppReviewUrl(phoneInput, customMessage = null) {
  const validation = validateWhatsAppPhone(phoneInput);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      url: null,
    };
  }

  const message = customMessage || getReviewWhatsAppMessage();
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${validation.normalized}?text=${encodedMessage}`;

  return {
    success: true,
    url,
    normalizedPhone: validation.normalized,
    error: null,
  };
}
