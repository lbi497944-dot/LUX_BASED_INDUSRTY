import * as authService from '../services/authService.js';
import { successResponse } from '../utils/apiResponse.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin(email, password);
    return successResponse(res, 'Authentication successful.', result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const admin = await authService.getAdminProfile(req.admin._id);
    return successResponse(res, 'Admin profile retrieved.', { admin });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return successResponse(res, 'Successfully logged out.');
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changeAdminPassword(req.admin._id, currentPassword, newPassword);
    return successResponse(res, result.message);
  } catch (error) {
    next(error);
  }
};
