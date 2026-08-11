import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

export function SettingItem({
  theme,
  icon: Icon,
  title,
  description,
  value,
  onPress,
  rightElement,
  danger = false,
  disabled = false,
  loading = false,
  showChevron = true,
  noBorder = false,
}) {
  const tintColor = danger ? '#ef4444' : '#3b82f6';
  const baseRowStyle = [
    styles.row,
    !noBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
    disabled && { opacity: 0.6 },
  ];

  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: danger ? 'rgba(239,68,68,0.12)' : theme.searchBg }]}>
        {Icon ? <Icon size={18} color={tintColor} /> : null}
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: danger ? '#ef4444' : theme.textPrimary }]}>{title}</Text>
        {!!description && (
          <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
        )}
      </View>
      <View style={styles.trailing}>
        {!!value && (
          <Text style={[styles.value, { color: theme.textSecondary }]} numberOfLines={1}>
            {value}
          </Text>
        )}
        {loading ? <ActivityIndicator size="small" color={tintColor} /> : rightElement}
        {!loading && !rightElement && showChevron ? (
          <ChevronRight size={16} color={theme.textMuted} />
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...baseRowStyle,
          pressed && !disabled && { backgroundColor: theme.searchBg },
        ]}
        onPress={disabled ? undefined : onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={baseRowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  description: {
    fontSize: 11.5,
    lineHeight: 18,
  },
  trailing: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    minHeight: 40,
    maxWidth: '44%',
    flexShrink: 0,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: 108,
    flexShrink: 1,
  },
});
