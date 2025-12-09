importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAzW96amBXdpEdwx4ncAkesKZxdJ_Yc8Ww",
  authDomain: "newtest-85b21.firebaseapp.com",
  projectId: "newtest-85b21",
  storageBucket: "newtest-85b21.firebasestorage.app",
  messagingSenderId: "659672434244",
  appId: "1:659672434244:web:08d60260cd750f25c5de11",
  measurementId: "G-8CQJ9C429J"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'Важная новость!';
  const notificationOptions = {
    body: payload.notification.body || 'У нас новости для вас',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'news-notification',
    requireInteraction: true,
    data: {
      url: payload.data?.url || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received.');
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
