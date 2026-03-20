import { Router } from "express";
import authMiddleware from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as orderController from "./order.controller.js";
import * as orderSchema from "./order.validation.js";

// @route /orders
const orderRoute = Router();

orderRoute.use(authMiddleware.protect, authMiddleware.restrictTo("student"));

orderRoute.get("/", orderController.getOrders);
orderRoute.get("/:id", validate(orderSchema.orderIdParamsRequest), orderController.getOrderById);
orderRoute.post("/", validate(orderSchema.createOrderRequest), orderController.createOrder);
orderRoute.patch("/:id/cancel", validate(orderSchema.orderIdParamsRequest), orderController.cancelOrder);

export default orderRoute;