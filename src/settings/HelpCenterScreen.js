import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CircleHelp, FileText, MessageSquare } from 'lucide-react-native';
import { HELP_CENTER_FAQS, getSettingsText } from './constants';
import { SettingsLayout } from './components/SettingsLayout';

export function HelpCenterScreen({ theme, language, onBack, onNavigate }) {
  const text = getSettingsText(language);
  const faqs = HELP_CENTER_FAQS[language] || HELP_CENTER_FAQS.vi;

  return (
    <SettingsLayout
      theme={theme}
      title={text.helpCenter}
      subtitle={text.supportHint}
      onBack={onBack}
    >
      <View style={styles.faqWrap}>
        <Text style={[styles.heading, { color: theme.textPrimary }]}>{text.helpFaqTitle}</Text>
        {faqs.map((faq) => (
          <View key={faq.title} style={[styles.faqCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.faqTitleRow}>
              <CircleHelp size={16} color="#3b82f6" />
              <Text style={[styles.faqTitle, { color: theme.textPrimary }]}>{faq.title}</Text>
            </View>
            <Text style={[styles.faqBody, { color: theme.textSecondary }]}>{faq.body}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.linksCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <QuickLink
          theme={theme}
          icon={MessageSquare}
          title={text.feedback}
          description={text.feedbackDescription}
          onPress={() => onNavigate('feedback')}
        />
        <QuickLink
          theme={theme}
          icon={FileText}
          title={text.privacyPolicy}
          description={language === 'en' ? 'Review how Vivu360 stores and uses your data.' : 'Xem cách Vivu360 lưu trữ và sử dụng dữ liệu của bạn.'}
          onPress={() => onNavigate('privacyPolicy')}
        />
        <QuickLink
          theme={theme}
          icon={FileText}
          title={text.termsOfUse}
          description={language === 'en' ? 'Read the usage rules for the app and AI features.' : 'Đọc các nguyên tắc sử dụng ứng dụng và tính năng AI.'}
          onPress={() => onNavigate('termsOfUse')}
          noBorder
        />
      </View>
    </SettingsLayout>
  );
}

function QuickLink({ theme, icon: Icon, title, description, onPress, noBorder = false }) {
  return (
    <Pressable
      style={[
        styles.linkRow,
        !noBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
      ]}
      onPress={onPress}
    >
      <View style={[styles.linkIcon, { backgroundColor: theme.searchBg }]}>
        <Icon size={16} color="#3b82f6" />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[styles.linkTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.linkDescription, { color: theme.textSecondary }]}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  faqWrap: {
    gap: 10,
  },
  heading: {
    fontSize: 14,
    fontWeight: '900',
  },
  faqCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  faqTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  faqTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  faqBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  linksCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  linkRow: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  linkDescription: {
    fontSize: 11.5,
    lineHeight: 17,
  },
});
