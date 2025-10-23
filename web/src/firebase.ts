import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCwsfs92IU3B3ffPvwqVNGtdfMUTRj4L1U",
  authDomain: "ciudad-app.firebaseapp.com",
  projectId: "ciudad-app",
  storageBucket: "ciudad-app.firebasestorage.app",
  messagingSenderId: "187309470053",
  appId: "1:187309470053:web:ce1d05026e3b8aff0bf18c",
  measurementId: "G-8EJWD60Q97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const generateToken = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey:
        "BBEhlVVzW6B2CJ1gX9EquRyMb2bUP5zYZXsl_d5sp7E_ugPXk_fpAiqo3DoCKNi6j0A7beAXUueDcfa1c_FT7lg",
    });
    return token;
  }
};

export const listenForMessages = (callback: (payload: any) => void) => {
  return onMessage(messaging, (payload) => {
    console.log("Message received in foreground: ", payload);
    callback(payload);
  });
};

export { app, messaging };

