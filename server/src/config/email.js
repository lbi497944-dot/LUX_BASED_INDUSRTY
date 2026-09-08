import { Resend } from 'resend';

let resendClient = null;

/**
 * Determines whether email delivery is fully configured.
 * Email is considered configured ONLY when all three environment variables exist:
 *   1. RESEND_API_KEY
 *   2. EMAIL_FROM
 *   3. ADMIN_NOTIFICATION_EMAIL
 *
 * Production strictly requires explicitly configured EMAIL_FROM; no implicit fallback is used.
 */
export const getIsEmailConfigured = () => {
  return Boolean(
    process.env.RESEND_API_KEY &&
    process.env.EMAIL_FROM &&
    process.env.ADMIN_NOTIFICATION_EMAIL
  );
};

/**
 * Get or instantiate the singleton Resend client.
 * Returns null if the required email configuration is incomplete.
 */
export const getResendClient = () => {
  if (!getIsEmailConfigured()) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

/**
 * Log startup configuration status for the Resend email service.
 * Resilient & non-blocking: Never performs outbound network requests during startup
 * and never halts the HTTP server. Never logs secrets or API keys.
 */
export const initEmailService = () => {
  if (getIsEmailConfigured()) {
    console.log(`[Email] Resend HTTPS email service ready (Sender: ${process.env.EMAIL_FROM}).`);
  } else {
    const missing = [];
    if (!process.env.RESEND_API_KEY) missing.push('RESEND_API_KEY');
    if (!process.env.EMAIL_FROM) missing.push('EMAIL_FROM');
    if (!process.env.ADMIN_NOTIFICATION_EMAIL) missing.push('ADMIN_NOTIFICATION_EMAIL');
    console.warn(`[Email Warning] Incomplete email configuration. Missing: ${missing.join(', ')}.`);
    console.warn('[Email Warning] Outbound email notifications are disabled.');
  }
};

// Aliases for compatibility
export const initEmailTransporter = initEmailService;
export const getTransporter = () => null;
