/**
 * Custom API error class that extends the native Error.
 * Used throughout the app to produce structured, consistent error responses.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // marks this as a known, handled error
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
