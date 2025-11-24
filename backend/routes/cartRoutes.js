import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { getCart, addToCart, removeFromCart, clearCart, getCartCount } from "../controllers/cartController.js";

const cartRoute = express.Router();

cartRoute.use(userAuth);

cartRoute.get("/", getCart);
cartRoute.get("/count", getCartCount);
cartRoute.post("/add", addToCart);
cartRoute.delete("/remove", removeFromCart);
cartRoute.delete("/clear", clearCart);

export default cartRoute;
