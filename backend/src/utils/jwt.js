import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Signs a JWT access token with the given payload.
 * @param {object} payload - Data to encode (e.g., { userId })
 * @returns {string} Signed JWT string
 */
export const signAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};

/**
 * Verifies and decodes a JWT access token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};
