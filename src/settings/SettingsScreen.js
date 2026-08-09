import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import {
  Bell,
  Bot,
  Globe,
  Info,
  Languages,
  Lock,
  LogOut,
  MapPin,
  MonitorSmartphone,
  ShieldCheck,
  UserCircle2,
  Users,
} from 'lucide-react-native';
import { registerForPushNotificationsAsync } from '../auth/notificationHelper';
import {
  DISTANCE_UNIT_OPTIONS,
  LANGUAGE_OPTIONS,
  PROFILE_VISIBILITY_OPTIONS,
  THEME_MODE_OPTIONS,
  findLocalizedValue,
  getLocalizedLabel,
  getSettingsText,
} from './constants';
import { SettingsChoiceModal } from './components/SettingsChoiceModal';
import { SettingsLayout } from './components/SettingsLayout';
import { SettingSection } from './components/SettingSection';
import { SettingSelect } from './components/SettingSelect';
import { SettingSwitch } from './components/SettingSwitch';

function normalizeOptions(options, language) {
  return options.map((option) => ({
    ...option,
    label: getLocalizedLabel(option, language),
  }));
}

function SummaryPill({ label, value, theme }) {
  return (
    <View style={[styles.summaryPill, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
      <Text style={[styles.summaryPillLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.summaryPillValue, { color: theme.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function SummaryStat({ label, value, theme }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={[styles.summaryStatLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.summaryStatValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

export function SettingsScreen({
  theme,
  language,
  settings,
  onBack,
  onNavigate,
  onUpdateSettings,
  onLogout,
}) {
  const text = getSettingsText(language);
  const [statusBanner, setStatusBanner] = useState(null);
  const [busyKey, setBusyKey] = useState('');
  const [choiceModal, setChoiceModal] = useState({ visible: false, key: '', options: [] });

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const themeOptions = useMemo(() => normalizeOptions(THEME_MODE_OPTIONS, language), [language]);
  const languageOptions = useMemo(() => normalizeOptions(LANGUAGE_OPTIONS, language), [language]);
  const distanceOptions = useMemo(() => normalizeOptions(DISTANCE_UNIT_OPTIONS, language), [language]);
  const visibilityOptions = useMemo(() => normalizeOptions(PROFILE_VISIBILITY_OPTIONS, language), [language]);

  const currentThemeLabel = findLocalizedValue(themeOptions, settings.theme, language);
  const currentLanguageLabel = findLocalizedValue(languageOptions, settings.language, language);
  const currentDistanceLabel = findLocalizedValue(distanceOptions, settings.distanceUnit, language);
  const currentPrivacyLabel = findLocalizedValue(visibilityOptions, settings.profileVisibility, language);
  const notificationStatus = settings.notificationsEnabled ? text.enabledValue : text.disabledValue;

  const showBanner = (type, message) => {
    setStatusBanner({ type, message });
    setTimeout(() => setStatusBanner(null), 2600);
  };

  const persistSettings = async (patch, successMessage = text.saveSuccess) => {
    setBusyKey(Object.keys(patch)[0] || 'settings');
    const result = await onUpdateSettings(patch);
    if (result?.syncError) {
      showBanner('error', text.partialSaveSuccess);
    } else {
      showBanner('success', successMessage);
    }
    setBusyKey('');
  };

  const handleNotificationsEnabled = async (value) => {
    if (value) {
      await registerForPushNotificationsAsync();
    }

    const shouldRestoreChildren = value
      && !settings.messageNotifications
      && !settings.groupNotifications
      && !settings.itineraryReminders
      && !settings.friendRequestNotifications;

    await persistSettings({
      notificationsEnabled: value,
      ...(value
        ? (shouldRestoreChildren
          ? {
              messageNotifications: true,
              groupNotifications: true,
              itineraryReminders: true,
              friendRequestNotifications: true,
            }
          : {})
        : {
            messageNotifications: false,
            groupNotifications: false,
            itineraryReminders: false,
            friendRequestNotifications: false,
          }),
    });
  };

  const openChoiceModal = (key, options) => {
    setChoiceModal({ visible: true, key, options });
  };

  const handleChoiceSelect = async (value) => {
    const key = choiceModal.key;
    setChoiceModal({ visible: false, key: '', options: [] });
    if (!key || settings[key] === value) return;
    await persistSettings({ [key]: value });
  };

  return (
    <SettingsLayout
      theme={theme}
      title={text.settingsTitle}
      subtitle={text.settingsSubtitle}
      onBack={onBack}
      statusBanner={statusBanner}
      footer={(
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: pressed ? '#b91c1c' : '#dc2626' },
          ]}
          onPress={() => {
            Alert.alert(
              text.confirmLogoutTitle,
              text.confirmLogoutMessage,
              [
                { text: text.cancel, style: 'cancel' },
                { text: text.logout, style: 'destructive', onPress: onLogout },
              ]
            );
          }}
        >
          <LogOut size={18} color="#fff" />
          <Text style={styles.logoutText}>{text.logout}</Text>
        </Pressable>
      )}
    >
      <View style={[styles.overviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.overviewTop}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.overviewTitle, { color: theme.textPrimary }]}>{text.overviewTitle}</Text>
            <Text style={[styles.overviewSubtitle, { color: theme.textSecondary }]}>{text.overviewSubtitle}</Text>
          </View>
          <View style={[styles.versionBadge, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
            <Text style={[styles.versionText, { color: theme.textPrimary }]}>{`${text.versionPrefix} ${appVersion}`}</Text>
          </View>
        </View>

        <View style={styles.summaryPills}>
          <SummaryPill label={text.summaryTheme} value={currentThemeLabel} theme={theme} />
          <SummaryPill label={text.summaryLanguage} value={currentLanguageLabel} theme={theme} />
          <SummaryPill label={text.summaryDistance} value={currentDistanceLabel} theme={theme} />
        </View>

        <View style={[styles.summaryStatsRow, { borderTopColor: theme.border }]}>
          <SummaryStat label={text.summaryNotifications} value={notificationStatus} theme={theme} />
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <SummaryStat label={text.summaryPrivacy} value={currentPrivacyLabel} theme={theme} />
        </View>
      </View>

      <SettingSection theme={theme} title={text.account} description={text.accountDescription}>
        <SettingSelect
          theme={theme}
          icon={UserCircle2}
          title={text.personalInfo}
          description={text.personalInfoDescription}
          onPress={() => onNavigate('editProfile')}
        />
        <SettingSelect
          theme={theme}
          icon={Lock}
          title={text.changePassword}
          description={text.changePasswordDescription}
          onPress={() => onNavigate('changePassword')}
          noBorder
        />
      </SettingSection>

      <SettingSection theme={theme} title={text.appearance} description={text.appearanceDescription}>
        <SettingSelect
          theme={theme}
          icon={MonitorSmartphone}
          title={text.theme}
          description={text.themeDescription}
          value={currentThemeLabel}
          onPress={() => openChoiceModal('theme', themeOptions)}
        />
        <SettingSelect
          theme={theme}
          icon={Languages}
          title={text.language}
          description={text.languageDescription}
          value={currentLanguageLabel}
          onPress={() => openChoiceModal('language', languageOptions)}
          noBorder
        />
      </SettingSection>

      <SettingSection theme={theme} title={text.notifications} description={text.notificationsDescription}>
        <SettingSwitch
          theme={theme}
          icon={Bell}
          title={text.notificationsEnabled}
          description={text.notificationsEnabledDescription}
          value={settings.notificationsEnabled}
          onValueChange={handleNotificationsEnabled}
          loading={busyKey === 'notificationsEnabled'}
        />
        <SettingSwitch
          theme={theme}
          icon={Bell}
          title={text.messageNotifications}
          description={text.messageNotificationsDescription}
          value={settings.messageNotifications}
          disabled={!settings.notificationsEnabled}
          onValueChange={(value) => persistSettings({ messageNotifications: value })}
          loading={busyKey === 'messageNotifications'}
        />
        <SettingSwitch
          theme={theme}
          icon={Users}
          title={text.groupNotifications}
          description={text.groupNotificationsDescription}
          value={settings.groupNotifications}
          disabled={!settings.notificationsEnabled}
          onValueChange={(value) => persistSettings({ groupNotifications: value })}
          loading={busyKey === 'groupNotifications'}
        />
        <SettingSwitch
          theme={theme}
          icon={MapPin}
          title={text.itineraryReminders}
          description={text.itineraryRemindersDescription}
          value={settings.itineraryReminders}
          disabled={!settings.notificationsEnabled}
          onValueChange={(value) => persistSettings({ itineraryReminders: value })}
          loading={busyKey === 'itineraryReminders'}
        />
        <SettingSwitch
          theme={theme}
          icon={Users}
          title={text.friendRequestNotifications}
          description={text.friendRequestNotificationsDescription}
          value={settings.friendRequestNotifications}
          disabled={!settings.notificationsEnabled}
          onValueChange={(value) => persistSettings({ friendRequestNotifications: value })}
          loading={busyKey === 'friendRequestNotifications'}
          noBorder
        />
      </SettingSection>

      <SettingSection theme={theme} title={text.travel} description={text.travelDescription}>
        <SettingSelect
          theme={theme}
          icon={MapPin}
          title={text.locationAccess}
          description={text.locationAccessDescription}
          onPress={() => onNavigate('locationAccess')}
        />
        <SettingSelect
          theme={theme}
          icon={Globe}
          title={text.distanceUnit}
          description={text.distanceUnitDescription}
          value={currentDistanceLabel}
          onPress={() => openChoiceModal('distanceUnit', distanceOptions)}
        />
        <SettingSelect
          theme={theme}
          icon={Users}
          title={text.travelPreferences}
          description={text.travelPreferencesDescription}
          onPress={() => onNavigate('travelPreferences')}
        />
        <SettingSelect
          theme={theme}
          icon={Bot}
          title={text.aiSuggestions}
          description={text.aiSuggestionsDescription}
          onPress={() => onNavigate('aiRecommendationSettings')}
          noBorder
        />
      </SettingSection>

      <SettingSection theme={theme} title={text.privacySecurity} description={text.privacySecurityDescription}>
        <SettingSelect
          theme={theme}
          icon={ShieldCheck}
          title={text.profilePrivacy}
          description={text.profilePrivacyDescription}
          value={currentPrivacyLabel}
          onPress={() => onNavigate('privacySecurity')}
        />
        <SettingSwitch
          theme={theme}
          icon={MapPin}
          title={text.locationSharing}
          description={text.locationSharingDescription}
          value={settings.locationSharing}
          onValueChange={(value) => persistSettings({ locationSharing: value })}
          loading={busyKey === 'locationSharing'}
        />
        <SettingSelect
          theme={theme}
          icon={Users}
          title={text.blockedUsers}
          description={text.blockedUsersDescription}
          value={settings.blockedUsers.length ? String(settings.blockedUsers.length) : ''}
          onPress={() => onNavigate('blockedUsers')}
        />
        <SettingSelect
          theme={theme}
          icon={MonitorSmartphone}
          title={text.loginDevices}
          description={text.loginDevicesDescription}
          value={settings.loginDevices.length ? String(settings.loginDevices.length) : ''}
          onPress={() => onNavigate('loginDevices')}
          noBorder
        />
      </SettingSection>

      <SettingSection theme={theme} title={text.support} description={text.supportDescription}>
        <SettingSelect
          theme={theme}
          icon={Info}
          title={text.helpCenter}
          description={text.helpCenterDescription}
          onPress={() => onNavigate('helpCenter')}
        />
        <SettingSelect
          theme={theme}
          icon={Info}
          title={text.feedback}
          description={text.feedbackDescription}
          onPress={() => onNavigate('feedback')}
        />
        <SettingSelect
          theme={theme}
          icon={Info}
          title={text.privacyPolicy}
          onPress={() => onNavigate('privacyPolicy')}
        />
        <SettingSelect
          theme={theme}
          icon={Info}
          title={text.termsOfUse}
          onPress={() => onNavigate('termsOfUse')}
        />
        <SettingSelect
          theme={theme}
          icon={Info}
          title={text.about}
          onPress={() => onNavigate('aboutVivu360')}
        />
        <SettingSelect
          theme={theme}
          icon={Info}
          title={text.appVersion}
          value={`${text.versionPrefix} ${appVersion}`}
          showChevron={false}
          noBorder
        />
      </SettingSection>

      <SettingsChoiceModal
        theme={theme}
        visible={choiceModal.visible}
        title={text.selectOption}
        options={choiceModal.options}
        value={settings[choiceModal.key]}
        onSelect={handleChoiceSelect}
        onClose={() => setChoiceModal({ visible: false, key: '', options: [] })}
      />
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  overviewCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  overviewTop: {
    gap: 12,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  overviewSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  versionBadge: {
    alignSelf: 'flex-start',
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  summaryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryPill: {
    minWidth: '30%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  summaryPillLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryPillValue: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  summaryStatsRow: {
    borderTopWidth: 1,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  summaryStat: {
    flex: 1,
    gap: 6,
  },
  summaryStatLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryStatValue: {
    fontSize: 13,
    fontWeight: '900',
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  logoutButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
});
