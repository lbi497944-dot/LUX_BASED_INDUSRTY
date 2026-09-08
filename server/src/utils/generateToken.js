import jwt from 'jsonwebtoken';

/**
 * Generate signed JWT token
 */
export const generateToken = (id, role = 'admin') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not configured.');
  }

  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '24h',
    }
  );
};
