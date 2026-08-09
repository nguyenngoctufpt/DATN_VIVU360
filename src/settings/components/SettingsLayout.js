import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

export function SettingsLayout({
  theme,
  title,
  subtitle,
  onBack,
  children,
  footer,
  scroll = true,
  statusBanner,
  loading = false,
}) {
  const content = scroll ? (
    <ScrollView
      style={styles.body}
      contentContainerStyle={styles.bodyContent}
      showsVerticalScrollIndicator={false}
    >
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#3b82f6" />
        </View>
      ) : null}
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.body, styles.bodyContent]}>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#3b82f6" />
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
        <Pressable
          style={[styles.backButton, { backgroundColor: theme.searchBg, borderColor: theme.border }]}
          onPress={onBack}
        >
          <ChevronLeft size={20} color={theme.textPrimary} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {!!statusBanner && (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: statusBanner.type === 'error'
                ? 'rgba(239,68,68,0.12)'
                : 'rgba(16,185,129,0.14)',
              borderColor: statusBanner.type === 'error'
                ? 'rgba(239,68,68,0.2)'
                : 'rgba(16,185,129,0.2)',
            },
          ]}
        >
          <Text style={{ color: statusBanner.type === 'error' ? '#ef4444' : '#10b981', fontWeight: '700' }}>
            {statusBanner.message}
          </Text>
        </View>
      )}

      {content}

      {footer ? (
        <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.card }]}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  loadingWrap: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});
