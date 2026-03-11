import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import categoryService from "./category.service.js";

// @desc  Get all categories with sort
// @route ..?sort=
export const getAllCategoriesWithSort = asyncHandler(async (req, res) => {
  const { sort } = req.query;
  const categories = await categoryService.getAllCatgeoriesWithSort(sort);
  sendSuccessResponse(res, 200, "Get all categories successfully!", categories);
});

export default {
  getAllCategoriesWithSort,
};