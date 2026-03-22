import { Router } from "express";
import { protect } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js"
import * as userController from "./user.controller.js";
import * as userSchema from "./user.validation.js";

// @route /user
const userRoute = Router();
userRoute.use(protect);

userRoute.get("/avatar/upload", userController.getAvatarParams);
userRoute.post(
  "/change-password", 
  protect, 
  validate(userSchema.changePasswordRequest), 
  userController.changePassword
);
userRoute.put(
  "/interests", 
  protect, 
  validate(userSchema.updateInterestsRequest), 
  userController.updateInterests
);

export default userRoute;