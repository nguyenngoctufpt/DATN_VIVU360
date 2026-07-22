import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit, X } from 'lucide-react-native';

const { height } = Dimensions.get('window');

export function EditActivityModal({
  visible,
  onClose,
  theme,
  editingActivityTitle,
  setEditingActivityTitle,
  editingActivityText,
  setEditingActivityText,
  onSave,
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.cardGlass, borderColor: theme.border, height: 380 }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Edit size={18} color="#f43f5e" />
              <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Thiết lập hoạt động</Text>
            </View>
            <Pressable style={styles.closeModalBtn} onPress={onClose}>
              <X size={20} color={theme.textPrimary} />
            </Pressable>
          </View>

          <View style={{ flex: 1, padding: 16 }}>
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Tên hoạt động (Buổi)</Text>
            <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 6, height: 42 }]}>
              <TextInput
                placeholder="Ví dụ: Hoạt động Sáng, Ăn trưa..."
                placeholderTextColor={theme.textMuted}
                value={editingActivityTitle}
                onChangeText={setEditingActivityTitle}
                style={[styles.formTextInput, { color: theme.textPrimary }]}
              />
            </View>

            <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 14 }]}>Chi tiết nội dung hoạt động</Text>
            <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 6, height: 80, alignItems: 'flex-start', paddingVertical: 8 }]}>
              <TextInput
                placeholder="Ví dụ: Tập trung tại sảnh khách sạn và bắt đầu di chuyển..."
                placeholderTextColor={theme.textMuted}
                value={editingActivityText}
                onChangeText={setEditingActivityText}
                multiline
                numberOfLines={3}
                style={[styles.formTextInput, { color: theme.textPrimary, flex: 1, height: '100%', textAlignVertical: 'top' }]}
              />
            </View>
          </View>

          <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
            <Pressable style={styles.modalSubmitBtn} onPress={onSave}>
              <LinearGradient colors={['#fb7185', '#f43f5e']} style={styles.modalSubmitGradient}>
                <Text style={styles.modalSubmitText}>Lưu hoạt động</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: 24,
  },
  modalHeader: {
    height: 58,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  modalHeaderTitle: {
    fontSize: 15.5,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 2,
  },
  formInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  formTextInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    paddingVertical: 4,
    marginLeft: 8,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  modalSubmitBtn: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalSubmitGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '900',
  },
});
