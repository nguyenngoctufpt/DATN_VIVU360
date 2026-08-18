import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Tự động phát hiện địa chỉ IP của máy chủ host linh hoạt:
 * 1. EXPO_PUBLIC_HOST_IP nếu có
 * 2. Web: Lấy trực tiếp từ window.location.hostname
 * 3. Expo Go (Máy thật / Máy ảo): Tự động trích xuất IP từ hostUri
 * 4. Fallback IP LAN thực tế: 10.24.11.50 / 10.0.2.2 / localhost
 */
export const getHostIp = () => {
  if (process.env.EXPO_PUBLIC_HOST_IP) {
    return process.env.EXPO_PUBLIC_HOST_IP;
  }

  // 1. Web browser
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }

  // 2. Trích xuất IP / Hostname trực tiếp từ Expo Go Uri (Hỗ trợ cả IP LAN và Tunnel)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.linkingUri ||
    Constants.experienceUrl;

  if (hostUri) {
    const cleanedHost = String(hostUri).replace(/^https?:\/\//, '').split(':')[0].split('/')[0];
    if (cleanedHost && cleanedHost !== 'localhost' && cleanedHost !== '127.0.0.1') {
      return cleanedHost;
    }
  }

  // 3. Fallback theo nền tảng (Máy ảo Android vs Máy thật/Web)
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
};
