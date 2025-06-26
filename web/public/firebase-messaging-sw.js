importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDqJ6txLQbQMjzWlK_b1VPxF1ucnkyY_NI",
    authDomain: "barangay-ec35f.firebaseapp.com",
    projectId: "barangay-ec35f",
    storageBucket: "barangay-ec35f.firebasestorage.app",
    messagingSenderId: "533036910135",
    appId: "1:533036910135:web:a9eba831514416478d21b2",
  });

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
      '[firebase-messaging-sw.js] Received background message ',
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