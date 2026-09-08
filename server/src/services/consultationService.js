import Consultation from '../models/Consultation.js';
import { sendConsultationNotification } from './emailService.js';

export const createConsultation = async (data, files = []) => {
  const attachments = files.map((file) => ({
    url: file.url,
    publicId: file.publicId || '',
    filename: file.filename || '',
    mimeType: file.mimeType || '',
  }));

  const consultation = await Consultation.create({
    ...data,
    attachments,
  });

  // Asynchronously trigger admin email notification (non-blocking)
  sendConsultationNotification(consultation).catch((err) => {
    console.error(`[Consultation Email Notification Error]: ${err.message}`);
  });

  return consultation;
};

export const getAllConsultations = async (queryParams) => {
  const { status, page = 1, limit = 20, sort = '-createdAt' } = queryParams;

  const filter = {};
  if (status && status !== 'ALL') {
    filter.status = status;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const total = await Consultation.countDocuments(filter);
  const consultations = await Consultation.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  return {
    consultations,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getConsultationById = async (id) => {
  const consultation = await Consultation.findById(id);
  if (!consultation) {
    const error = new Error(`Consultation request not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return consultation;
};

export const updateConsultationStatus = async (id, status) => {
  const consultation = await Consultation.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!consultation) {
    const error = new Error(`Consultation request not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return consultation;
};

export const updateConsultationNotes = async (id, adminNotes) => {
  const consultation = await Consultation.findByIdAndUpdate(
    id,
    { adminNotes },
    { new: true }
  );

  if (!consultation) {
    const error = new Error(`Consultation request not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return consultation;
};

export const deleteConsultation = async (id) => {
  const consultation = await Consultation.findByIdAndDelete(id);
  if (!consultation) {
    const error = new Error(`Consultation request not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return consultation;
};
