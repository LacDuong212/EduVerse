import { transformError } from "#exceptions/error.handler.js";
import logger from "#utils/logger.js";
import { sendError } from "#utils/response.js";

const errorMiddleware = (err, req, res, next) => {
  logger.logErrorWithContext(err, req);

  const error = transformError(err);
  const stack = err.stack;
  if (error.isOperational) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    const errors = error.errors || null;

    return sendError(res, statusCode, message, errors, stack);
  } else {
    return sendError(res, 500, "Something went wrong on our end. Please try again later.", stack);
  }
};

export default errorMiddleware;