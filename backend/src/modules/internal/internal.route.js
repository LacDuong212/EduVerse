import { Router } from "express";
import { internal } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as inController from "./internal.controller.js";
import * as inSchema from "./internal.validation.js";

// @route /internal
const internalRoute = Router();
internalRoute.use(internal);

internalRoute.post("/notify", validate(inSchema.notifyRequest), inController.notifyUser);

export default internalRoute;