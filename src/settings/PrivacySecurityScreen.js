import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPin, ShieldCheck } from 'lucide-react-native';
import {
  PROFILE_VISIBILITY_OPTIONS,
  findLocalizedValue,
  getLocalizedLabel,
  getSettingsText,
} from './constants';
import { SettingsChoiceModal } from './components/SettingsChoiceModal';
import { SettingsLayout } from './components/SettingsLayout';
import { SettingSelect } from './components/SettingSelect';
import { SettingSwitch } from './components/SettingSwitch';

export function PrivacySecurityScreen({
  theme,
  language,
  settings,
  onBack,
  onUpdateSettings,
}) {
  const text = getSettingsText(language);
  const [draft, setDraft] = useState({
    profileVisibility: settings.profileVisibility,
    locationSharing: settings.locationSharing,
  });
  const [statusBanner, setStatusBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [choiceVisible, setChoiceVisible] = useState(false);

  const visibilityOptions = useMemo(
    () => PROFILE_VISIBILITY_OPTIONS.map((option) => ({ ...option, label: getLocalizedLabel(option, language) })),
    [language]
  );

  const showBanner = (type, message) => {
    setStatusBanner({ type, message });
    setTimeout(() => setStatusBanner(null), 2600);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await onUpdateSettings(draft);
    showBanner(result?.syncError ? 'error' : 'success', result?.syncError ? text.partialSaveSuccess : text.saveSuccess);
    setSaving(false);
  };

  return (
    <SettingsLayout
      theme={theme}
      title={text.profilePrivacy}
      subtitle={text.profileVisibilityHint}
      onBack={onBack}
      statusBanner={statusBanner}
      footer={(
        <Pressable style={[styles.submitButton, { backgroundColor: '#2563eb', opacity: saving ? 0.7 : 1 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.submitText}>{saving ? text.saving : text.save}</Text>
        </Pressable>
      )}
    >
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <SettingSelect
          theme={theme}
          icon={ShieldCheck}
          title={text.profilePrivacy}
          description={text.profilePrivacyDescription}
          value={findLocalizedValue(visibilityOptions, draft.profileVisibility, language)}
          onPress={() => setChoiceVisible(true)}
        />
        <SettingSwitch
          theme={theme}
          icon={MapPin}
          title={text.locationSharing}
          description={text.locationSharingDescription}
          value={draft.locationSharing}
          onValueChange={(value) => setDraft((prev) => ({ ...prev, locationSharing: value }))}
          noBorder
        />
      </View>

      <SettingsChoiceModal
        theme={theme}
        visible={choiceVisible}
        title={text.selectOption}
        options={visibilityOptions}
        value={draft.profileVisibility}
        onSelect={(value) => {
          setDraft((prev) => ({ ...prev, profileVisibility: value }));
          setChoiceVisible(false);
        }}
        onClose={() => setChoiceVisible(false)}
      />
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
});
