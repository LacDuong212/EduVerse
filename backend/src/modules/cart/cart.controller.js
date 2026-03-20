import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse, sendUnsuccessResponse } from "#utils/response.js";
import * as cartService from "./cart.service.js";

// @desc  Get student cart
// @route GET /
export const getMyCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const cart = await cartService.getCart(userId);
  return sendSuccessResponse(res, 200, "Get cart successfully!", cart);
});

// @desc  Add one course to cart
// @route POST /items
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.body;
  const cart = await cartService.addToCart(userId, courseId);
  return sendSuccessResponse(res, 200, "Added course to your cart!", cart);
});

// @desc  Remove a list of courses from cart
// @route DELETE /items
export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseIds } = req.validated?.body;

  const {
    cart = [],
    removedCount = 0
  } = await cartService.bulkRemoveFromCart(userId, courseIds);

  return sendSuccessResponse(
    res,
    200,
    `Removed ${removedCount} course${removedCount === 1 ? "" : "s"} from cart`,
    cart
  );
});

// @desc  Clear all items in cart
// @route DELETE /
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  await cartService.clearCart(userId);
  return sendSuccessResponse(res, 200, "Cart cleared successfully!");
});

// @desc  Count items in cart
// @route GET /items
export const countCartItems = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const size = await cartService.countCartItems(userId);
  return sendSuccessResponse(
    res, 
    200, 
    `You have ${size} item${size === 1 ? "" : "s"} in cart.`, 
    size
  );
});