import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Appearance, Linking, PermissionsAndroid, Platform } from 'react-native';
import { loadAppData, saveAppData } from './appDataService';
import api from './api';

export const SETTINGS_NAMESPACE = 'settings';
const FEEDBACK_NAMESPACE = 'feedback';
const DEVICE_PREFS_KEY = 'vivu360:device-preferences';
const INSTALLATION_ID_KEY = 'vivu360:installation-id';

const THEME_OPTIONS = ['light', 'dark', 'system'];
const LANGUAGE_OPTIONS = ['vi', 'en'];
const DISTANCE_OPTIONS = ['km', 'mi'];
const VISIBILITY_OPTIONS = ['public', 'friends', 'private'];
const TRAVEL_INTEREST_OPTIONS = [
  'nature',
  'food',
  'culture',
  'history',
  'photography',
  'shopping',
  'entertainment',
  'beach',
  'adventure',
  'family',
];
const AI_PACE_OPTIONS = ['relaxed', 'normal', 'intensive'];
const LOCATION_PERMISSION_OPTIONS = ['unknown', 'granted', 'denied', 'blocked'];

export const DEFAULT_USER_SETTINGS = {
  notificationsEnabled: true,
  messageNotifications: true,
  groupNotifications: true,
  itineraryReminders: true,
  friendRequestNotifications: true,
  theme: 'system',
  language: 'vi',
  distanceUnit: 'km',
  locationSharing: true,
  locationPermissionStatus: 'unknown',
  travelPreferences: ['food', 'culture'],
  aiRecommendations: {
    enabled: true,
    pace: 'normal',
    keepBudget: true,
    hiddenGems: false,
  },
  profileVisibility: 'friends',
  blockedUsers: [],
  loginDevices: [],
};

function uniqueStrings(value) {
  return [...new Set(
    (Array.isArray(value) ? value : [])
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  )];
}

function sortByDateDesc(items, key) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left?.[key] || 0).getTime();
    const rightTime = new Date(right?.[key] || 0).getTime();
    return rightTime - leftTime;
  });
}

function normalizeBlockedUsers(value) {
  if (!Array.isArray(value)) return [];

  const deduped = new Map();
  value.forEach((item) => {
    const firebaseUid = String(item?.firebaseUid || '').trim();
    if (!firebaseUid) return;

    deduped.set(firebaseUid, {
      firebaseUid,
      name: String(item?.name || 'Thành viên Vivu360').trim(),
      email: String(item?.email || '').trim(),
      avatar: String(item?.avatar || '').trim(),
      blockedAt: item?.blockedAt || new Date().toISOString(),
    });
  });

  return sortByDateDesc(Array.from(deduped.values()), 'blockedAt');
}

function normalizeLoginDevices(value) {
  if (!Array.isArray(value)) return [];

  const deduped = new Map();
  value.forEach((item) => {
    const deviceId = String(item?.deviceId || '').trim();
    if (!deviceId) return;

    deduped.set(deviceId, {
      deviceId,
      label: String(item?.label || 'Thiết bị Vivu360').trim(),
      platform: String(item?.platform || 'unknown').trim(),
      appVersion: String(item?.appVersion || '').trim(),
      lastActiveAt: item?.lastActiveAt || new Date().toISOString(),
    });
  });

  return sortByDateDesc(Array.from(deduped.values()), 'lastActiveAt').slice(0, 12);
}

