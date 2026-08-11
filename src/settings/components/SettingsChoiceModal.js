import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';

export function SettingsChoiceModal({
  theme,
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
            <Pressable style={[styles.closeButton, { backgroundColor: theme.searchBg }]} onPress={onClose}>
              <X size={18} color={theme.textPrimary} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option, index) => {
              const selected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionRow,
                    { borderBottomColor: index === options.length - 1 ? 'transparent' : theme.border },
                  ]}
                  onPress={() => onSelect(option.value)}
                >
                  <Text style={[styles.optionText, { color: selected ? '#3b82f6' : theme.textPrimary }]}>
                    {option.label}
                  </Text>
                  {selected ? <Check size={18} color="#3b82f6" /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: 'hidden',
    maxHeight: '72%',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
});
