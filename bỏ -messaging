importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCbX1EryC_4pmRpQ-F6sXUkSG6iLoUqFvM",
  authDomain: "pivo-crm.firebaseapp.com",
  projectId: "pivo-crm",
  storageBucket: "pivo-crm.firebasestorage.app",
  messagingSenderId: "626098511075",
  appId: "1:626098511075:web:26f91253d17c95f44d79d6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message:', payload);
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Pivo CRM', {
    body: body || '',
    icon: './icon-192.png',
    badge: './icon-192.png'
  });
});
