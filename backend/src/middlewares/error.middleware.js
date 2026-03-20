import { transformError } from "#exceptions/error.handler.js";
import logger from "#utils/logger.js";
import { sendError } from "#utils/response.js";

const errorMiddleware = (err, req, res, next) => {
  logger.logErrorWithContext(err, req);

  const error = transformError(err);
  const isDev = process.env.NODE_ENV === "development";

  let finalMessage = error.message;
  if (!error.isOperational && !isDev) {
    finalMessage = "Something went wrong on our end. Please try again later.";
  }

  const statusCode = error.statusCode || 500;

  return sendError(
    res,
    statusCode,
    finalMessage,
    error.errors,
    err.stack
  );
};

export default errorMiddleware;