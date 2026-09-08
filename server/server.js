import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { validateEnvironment } from './src/config/envValidator.js';
import { initEmailTransporter } from './src/config/email.js';

const PORT = process.env.PORT || 5000;

/**
 * Application startup sequence:
 *  1. Validate all required environment variables — fail fast if any critical var is missing.
 *  2. Connect to MongoDB — exit in production if connection fails.
 *  3. Initialize email transporter — fail fast in production if SMTP is not configured.
 *  4. Start HTTP listener.
 */
const startServer = async () => {
  try {
    // Step 1 — Environment validation (throws on critical missing config)
    validateEnvironment();

    // Step 2 — Database connection
    await connectDB();

    // Step 3 — Email transporter initialization
    await initEmailTransporter();

    // Step 4 — HTTP server
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`  VELOURA LIGHTING BACKEND API`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Server Port: ${PORT}`);
      console.log(`  API Endpoint: http://localhost:${PORT}/api`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error(`\n[Startup Fatal] ${err.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception] ${err.message}`);
});
