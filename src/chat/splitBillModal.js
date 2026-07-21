import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Calculator, Coins, FileText, Users, Check } from 'lucide-react-native';

export function SplitBillModal({
  visible,
  onClose,
  theme,
  selectedGroup,
  onSubmit, // callback nhận (totalAmount, billTitle, selectedMemberIds, splitDetails)
}) {
  const [billTitle, setBillTitle] = useState('');
  const [totalAmountInput, setTotalAmountInput] = useState('');
  const [selectedMembers, setSelectedMembers] = useState({}); // { memberId: boolean }

  // Mặc định chọn tất cả thành viên khi Modal được mở
  useEffect(() => {
    if (visible && selectedGroup?.membersList) {
      const initial = {};
      selectedGroup.membersList.forEach((m) => {
        initial[m.id] = true;
      });
      setSelectedMembers(initial);
      setBillTitle('');
      setTotalAmountInput('');
    }
  }, [visible, selectedGroup]);

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const activeMembers = selectedGroup?.membersList?.filter((m) => selectedMembers[m.id]) || [];
  const activeCount = activeMembers.length;
  const totalAmount = Number(totalAmountInput) || 0;
  const perPersonAmount = activeCount > 0 ? Math.round(totalAmount / activeCount) : 0;

  const handleConfirm = () => {
    if (!billTitle.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên hóa đơn / nội dung chia bill.');
      return;
    }
    if (totalAmount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập tổng số tiền hóa đơn hợp lệ.');
      return;
    }
    if (activeCount === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một thành viên tham gia chia bill.');
      return;
    }

    const splitDetails = activeMembers.map((m) => ({
      memberId: m.id,
      memberName: m.name,
      amount: perPersonAmount,
    }));

    onSubmit(totalAmount, billTitle, activeMembers.map(m => m.id), splitDetails);
  };

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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Calculator size={20} color="#f43f5e" />
                <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Máy tính Split Bill</Text>
              </View>
              <Pressable style={styles.closeModalBtn} onPress={onClose}>
                <X size={22} color={theme.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Bill Title Input */}
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Nội dung hóa đơn / Lý do</Text>
              <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg }]}>
                <FileText size={18} color="#f43f5e" />
                <TextInput
                  placeholder="Ví dụ: Tiền ăn lẩu tối ngày 1, tiền xe ôm..."
                  placeholderTextColor={theme.textMuted}
                  value={billTitle}
                  onChangeText={setBillTitle}
                  style={[styles.formTextInput, { color: theme.textPrimary }]}
                />
              </View>

              {/* Total Amount Input */}
              <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 16 }]}>Tổng số tiền cần chia (đ)</Text>
              <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg }]}>
                <Coins size={18} color="#f43f5e" />
                <TextInput
                  placeholder="Ví dụ: 1200000"
                  placeholderTextColor={theme.textMuted}
                  value={totalAmountInput}
                  onChangeText={setTotalAmountInput}
                  keyboardType="numeric"
                  style={[styles.formTextInput, { color: theme.textPrimary }]}
                />
              </View>

              {/* Member Selector List */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
                <Text style={[styles.inputLabel, { color: theme.textMuted, marginBottom: 0 }]}>Thành viên chia bill</Text>
                <Text style={{ fontSize: 12, fontWeight: '750', color: '#f43f5e' }}>{activeCount}/{selectedGroup?.membersList?.length || 0} người</Text>
              </View>

              <View style={styles.membersListContainer}>
                {selectedGroup?.membersList?.map((member) => {
                  const isChecked = !!selectedMembers[member.id];
                  return (
                    <Pressable
                      key={member.id}
                      style={[
                        styles.memberRow,
                        { backgroundColor: theme.searchBg, borderColor: isChecked ? 'rgba(244, 63, 94, 0.3)' : 'transparent' },
                      ]}
                      onPress={() => toggleMember(member.id)}
                    >
                      <Image source={{ uri: member.avatar || ('https://i.pravatar.cc/150?name=' + encodeURIComponent(member.name || 'User')) }} style={styles.memberAvatar} />
                      <Text style={[styles.memberName, { color: theme.textPrimary }]} numberOfLines={1}>
                        {member.name}
                      </Text>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isChecked ? '#f43f5e' : 'transparent',
                            borderColor: isChecked ? '#f43f5e' : theme.textMuted,
                          },
                        ]}
                      >
                        {isChecked && <Check size={12} color="#fff" strokeWidth={3} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Calculated Result Card */}
              {totalAmount > 0 && activeCount > 0 && (
                <View style={[styles.resultCard, { backgroundColor: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.15)' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Users size={14} color="#f43f5e" />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textSecondary, textTransform: 'uppercase' }}>
                      Mỗi người cần đóng góp
                    </Text>
                  </View>
                  <Text style={styles.resultAmountText}>{perPersonAmount.toLocaleString('vi-VN')} đ</Text>
                  <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2, fontStyle: 'italic' }}>
                    * Tự động chia đều cho {activeCount} người đã chọn.
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Footer Submit Button */}
            <Pressable style={styles.modalSubmitBtn} onPress={handleConfirm}>
              <LinearGradient colors={['#fb7185', '#f43f5e']} style={styles.modalSubmitGradient}>
                <Calculator size={20} color="#fff" />
                <Text style={styles.modalSubmitText}>Xác nhận chia bill</Text>
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
  formInputGroup: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, height: 52, gap: 12 },
  formTextInput: { flex: 1, fontSize: 15, fontWeight: '500' },
  membersListContainer: { gap: 8, marginVertical: 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, gap: 12 },
  memberAvatar: { width: 34, height: 34, borderRadius: 17 },
  memberName: { flex: 1, fontSize: 14, fontWeight: '700' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  resultCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginTop: 16 },
  resultAmountText: { fontSize: 24, fontWeight: '950', color: '#f43f5e' },
  modalSubmitBtn: { height: 54, borderRadius: 16, overflow: 'hidden', marginTop: 24 },
  modalSubmitGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalSubmitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
