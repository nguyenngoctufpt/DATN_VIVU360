import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Coins, FileText, Plus } from 'lucide-react-native';

export function ThuTienModal({
  visible,
  onClose,
  theme,
  selectedGroup,
  selectedFundMemberId,
  setSelectedFundMemberId,
  fundContributionInput,
  setFundContributionInput,
  fundContributionNote,
  setFundContributionNote,
  onSubmit,
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalBackdrop}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.modalCard, { backgroundColor: theme.background || '#fff' }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Ghi nhận thu tiền quỹ</Text>
              <Pressable style={styles.closeModalBtn} onPress={onClose}>
                <X size={22} color={theme.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Member Selection */}
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Chọn thành viên</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.memberListScroll}
              >
                {selectedGroup?.membersList?.map((member) => {
                  const isSelected = selectedFundMemberId === member.id;
                  return (
                    <Pressable
                      key={member.id}
                      style={[
                        styles.memberChip,
                        { backgroundColor: isSelected ? 'rgba(244, 63, 94, 0.1)' : theme.searchBg },
                        isSelected && { borderColor: '#f43f5e' }
                      ]}
                      onPress={() => setSelectedFundMemberId(member.id)}
                    >
                      <Image source={{ uri: member.avatar || ('https://i.pravatar.cc/150?name=' + encodeURIComponent(member.name || 'User')) }} style={styles.memberChipAvatar} />
                      <Text style={[styles.memberChipText, { color: isSelected ? '#f43f5e' : theme.textPrimary }]}>
                        {member.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Inputs */}
              <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 20 }]}>Số tiền nộp (đ)</Text>
              <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg }]}>
                <Coins size={18} color="#f43f5e" />
                <TextInput
                  placeholder="Nhập số tiền"
                  placeholderTextColor={theme.textMuted}
                  value={fundContributionInput}
                  onChangeText={setFundContributionInput}
                  keyboardType="numeric"
                  style={[styles.formTextInput, { color: theme.textPrimary }]}
                />
              </View>

              <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 16 }]}>Ghi chú</Text>
              <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                <FileText size={18} color="#f43f5e" style={{ marginTop: 2 }} />
                <TextInput
                  placeholder="Ví dụ: Đóng quỹ tháng 7..."
                  placeholderTextColor={theme.textMuted}
                  value={fundContributionNote}
                  onChangeText={setFundContributionNote}
                  multiline
                  style={[styles.formTextInput, { color: theme.textPrimary, textAlignVertical: 'top' }]}
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <Pressable style={styles.modalSubmitBtn} onPress={onSubmit}>
              <LinearGradient colors={['#fb7185', '#f43f5e']} style={styles.modalSubmitGradient}>
                <Plus size={20} color="#fff" />
                <Text style={styles.modalSubmitText}>Xác nhận thu tiền</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { width: '100%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalHeaderTitle: { fontSize: 18, fontWeight: '800' },
  closeModalBtn: { padding: 4 },
  inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  memberListScroll: { gap: 10, paddingVertical: 4 },
  memberChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', gap: 8 },
  memberChipAvatar: { width: 32, height: 32, borderRadius: 16 },
  memberChipText: { fontSize: 14, fontWeight: '600' },
  formInputGroup: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, height: 52, gap: 12 },
  formTextInput: { flex: 1, fontSize: 15, fontWeight: '500' },
  modalSubmitBtn: { height: 54, borderRadius: 16, overflow: 'hidden', marginTop: 20 },
  modalSubmitGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalSubmitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});