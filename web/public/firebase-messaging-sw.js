importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCwsfs92IU3B3ffPvwqVNGtdfMUTRj4L1U",
  authDomain: "ciudad-app.firebaseapp.com",
  projectId: "ciudad-app",
  storageBucket: "ciudad-app.firebasestorage.app",
  messagingSenderId: "187309470053",
  appId: "1:187309470053:web:ce1d05026e3b8aff0bf18c",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
