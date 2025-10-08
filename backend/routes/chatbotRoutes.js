import express from "express";
import { sendMessageToDialogflow } from "../configs/dialogflowService.js";


const router = express.Router();

router.post('/message', async (req, res) => {
  const { message, sessionId, languageCode } = req.body;
  try {
    const response = await sendMessageToDialogflow(message, sessionId, languageCode);
    res.json({ success:true, reply: response.fulfillmentText });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
