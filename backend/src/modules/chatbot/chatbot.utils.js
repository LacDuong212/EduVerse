import { PAGE_MAP } from "./chatbot.config.js";

// helper: check if page is public
export const getPublicUrl = (pageKey) => {
  const entry = PAGE_MAP[pageKey];
  if (entry && entry.path) return entry.path;
  return null;
};

// helper: check if page is role-based
export const getRoleBasedUrl = (role, pageKey) => {
  const entry = PAGE_MAP[pageKey];
  if (entry && entry[role]) {
    return entry[role];
  }
  return null;
};

// helper: check if page is unique to one role
export const getSoleRole = (pageEntry) => {
  if (!pageEntry) return null;
  // get all keys that are not 'path'
  const roles = Object.keys(pageEntry).filter(key => key !== 'path');
  if (roles.length === 1) {
    return roles[0];
  }
  return null;
};

// helper: my-courses, my_courses -> my courses
export const toNormalText = (value) => {
  if (!value) return '';
  return value.replace(/[_-]+/g, ' ');
};

// helper: unwrap Dialogflow's response
export const protoToJSON = (proto) => {
  if (!proto) return null;
  if (typeof proto !== 'object') return proto;

  if (proto.stringValue !== undefined) return proto.stringValue;
  if (proto.numberValue !== undefined) return proto.numberValue;
  if (proto.boolValue !== undefined) return proto.boolValue;

  if (proto.listValue) {
    return proto.listValue.values.map(v => protoToJSON(v));
  }
  if (proto.structValue) {
    return protoToJSON(proto.structValue);
  }
  if (proto.fields) {
    const json = {};
    for (const [key, value] of Object.entries(proto.fields)) {
      json[key] = protoToJSON(value);
    }
    return json;
  }
  return proto;
};

// helper: get text from Dialogflow's response
export const getBotText = (response, language = "en") => {
  if (response.fulfillmentText) return response.fulfillmentText;

  if (response.fulfillmentMessages) {
    const textMsg = response.fulfillmentMessages.find(m => m.text);
    if (textMsg && textMsg.text && textMsg.text.text) {
      return textMsg.text.text[0];
    }
  }

  const resp = language === "vi"
    ? "Tôi đã xử lý yêu cầu của bạn."
    : "I processed your request.";

  return resp;
};