export function sanitizeUserSettings(value) {
  const raw = value && typeof value === 'object' ? value : {};
  const rawAI = raw.aiRecommendations && typeof raw.aiRecommendations === 'object'
    ? raw.aiRecommendations
    : {};

  return {
    notificationsEnabled: raw.notificationsEnabled !== false,
    messageNotifications: raw.messageNotifications !== false,
    groupNotifications: raw.groupNotifications !== false,
    itineraryReminders: raw.itineraryReminders !== false,
    friendRequestNotifications: raw.friendRequestNotifications !== false,
    theme: THEME_OPTIONS.includes(raw.theme) ? raw.theme : DEFAULT_USER_SETTINGS.theme,
    language: LANGUAGE_OPTIONS.includes(raw.language) ? raw.language : DEFAULT_USER_SETTINGS.language,
    distanceUnit: DISTANCE_OPTIONS.includes(raw.distanceUnit) ? raw.distanceUnit : DEFAULT_USER_SETTINGS.distanceUnit,
    locationSharing: raw.locationSharing !== false,
    locationPermissionStatus: LOCATION_PERMISSION_OPTIONS.includes(raw.locationPermissionStatus)
      ? raw.locationPermissionStatus
      : DEFAULT_USER_SETTINGS.locationPermissionStatus,
    travelPreferences: (() => {
      const values = uniqueStrings(raw.travelPreferences);
      const filtered = values.filter((item) => TRAVEL_INTEREST_OPTIONS.includes(item));
      return filtered.length ? filtered : [...DEFAULT_USER_SETTINGS.travelPreferences];
    })(),
    aiRecommendations: {
      enabled: rawAI.enabled !== false,
      pace: AI_PACE_OPTIONS.includes(rawAI.pace) ? rawAI.pace : DEFAULT_USER_SETTINGS.aiRecommendations.pace,
      keepBudget: rawAI.keepBudget !== false,
      hiddenGems: Boolean(rawAI.hiddenGems),
    },
    profileVisibility: VISIBILITY_OPTIONS.includes(raw.profileVisibility)
      ? raw.profileVisibility
      : DEFAULT_USER_SETTINGS.profileVisibility,
    blockedUsers: normalizeBlockedUsers(raw.blockedUsers),
    loginDevices: normalizeLoginDevices(raw.loginDevices),
  };
}

export function mergeUserSettings(baseValue, patchValue) {
  const base = sanitizeUserSettings(baseValue);
  const patch = patchValue && typeof patchValue === 'object' ? patchValue : {};
  const next = {
    ...base,
    ...patch,
    aiRecommendations: {
      ...base.aiRecommendations,
      ...(patch.aiRecommendations && typeof patch.aiRecommendations === 'object'
        ? patch.aiRecommendations
        : {}),
    },
  };

  return sanitizeUserSettings(next);
}

export function getDevicePreferenceSubset(value) {
  const settings = sanitizeUserSettings(value);
  return {
    theme: settings.theme,
    language: settings.language,
    distanceUnit: settings.distanceUnit,
  };
}

export async function loadDevicePreferenceCache() {
  try {
    const raw = await AsyncStorage.getItem(DEVICE_PREFS_KEY);
    if (!raw) return getDevicePreferenceSubset(DEFAULT_USER_SETTINGS);
    return getDevicePreferenceSubset(JSON.parse(raw));
  } catch (_error) {
    return getDevicePreferenceSubset(DEFAULT_USER_SETTINGS);
  }
}

export async function persistDevicePreferenceCache(value) {
  try {
    await AsyncStorage.setItem(
      DEVICE_PREFS_KEY,
      JSON.stringify(getDevicePreferenceSubset(value))
    );
  } catch (_error) {
    // Ignore cache failures and keep settings usable in-memory.
  }
}

export async function loadUserSettings(ownerId) {
  const remote = await loadAppData(ownerId, SETTINGS_NAMESPACE);
  const normalized = sanitizeUserSettings(remote);
  await persistDevicePreferenceCache(normalized);
  return normalized;
}

export async function saveUserSettings(ownerId, settings) {
  const normalized = sanitizeUserSettings(settings);
  await saveAppData(ownerId, SETTINGS_NAMESPACE, normalized);
  await persistDevicePreferenceCache(normalized);
  return normalized;
}

