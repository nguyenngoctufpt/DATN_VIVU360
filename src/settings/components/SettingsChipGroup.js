import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function SettingsChipGroup({ options, values, onChange, theme, language }) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = values.includes(option.value);
        return (
          <Pressable
            key={option.value}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? 'rgba(59,130,246,0.16)' : theme.searchBg,
                borderColor: selected ? '#3b82f6' : theme.searchBorder,
              },
            ]}
            onPress={() => {
              const next = selected
                ? values.filter((item) => item !== option.value)
                : [...values, option.value];
              onChange(next);
            }}
          >
            <Text style={[styles.text, { color: selected ? '#3b82f6' : theme.textPrimary }]}>
              {option.label?.[language] || option.label?.vi || option.value}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 999,
  },
  text: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
