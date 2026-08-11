import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Laptop2, Smartphone } from 'lucide-react-native';
import { markCurrentDevice } from '../services/settingsService';
import { getSettingsText } from './constants';
import { SettingsLayout } from './components/SettingsLayout';

export function LoginDevicesScreen({
  theme,
  language,
  settings,
  currentDeviceId,
  onBack,
  onUpdateSettings,
}) {
  const text = getSettingsText(language);
  const devices = markCurrentDevice(settings.loginDevices || [], currentDeviceId);
  const currentDevice = devices.find((item) => item.isCurrent);
  const otherDevices = devices.filter((item) => !item.isCurrent);

  const removeDevice = async (deviceId) => {
    await onUpdateSettings({
      loginDevices: (settings.loginDevices || []).filter((item) => item.deviceId !== deviceId),
    });
  };

  const renderDevice = (device, isCurrent) => (
    <View key={device.deviceId} style={[styles.deviceCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.deviceIcon, { backgroundColor: theme.searchBg }]}>
        {device.platform === 'android' || device.platform === 'ios'
          ? <Smartphone size={18} color="#3b82f6" />
          : <Laptop2 size={18} color="#3b82f6" />}
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[styles.deviceTitle, { color: theme.textPrimary }]}>{device.label}</Text>
        <Text style={[styles.deviceMeta, { color: theme.textSecondary }]}>
          {new Date(device.lastActiveAt).toLocaleString(language === 'en' ? 'en-US' : 'vi-VN')}
        </Text>
      </View>
      {isCurrent ? (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>{text.currentDevice}</Text>
        </View>
      ) : (
        <Pressable style={[styles.removeButton, { backgroundColor: 'rgba(239,68,68,0.12)' }]} onPress={() => removeDevice(device.deviceId)}>
          <Text style={[styles.removeText, { color: '#ef4444' }]}>{text.removeDevice}</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <SettingsLayout
      theme={theme}
      title={text.loginDevices}
      subtitle={text.loginDevicesDescription}
      onBack={onBack}
    >
      {currentDevice ? (
        <View style={{ gap: 10 }}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{text.currentDevice}</Text>
          {renderDevice(currentDevice, true)}
        </View>
      ) : null}

      <View style={{ gap: 10 }}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{text.deviceHistory}</Text>
        {otherDevices.length ? otherDevices.map((item) => renderDevice(item, false)) : (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{text.noDevices}</Text>
        )}
      </View>
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  deviceCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  deviceMeta: {
    fontSize: 11.5,
  },
  currentBadge: {
    backgroundColor: 'rgba(16,185,129,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  currentBadgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '900',
  },
  removeButton: {
    minHeight: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
