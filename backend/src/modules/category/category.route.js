import { Router } from "express";
import categoryController from "./category.controller.js";

// @route /categories
const categoryRoute = Router();

categoryRoute.get("/", categoryController.getAllCategoriesWithSort);

export default categoryRoute;