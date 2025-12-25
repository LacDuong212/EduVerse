
// unwrap Dialogflow's response
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

// get text from Dialogflow's response
export const getBotText = (response) => {
  if (response.fulfillmentText) return response.fulfillmentText;
  
  if (response.fulfillmentMessages) {
    const textMsg = response.fulfillmentMessages.find(m => m.text);
    if (textMsg && textMsg.text && textMsg.text.text) {
      return textMsg.text.text[0];
    }
  }
  return "I processed your request.";
};
