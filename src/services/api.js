import axios from "axios";
import { getHostIp } from "../utils/hostIp";

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const host = getHostIp();
  return `http://${host}:3000/api`;
};

const apiBaseUrl = getApiBaseUrl();

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

console.log('[API] Base URL:', apiBaseUrl);

// Tự động thử lại các IP thay thế (IP LAN / 10.0.2.2 / localhost) nếu gặp Network Error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || config._retry || error.message !== 'Network Error') {
      return Promise.reject(error);
    }

    config._retry = true;
    const currentHost = getHostIp();
    const fallbacks = [
      `http://${currentHost}:3000/api`,
      'http://10.0.2.2:3000/api',
      'http://localhost:3000/api',
      'http://127.0.0.1:3000/api',
    ];
    
    for (const altUrl of fallbacks) {
      if (altUrl !== apiBaseUrl) {
        try {
          const originalPath = config.url.replace(config.baseURL || '', '');
          config.baseURL = altUrl;
          config.url = originalPath;
          return await axios(config);
        } catch (_) {}
      }
    }
    return Promise.reject(error);
  }
);

export default api;
