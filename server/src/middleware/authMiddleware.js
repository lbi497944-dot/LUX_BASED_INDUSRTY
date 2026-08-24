import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Protect routes: verifies Bearer JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized. Please login to access this resource.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'veloura_default_jwt_secret');
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return errorResponse(res, 'Admin account associated with this token no longer exists.', 401);
    }

    req.admin = admin;
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired authentication token. Please login again.', 401);
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return errorResponse(
        res,
        `Role (${req.admin ? req.admin.role : 'Guest'}) is not permitted to perform this action.`,
        403
      );
    }
    next();
  };
};
