import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js"
import cartController from "./cart.controller.js";
import * as cartSchema from "./cart.validation.js";

// @route /cart
const cartRoute = Router();
cartRoute.use(protect, restrictTo("student"));

cartRoute.get("/", cartController.getMyCart);
cartRoute.post("/", validate(cartSchema.addToCartSchema), cartController.addToCart);

export default cartRoute;