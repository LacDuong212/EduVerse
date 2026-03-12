import { Router } from "express";
import * as orderController from "./order.controller.js";
import authMiddleware from "#middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware.protect);

router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderById);
router.post("/", orderController.createOrder);
router.patch("/:id/cancel", orderController.cancelOrder);

export default router;