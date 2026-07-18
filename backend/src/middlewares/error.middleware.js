import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Centralized error handling middleware.
 * Must be registered LAST in Express middleware chain (4 parameters).
 */
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, _next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Log 5xx errors as errors, 4xx as warnings
  if (statusCode >= 500) {
    logger.error({ err, req: { method: req.method, url: req.url } }, err.message);
  } else {
    logger.warn({ err, req: { method: req.method, url: req.url } }, err.message);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorMiddleware;
