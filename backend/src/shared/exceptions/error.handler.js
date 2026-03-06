import AppError from "./app.error.js";

const handleJWTError = () => 
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () => 
  new AppError("Your session has expired. Please log in again.", 401);

const handleCastErrorDB = () => 
  new AppError("The resource you are looking for has an invalid ID format.", 400);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`This ${field} is already in use. Please try another one!`, 400);
};

export const transformError = (err) => {
  if (err.name === "CastError") return handleCastErrorDB();
  if (err.code === 11000) return handleDuplicateFieldsDB(err);
  if (err.name === "JsonWebTokenError") return handleJWTError();
  if (err.name === "TokenExpiredError") return handleJWTExpiredError();
  
  return err;
};