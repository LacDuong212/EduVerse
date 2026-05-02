import { Router } from "express";
import authMiddleware from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as orderController from "./order.controller.js";
import * as orderSchema from "./order.validation.js";

// @route /orders
const orderRoute = Router();

orderRoute.use(authMiddleware.protect, authMiddleware.restrictTo("student"));

orderRoute.get(
  "",
  validate(orderSchema.ordersQueryRequest),
  orderController.getOrders
);
orderRoute.get("/stats", orderController.getOrdersStats);

orderRoute.get(
  "/:orderId",
  validate(orderSchema.orderIdParam),
  orderController.getOrderDetail
);
orderRoute.post("/", validate(orderSchema.createOrderRequest), orderController.createOrder);
orderRoute.patch("/:id/cancel", validate(orderSchema.orderIdParamsRequest), orderController.cancelOrder);

export default orderRoute;