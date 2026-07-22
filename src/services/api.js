import axios from "axios";
import Constants from "expo-constants";

// Lấy IP từ Expo host (tự động khi chạy qua Expo Go)
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Thử lấy host từ các phiên bản Expo khác nhau
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost') {
      return `http://${ip}:3000/api`;
    }
  }

  // Fallback: IP máy tính trong mạng LAN
  return 'http://192.168.100.101:3000/api';
};

const apiBaseUrl = getApiBaseUrl();

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 8000, // 8 giây - đủ thời gian kết nối qua LAN
});

// Log URL khi khởi động để debug
console.log('[API] Base URL:', apiBaseUrl);

export default api;
