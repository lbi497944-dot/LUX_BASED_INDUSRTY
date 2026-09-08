import nodemailer from 'nodemailer';

let transporter = null;
let isEmailConfigured = false;

/**
 * Initialize and verify SMTP email transporter
 * Designed to be resilient: logs clear diagnostics and marks email unavailable
 * if SMTP is unreachable, without terminating the HTTP server process.
 */
export const initEmailTransporter = async () => {
  console.log('[Email] Initializing SMTP transporter...');
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    try {
      const port = parseInt(SMTP_PORT, 10) || 587;
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
        connectionTimeout: 10000, // 10 second timeout for initial connection
        greetingTimeout: 5000,    // 5 second greeting timeout
        socketTimeout: 10000,     // 10 second socket timeout
      });

      // Verify connection configuration
      await transporter.verify();
      isEmailConfigured = true;
      console.log(`[Email] SMTP transporter verified successfully (${SMTP_HOST}:${port}).`);
    } catch (err) {
      console.warn('[Email Warning] SMTP transporter verification failed.');
      console.warn('[Email Warning] Outbound email is temporarily unavailable.');
      console.warn(`[Email Warning] Error: ${err.message}`);
      isEmailConfigured = false;
      transporter = null;
    }
  } else {
    console.warn('[Email Warning] SMTP credentials not configured.');
    console.warn('[Email Warning] Outbound email notifications are disabled.');
    isEmailConfigured = false;
    transporter = null;
  }
};

export const getTransporter = () => transporter;
export const getIsEmailConfigured = () => isEmailConfigured;
