import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Validate required JWT secrets
// if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
//     throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables are required');
// }

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev-mode';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

/**
 * Generate JWT access token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: 'brainex',
    audience: 'brainex-users',
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
    issuer: 'brainex',
    audience: 'brainex-users',
  });
};

/**
 * Verify JWT access token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'brainex',
      audience: 'brainex-users',
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify JWT refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'brainex',
      audience: 'brainex-users',
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message || 'Authentication failed',
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  authenticate,
  authorize,
  hashPassword,
  comparePassword,
  optionalAuth,
};
