import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as wishlistController from "./wishlist.controller.js";
import * as wishlistSchema from "./wishlist.validation.js";

// @route /wishlist
const wishlistRoute = Router();

wishlistRoute.use(protect, restrictTo("student"));

wishlistRoute.get("/", wishlistController.getWishlist);
wishlistRoute.post(
  "/",
  validate(wishlistSchema.courseIdRequest),
  wishlistController.addToWishlist
);
wishlistRoute.delete(
  "/",
  validate(wishlistSchema.courseIdRequest),
  wishlistController.removeFromWishlist
);
wishlistRoute.get("/check", validate(wishlistSchema.courseIdQuery), wishlistController.checkWishlist);
wishlistRoute.get("/count", wishlistController.countWishlist);

export default wishlistRoute;