import logger from '../config/logger.js';

/**
 * Validate required environment variables at startup
 */
export const validateEnvironment = () => {
  const requiredVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    logger.error('Please set all required variables in .env file');
    // process.exit(1);
    throw new Error('Missing environment variables');
  }

  // Validate JWT secret length (minimum 32 characters)
  if (process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET must be at least 32 characters long for security');
    // process.exit(1);
  }

  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    logger.error('JWT_REFRESH_SECRET must be at least 32 characters long for security');
    // process.exit(1);
  }

  logger.info('✅ All required environment variables are set');
};

export default validateEnvironment;
