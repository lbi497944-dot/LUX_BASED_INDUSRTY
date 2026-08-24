import { processUploadedFile } from '../middleware/uploadMiddleware.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return errorResponse(res, 'No file was provided in the request.', 400);
    }

    if (req.file) {
      const processed = await processUploadedFile(req.file);
      return successResponse(res, 'File uploaded successfully.', processed, 201);
    }

    if (req.files && Array.isArray(req.files)) {
      const processedFiles = [];
      for (const file of req.files) {
        const processed = await processUploadedFile(file);
        if (processed) processedFiles.push(processed);
      }
      return successResponse(res, 'Files uploaded successfully.', processedFiles, 201);
    }
  } catch (error) {
    next(error);
  }
};
