import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Đăng ký kênh thông báo cho Android và lấy token thông báo đẩy
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Người dùng từ chối cấp quyền thông báo.');
    return null;
  }

  try {
    const projectId = 
      Constants.expoConfig?.extra?.eas?.projectId ?? 
      Constants.easConfig?.projectId ?? 
      Constants.expoConfig?.projectId;

    if (projectId && projectId !== 'vivu360-project-id') {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    }
  } catch (error) {
    // Gracefully handle dev environment push token initialization
  }

  return token;
}

// Hàm kích hoạt một thông báo cục bộ ngay lập tức (Local Notification)
export async function sendLocalNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // trigger = null nghĩa là gửi ngay lập tức
    });
  } catch (error) {
    console.warn('Lỗi khi gửi thông báo cục bộ:', error);
  }
}
