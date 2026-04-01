import { Router } from "express";
import { checkAuth, protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js"
import * as videoController from "./video.controller.js";
import * as videoSchema from "./video.validation.js";

// @route /videos
const videoRoute = Router();

videoRoute.post("/",
  protect,
  restrictTo("instructor"),
  validate(videoSchema.uploadVideoRequest),
  videoController.getUploadUrl
);
videoRoute.get("/:videoId", checkAuth, videoController.getViewUrl);

export default videoRoute;