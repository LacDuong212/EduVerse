import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as badgeService from "./badge.service.js";

export const listBadges = asyncHandler(async (req, res) => {
  const badges = await badgeService.getAllBadges();
  sendSuccessResponse(res, 200, "Badges fetched.", badges);
});

export const getMyBadges = asyncHandler(async (req, res) => {
  const result = await badgeService.getUserBadges(req.user.userId);
  sendSuccessResponse(res, 200, "User badges fetched.", result);
});
