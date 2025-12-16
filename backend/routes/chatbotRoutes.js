import express from "express";
import { sendMessageToDialogflow } from "../services/dialogflowService.js";

const INTENT = {
  COURSE: {
    SEARCH: "COURSE_SEARCH",
    DETAILS: "COURSE_DETAILS",
  },
};

// --- HELPER: Unwrap Dialogflow Protobuf Structs ---
// This turns the messy { fields: { key: { stringValue: "val" } } } into { key: "val" }
const protoToJSON = (proto) => {
  if (!proto) return null;

  // If it's already a simple value, return it
  if (typeof proto !== 'object') return proto;

  // Handle distinct Proto types
  if (proto.stringValue !== undefined) return proto.stringValue;
  if (proto.numberValue !== undefined) return proto.numberValue;
  if (proto.boolValue !== undefined) return proto.boolValue;

  // Handle Lists
  if (proto.listValue) {
    return proto.listValue.values.map(v => protoToJSON(v));
  }

  // Handle Objects (Structs)
  if (proto.structValue) {
    return protoToJSON(proto.structValue);
  }

  // Handle Fields (The main wrapper)
  if (proto.fields) {
    const json = {};
    for (const [key, value] of Object.entries(proto.fields)) {
      json[key] = protoToJSON(value);
    }
    return json;
  }

  // Fallback (if it's already normal JSON)
  return proto;
};

const router = express.Router();

router.post('/message', async (req, res) => {
  const { message, sessionId, languageCode } = req.body;
  try {
    // get { queryResult } from dialogflow api response
    const response = await sendMessageToDialogflow(message, sessionId, languageCode);
    //console.log(response);

    let botReply = "Here are the results.";
    if (response.fulfillmentText) {
      botReply = response.fulfillmentText;
    } else if (response.fulfillmentMessages) {
      const textMsg = response.fulfillmentMessages.find(m => m.text);
      if (textMsg && textMsg.text && textMsg.text.text) {
        botReply = textMsg.text.text[0];
      }
    }

    let actionData = null;

    // extract payload
    if (response.fulfillmentMessages) {
      const payloadMsg = response.fulfillmentMessages.find(msg => msg.payload);

      if (payloadMsg) {
        // clean data
        const payload = protoToJSON(payloadMsg.payload);

        // if searching courses
        if (payload.type === INTENT.COURSE.SEARCH && payload.filters) {
          const filters = payload.filters;
          const params = new URLSearchParams();

          // join strings
          if (filters.search) {
            const val = Array.isArray(filters.search) ? filters.search.join(' ') : filters.search;
            params.append('search', val);
          }

          // take first value
          if (filters.price) {
            const val = Array.isArray(filters.price)
              ? (filters.price.length > 0 ? filters.price[0] : "")
              : filters.price;
            if (val) params.append('price', val);
          }

          if (filters.level) {
            params.append('level', filters.level);
          }

          if (filters.language) {
            params.append('lang', filters.language);
          }

          // take first value
          if (filters.sort) {
            const val = Array.isArray(filters.sort)
              ? (filters.sort.length > 0 ? filters.sort[0] : "")
              : filters.sort;
            if (val) params.append('sort', val);
          }

          actionData = {
            url: `/courses?${params.toString()}`,
            label: "View Courses"
          };
        }
      }
    }

    res.json({
      success: true,
      reply: botReply,
      action: actionData  // null if no payload
    });
  } catch (err) {
    console.error("Chatbot Error: ", err);
    res.status(500).send(err.message);
  }
});

export default router;