export function resolveIsDarkMode(themeMode, systemColorScheme = Appearance.getColorScheme()) {
  if (themeMode === 'light') return false;
  if (themeMode === 'dark') return true;
  return (systemColorScheme || 'dark') === 'dark';
}

export async function getOrCreateInstallationId() {
  const existing = await AsyncStorage.getItem(INSTALLATION_ID_KEY);
  if (existing) return existing;

  const nextId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(INSTALLATION_ID_KEY, nextId);
  return nextId;
}

export async function buildCurrentDeviceSession() {
  const deviceId = await getOrCreateInstallationId();
  const version = Constants.expoConfig?.version || '1.0.0';
  const platformLabel = Platform.select({
    ios: 'iOS',
    android: 'Android',
    default: 'Device',
  });

  return {
    deviceId,
    label: `${platformLabel} • Vivu360 ${version}`,
    platform: Platform.OS,
    appVersion: version,
    lastActiveAt: new Date().toISOString(),
  };
}

export function registerCurrentDeviceSession(settingsValue, deviceSession) {
  const settings = sanitizeUserSettings(settingsValue);
  if (!deviceSession?.deviceId) return settings;

  const otherDevices = settings.loginDevices.filter(
    (item) => String(item.deviceId) !== String(deviceSession.deviceId)
  );

  return {
    ...settings,
    loginDevices: normalizeLoginDevices([deviceSession, ...otherDevices]),
  };
}

export function markCurrentDevice(loginDevices, currentDeviceId) {
  return normalizeLoginDevices(loginDevices).map((item) => ({
    ...item,
    isCurrent: String(item.deviceId) === String(currentDeviceId),
  }));
}

export async function getLocationPermissionStatus() {
  if (Platform.OS !== 'android') return 'unknown';

  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted ? 'granted' : 'denied';
  } catch (_error) {
    return 'unknown';
  }
}

export async function requestLocationPermissionAccess() {
  if (Platform.OS !== 'android') return 'unknown';

  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Quyền truy cập vị trí',
        message: 'Vivu360 cần vị trí để gợi ý điểm đến và tính khoảng cách chính xác.',
        buttonPositive: 'Cho phép',
        buttonNegative: 'Từ chối',
        buttonNeutral: 'Để sau',
      }
    );

    if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
    return 'denied';
  } catch (_error) {
    return 'unknown';
  }
}

export async function openApplicationSettings() {
  try {
    await Linking.openSettings();
    return true;
  } catch (_error) {
    return false;
  }
}

export async function loadFeedbackEntries(ownerId) {
  const raw = await loadAppData(ownerId, FEEDBACK_NAMESPACE);
  if (!raw || !Array.isArray(raw.entries)) return [];

  return sortByDateDesc(
    raw.entries.map((item) => ({
      id: String(item?.id || '').trim(),
      category: String(item?.category || 'general').trim(),
      message: String(item?.message || '').trim(),
      contact: String(item?.contact || '').trim(),
      createdAt: item?.createdAt || new Date().toISOString(),
    })).filter((item) => item.id && item.message),
    'createdAt'
  );
}

export async function addFeedbackEntry(ownerId, entry) {
  const current = await loadFeedbackEntries(ownerId);
  const nextEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category: String(entry?.category || 'general').trim(),
    message: String(entry?.message || '').trim(),
    contact: String(entry?.contact || '').trim(),
    createdAt: new Date().toISOString(),
  };
  const nextEntries = [nextEntry, ...current].slice(0, 20);
  // Persist to app-data store (user-scoped cache)
  await saveAppData(ownerId, FEEDBACK_NAMESPACE, { entries: nextEntries });

  // Also attempt to send to central feedback API (best-effort)
  try {
    await api.post('/feedback', {
      ownerId,
      category: nextEntry.category,
      message: nextEntry.message,
      contact: nextEntry.contact,
    });
  } catch (error) {
    // ignore network errors; app-data retains the entry locally
  }

  return nextEntries;
}
