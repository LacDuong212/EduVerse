import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { getOrderById, getOrders, createOrder, updateOrder } from "../controllers/orderController.js";

const orderRoute = express.Router();

orderRoute.use(userAuth);

orderRoute.get("/", getOrders);
orderRoute.get("/:id", getOrderById);
orderRoute.post("/create", createOrder);
orderRoute.patch("/:id/update", updateOrder);

export default orderRoute;
