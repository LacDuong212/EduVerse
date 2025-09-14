import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cartController.js";

const cartRoute = express.Router();

cartRoute.use(userAuth);

cartRoute.get("/", getCart);
cartRoute.post("/add", addToCart);
cartRoute.delete("/remove", removeFromCart);
cartRoute.delete("/clear", clearCart);

export default cartRoute;
