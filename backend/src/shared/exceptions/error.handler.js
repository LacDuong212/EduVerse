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

const handleJSONSyntaxError = () => 
  new AppError("Invalid JSON format. Please check your request body syntax!", 400);

const handleValidationErrorDB = (err) => {
  const formattedErrors = Object.values(err.errors).map((el) => {
    if (el.name === "CastError") {
      return {
        field: el.path,
        message: `Invalid data format. Expected type {${el.kind}}.`,
      };
    }

    return {
      field: el.path,
      message: el.message,
    };
  });

  return new AppError("Validation Failed", 400, formattedErrors);
};

const handleZodError = (err) => {
  const formattedErrors = err.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return new AppError("Validation Failed", 400, formattedErrors);
};

export const transformError = (err) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err)
    return handleJSONSyntaxError();
  if (err.name === "ZodError") return handleZodError(err);
  if (err.name === "CastError") return handleCastErrorDB();
  if (err.code === 11000) return handleDuplicateFieldsDB(err);
  if (err.name === "JsonWebTokenError") return handleJWTError();
  if (err.name === "TokenExpiredError") return handleJWTExpiredError();
  if (err.name === "ValidationError") return handleValidationErrorDB(err);
  
  return err;
};