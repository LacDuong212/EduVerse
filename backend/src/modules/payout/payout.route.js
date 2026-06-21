import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as payoutController from "./payout.controller.js";
import * as payoutValidation from "./payout.validation.js";

// @route /api/instructor/payouts
const instructorRoutes = Router();
instructorRoutes.use(protect, restrictTo("instructor"));

instructorRoutes.post(
  "/",
  validate(payoutValidation.requestPayoutRequest),
  payoutController.requestPayout
);
instructorRoutes.get(
  "/",
  validate(payoutValidation.listPayoutsRequest),
  payoutController.getMyPayouts
);

// @route /api/admin/payouts
const adminRoutes = Router();
adminRoutes.use(protect, restrictTo("admin"));

adminRoutes.get(
  "/",
  validate(payoutValidation.listPayoutsRequest),
  payoutController.getAllPayouts
);
adminRoutes.patch(
  "/:id",
  validate(payoutValidation.updatePayoutStatusRequest),
  payoutController.updatePayoutStatus
);

export default { instructorRoutes, adminRoutes };
