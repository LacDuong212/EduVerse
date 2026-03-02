import express from "express";
import { handleChatbotResponse } from "./chatbotController.js";
import { checkAuth } from "#middlewares/user.auth.js";

const router = express.Router();

router.post("/message", checkAuth, handleChatbotResponse);

export default router;