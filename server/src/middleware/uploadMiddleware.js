import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { cloudinary, isCloudinaryConfigured, localUploadsDir } from '../config/cloudinary.js';

const isProduction = process.env.NODE_ENV === 'production';

// In production or when Cloudinary is configured, use memory storage to avoid ephemeral disk dependency
const storage = (isProduction || isCloudinaryConfigured)
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, localUploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    });

// File filter: Whitelist safe image & document formats (excluding raw active SVG from public uploads)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type (${ext}). Only JPG, PNG, WEBP and PDF files are permitted for architectural submissions.`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit per file
  },
  fileFilter,
});

/**
 * Upload a memory buffer stream directly to Cloudinary
 */
const uploadStreamToCloudinary = (fileBuffer, originalname, mimetype) => {
  return new Promise((resolve, reject) => {
    const folder = process.env.CLOUDINARY_FOLDER || 'veloura_lighting';
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          filename: originalname,
          mimeType: mimetype,
        });
      }
    );

    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

/**
 * Process uploaded file (memory buffer or disk file)
 */
export const processUploadedFile = async (file) => {
  if (!file) return null;

  // 1. If Cloudinary is configured, upload buffer / disk file
  if (isCloudinaryConfigured) {
    try {
      if (file.buffer) {
        return await uploadStreamToCloudinary(file.buffer, file.originalname, file.mimetype);
      } else if (file.path) {
        const folder = process.env.CLOUDINARY_FOLDER || 'veloura_lighting';
        const result = await cloudinary.uploader.upload(file.path, {
          folder,
          resource_type: 'auto',
        });

        // Clean local temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        return {
          url: result.secure_url,
          publicId: result.public_id,
          filename: file.originalname,
          mimeType: file.mimetype,
        };
      }
    } catch (err) {
      console.error('[Cloudinary Upload Failure]:', err.message);
      if (isProduction) {
        throw new Error(`Media storage service error: ${err.message}`);
      }
    }
  }

  // 2. Production safety check: Fail clearly if Cloudinary is not configured in production
  if (isProduction && !isCloudinaryConfigured) {
    throw new Error('Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) must be configured in production environment.');
  }

  // 3. Development local disk fallback
  if (file.filename) {
    const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    return {
      url: `${baseUrl}/uploads/${file.filename}`,
      publicId: file.filename,
      filename: file.originalname,
      mimeType: file.mimetype,
    };
  }

  return null;
};

/**
 * Helper to delete Cloudinary asset if replaced or deleted
 */
export const deleteCloudinaryAsset = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`[Cloudinary Cleanup Error] Failed to destroy ${publicId}:`, err.message);
  }
};
