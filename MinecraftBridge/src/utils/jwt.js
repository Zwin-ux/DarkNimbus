// src/utils/jwt.js
import jwt from 'jsonwebtoken';
import { logger } from './logger.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Default to 7 days

if (!JWT_SECRET) {
  logger.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  // process.exit(1); // Or handle this more gracefully depending on your app's startup sequence
}

/**
 * Generates a JWT for a given user payload.
 * @param {object} payload - The payload to include in the JWT (e.g., { userId: 'discordUserId', username: 'DiscordUser' })
 * @returns {string} The generated JWT.
 */
export const generateToken = (payload) => {
  if (!JWT_SECRET) {
    logger.error('Cannot generate token: JWT_SECRET is not available.');
    throw new Error('Token generation failed due to missing secret.');
  }
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (error) {
    logger.error(`Error generating JWT: ${error.message}`);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {object | null} The decoded payload if verification is successful, otherwise null.
 */
export const verifyToken = (token) => {
  if (!JWT_SECRET) {
    logger.error('Cannot verify token: JWT_SECRET is not available.');
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.warn(`JWT verification failed: ${error.message}`); // Warn because invalid tokens are expected
    return null;
  }
};
