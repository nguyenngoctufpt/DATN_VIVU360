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

  return null;
}

export async function sendLocalNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        channelId: 'default',
      },
      trigger: null, // trigger = null nghĩa là gửi ngay lập tức
    });
  } catch (error) {
    console.warn('Lỗi khi gửi thông báo cục bộ:', error);
  }
}
