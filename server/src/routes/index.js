import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import collectionRoutes from './collectionRoutes.js';
import projectRoutes from './projectRoutes.js';
import consultationRoutes from './consultationRoutes.js';
import contactRoutes from './contactRoutes.js';
import newsletterRoutes from './newsletterRoutes.js';
import faqRoutes from './faqRoutes.js';
import testimonialRoutes from './testimonialRoutes.js';
import settingRoutes from './settingRoutes.js';
import statsRoutes from './statsRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import pageRoutes from './pageRoutes.js';

import mongoose from 'mongoose';
import Collection from '../models/Collection.js';
import Project from '../models/Project.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { getIsEmailConfigured } from '../config/email.js';

const router = express.Router();

router.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  const healthData = {
    status: isDbConnected ? 'ok' : 'degraded',
    success: true,
    message: isDbConnected
      ? 'LUX BASED INDUSTRY REST API is operational'
      : 'LUX BASED INDUSTRY REST API is operational (database disconnected)',
    database: {
      connected: isDbConnected,
    },
    email: {
      configured: getIsEmailConfigured(),
    },
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    storage: isCloudinaryConfigured ? 'cloudinary' : 'local',
    timestamp: new Date().toISOString(),
  };

  const statusCode = isDbConnected ? 200 : 503;
  res.status(statusCode).json(healthData);
});

/**
 * Dynamic XML Sitemap generator (excludes admin/private endpoints)
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl =
      (process.env.CLIENT_URL || '')
        .split(',')[0]
        .trim()
        .replace(/\/+$/, '') ||
      'https://lux-based-indusrty.vercel.app';
    const [collections, projects] = await Promise.all([
      Collection.find({ isActive: true }).select('slug updatedAt'),
      Project.find({ isActive: true }).select('slug updatedAt'),
    ]);

    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'weekly' },
      { path: 'collections', priority: '0.9', changefreq: 'weekly' },
      { path: 'portfolio', priority: '0.9', changefreq: 'weekly' },
      { path: 'about', priority: '0.7', changefreq: 'monthly' },
      { path: 'contact', priority: '0.8', changefreq: 'monthly' },
      { path: 'consultation', priority: '0.9', changefreq: 'weekly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Routes
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/${page.path}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic Collections
    for (const col of collections) {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/collections/${col.slug}</loc>\n`;
      xml += `    <lastmod>${(col.updatedAt || new Date()).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic Portfolio Projects
    for (const proj of projects) {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/portfolio/${proj.slug}</loc>\n`;
      xml += `    <lastmod>${(proj.updatedAt || new Date()).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/collections', collectionRoutes);
router.use('/projects', projectRoutes);
router.use('/consultations', consultationRoutes);
router.use('/contact', contactRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/faqs', faqRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/settings', settingRoutes);
router.use('/stats', statsRoutes);
router.use('/upload', uploadRoutes);
router.use('/pages', pageRoutes);

export default router;
