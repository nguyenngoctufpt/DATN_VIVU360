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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalBackdrop}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.modalCard, { backgroundColor: theme.background || '#fff', borderColor: theme.border }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Ghi nhận chi tiêu</Text>
              <Pressable style={styles.closeModalBtn} onPress={onClose}>
                <X size={22} color={theme.textPrimary} />
              </Pressable>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Tên khoản chi</Text>
              <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg }]}>
                <ShoppingBag size={18} color="#f43f5e" style={styles.icon} />
                <TextInput
                  placeholder="Ví dụ: Vé máy bay"
                  placeholderTextColor={theme.textMuted}
                  value={fundExpenseTitle}
                  onChangeText={setFundExpenseTitle}
                  style={[styles.formTextInput, { color: theme.textPrimary }]}
                />
              </View>

              <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 20 }]}>Số tiền (đ)</Text>
              <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg }]}>
                <Coins size={18} color="#f43f5e" style={styles.icon} />
                <TextInput
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  value={fundExpenseInput}
                  onChangeText={setFundExpenseInput}
                  keyboardType="numeric"
                  style={[styles.formTextInput, { color: theme.textPrimary, fontSize: 16 }]}
                />
              </View>
            </View>

            {/* Footer */}
            <Pressable style={styles.modalSubmitBtn} onPress={onSubmit}>
              <LinearGradient colors={['#fb7185', '#f43f5e']} style={styles.modalSubmitGradient}>
                <Minus size={18} color="#fff" />
                <Text style={styles.modalSubmitText}>Xác nhận chi tiêu</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
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