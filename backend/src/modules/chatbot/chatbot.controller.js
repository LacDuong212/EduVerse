import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as chatbotService from "./chatbot.service.js";

// @desc  Get chatbot response for user's message
// @route POST /message
export const getChatbotResponse = asyncHandler(async (req, res) => {
  const user = req.user;
  const { sessionId, message, language } = req.validated?.body;

  const result = await chatbotService.handleChatbotResponse(
    user,
    { sessId: sessionId, userMessage: message, languageCode: language }
  );

  return sendSuccessResponse(res, 200, "Get chatbot response successfully!", result);
});
