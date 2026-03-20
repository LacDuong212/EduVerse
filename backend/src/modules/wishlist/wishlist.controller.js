import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as wishlistService from "./wishlist.service.js";
import * as wishlistMapper from "./wishlist.mapper.js";

// @route POST /
export const addToWishlist = asyncHandler(async (req, res) => {
  const { courseId } = req.validated?.body;

  const item = await wishlistService.addToWishlist(
    req.user?.userId,
    courseId
  );

  return sendSuccessResponse(
    res,
    201,
    "Added to wishlist.",
    wishlistMapper.toWishlistDto(item.course)
  );
});

// @route DELETE /
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { courseId } = req.validated?.body;

  await wishlistService.removeFromWishlist(
    req.user?.userId,
    courseId
  );

  return sendSuccessResponse(
    res,
    200,
    "Removed from wishlist.",
    courseId
  );
});

// @route GET /
export const getWishlist = asyncHandler(async (req, res) => {
  const courses = await wishlistService.getWishlist(req.user?.userId);

  return sendSuccessResponse(
    res,
    200,
    "Wishlist fetched.",
    wishlistMapper.toWishlistDtoList(courses)
  );
});

// @route GET /check
export const checkWishlist = asyncHandler(async (req, res) => {
  const { courseId } = req.validated?.query;

  const exists = await wishlistService.checkWishlist(
    req.user?.userId,
    courseId
  );

  return sendSuccessResponse(
    res,
    200,
    "Wishlist status fetched",
    { exists }
  );
});

// @route GET /count
export const countWishlist = asyncHandler(async (req, res) => {
  const count = await wishlistService.countWishlist(req.user?.userId);

  return sendSuccessResponse(
    res,
    200,
    "Wishlist count fetched.",
    { count }
  );
});