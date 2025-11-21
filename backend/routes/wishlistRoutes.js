import express from "express";
import { 
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    checkWishlist,
    countWishlist
} from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/add", addToWishlist);
router.delete("/remove", removeFromWishlist);

router.get("/check/exist", checkWishlist);
router.get("/count/:userId", countWishlist);

router.get("/:userId", getWishlist);

export default router;