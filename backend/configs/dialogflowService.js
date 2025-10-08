import dialogflow from '@google-cloud/dialogflow';
import { v4 as uuid } from 'uuid';


const projectId = process.env.PROJECT_ID;
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: process.env.KEY_FILENAME,
});

export async function sendMessageToDialogflow(message, sessionId = uuid(), languageCode) {
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: languageCode, // 'en-US' or 'vi'
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  return responses[0].queryResult;
}
