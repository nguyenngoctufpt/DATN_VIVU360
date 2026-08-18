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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, Sparkles, X, Send, Calendar, Wallet, AlertCircle, Utensils, MessageSquare } from 'lucide-react-native';

const QUICK_QUESTIONS = [
  { icon: Calendar, text: 'Ngày 2 đi những đâu?', color: '#3b82f6' },
  { icon: Wallet, text: 'Số dư quỹ nhóm hiện tại còn bao nhiêu?', color: '#10b981' },
  { icon: AlertCircle, text: 'Danh sách ai chưa đóng tiền quỹ?', color: '#ef4444' },
  { icon: Utensils, text: 'Gợi ý đổi chỗ ăn tối gần khách sạn', color: '#f59e0b' },
];

export function GroupAssistantModal({ visible, onClose, onAsk, isDarkMode }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend) => {
    const targetQuery = (textToSend || question).trim();
    if (!targetQuery || loading) return;

    setLoading(true);
    try {
      await onAsk(targetQuery);
      setQuestion('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bgStyle = { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' };
  const textColor = { color: isDarkMode ? '#f8fafc' : '#0f172a' };
  const subTextColor = { color: isDarkMode ? '#94a3b8' : '#64748b' };
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
          <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.headerGradient}>
            <View style={styles.headerTitleRow}>
              <View style={styles.botIconWrapper}>
                <Bot size={22} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Trợ Lý Nhóm Vivu360 🤖</Text>
                <Text style={styles.headerSubtitle}>Giải đáp lịch trình, quỹ & gợi ý điểm đến</Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <X size={20} color="#ffffff" />
              </Pressable>
            </View>
          </LinearGradient>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, textColor]}>💡 Câu hỏi gợi ý nhanh:</Text>
            <View style={styles.quickList}>
              {QUICK_QUESTIONS.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <Pressable
                    key={idx}
                    style={[styles.quickCard, cardBg]}
                    onPress={() => handleSend(item.text)}
                    disabled={loading}
                  >
                    <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
                      <IconComp size={18} color={item.color} />
                    </View>
                    <Text style={[styles.quickText, textColor]}>{item.text}</Text>
                    <Sparkles size={14} color="#3b82f6" style={{ marginLeft: 4 }} />
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Input */}
          <View style={[styles.footerInputRow, cardBg]}>
            <TextInput
              style={[styles.input, textColor]}
              placeholder="Hỏi trợ lý AI điều gì..."
              placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <Pressable
              style={[styles.sendBtn, !question.trim() && { opacity: 0.5 }]}
              onPress={() => handleSend()}
              disabled={!question.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Send size={18} color="#ffffff" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e2e8f0',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickList: {
    gap: 10,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  footerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
