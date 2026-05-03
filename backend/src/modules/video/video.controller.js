import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as videoService from "./video.service.js";

// @desc  Get video stream url
// @roure GET /:videoId
export const getViewUrl = asyncHandler(async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const url = await videoService.getVideoViewUrl(user, videoId);
  sendSuccessResponse(res, 200, "Get video stream URL successfully.", url);
});

// @desc  Get video upload url
// @roure POST /
export const getUploadUrl = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId, contentType } = req.validated?.body || {};
  const result = await videoService.getVideoUploadUrl(userId, courseId, contentType);
  sendSuccessResponse(res, 200, "Get video upload URL successfully.", result);
});