import jwt from 'jsonwebtoken';

/**
 * Generate signed JWT token
 */
export const generateToken = (id, role = 'admin') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'veloura_default_jwt_secret',
    {
      expiresIn: process.env.JWT_EXPIRE || '24h'
    }
  );
};
