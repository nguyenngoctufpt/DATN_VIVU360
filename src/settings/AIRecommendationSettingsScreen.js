import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bot, Sparkles, Wallet } from 'lucide-react-native';
import { AI_PACE_OPTIONS, findLocalizedValue, getLocalizedLabel, getSettingsText } from './constants';
import { SettingsLayout } from './components/SettingsLayout';
import { SettingSelect } from './components/SettingSelect';
import { SettingSwitch } from './components/SettingSwitch';
import { SettingsChoiceModal } from './components/SettingsChoiceModal';

export function AIRecommendationSettingsScreen({
  theme,
  language,
  settings,
  onBack,
  onUpdateSettings,
}) {
  const text = getSettingsText(language);
  const [draft, setDraft] = useState(settings.aiRecommendations);
  const [saving, setSaving] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);
  const [choiceVisible, setChoiceVisible] = useState(false);

  const paceOptions = useMemo(
    () => AI_PACE_OPTIONS.map((option) => ({ ...option, label: getLocalizedLabel(option, language) })),
    [language]
  );

  const showBanner = (type, message) => {
    setStatusBanner({ type, message });
    setTimeout(() => setStatusBanner(null), 2600);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await onUpdateSettings({ aiRecommendations: draft });
    showBanner(
      result?.syncError ? 'error' : 'success',
      result?.syncError ? text.partialSaveSuccess : text.saveSuccess
    );
    setSaving(false);
  };

  return (
    <SettingsLayout
      theme={theme}
      title={text.aiSuggestions}
      subtitle={text.aiSuggestionsDescription}
      onBack={onBack}
      statusBanner={statusBanner}
      footer={(
        <Pressable
          style={[styles.submitButton, { backgroundColor: '#2563eb', opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.submitText}>{saving ? text.saving : text.save}</Text>
        </Pressable>
      )}
    >
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <SettingSwitch
          theme={theme}
          icon={Bot}
          title={language === 'en' ? 'Apply AI defaults' : 'Áp dụng mặc định AI'}
          description={language === 'en' ? 'Use these preferences whenever a new itinerary is generated.' : 'Dùng các tùy chọn này mỗi khi tạo lịch trình AI mới.'}
          value={draft.enabled}
          onValueChange={(value) => setDraft((prev) => ({ ...prev, enabled: value }))}
        />
        <SettingSelect
          theme={theme}
          icon={Sparkles}
          title={language === 'en' ? 'Preferred pace' : 'Nhịp độ ưu tiên'}
          description={language === 'en' ? 'Default travel pace used by the AI planner.' : 'Nhịp độ chuyến đi mặc định mà AI ưu tiên sử dụng.'}
          value={findLocalizedValue(paceOptions, draft.pace, language)}
          onPress={() => setChoiceVisible(true)}
        />
        <SettingSwitch
          theme={theme}
          icon={Wallet}
          title={language === 'en' ? 'Respect budget first' : 'Ưu tiên bám ngân sách'}
          description={language === 'en' ? 'Keep activity costs closer to the total budget you set.' : 'Giữ chi phí hoạt động gần hơn với tổng ngân sách bạn nhập.'}
          value={draft.keepBudget}
          onValueChange={(value) => setDraft((prev) => ({ ...prev, keepBudget: value }))}
        />
        <SettingSwitch
          theme={theme}
          icon={Sparkles}
          title={language === 'en' ? 'Suggest hidden gems' : 'Ưu tiên điểm độc đáo'}
          description={language === 'en' ? 'Allow the planner to include less crowded or niche places.' : 'Cho phép AI đề xuất thêm các điểm ít đông hoặc mang tính khám phá.'}
          value={draft.hiddenGems}
          onValueChange={(value) => setDraft((prev) => ({ ...prev, hiddenGems: value }))}
          noBorder
        />
      </View>

      {!draft.enabled ? (
        <View style={[styles.hintCard, { backgroundColor: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.2)' }]}>
          <Text style={styles.hintText}>{text.aiDisabledHint}</Text>
        </View>
      ) : null}

      <SettingsChoiceModal
        theme={theme}
        visible={choiceVisible}
        title={text.selectOption}
        options={paceOptions}
        value={draft.pace}
        onSelect={(value) => {
          setDraft((prev) => ({ ...prev, pace: value }));
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
  hintCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  hintText: {
    color: '#3b82f6',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
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
