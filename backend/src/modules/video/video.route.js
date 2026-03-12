import { Router } from "express";
import { checkAuth, protect, restrictTo } from "#middlewares/auth.middleware.js";
import * as videoController from "./video.controller.js";

// @route /videos
const videoRoute = Router();

videoRoute.get("/:videoId", checkAuth, videoController.getViewUrl);

export default videoRoute;