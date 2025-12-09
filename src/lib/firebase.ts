import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAzW96amBXdpEdwx4ncAkesKZxdJ_Yc8Ww",
  authDomain: "newtest-85b21.firebaseapp.com",
  projectId: "newtest-85b21",
  storageBucket: "newtest-85b21.firebasestorage.app",
  messagingSenderId: "659672434244",
  appId: "1:659672434244:web:08d60260cd750f25c5de11",
  measurementId: "G-8CQJ9C429J"
};

const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}

export { messaging };

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      throw new Error('Firebase Messaging is not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);

      const token = await getToken(messaging, {
        vapidKey: 'BPVifRAtHQ3KQYNu-dHwJYWTlSHcEqQsqfbQunLA8AfpXQ4BRQQu2jADR112XOtoKZj4BE7Oo7mm8jLpH0hRXI8',
        serviceWorkerRegistration: registration
      });

      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      resolve(payload);
    });
  });
