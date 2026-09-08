import ContactEnquiry from '../models/ContactEnquiry.js';
import { sendContactNotification } from './emailService.js';

export const createContactEnquiry = async (data) => {
  const enquiry = await ContactEnquiry.create(data);

  // Asynchronously trigger admin email notification (non-blocking)
  sendContactNotification(enquiry).catch((err) => {
    console.error(`[Contact Email Notification Error]: ${err.message}`);
  });

  return enquiry;
};

export const getAllContactEnquiries = async (queryParams) => {
  const { status, page = 1, limit = 20, sort = '-createdAt' } = queryParams;

  const filter = {};
  if (status && status !== 'ALL') {
    filter.status = status;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const total = await ContactEnquiry.countDocuments(filter);
  const enquiries = await ContactEnquiry.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  return {
    enquiries,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getContactEnquiryById = async (id) => {
  const enquiry = await ContactEnquiry.findById(id);
  if (!enquiry) {
    const error = new Error(`Contact enquiry not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return enquiry;
};

export const updateContactEnquiryStatus = async (id, status) => {
  const enquiry = await ContactEnquiry.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!enquiry) {
    const error = new Error(`Contact enquiry not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return enquiry;
};

export const updateContactEnquiryNotes = async (id, adminNotes) => {
  const enquiry = await ContactEnquiry.findByIdAndUpdate(
    id,
    { adminNotes },
    { new: true }
  );

  if (!enquiry) {
    const error = new Error(`Contact enquiry not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return enquiry;
};

export const deleteContactEnquiry = async (id) => {
  const enquiry = await ContactEnquiry.findByIdAndDelete(id);
  if (!enquiry) {
    const error = new Error(`Contact enquiry not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return enquiry;
};
