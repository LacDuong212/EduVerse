import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as wishlistController from "./wishlist.controller.js";
import * as wishlistSchema from "./wishlist.validation.js";

const router = Router();

router.use(protect, restrictTo("student"));

router.get("/", wishlistController.getWishlist);

router.post(
  "/",
  validate(wishlistSchema.addToWishlistSchema),
  wishlistController.addToWishlist
);

router.delete("/", wishlistController.removeFromWishlist);

router.get("/check", wishlistController.checkWishlist);

router.get("/count", wishlistController.countWishlist);

export default router;