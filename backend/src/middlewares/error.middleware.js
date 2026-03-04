import { transformError } from "#exceptions/error.handler.js";
import logger from "#utils/logger.js";
import { sendError } from "#utils/response.js";

const errorMiddleware = (err, req, res, next) => {
  logger.logErrorWithContext(err, req);
  
  const error = transformError(err); 

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  const errors = error.errors || null;
  const stack = err.stack;

  return sendError(res, statusCode, message, errors, stack);
};

export default errorMiddleware;