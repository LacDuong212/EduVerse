import { Router } from "express";
import * as categoryController from "./category.controller.js";

// @route /categories
const categoryRoute = Router();

categoryRoute.get("/", categoryController.getAllCategoriesWithSort);

export default categoryRoute;