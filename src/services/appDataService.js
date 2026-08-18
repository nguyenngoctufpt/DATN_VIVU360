import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const safeSegment = value => encodeURIComponent(String(value));
const getStorageKey = (ownerId, namespace) => `@vivu360_appData_${ownerId}_${namespace}`;

export async function loadAppData(ownerId, namespace) {
  const storageKey = getStorageKey(ownerId, namespace);
  try {
    const response = await api.get(`/app-data/${safeSegment(ownerId)}/${safeSegment(namespace)}`);
    const remoteData = response.data.data;
    if (remoteData) {
      AsyncStorage.setItem(storageKey, JSON.stringify(remoteData)).catch(() => {});
    }
    return remoteData;
  } catch (error) {
    try {
      const localStr = await AsyncStorage.getItem(storageKey);
      if (localStr) {
        return JSON.parse(localStr);
      }
    } catch (_) {}
    return null;
  }
}

export async function saveAppData(ownerId, namespace, data) {
  const storageKey = getStorageKey(ownerId, namespace);
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
  } catch (_) {}

  try {
    const response = await api.put(`/app-data/${safeSegment(ownerId)}/${safeSegment(namespace)}`, { data });
    return response.data.data;
  } catch (error) {
    return data;
  }
}
