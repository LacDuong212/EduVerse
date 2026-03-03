import { Router } from "express";
import { protect, restrictTo, checkAuth } from "#middlewares/auth.middleware.js";

const courseRoute = Router();

export default courseRoute;