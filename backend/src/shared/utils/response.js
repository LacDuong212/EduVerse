
/**
 * Internal helper to standardize the response object.
 * This ensures the base structure (success, message) never changes.
 */
const createResponse = (success, message, payload = null, key = "data") => {
  const response = {
    success,
    message,
  };

  if (payload !== null) {
    response[key] = payload;
  }

  response.timestamp = new Date().toISOString();
  return response;
};

/**
 * Standard API Success Response
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {any} [data=null] - The payload, returned under the "result" key
 */
export const sendSuccessResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json(createResponse(true, message, data, "result"));
};

/**
 * Standard API Unsuccess Response (Logic-based failures, e.g., Wrong Password)
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Failure description
 * @param {any} [data=null] - Optional context data, returned under the "result" key
 */
export const sendUnsuccessResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json(createResponse(false, message, data, "result"));
};

/**
 * Standard API Error Response (Exceptions/Validation failures)
 * Includes stack trace in development mode via the error middleware.
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error category message
 * @param { Object[] | null } [errors=null] - Array of specific error details
 * @param {string} [stack=null] - Error stack trace (only sent in development)
 */
export const sendError = (res, statusCode, message, errors = null, stack = null) => {
  const response = createResponse(false, message, errors, "errors");

  if (stack && process.env.NODE_ENV === "development") {
    response.stack = stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard API Paginated Response
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {any[]} data - The array of DTOs
 * @param {Object} meta
 * @param {number} meta.page
 * @param {number} meta.limit
 * @param {number} meta.totalItems
 */
export const sendPaginatedResponse = (res, statusCode, message, data, meta) => {
  const response = createResponse(true, message, data, "result");

  response.pagination = {
    page: Number(meta.page),
    limit: Number(meta.limit),
    totalItems: meta.totalItems,
    totalPages: Math.ceil(meta.totalItems / meta.limit),
    hasNextPage: Number(meta.page) * Number(meta.limit) < meta.totalItems,
    hasPrevPage: Number(meta.page) > 1,
  }

  return res.status(statusCode).json(response);
};