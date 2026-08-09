import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STATIC_ARTICLES, getSettingsText } from './constants';
import { SettingsLayout } from './components/SettingsLayout';

export function StaticContentScreen({ theme, language, articleKey, onBack }) {
  const text = getSettingsText(language);
  const article = STATIC_ARTICLES[articleKey]?.[language] || STATIC_ARTICLES[articleKey]?.vi;

  if (!article) {
    return (
      <SettingsLayout
        theme={theme}
        title={text.about}
        subtitle={text.supportHint}
        onBack={onBack}
      >
        <Text style={{ color: theme.textSecondary }}>{text.noResults}</Text>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      theme={theme}
      title={article.title}
      subtitle={text.supportHint}
      onBack={onBack}
    >
      {article.sections.map((section) => (
        <View key={section.heading} style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>{section.heading}</Text>
          {section.paragraphs.map((paragraph) => (
            <Text key={paragraph} style={[styles.paragraph, { color: theme.textSecondary }]}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  heading: {
    fontSize: 14,
    fontWeight: '900',
  },
  paragraph: {
    fontSize: 12.5,
    lineHeight: 19,
  },
});
