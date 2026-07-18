import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Catches requests to undefined routes and forwards a 404 ApiError.
 */
const notFoundMiddleware = (req, _res, next) => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, `Route ${req.method} ${req.originalUrl} not found`));
};

export default notFoundMiddleware;
