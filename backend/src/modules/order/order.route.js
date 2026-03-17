import { Router } from "express";
import authMiddleware from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as orderController from "./order.controller.js";
import * as orderSchema from "./order.validation.js";

const router = Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo("student"));

router.get("/", orderController.getOrders);
router.get("/:id", validate(orderSchema.orderIdParamsSchema), orderController.getOrderById);
router.post("/", validate(orderSchema.createOrderSchema), orderController.createOrder);
router.patch("/:id/cancel", validate(orderSchema.orderIdParamsSchema), orderController.cancelOrder);

export default router;