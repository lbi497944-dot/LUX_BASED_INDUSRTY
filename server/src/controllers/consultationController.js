import * as consultationService from '../services/consultationService.js';
import { processUploadedFile } from '../middleware/uploadMiddleware.js';
import { successResponse } from '../utils/apiResponse.js';

export const createConsultation = async (req, res, next) => {
  try {
    const uploadedFiles = [];
    if (req.file) {
      const processed = await processUploadedFile(req.file);
      if (processed) uploadedFiles.push(processed);
    } else if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const processed = await processUploadedFile(file);
        if (processed) uploadedFiles.push(processed);
      }
    }

    const consultation = await consultationService.createConsultation(req.body, uploadedFiles);
    return successResponse(
      res,
      'Your private consultation request has been received. Our Senior Lighting Architect will contact you shortly.',
      { consultation },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getConsultations = async (req, res, next) => {
  try {
    const result = await consultationService.getAllConsultations(req.query);
    return successResponse(res, 'Consultations retrieved.', result.consultations, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getConsultationById = async (req, res, next) => {
  try {
    const consultation = await consultationService.getConsultationById(req.params.id);
    return successResponse(res, 'Consultation detail retrieved.', { consultation });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const consultation = await consultationService.updateConsultationStatus(req.params.id, status);
    return successResponse(res, 'Status updated successfully.', { consultation });
  } catch (error) {
    next(error);
  }
};

export const updateNotes = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const consultation = await consultationService.updateConsultationNotes(req.params.id, adminNotes);
    return successResponse(res, 'Internal notes updated.', { consultation });
  } catch (error) {
    next(error);
  }
};

export const deleteConsultation = async (req, res, next) => {
  try {
    await consultationService.deleteConsultation(req.params.id);
    return successResponse(res, 'Consultation request removed.');
  } catch (error) {
    next(error);
  }
};
