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

// Khởi tạo Firebase App (Tránh lỗi duplicate app khi Hot Reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Firebase Auth (Tránh lỗi auth/already-initialized khi Hot Reload)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}

export { auth };
