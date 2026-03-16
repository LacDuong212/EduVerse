import { Router } from "express";
import { checkAuth, protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js"
import * as userController from "./user.controller.js";

// @route /user
const userRoute = Router();
userRoute.use(protect);

userRoute.get("/avatar/upload", userController.getAvatarParams);

export default userRoute;