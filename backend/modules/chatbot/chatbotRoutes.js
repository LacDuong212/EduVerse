import express from "express";
import { handleChatbotResponse } from "./chatbotController.js";
import { checkAuth } from "../../middlewares/userAuth.js";

const router = express.Router();

router.post('/message', checkAuth, handleChatbotResponse);

export default router;
