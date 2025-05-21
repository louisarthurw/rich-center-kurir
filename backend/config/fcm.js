import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./rich-center-kurir-firebase-adminsdk-fbsvc-eb06613223.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const sendFcmNotification = async (token, title, message) => {
  const payload = {
    token,
    notification: {
      title,
      body: message,
    },
  };

  try {
    await admin.messaging().send(payload);
    console.log("FCM sent to", token);
  } catch (err) {
    console.error("Error sending FCM:", err);
  }
};
