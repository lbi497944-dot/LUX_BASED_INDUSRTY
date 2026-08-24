import Admin from '../models/Admin.js';
import { generateToken } from '../utils/generateToken.js';

export const loginAdmin = async (email, password) => {
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin) {
    const error = new Error('Invalid email or password credentials.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password credentials.');
    error.statusCode = 401;
    throw error;
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = generateToken(admin._id, admin.role);

  return {
    token,
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin,
    },
  };
};

export const getAdminProfile = async (adminId) => {
  const admin = await Admin.findById(adminId).select('-password');
  if (!admin) {
    const error = new Error('Admin profile not found.');
    error.statusCode = 404;
    throw error;
  }
  return admin;
};
