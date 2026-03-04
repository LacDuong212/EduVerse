import jwt from "jsonwebtoken";
import AppError from "#exceptions/app.error.js";
import { toAuthUserDto } from "#modules/user/user.mapper.js";
import User from "#modules/user/user.model.js";
import asyncHandler from "#utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.token;

  if (!token) {
    return next(new AppError("You are not logged in. Please log in to get access.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.userId).select("-password");
  if (!currentUser) {
    return next(new AppError("The user belonging to this token no longer exists.", 401));
  }

  req.user = toAuthUserDto(currentUser);
  next();
});

/**
 * @param {...string} roles - e.g., "instructor", "student"
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ["instructor"], req.user.role is "student"
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

export const checkAuth = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select("-password");
    req.user = toAuthUserDto(user);
    
  } catch (error) {
    req.user = null;
  }

  next();
};

export default { protect, restrictTo, checkAuth };