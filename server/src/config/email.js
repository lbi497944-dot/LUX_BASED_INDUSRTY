import nodemailer from 'nodemailer';

let transporter = null;
let isEmailConfigured = false;

export const initEmailTransporter = async () => {
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
      });

      // Verify connection configuration
      await transporter.verify();
      isEmailConfigured = true;
      console.log(`[Email] SMTP transporter verified successfully (${SMTP_HOST}:${port}).`);
    } catch (err) {
      console.warn(`[Email Warning] SMTP connection verification failed: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Production email configuration error: ${err.message}`);
      }
      isEmailConfigured = false;
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production environment requires complete SMTP configuration (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, ADMIN_NOTIFICATION_EMAIL).');
    }
    console.log('[Email] SMTP not configured; notification skipped.');
    isEmailConfigured = false;
  }
};

export const getTransporter = () => transporter;
export const getIsEmailConfigured = () => isEmailConfigured;
