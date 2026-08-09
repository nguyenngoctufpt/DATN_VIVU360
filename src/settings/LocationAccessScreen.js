import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';
import {
  getLocationPermissionStatus,
  openApplicationSettings,
  requestLocationPermissionAccess,
} from '../services/settingsService';
import { getSettingsText } from './constants';
import { SettingsLayout } from './components/SettingsLayout';

export function LocationAccessScreen({
  theme,
  language,
  settings,
  onBack,
  onUpdateSettings,
}) {
  const text = getSettingsText(language);
  const [permissionStatus, setPermissionStatus] = useState(settings.locationPermissionStatus);
  const [statusBanner, setStatusBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const showBanner = (type, message) => {
    setStatusBanner({ type, message });
    setTimeout(() => setStatusBanner(null), 2600);
  };

  const persistStatus = async (nextStatus) => {
    setPermissionStatus(nextStatus);
    const result = await onUpdateSettings({ locationPermissionStatus: nextStatus });
    showBanner(result?.syncError ? 'error' : 'success', result?.syncError ? text.partialSaveSuccess : text.saveSuccess);
  };

  const refreshStatus = async () => {
    setLoading(true);
    const currentStatus = await getLocationPermissionStatus();
    setLoading(false);
    if (currentStatus !== permissionStatus) {
      await persistStatus(currentStatus);
    }
  };

  useEffect(() => {
    refreshStatus().catch(() => undefined);
  }, []);

  const requestAccess = async () => {
    setLoading(true);
    const nextStatus = await requestLocationPermissionAccess();
    setLoading(false);
    await persistStatus(nextStatus);
  };

  const statusText = {
    granted: text.locationGranted,
    denied: text.locationDenied,
    blocked: text.locationBlocked,
    unknown: text.locationUnknown,
  }[permissionStatus] || text.locationUnknown;

  return (
    <SettingsLayout
      theme={theme}
      title={text.locationAccess}
      subtitle={text.locationAccessDescription}
      onBack={onBack}
      statusBanner={statusBanner}
      loading={loading}
    >
      <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.statusIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
          <Navigation size={20} color="#3b82f6" />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.statusTitle, { color: theme.textPrimary }]}>{statusText}</Text>
          <Text style={[styles.statusDescription, { color: theme.textSecondary }]}>
            {language === 'en'
              ? 'Location access helps Vivu360 suggest nearby places and keep map recommendations relevant.'
              : 'Quyền vị trí giúp Vivu360 gợi ý điểm đến gần bạn và giữ bản đồ phù hợp với hành trình.'}
          </Text>
        </View>
      </View>

      <Pressable style={[styles.actionButton, { backgroundColor: '#2563eb' }]} onPress={requestAccess}>
        <MapPin size={18} color="#fff" />
        <Text style={styles.primaryText}>{text.requestPermission}</Text>
      </Pressable>

      <Pressable style={[styles.secondaryButton, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={openApplicationSettings}>
        <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>{text.openSystemSettings}</Text>
      </Pressable>
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  statusDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '900',
  },
});
