import { getLatestLearningProgress } from "../../controllers/learningController.js";
import { sendMessageToDialogflow } from "../../services/dialogflowService.js";

import { INTENT } from "./chatbotConfig.js";
import {
  handleCourseSearch, handleLearningProgress, handlePageNavigation
} from "./chatbotHandler.js";
import { protoToJSON, getBotText } from "./chatbotUtils.js";

/**
 * @param {*} req user's message + session (history) + language
 * @param {*} res proccessed response, from Dialogflow's raw response, base on intention
 */
export const handleChatbotResponse = async (req, res) => {
  const { message, sessionId, languageCode = "en" } = req.body;

  const isVi = languageCode === "vi";

  const userId = req.user?._id || req.userId;
  const userRole = req.user ? req.user.role : "guest";

  try {
    // call Dialogflow
    const response = await sendMessageToDialogflow(message, sessionId, languageCode);

    // get default text response
    let botReply = getBotText(response);
    let actionData = null;

    // process custom payload
    if (response.fulfillmentMessages) {
      const payloadMsg = response.fulfillmentMessages.find(msg => msg.payload);

      if (payloadMsg) {
        const payload = protoToJSON(payloadMsg.payload);

        // course search intent
        if (payload.type === INTENT.COURSE_SEARCH && payload.filters) {
          actionData = handleCourseSearch(payload.filters);
        }

        // page navigation intent
        else if (payload.type === INTENT.PAGE_NAVIGATION && payload.navigation) {
          const result = handlePageNavigation(payload.navigation, userRole, languageCode);

          if (result.actionData) actionData = result.actionData;
          if (result.replyOverride) botReply = result.replyOverride;  // override Dialogflow's response message
        }

        else if (payload.type === INTENT.LEARNING_PROGRESS) {
          // check if user logged in
          if (!userId) {
            botReply = languageCode === "vi"
              ? "Bạn cần đăng nhập để theo dõi tiến độ học tập."
              : "You need to be logged in to track your learning progress.";

            actionData = {
              type: "redirect",
              url: "/auth/sign-in?redirectTo=%2Fstudent%2Fcourses",
              label: languageCode === "vi" ? "Đăng nhập" : "Sign In"
            };
          }

          // check if user is a student
          else if (req.user.role !== "student") {
            botReply = isVi
              ? `Tính năng này chỉ dành cho học viên. Bạn đang đăng nhập với vai trò là ${req.user.role}.`
              : `This feature is only for students. You are currently logged in as a ${req.user.role}.`;

            actionData = null;  // no action needed, just the message
          }

          // valid student
          else {
            const latestProgress = await getLatestLearningProgress(userId);
            const result = handleLearningProgress(latestProgress, languageCode);

            if (result.actionData) actionData = result.actionData;
            if (result.replyOverride) botReply = result.replyOverride;  // overide Dialogflow's response
          }
        }
      }
    }

    // send back to user
    res.json({
      success: true,
      reply: botReply,
      action: actionData
    });

  } catch (err) {
    console.error("Chatbot Error: ", err);
    res.status(500).json({ success: false, reply: "Server Error" });
  }
};
