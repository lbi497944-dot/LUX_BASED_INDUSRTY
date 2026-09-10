/**
 * Startup Environment Configuration Validator
 * Ensures required security and database configurations are present before booting the server.
 */

export const validateEnvironment = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  // 1. JWT_SECRET Validation
  if (!process.env.JWT_SECRET) {
    errors.push('CRITICAL: JWT_SECRET environment variable is missing.');
  } else if (process.env.JWT_SECRET.trim() === 'veloura_default_jwt_secret' || process.env.JWT_SECRET.length < 16) {
    if (isProduction) {
      errors.push('CRITICAL: JWT_SECRET is using a weak or default placeholder value in production mode.');
    } else {
      warnings.push('JWT_SECRET is shorter than recommended (minimum 32 characters recommended for production).');
    }
  }

  // 2. MONGODB_URI Validation
  if (!process.env.MONGODB_URI) {
    errors.push('CRITICAL: MONGODB_URI environment variable is missing. Explicit database URI configuration is required.');
  }

  // 3. Email Configuration (Resend HTTPS API)
  const missingEmailVars = [];
  if (!process.env.RESEND_API_KEY) missingEmailVars.push('RESEND_API_KEY');
  if (!process.env.EMAIL_FROM) missingEmailVars.push('EMAIL_FROM');
  if (!process.env.ADMIN_NOTIFICATION_EMAIL) missingEmailVars.push('ADMIN_NOTIFICATION_EMAIL');

  if (missingEmailVars.length > 0) {
    if (isProduction) {
      warnings.push(`Incomplete email configuration in production. Missing: ${missingEmailVars.join(', ')}. Outbound email notifications will be disabled.`);
    } else {
      warnings.push(`Email configuration incomplete (${missingEmailVars.join(', ')}). Contact and consultation email notifications will be skipped safely in development.`);
    }
  }

  // 4. CORS CLIENT_URL Configuration
  if (isProduction && !process.env.CLIENT_URL) {
    warnings.push('CLIENT_URL environment variable is missing in production. Cross-origin browser requests will be blocked by CORS.');
  }

  // Report Warnings
  if (warnings.length > 0) {
    warnings.forEach((warn) => console.warn(`[Config Warning] ${warn}`));
  }

  // Fail fast on critical errors
  if (errors.length > 0) {
    console.error('\n======================================================');
    console.error('  FATAL CONFIGURATION ERROR — SERVER STARTUP ABORTED');
    console.error('======================================================');
    errors.forEach((err) => console.error(`  ❌ ${err}`));
    console.error('======================================================\n');
    throw new Error(`Environment validation failed with ${errors.length} error(s).`);
  }
};
