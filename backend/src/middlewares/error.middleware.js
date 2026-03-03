import { transformError } from "#exceptions/error.handler.js";

const errorMiddleware = (err, req, res, next) => {
  let error = transformError(err);

  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  const response = {
    success: false,
    status: status,
    message: error.message || "Internal Server Error",
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};

export default errorMiddleware;