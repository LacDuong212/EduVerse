import axios from "axios";

export const sendMessageToApi = async (message, sessionId, languageCode = "en") => {
  const response = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/api/chatbot/message`,
    {
      message,
      sessionId,
      languageCode,
    },
    { withCredentials: true }
  );

  return response.data;
};