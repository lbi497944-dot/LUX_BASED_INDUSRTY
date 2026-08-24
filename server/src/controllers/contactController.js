import * as contactService from '../services/contactService.js';
import { successResponse } from '../utils/apiResponse.js';

export const createContact = async (req, res, next) => {
  try {
    const enquiry = await contactService.createContactEnquiry(req.body);
    return successResponse(
      res,
      'Thank you for reaching out to Veloura Lighting. Our architectural team will respond within 24 hours.',
      { enquiry },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const result = await contactService.getAllContactEnquiries(req.query);
    return successResponse(res, 'Contact enquiries retrieved.', result.enquiries, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const enquiry = await contactService.getContactEnquiryById(req.params.id);
    return successResponse(res, 'Enquiry detail retrieved.', { enquiry });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const enquiry = await contactService.updateContactEnquiryStatus(req.params.id, status);
    return successResponse(res, 'Status updated successfully.', { enquiry });
  } catch (error) {
    next(error);
  }
};

export const updateNotes = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const enquiry = await contactService.updateContactEnquiryNotes(req.params.id, adminNotes);
    return successResponse(res, 'Internal notes updated.', { enquiry });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    await contactService.deleteContactEnquiry(req.params.id);
    return successResponse(res, 'Enquiry removed successfully.');
  } catch (error) {
    next(error);
  }
};
