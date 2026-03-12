import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import videoService from "./video.service.js";

// @desc  getVideo
// @roure GET /:videoId
export const getViewUrl = asyncHandler(async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const url = await videoService.getVideoViewUrl(user, videoId);
  sendSuccessResponse(res, 200, "Get video stream URL successfully.", url);
});


export default {
  getViewUrl,

};