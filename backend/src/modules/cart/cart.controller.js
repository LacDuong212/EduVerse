import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import cartService from "./cart.service.js";

// @desc  Get student cart
// @route GET /
export const getMyCart = asyncHandler(async (req, res) => {
  const user = req.user;
  const cart = await cartService.getCart(user.userId);
  sendSuccessResponse(res, 200, "Get cart successfully!", cart);
});

// @desc  Add one course to cart
// @route POST /items
export const addToCart = asyncHandler(async (req, res) => {
  const user = req.user;
  const { courseId } = req.body;
  const cart = await cartService.addToCart(user.userId, courseId);
  sendSuccessResponse(res, 200, "Added course to your cart!", cart);
});

// @desc  Remove a list of courses from cart
// @route DELETE /items
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { courseIds } = req.body;

  const { 
    cart = [], 
    removedCount = 0 
  } = await cartService.bulkRemoveFromCart(user.userId, courseIds);

  sendSuccessResponse(
    res, 
    200, 
    `Removed ${removedCount} course${removedCount === 1 ? "": "s"} from cart`, 
    cart
  );
});

export default {
  getMyCart,
  addToCart,
  removeFromCart,
};