import AppError from "#exceptions/app.error.js";
import * as authService from "#modules/auth/auth.service.js";
import asyncHandler from "#utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return next(new AppError("You are not logged in. Please log in first.", 401));

  const user = await authService.getUserFromToken(token);
  if (!user) return next(new AppError("User not found.", 401));

  req.user = user;
  next();
});

/**
 * @param {...string} roles - e.g., "instructor", "student"
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError("Access denied.", 403));
    next();
  };
};

export const checkAuth = async (req, res, next) => {
  req.user = await authService.getUserFromToken(req.cookies?.token);
  next();
};

export default { protect, restrictTo, checkAuth };