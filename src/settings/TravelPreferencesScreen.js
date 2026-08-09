import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getSettingsText, TRAVEL_PREFERENCE_OPTIONS } from './constants';
import { SettingsLayout } from './components/SettingsLayout';
import { SettingsChipGroup } from './components/SettingsChipGroup';

export function TravelPreferencesScreen({
  theme,
  language,
  settings,
  onBack,
  onUpdateSettings,
}) {
  const text = getSettingsText(language);
  const [selectedValues, setSelectedValues] = useState(settings.travelPreferences || []);
  const [statusBanner, setStatusBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  const showBanner = (type, message) => {
    setStatusBanner({ type, message });
    setTimeout(() => setStatusBanner(null), 2600);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await onUpdateSettings({ travelPreferences: selectedValues });
    showBanner(result?.syncError ? 'error' : 'success', result?.syncError ? text.partialSaveSuccess : text.saveSuccess);
    setSaving(false);
  };

  return (
    <SettingsLayout
      theme={theme}
      title={text.travelPreferences}
      subtitle={text.travelPreferencesDescription}
      onBack={onBack}
      statusBanner={statusBanner}
      footer={(
        <Pressable style={[styles.submitButton, { backgroundColor: '#2563eb', opacity: saving ? 0.7 : 1 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.submitText}>{saving ? text.saving : text.save}</Text>
        </Pressable>
      )}
    >
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {language === 'en'
            ? 'Choose the kinds of experiences you usually enjoy. These preferences are also used as defaults for AI itinerary suggestions.'
            : 'Chọn các kiểu trải nghiệm bạn thường yêu thích. Các lựa chọn này cũng được dùng làm mặc định cho AI gợi ý lịch trình.'}
        </Text>
        <SettingsChipGroup
          options={TRAVEL_PREFERENCE_OPTIONS}
          values={selectedValues}
          onChange={setSelectedValues}
          theme={theme}
          language={language}
        />
      </View>
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
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
