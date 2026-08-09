import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { addFeedbackEntry, loadFeedbackEntries } from '../services/settingsService';
import { FEEDBACK_CATEGORY_OPTIONS, getLocalizedLabel, getSettingsText } from './constants';
import { SettingsChoiceModal } from './components/SettingsChoiceModal';
import { SettingsLayout } from './components/SettingsLayout';

export function FeedbackScreen({ theme, language, ownerId, onBack }) {
  const text = getSettingsText(language);
  const categoryOptions = useMemo(
    () => FEEDBACK_CATEGORY_OPTIONS.map((option) => ({ ...option, label: getLocalizedLabel(option, language) })),
    [language]
  );
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);
  const [choiceVisible, setChoiceVisible] = useState(false);

  const showBanner = (type, bannerMessage) => {
    setStatusBanner({ type, message: bannerMessage });
    setTimeout(() => setStatusBanner(null), 2600);
  };

  useEffect(() => {
    if (!ownerId) return undefined;
    let active = true;
    setLoading(true);
    loadFeedbackEntries(ownerId)
      .then((items) => active && setEntries(items))
      .catch(() => active && setEntries([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [ownerId]);

  const handleSubmit = async () => {
    if (!ownerId || !message.trim()) {
      showBanner('error', language === 'en' ? 'Please enter your feedback before sending.' : 'Vui lòng nhập nội dung phản hồi trước khi gửi.');
      return;
    }

    setSending(true);
    try {
      const nextEntries = await addFeedbackEntry(ownerId, {
        category,
        message,
        contact,
      });
      setEntries(nextEntries);
      setMessage('');
      setContact('');
      setCategory('general');
      showBanner('success', text.feedbackSent);
    } catch (error) {
      showBanner('error', error?.message || text.saveError);
    } finally {
      setSending(false);
    }
  };

  return (
    <SettingsLayout
      theme={theme}
      title={text.feedback}
      subtitle={text.feedbackDescription}
      onBack={onBack}
      statusBanner={statusBanner}
      footer={(
        <Pressable style={[styles.submitButton, { backgroundColor: '#2563eb', opacity: sending ? 0.7 : 1 }]} onPress={handleSubmit} disabled={sending}>
          <Text style={styles.submitText}>{sending ? text.saving : text.save}</Text>
        </Pressable>
      )}
    >
      <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Pressable style={[styles.selectButton, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]} onPress={() => setChoiceVisible(true)}>
          <Text style={[styles.selectLabel, { color: theme.textPrimary }]}>
            {categoryOptions.find((item) => item.value === category)?.label}
          </Text>
        </Pressable>

        <TextInput
          value={message}
          onChangeText={setMessage}
          multiline
          placeholder={text.feedbackPlaceholder}
          placeholderTextColor={theme.textMuted}
          style={[
            styles.messageInput,
            {
              color: theme.textPrimary,
              backgroundColor: theme.searchBg,
              borderColor: theme.searchBorder,
            },
          ]}
        />

        <TextInput
          value={contact}
          onChangeText={setContact}
          placeholder={text.feedbackContactPlaceholder}
          placeholderTextColor={theme.textMuted}
          style={[
            styles.contactInput,
            {
              color: theme.textPrimary,
              backgroundColor: theme.searchBg,
              borderColor: theme.searchBorder,
            },
          ]}
        />
      </View>

      <View style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.historyTitle, { color: theme.textPrimary }]}>{text.feedbackHistory}</Text>
        {loading ? (
          <ActivityIndicator color="#3b82f6" style={{ marginTop: 14 }} />
        ) : entries.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{text.feedbackEmpty}</Text>
        ) : (
          entries.map((entry, index) => (
            <View
              key={entry.id}
              style={[
                styles.historyRow,
                index !== entries.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
              ]}
            >
              <Text style={[styles.historyCategory, { color: '#3b82f6' }]}>
                {categoryOptions.find((item) => item.value === entry.category)?.label || entry.category}
              </Text>
              <Text style={[styles.historyMessage, { color: theme.textPrimary }]}>{entry.message}</Text>
              <Text style={[styles.historyMeta, { color: theme.textSecondary }]}>
                {new Date(entry.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'vi-VN')}
              </Text>
            </View>
          ))
        )}
      </View>

      <SettingsChoiceModal
        theme={theme}
        visible={choiceVisible}
        title={text.selectOption}
        options={categoryOptions}
        value={category}
        onSelect={(value) => {
          setCategory(value);
          setChoiceVisible(false);
        }}
        onClose={() => setChoiceVisible(false)}
      />
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  formCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  selectButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  selectLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  messageInput: {
    minHeight: 140,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  contactInput: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  historyCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  historyRow: {
    paddingVertical: 12,
    gap: 6,
  },
  historyCategory: {
    fontSize: 11.5,
    fontWeight: '900',
  },
  historyMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  historyMeta: {
    fontSize: 11,
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
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
