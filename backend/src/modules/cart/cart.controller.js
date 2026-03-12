import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import cartService from "./cart.service.js";

export const getMyCart = asyncHandler(async (req, res) => {
  const user = req.user;
  const cart = await cartService.getCart(user.userId);
  sendSuccessResponse(res, 200, "Get cart successfully!", cart);
});

export const addToCart = asyncHandler(async (req, res) => {
  const user = req.user;
  const { courseId } = req.body;
  const cart = await cartService.addToCart(user.userId, courseId);
  sendSuccessResponse(res, 200, "Added course to your cart!", cart);
});

export default {
  getMyCart,
  addToCart,
};