import { verifyAccessToken } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Middleware to protect routes — extracts and verifies the Bearer token.
 * Attaches the decoded payload to req.user on success.
 */
const authenticate = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Token has expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token'));
    }
    next(error);
  }
};

export default authenticate;
