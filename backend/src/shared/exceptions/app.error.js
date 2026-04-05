
class AppError extends Error {
  constructor(message, statusCode, errors = null, options = {}) {
    super(message, options); 
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? "fail" : "error";
    this.errors = errors;
    this.isOperational = true;

    if (!options.cause) Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;