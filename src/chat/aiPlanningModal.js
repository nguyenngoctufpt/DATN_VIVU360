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
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, X, Clock, CalendarDays } from 'lucide-react-native';

const { height } = Dimensions.get('window');

export function AIPlanningModal({
  visible,
  onClose,
  theme,
  planDaysInput,
  setPlanDaysInput,
  planStartDate,
  setPlanStartDate,
  planEndDate,
  setPlanEndDate,
  selectedDestinationId,
  setSelectedDestinationId,
  isGeneratingPlan,
  TRAVEL_DESTINATIONS,
  onSubmit,
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.cardGlass, borderColor: theme.border, height: 490 }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={18} color="#f43f5e" />
              <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>AI Smart Planner</Text>
            </View>
            <Pressable style={styles.closeModalBtn} onPress={onClose}>
              <X size={20} color={theme.textPrimary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Chọn điểm đến du lịch</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginTop: 8, paddingBottom: 6 }}>
              {TRAVEL_DESTINATIONS.map((dest) => {
                const isSelected = selectedDestinationId === dest.id;
                return (
                  <Pressable
                    key={dest.id}
                    style={[
                      styles.destinationChipCard,
                      {
                        backgroundColor: isSelected ? 'rgba(244, 63, 94, 0.08)' : theme.searchBg,
                        borderColor: isSelected ? '#f43f5e' : theme.border,
                      },
                    ]}
                    onPress={() => setSelectedDestinationId(dest.id)}
                  >
                    <Image source={{ uri: dest.image }} style={styles.destinationChipImage} />
                    <Text style={[styles.destinationChipText, { color: isSelected ? '#f43f5e' : theme.textPrimary, fontWeight: isSelected ? '800' : '600' }]}>
                      {dest.name}
                    </Text>
                    {isSelected && <Sparkles size={11} color="#f43f5e" />}
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Số ngày du lịch</Text>
                <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 6, height: 42 }]}>
                  <Clock size={16} color={theme.textSecondary} />
                  <TextInput
                    placeholder="Ví dụ: 3"
                    placeholderTextColor={theme.textMuted}
                    value={planDaysInput}
                    onChangeText={setPlanDaysInput}
                    keyboardType="numeric"
                    style={[styles.formTextInput, { color: theme.textPrimary, fontSize: 13 }]}
                  />
                </View>
              </View>

              <View style={{ flex: 1.5 }}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Ngày khởi hành</Text>
                <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 6, height: 42 }]}>
                  <CalendarDays size={16} color={theme.textSecondary} />
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.textMuted}
                    value={planStartDate}
                    onChangeText={setPlanStartDate}
                    style={[styles.formTextInput, { color: theme.textPrimary, fontSize: 13 }]}
                  />
                </View>
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 14 }]}>Ngày kết thúc</Text>
            <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 6, height: 42 }]}>
              <CalendarDays size={16} color={theme.textSecondary} />
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
                value={planEndDate}
                onChangeText={setPlanEndDate}
                style={[styles.formTextInput, { color: theme.textPrimary, fontSize: 13 }]}
              />
            </View>

            <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 14, fontStyle: 'italic', lineHeight: 16 }}>
              💡 Trình lập lịch thông minh của Vivu360 sẽ tự động phân tích điều kiện thời tiết thực tế từ Google Weather API để tối ưu hóa lộ trình cho nhóm của bạn.
            </Text>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
            <Pressable 
              style={[styles.modalSubmitBtn, isGeneratingPlan && { opacity: 0.75 }]} 
              onPress={onSubmit}
              disabled={isGeneratingPlan}
            >
              <LinearGradient colors={['#a21caf', '#db2777', '#f43f5e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalSubmitGradient}>
                {isGeneratingPlan ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Sparkles size={16} color="#fff" />
                    <Text style={styles.modalSubmitText}>AI gợi ý lộ trình thông minh</Text>
                  </>
                )}
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
  destinationChipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  destinationChipImage: {
    width: 24,
    height: 24,
    borderRadius: 8,
  },
  destinationChipText: {
    fontSize: 12,
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
