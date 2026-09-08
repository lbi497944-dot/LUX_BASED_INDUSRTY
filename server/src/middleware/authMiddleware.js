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

  if (!process.env.JWT_SECRET) {
    console.error('[Auth Error] JWT_SECRET is not configured on server.');
    return errorResponse(res, 'Internal authentication service misconfiguration.', 500);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    if (!req.admin) {
      return errorResponse(res, 'Authentication required to access this resource.', 401);
    }
    if (!roles.includes(req.admin.role)) {
      return errorResponse(
        res,
        `Role (${req.admin.role || 'Guest'}) is not permitted to perform this action.`,
        403
      );
    }
    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches req.admin if a valid Bearer token is passed; otherwise proceeds anonymously without error.
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || !process.env.JWT_SECRET) {
    req.admin = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    req.admin = admin || null;
  } catch {
    req.admin = null;
  }

  next();
};
