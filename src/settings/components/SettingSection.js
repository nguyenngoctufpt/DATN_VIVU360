import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function SettingSection({ theme, title, description, children }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        {!!description && (
          <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
        )}
      </View>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  heading: {
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
});
