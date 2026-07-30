import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CẤU HÌNH FIREBASE CỦA BẠN
// Thay thế các giá trị bên dưới bằng cấu hình từ Firebase Console của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDEE8BBHDh2maB7lvdBlujh8Q8guO0rFo8",
  authDomain: "vivu360.firebaseapp.com",
  projectId: "vivu360",
  storageBucket: "vivu360.firebasestorage.app",
  messagingSenderId: "397515739438",
  appId: "1:397515739438:web:f45eb7a788e806a34e6abf",
  measurementId: "G-BJVQM6FYQN"
};

// Khởi tạo Firebase App & Auth với AsyncStorage persistence
const isNewApp = getApps().length === 0;
const app = isNewApp ? initializeApp(firebaseConfig) : getApp();

let auth;
if (isNewApp) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
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
