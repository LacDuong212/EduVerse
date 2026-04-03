import { Router } from "express";
import { checkAuth } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js"
import * as chatbotController from "./chatbot.controller.js";
import * as chatbotSchema from "./chatbot.validation.js";

// @route /chatbot
const chatbotRoute = Router();

chatbotRoute.post(
  "/message",
  checkAuth,
  validate(chatbotSchema.chatbotRequest),
  chatbotController.getChatbotResponse
);

export default chatbotRoute;