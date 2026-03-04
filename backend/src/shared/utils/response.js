
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

  return response;
};

/**
 * Standard API Success Response
 */
export const sendSuccessResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json(createResponse(true, message, data, "result"));
};

/**
 * Standard API Unsuccess Response (Logic-based failures, e.g., Wrong Password)
 */
export const sendUnsuccessResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json(createResponse(false, message, data, "result"));
};

/**
 * Standard API Error Response (Exceptions/Validation failures)
 * Includes stack trace in development mode via the error middleware.
 */
export const sendError = (res, statusCode, message, errors = null, stack = null) => {
  const response = createResponse(false, message, errors, "errors");

  if (stack && process.env.NODE_ENV === "development") {
    response.stack = stack;
  }

  return res.status(statusCode).json(response);
};