import dialogflow from "@google-cloud/dialogflow";
import fs from "fs";
import { GoogleAuth } from "google-auth-library";
import path from "path";
import { v4 as uuid } from "uuid";
import AppError from "#exceptions/app.error.js";

const keyPath = path.join(process.cwd(), "src", "config", "keys", process.env.KEY_FILENAME || "");
const projectId = process.env.PROJECT_ID;

// Lazily created so a missing key file surfaces as a handled request error
// instead of an unhandled rejection from the gRPC client that crashes the server.
let sessionClient = null;

const getSessionClient = () => {
  if (sessionClient) return sessionClient;

  if (!process.env.KEY_FILENAME || !fs.existsSync(keyPath)) {
    throw new AppError(
      "Chatbot is not configured: missing Dialogflow service account key.",
      503
    );
  }
  if (!projectId) {
    throw new AppError("Chatbot is not configured: missing PROJECT_ID.", 503);
  }

  const auth = new GoogleAuth({
    keyFile: keyPath,
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });

  sessionClient = new dialogflow.SessionsClient({ auth, projectId });
  return sessionClient;
};

export async function sendMessageToDialogflow(message, sessionId = uuid(), languageCode) {
  const client = getSessionClient();
  const sessionPath = client.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: languageCode, // "en-US" or "vi"
      },
    },
  };

  const responses = await client.detectIntent(request);
  return responses[0].queryResult;
}
