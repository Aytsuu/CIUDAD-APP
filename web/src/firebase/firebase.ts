import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDqJ6txLQbQMjzWlK_b1VPxF1ucnkyY_NI",
  authDomain: "barangay-ec35f.firebaseapp.com",
  projectId: "barangay-ec35f",
  storageBucket: "barangay-ec35f.firebasestorage.app",
  messagingSenderId: "533036910135",
  appId: "1:533036910135:web:a9eba831514416478d21b2",
  measurementId: "G-JRY30KEG4J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export {app, messaging, onMessage};

export const generateToken = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey:
        "BNoy6_XqLegYmwYnGZRmJ24Te-VkOqxMaVPMCt8t-QCzrBot_Kk6OZWcrDmDqBVHTgfrBvcHvjVGfz_-LTpB5aY",
    });
    return token;
  }
};
