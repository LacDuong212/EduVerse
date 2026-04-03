import { Router } from "express";
import { protect } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as notifController from "./notification.controller.js";
import * as notifSchema from "./notification.validation.js";

// @route /notifications
const notifRoute = Router();
notifRoute.use(protect);

notifRoute.get("/", validate(notifSchema.limitQuery), notifController.getMyNotifications);
notifRoute.delete("/", notifController.deleteAllNotifications);
notifRoute.get("/count", notifController.countMyNoftications);
notifRoute.put("/read", notifController.markAllRead);
notifRoute.get("/unread/count", notifController.countMyUnreadNoftications);
notifRoute.put("/:id/read", validate(notifSchema.notifIdParams), notifController.markAsRead);

export default notifRoute;