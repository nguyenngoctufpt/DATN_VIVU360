import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Coins, ShoppingBag, Minus } from 'lucide-react-native';

export function ChiTienModal({
  visible,
  onClose,
  theme,
  fundExpenseTitle,
  setFundExpenseTitle,
  fundExpenseInput,
  setFundExpenseInput,
  onSubmit,
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <View style={[styles.modalCard, { backgroundColor: theme.background || '#fff', borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Ghi nhận chi tiêu từ quỹ</Text>
            <Pressable style={styles.closeModalBtn} onPress={onClose}>
              <X size={22} color={theme.textPrimary} />
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Danh mục chọn nhanh khoản chi */}
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Gợi ý danh mục khoản chi</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {[
                '🏨 Homestay / Khách sạn',
                '🚕 Tiền xe / Di chuyển',
                '🍜 Tiền ăn uống',
                '🎟️ Vé tham quan',
                '🛒 Sắm đồ chung',
                '💡 Khác',
              ].map(cat => (
                <Pressable
                  key={cat}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: fundExpenseTitle === cat ? 'rgba(239, 68, 68, 0.15)' : theme.searchBg,
                    borderWidth: 1,
                    borderColor: fundExpenseTitle === cat ? '#ef4444' : theme.border,
                  }}
                  onPress={() => setFundExpenseTitle(cat)}
                >
                  <Text style={{ fontSize: 11.5, fontWeight: '750', color: fundExpenseTitle === cat ? '#ef4444' : theme.textPrimary }}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Tên / Nội dung khoản chi</Text>
            <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg }]}>
              <ShoppingBag size={18} color="#ef4444" style={styles.icon} />
              <TextInput
                placeholder="Ví dụ: Cọc Homestay 50%..."
                placeholderTextColor={theme.textMuted}
                value={fundExpenseTitle}
                onChangeText={setFundExpenseTitle}
                style={[styles.formTextInput, { color: theme.textPrimary }]}
              />
            </View>

            <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 16 }]}>Số tiền chi từ quỹ (đ)</Text>
            <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg }]}>
              <Coins size={18} color="#ef4444" style={styles.icon} />
              <TextInput
                placeholder="Nhập số tiền (VD: 2.500.000)"
                placeholderTextColor={theme.textMuted}
                value={fundExpenseInput}
                onChangeText={setFundExpenseInput}
                keyboardType="numeric"
                style={[styles.formTextInput, { color: theme.textPrimary, fontSize: 16, fontWeight: '800' }]}
              />
              {Number(fundExpenseInput) > 0 && (
                <Text style={{ fontSize: 12, fontWeight: '850', color: '#ef4444' }}>
                  {Number(fundExpenseInput).toLocaleString('vi-VN')} đ
                </Text>
              )}
            </View>

            {/* Presets chọn nhanh số tiền chi */}
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              {[
                { label: '100k', value: '100000' },
                { label: '300k', value: '300000' },
                { label: '500k', value: '500000' },
                { label: '1Tr', value: '1000000' },
                { label: '2.5Tr', value: '2500000' },
                { label: '5Tr', value: '5000000' },
              ].map(preset => (
                <Pressable
                  key={preset.label}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: fundExpenseInput === preset.value ? 'rgba(239, 68, 68, 0.15)' : theme.searchBg,
                    borderWidth: 1,
                    borderColor: fundExpenseInput === preset.value ? '#ef4444' : theme.border,
                  }}
                  onPress={() => setFundExpenseInput(preset.value)}
                >
                  <Text style={{ fontSize: 11, fontWeight: '850', color: fundExpenseInput === preset.value ? '#ef4444' : theme.textPrimary }}>
                    {preset.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Footer */}
          <Pressable style={styles.modalSubmitBtn} onPress={onSubmit}>
            <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.modalSubmitGradient}>
              <Minus size={18} color="#fff" />
              <Text style={styles.modalSubmitText}>Xác nhận chi tiêu</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  formInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  icon: {
    marginRight: 12,
  },
  formTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  modalSubmitBtn: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalSubmitGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});