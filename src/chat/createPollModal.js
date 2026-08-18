import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart3, Plus, Trash2, X, Check, Clock, Utensils, Bus, CalendarDays } from 'lucide-react-native';

const SAMPLE_POLLS = [
  {
    title: '⏰ Vote Giờ xuất phát',
    question: 'Mọi người muốn xuất phát lúc mấy giờ?',
    options: ['06:00 Sáng (Đi sớm ngắm bình minh)', '07:30 Sáng (Thời gian đẹp nhất)', '09:00 Sáng (Thong thả ăn sáng xong đi)'],
    icon: Clock,
    color: '#8b5cf6',
  },
  {
    title: '🍽️ Vote Chỗ ăn tối',
    question: 'Tối nay nhóm mình ăn món gì?',
    options: ['Lẩu & Đồ nướng đặc sản', 'Nhà hàng Hải Sản ven biển', 'Ăn chợ đêm & Food tour phố cổ'],
    icon: Utensils,
    color: '#f59e0b',
  },
  {
    title: '🚗 Vote Phương tiện di chuyển',
    question: 'Nhóm sẽ di chuyển bằng phương tiện gì?',
    options: ['Thuê xe máy tự lái', 'Đi Grab / Taxi nhóm 7 chỗ', 'Thuê xe ô tô tự lái'],
    icon: Bus,
    color: '#10b981',
  },
  {
    title: '📅 Vote Lịch trình thay thế',
    question: 'Nếu trời mưa chiều nay, nhóm sẽ làm gì?',
    options: ['Ghé tiệm cafe ngắm mưa', 'Về khách sạn nghỉ ngơi & họp bàn', 'Đi trung tâm thương mại / Bảo tàng'],
    icon: CalendarDays,
    color: '#3b82f6',
  },
];

export function CreatePollModal({ visible, onClose, onCreatePoll, isDarkMode }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['Option 1', 'Option 2']);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApplySample = (sample) => {
    setQuestion(sample.question);
    setOptions([...sample.options]);
  };

  const handleAddOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, `Lựa chọn ${options.length + 1}`]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (text, index) => {
    const next = [...options];
    next[index] = text;
    setOptions(next);
  };

  const handleSubmit = async () => {
    const cleanQ = question.trim();
    const cleanOpts = options.map((o) => o.trim()).filter(Boolean);

    if (!cleanQ || cleanOpts.length < 2 || loading) return;

    setLoading(true);
    try {
      await onCreatePoll({ question: cleanQ, options: cleanOpts, multipleChoice });
      setQuestion('');
      setOptions(['Lựa chọn 1', 'Lựa chọn 2']);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bgStyle = { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' };
  const textColor = { color: isDarkMode ? '#f8fafc' : '#0f172a' };
  const cardBg = { backgroundColor: isDarkMode ? '#334155' : '#f8fafc' };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.modalContent, bgStyle]}>
          {/* Header */}
          <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.headerGradient}>
            <View style={styles.headerRow}>
              <View style={styles.headerIconBox}>
                <BarChart3 size={22} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Tạo Bình Chọn Nhanh 📊</Text>
                <Text style={styles.headerSubtitle}>Giảm tranh luận - Thống nhất ý kiến nhóm</Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <X size={20} color="#ffffff" />
              </Pressable>
            </View>
          </LinearGradient>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Sample Polls */}
            <Text style={[styles.sectionTitle, textColor]}>✨ Mẫu bình chọn nhanh:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sampleScroll}>
              {SAMPLE_POLLS.map((s, idx) => {
                const IconC = s.icon;
                return (
                  <Pressable key={idx} style={[styles.sampleCard, cardBg]} onPress={() => handleApplySample(s)}>
                    <View style={[styles.sampleIconBox, { backgroundColor: s.color + '20' }]}>
                      <IconC size={16} color={s.color} />
                    </View>
                    <Text style={[styles.sampleText, textColor]}>{s.title}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Poll Form */}
            <Text style={[styles.fieldLabel, textColor]}>Câu hỏi bình chọn:</Text>
            <TextInput
              style={[styles.questionInput, cardBg, textColor]}
              placeholder="VD: Nhóm mình muốn ăn ở đâu tối nay?"
              placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
              value={question}
              onChangeText={setQuestion}
            />

            <View style={styles.optionsHeader}>
              <Text style={[styles.fieldLabel, textColor]}>Các phương án lựa chọn:</Text>
              <Text style={styles.optCount}>{options.length}/6</Text>
            </View>

            {options.map((opt, idx) => (
              <View key={idx} style={styles.optRow}>
                <TextInput
                  style={[styles.optInput, cardBg, textColor]}
                  placeholder={`Lựa chọn ${idx + 1}`}
                  placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                  value={opt}
                  onChangeText={(txt) => handleOptionChange(txt, idx)}
                />
                {options.length > 2 && (
                  <Pressable style={styles.removeBtn} onPress={() => handleRemoveOption(idx)}>
                    <Trash2 size={18} color="#ef4444" />
                  </Pressable>
                )}
              </View>
            ))}

            {options.length < 6 && (
              <Pressable style={styles.addOptBtn} onPress={handleAddOption}>
                <Plus size={16} color="#8b5cf6" />
                <Text style={styles.addOptText}>Thêm phương án</Text>
              </Pressable>
            )}

            {/* Multiple Choice Toggle */}
            <View style={[styles.toggleRow, cardBg]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleTitle, textColor]}>Cho phép chọn nhiều phương án</Text>
                <Text style={styles.toggleDesc}>Thành viên có thể tick nhiều câu trả lời</Text>
              </View>
              <Switch
                value={multipleChoice}
                onValueChange={setMultipleChoice}
                trackColor={{ false: '#cbd5e1', true: '#c4b5fd' }}
                thumbColor={multipleChoice ? '#8b5cf6' : '#f8fafc'}
              />
            </View>
          </ScrollView>

          {/* Submit Footer */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.submitBtn,
                (!question.trim() || options.filter((o) => o.trim()).length < 2) && { opacity: 0.5 },
              ]}
              onPress={handleSubmit}
              disabled={!question.trim() || options.filter((o) => o.trim()).length < 2 || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Check size={18} color="#ffffff" />
                  <Text style={styles.submitText}>Tạo Bình Chọn Nhóm</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 16,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
  headerSubtitle: { fontSize: 12, color: '#e9d5ff', marginTop: 2 },
  closeBtn: { padding: 6, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' },
  scrollBody: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  sampleScroll: { flexDirection: 'row', marginBottom: 16 },
  sampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    gap: 8,
  },
  sampleIconBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sampleText: { fontSize: 13, fontWeight: '600' },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  questionInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  optionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optCount: { fontSize: 12, color: '#8b5cf6', fontWeight: '600' },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  optInput: { flex: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  removeBtn: { padding: 8 },
  addOptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c4b5fd',
    borderStyle: 'dashed',
    gap: 6,
    marginVertical: 10,
  },
  addOptText: { color: '#8b5cf6', fontWeight: '600', fontSize: 13 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  toggleTitle: { fontSize: 13, fontWeight: '600' },
  toggleDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  footer: { paddingHorizontal: 20, paddingTop: 10 },
  submitBtn: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  submitText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
});
