import dialogflow from "@google-cloud/dialogflow";
import { GoogleAuth } from "google-auth-library";
import path from "path";
import { v4 as uuid } from "uuid";

const keyPath = path.join(process.cwd(), "src", "config", "keys", process.env.KEY_FILENAME);
const projectId = process.env.PROJECT_ID;

const auth = new GoogleAuth({
  keyFile: keyPath,
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});

const sessionClient = new dialogflow.SessionsClient({
  auth: auth,
  projectId: projectId,
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
