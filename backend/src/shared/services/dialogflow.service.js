import dialogflow from "@google-cloud/dialogflow";
import { GoogleAuth } from "google-auth-library";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auth = new GoogleAuth({
  keyFile: path.join(__dirname, "src", "config", "keys", process.env.KEY_FILENAME),
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});

const sessionClient = new dialogflow.SessionsClient({
  auth: auth,
  projectId: process.env.PROJECT_ID,
});

export async function sendMessageToDialogflow(message, sessionId = uuid(), languageCode) {
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: languageCode, // "en-US" or "vi"
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  return responses[0].queryResult;
}
