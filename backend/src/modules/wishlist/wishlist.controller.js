import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as wishlistService from "./wishlist.service.js";
import * as wishlistMapper  from "./wishlist.mapper.js";

export const addToWishlist = asyncHandler(async (req, res) => {

    const { courseId } = req.body;

    const item = await wishlistService.addToWishlist(
        req.user.userId,
        courseId
    );

    return sendSuccessResponse(
        res,
        201,
        "Added to wishlist",
        wishlistMapper.toWishlistDto(item.course)
    );
});

export const removeFromWishlist = asyncHandler(async (req, res) =>{

    const { courseId } = req.body;

    await wishlistService.removeFromWishlist(
        req.user.userId,
        courseId
    )

    return sendSuccessResponse(
        res,
        200,
        "Removed from wishlist",
        courseId
    );
});

export const getWishlist = asyncHandler(async (req, res) => {

  const courses = await wishlistService.getWishlist(req.user.userId);

  return sendSuccessResponse(
    res,
    200,
    "Wishlist fetched",
    wishlistMapper.toWishlistDtoList(courses)
  );
});


export const checkWishlist = asyncHandler(async (req, res) => {

  const { courseId } = req.query;

  const exists = await wishlistService.checkWishlist(
    req.user.userId,
    courseId
  );

  return sendSuccessResponse(
    res,
    200,
    "Wishlist status fetched",
    { exists }
  );
});


export const countWishlist = asyncHandler(async (req, res) => {

  const count = await wishlistService.countWishlist(req.user.userId);

  return sendSuccessResponse(
    res,
    200,
    "Wishlist count fetched",
    { count }
  );
});