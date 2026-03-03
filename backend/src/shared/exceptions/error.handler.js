import AppError from "./app.error.js";

const handleJWTError = () => 
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () => 
  new AppError("Your session has expired. Please log in again.", 401);

const handleCastErrorDB = (err) => 
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/([""])(\\?.)*?\1/)[0];
  return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
};

export const transformError = (err) => {
  if (err.name === "CastError") return handleCastErrorDB(err);
  if (err.code === 11000) return handleDuplicateFieldsDB(err);
  if (err.name === "JsonWebTokenError") return handleJWTError();
  if (err.name === "TokenExpiredError") return handleJWTExpiredError();
  
  return err;
};