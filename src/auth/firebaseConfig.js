import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD84HkZ8G_..." || "AIzaSyB...",
  authDomain: "vivu360-app.firebaseapp.com",
  projectId: "vivu360-app",
  storageBucket: "vivu360-app.appspot.com",
  messagingSenderId: "1056583920148",
  appId: "1:1056583920148:web:75d6978436573bdabf3747",
  measurementId: "G-BJVQM6FYQN"
};

const isNewApp = getApps().length === 0;
const app = isNewApp ? initializeApp(firebaseConfig) : getApp();

let auth;
if (isNewApp) {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (e) {
    auth = getAuth(app);
  }
} else {
  try {
    auth = getAuth(app);
  } catch (e) {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
}

export { auth };
export default app;
