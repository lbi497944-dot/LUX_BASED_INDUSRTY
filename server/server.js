import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { validateEnvironment } from './src/config/envValidator.js';
import { initEmailService } from './src/config/email.js';

const PORT = process.env.PORT || 5000;

/**
 * Resilient Application Startup Sequence:
 *  1. Validate critical environment variables (JWT_SECRET, MONGODB_URI) — fail fast if missing.
 *  2. Connect to MongoDB — fatal if database connection fails.
 *  3. Start HTTP server listening on 0.0.0.0:PORT immediately so cloud platforms (Render) detect open port.
 *  4. Check Resend email service configuration (non-blocking status check).
 */
const startServer = async () => {
  try {
    // Step 1 — Environment validation (throws on critical missing config)
    validateEnvironment();

    // Step 2 — Database connection
    await connectDB();

    // Step 3 — HTTP server (bind immediately on 0.0.0.0 for cloud port detection)
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(`  VELOURA LIGHTING BACKEND API`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Server Port: ${PORT}`);
      console.log(`  Listening on: http://0.0.0.0:${PORT}`);
      console.log(`  API Endpoint: http://localhost:${PORT}/api`);
      console.log(`======================================================\n`);
    });

    // Step 4 — Log Resend email configuration status (non-blocking, no external network call)
    initEmailService();

    return server;
  } catch (err) {
    console.error('\n[Startup Fatal Error]:', err.stack || err);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]:`, err.stack || err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception]:`, err.stack || err);
});
