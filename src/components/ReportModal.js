import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { X } from 'lucide-react-native';

const REPORT_REASONS = [
  { label: 'Spam', value: 'spam' },
  { label: 'Nội dung thô tục, xúc phạm', value: 'abusive' },
  { label: 'Thông tin sai lệch', value: 'misinformation' },
  { label: 'Quấy rối', value: 'harassment' },
  { label: 'Vi phạm bản quyền', value: 'copyright' },
  { label: 'Lý do khác', value: 'other' },
];

const ReportModal = ({ visible, onClose, onSubmit, isDarkMode, theme, postId, currentUserId }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setSelectedReason('');
    setDescription('');
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Vui lòng chọn lý do báo cáo');
      return;
    }
    setLoading(true);

    try {
      await onSubmit(postId, selectedReason, description);
      resetForm();
      onClose();
      Alert.alert('Thành công', 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét.');
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi báo cáo, vui lòng thử lại.');
    } finally {
      setLoading(true);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Báo cáo bài viết
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={theme.textSecondary} />
            </Pressable>
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Lý do báo cáo <Text style={{ color: '#ef4444' }}>*</Text>
          </Text>
          <View style={styles.reasonList}>
            {REPORT_REASONS.map((item) => (
              <Pressable
                key={item.value}
                style={[
                  styles.reasonItem,
                  {
                    backgroundColor:
                      selectedReason === item.value
                        ? isDarkMode
                          ? 'rgba(59, 130, 246, 0.2)'
                          : '#dbeafe'
                        : 'transparent',
                    borderColor:
                      selectedReason === item.value ? '#3b82f6' : theme.border,
                  },
                ]}
                onPress={() => setSelectedReason(item.value)}
              >
                <Text
                  style={[
                    styles.reasonText,
                    { color: selectedReason === item.value ? '#3b82f6' : theme.textPrimary },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: theme.textSecondary, marginTop: 12 }]}>
            Mô tả thêm (không bắt buộc)
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.searchBg,
                borderColor: theme.border,
                color: theme.textPrimary,
              },
            ]}
            placeholder="Nhập chi tiết nếu cần..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.actions}>
            <Pressable
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
                Hủy
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.submitBtn,
                { backgroundColor: '#3b82f6' },
                loading && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitText}>Gửi báo cáo</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReportModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '88%',
    maxHeight: '80%',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  reasonList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  reasonItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  }
});