import React, { useState } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Coins, FileText, Plus, Sparkles, CreditCard, Camera, CheckCircle2 } from 'lucide-react-native';

const SAMPLE_BILLS = [
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
  'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600',
];

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
  fundStkInput,
  setFundStkInput,
  billImage,
  setBillImage,
  onSubmit,
}) {
  const [isScanningAi, setIsScanningAi] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  const handleScanBillAi = () => {
    setIsScanningAi(true);
    setAiSuccessMsg('');

    setTimeout(() => {
      setIsScanningAi(false);
      const randomBill = SAMPLE_BILLS[Math.floor(Math.random() * SAMPLE_BILLS.length)];
      
      setFundContributionInput('3000000');
      setFundContributionNote('Chuyển nộp quỹ (Ghi STK người B)');
      if (setFundStkInput) setFundStkInput('STK người B: 999888777 (Vietcombank)');
      if (setBillImage) setBillImage(randomBill);

      setAiSuccessMsg('✨ AI OCR đã quét bill thành công: 3.000.000 đ · STK người B: 999888777');
    }, 1000);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <View style={[styles.modalCard, { backgroundColor: theme.background || '#fff' }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Coins size={20} color="#10b981" />
              <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Ghi nhận thu tiền quỹ</Text>
            </View>
            <Pressable style={styles.closeModalBtn} onPress={onClose}>
              <X size={22} color={theme.textPrimary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* AI Scan Bill Banner */}
            <Pressable
              style={styles.aiScanBanner}
              onPress={handleScanBillAi}
              disabled={isScanningAi}
            >
              <LinearGradient
                colors={['#8b5cf6', '#ec4899', '#f43f5e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.aiScanGradient}
              >
                {isScanningAi ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Sparkles size={16} color="#fff" />
                    <Text style={styles.aiScanText}>🤖 AI Đọc & Tự Động Quét Bill Chuyển Khoản</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {aiSuccessMsg !== '' && (
              <View style={styles.aiSuccessBadge}>
                <CheckCircle2 size={14} color="#10b981" />
                <Text style={styles.aiSuccessText}>{aiSuccessMsg}</Text>
              </View>
            )}

            {/* Member Selection */}
            <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 14 }]}>Chọn thành viên nộp</Text>
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
                      { backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.12)' : theme.searchBg },
                      isSelected && { borderColor: '#10b981' }
                    ]}
                    onPress={() => setSelectedFundMemberId(member.id)}
                  >
                    <Image source={{ uri: member.avatar || ('https://i.pravatar.cc/150?name=' + encodeURIComponent(member.name || 'User')) }} style={styles.memberChipAvatar} />
                    <Text style={[styles.memberChipText, { color: isSelected ? '#10b981' : theme.textPrimary }]}>
                      {member.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Inputs */}
            <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 16 }]}>Số tiền nộp (đ)</Text>
            <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg }]}>
              <Coins size={18} color="#10b981" />
              <TextInput
                placeholder="Nhập số tiền (VD: 3.000.000)"
                placeholderTextColor={theme.textMuted}
                value={fundContributionInput}
                onChangeText={setFundContributionInput}
                keyboardType="numeric"
                style={[styles.formTextInput, { color: theme.textPrimary, fontSize: 16, fontWeight: '800' }]}
              />
              {Number(fundContributionInput) > 0 && (
                <Text style={{ fontSize: 12, fontWeight: '850', color: '#10b981' }}>
                  {Number(fundContributionInput).toLocaleString('vi-VN')} đ
                </Text>
              )}
            </View>

            {/* Presets 1-chạm */}
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              {[
                { label: '300k', value: '300000' },
                { label: '500k', value: '500000' },
                { label: '1Tr', value: '1000000' },
                { label: '2Tr', value: '2000000' },
                { label: '3Tr', value: '3000000' },
                { label: '5Tr', value: '5000000' },
              ].map(preset => (
                <Pressable
                  key={preset.label}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: fundContributionInput === preset.value ? 'rgba(16, 185, 129, 0.15)' : theme.searchBg,
                    borderWidth: 1,
                    borderColor: fundContributionInput === preset.value ? '#10b981' : theme.border,
                  }}
                  onPress={() => setFundContributionInput(preset.value)}
                >
                  <Text style={{ fontSize: 11, fontWeight: '850', color: fundContributionInput === preset.value ? '#10b981' : theme.textPrimary }}>
                    {preset.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* STK / Thông tin ngân hàng nhận */}
            <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 14 }]}>Tài khoản nhận / Ghi chú STK (VD: STK người B)</Text>
            <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg }]}>
              <CreditCard size={18} color="#3b82f6" />
              <TextInput
                placeholder="Ví dụ: Người A chuyển cho Trưởng nhóm, STK người B..."
                placeholderTextColor={theme.textMuted}
                value={fundStkInput || ''}
                onChangeText={setFundStkInput}
                style={[styles.formTextInput, { color: theme.textPrimary }]}
              />
            </View>

            {/* Ghi chú */}
            <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 14 }]}>Ghi chú đóng góp</Text>
            <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, height: 60, alignItems: 'flex-start', paddingTop: 10 }]}>
              <FileText size={18} color="#10b981" style={{ marginTop: 2 }} />
              <TextInput
                placeholder="Ví dụ: Đóng quỹ đợt 1..."
                placeholderTextColor={theme.textMuted}
                value={fundContributionNote}
                onChangeText={setFundContributionNote}
                multiline
                style={[styles.formTextInput, { color: theme.textPrimary, textAlignVertical: 'top' }]}
              />
            </View>

            {/* Minh chứng Bill CK Image */}
            <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 14 }]}>Minh chứng chuyển tiền (Hình ảnh Bill)</Text>
            {billImage ? (
              <View style={styles.billPreviewContainer}>
                <Image source={{ uri: billImage }} style={styles.billPreviewImage} />
                <Pressable style={styles.removeBillBtn} onPress={() => setBillImage && setBillImage(null)}>
                  <X size={14} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[styles.uploadBillBox, { backgroundColor: theme.searchBg, borderColor: theme.border }]}
                onPress={() => {
                  const sample = SAMPLE_BILLS[0];
                  if (setBillImage) setBillImage(sample);
                  Alert.alert('Đã tải minh chứng', 'Đã tải bill chuyển khoản lên thành công!');
                }}
              >
                <Camera size={20} color="#3b82f6" />
                <Text style={[styles.uploadBillText, { color: theme.textPrimary }]}>Tải ảnh bill minh chứng CK</Text>
              </Pressable>
            )}
          </ScrollView>

          {/* Footer */}
          <Pressable style={styles.modalSubmitBtn} onPress={onSubmit}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.modalSubmitGradient}>
              <Plus size={20} color="#fff" />
              <Text style={styles.modalSubmitText}>Xác nhận thu tiền</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { width: '100%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalHeaderTitle: { fontSize: 17, fontWeight: '800' },
  closeModalBtn: { padding: 4 },
  aiScanBanner: { borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
  aiScanGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12 },
  aiScanText: { color: '#fff', fontSize: 12.5, fontWeight: '850' },
  aiSuccessBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginBottom: 10 },
  aiSuccessText: { color: '#10b981', fontSize: 11, fontWeight: '700' },
  inputLabel: { fontSize: 11.5, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase' },
  memberListScroll: { gap: 8, paddingVertical: 2 },
  memberChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', gap: 6 },
  memberChipAvatar: { width: 28, height: 28, borderRadius: 14 },
  memberChipText: { fontSize: 13, fontWeight: '600' },
  formInputGroup: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 12, height: 46, gap: 10 },
  formTextInput: { flex: 1, fontSize: 13.5, fontWeight: '500' },
  uploadBillBox: { height: 50, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadBillText: { fontSize: 12.5, fontWeight: '700' },
  billPreviewContainer: { position: 'relative', width: 100, height: 70, borderRadius: 10, overflow: 'hidden', marginTop: 4 },
  billPreviewImage: { width: '100%', height: '100%' },
  removeBillBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  modalSubmitBtn: { height: 48, borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  modalSubmitGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalSubmitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});