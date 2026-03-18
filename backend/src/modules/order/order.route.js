import { Router } from "express";
import authMiddleware from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as orderController from "./order.controller.js";
import * as orderSchema from "./order.validation.js";

const router = Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo("student"));

router.get("/", orderController.getOrders);
router.get("/:id", validate(orderSchema.orderIdParamsRequest), orderController.getOrderById);
router.post("/", validate(orderSchema.createOrderRequest), orderController.createOrder);
router.patch("/:id/cancel", validate(orderSchema.orderIdParamsRequest), orderController.cancelOrder);

export default router;