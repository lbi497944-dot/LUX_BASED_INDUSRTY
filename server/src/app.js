import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { localUploadsDir } from './config/cloudinary.js';

const app = express();

// Trust the single reverse proxy hop used by Render.
// This allows Express and express-rate-limit to resolve the real client IP safely.
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Compression
app.use(compression());

// CORS configuration
const isProduction = process.env.NODE_ENV === 'production';

// Helper to normalize origin strings by trimming whitespace and trailing slashes
const normalizeOrigin = (url) => (url ? url.trim().replace(/\/+$/, '') : '');

// Support multiple origins through a comma-separated CLIENT_URL value
const configuredClientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const devOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].map(normalizeOrigin);

const allowedOrigins = isProduction
  ? configuredClientUrls
  : Array.from(new Set([...configuredClientUrls, ...devOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      const normalizedIncomingOrigin = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalizedIncomingOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: Origin '${origin}' is not permitted.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded static files
app.use('/uploads', express.static(localUploadsDir));

// Root sitemap redirect for search crawlers
app.get('/sitemap.xml', (req, res) => {
  res.redirect(301, '/api/sitemap.xml');
});

// API Entry Route
app.use('/api', apiRoutes);

// Production Static SPA Delivery (Optional unified deployment mode)
const clientDistPath = path.join(process.cwd(), '..', 'client', 'dist');
const altClientDistPath = path.join(process.cwd(), 'client', 'dist');
const rootDistPath = path.join(process.cwd(), 'dist');

const staticDir = [clientDistPath, altClientDistPath, rootDistPath].find((p) => fs.existsSync(p));

if (process.env.NODE_ENV === 'production' && staticDir) {
  app.use(express.static(staticDir));

  // Catch-all non-API routes for SPA navigation
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(staticDir, 'index.html'));
  });
} else {
  // Root welcome route for standalone API mode
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'Veloura Lighting API',
      version: '1.0.0',
      status: 'online',
      endpoints: '/api',
    });
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
