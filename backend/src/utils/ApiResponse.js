/**
 * Returns a standardized success response object.
 * @param {number} statusCode - HTTP status code
 * @param {*} data - Response payload
 * @param {string} message - Success message
 */
const ApiResponse = (statusCode, data, message = 'Success') => ({
  success: true,
  statusCode,
  message,
  data,
});

export default ApiResponse;
