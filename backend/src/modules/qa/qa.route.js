import { Router } from "express";
import { protect } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as qaController from "./qa.controller.js";
import * as qaSchema from "./qa.validation.js";

// @route /qa
const qaRoute = Router();

qaRoute.get(
  "/courses/:courseId",
  protect,
  validate(qaSchema.getQnaRequest),
  qaController.getQna
);

qaRoute.post(
  "/courses/:courseId",
  protect,
  validate(qaSchema.createQuestionRequest),
  qaController.createQuestion
);

qaRoute.post(
  "/:questionId/replies",
  protect,
  validate(qaSchema.createReplyRequest),
  qaController.createReply
);

qaRoute.patch(
  "/:id/resolve",
  protect,
  validate(qaSchema.toggleResolveRequest),
  qaController.toggleResolve
);

qaRoute.delete(
  "/:id",
  protect,
  validate(qaSchema.deleteQnaRequest),
  qaController.deleteQna
);

export default qaRoute;
