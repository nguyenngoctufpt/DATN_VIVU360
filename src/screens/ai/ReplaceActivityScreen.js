import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, RefreshCw } from 'lucide-react-native';
import { replaceAIItineraryActivity } from '../../services/aiItineraryService';

const REPLACEMENT_OPTIONS = [
  { key: 'nearer', label: 'Địa điểm gần hơn' },
  { key: 'cheaper', label: 'Địa điểm rẻ hơn' },
  { key: 'free', label: 'Hoạt động miễn phí' },
  { key: 'indoor', label: 'Hoạt động trong nhà' },
  { key: 'outdoor', label: 'Hoạt động ngoài trời' },
];

export function ReplaceActivityScreen({
  theme,
  ownerId,
  context,
  onBack,
  onCompleted,
}) {
  const [replacementType, setReplacementType] = useState(context?.replacementType || 'cheaper');
  const [userRequest, setUserRequest] = useState('');
  const [loading, setLoading] = useState(false);

  const activity = context?.activity;

  const handleSubmit = async () => {
    if (!activity) {
      Alert.alert('Thiếu dữ liệu', 'Không tìm thấy hoạt động cần thay thế.');
      return;
    }

    setLoading(true);
    try {
      const result = await replaceAIItineraryActivity(ownerId, context.groupId, activity.activityId, {
        groupId: context.groupId,
        currentItinerary: context.itinerary,
        input: context.input,
        replacementType,
        userRequest,
      });

      onCompleted({
        ...context,
        requestId: result.requestId,
        itinerary: result.itinerary,
        input: result.input,
        candidatePlaces: result.candidatePlaces || context.candidatePlaces || [],
        warnings: result.warnings || [],
      });
    } catch (error) {
      const message = error.response?.data?.details?.[0]
        || error.response?.data?.message
        || 'Không thể thay thế hoạt động vào lúc này.';
      Alert.alert('Thay thế thất bại', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable style={[styles.backBtn, { backgroundColor: theme.searchBg }]} onPress={onBack}>
          <ChevronLeft size={20} color={theme.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Thay thế hoạt động</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            AI sẽ chỉ thay hoạt động đang chọn và giữ nguyên các ngày khác.
          </Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Hoạt động hiện tại</Text>
        <Text style={[styles.currentTitle, { color: theme.textPrimary }]}>{activity?.activityName || 'Không rõ hoạt động'}</Text>
        <Text style={[styles.currentMeta, { color: theme.textSecondary }]}>
          {activity?.startTime} - {activity?.endTime} • {activity?.placeName || activity?.address || 'Chưa gắn địa điểm'}
        </Text>
      </View>

      <View style={styles.optionWrap}>
        {REPLACEMENT_OPTIONS.map((option) => {
          const selected = replacementType === option.key;
          return (
            <Pressable
              key={option.key}
              style={[
                styles.optionBtn,
                {
                  backgroundColor: selected ? 'rgba(59,130,246,0.16)' : theme.searchBg,
                  borderColor: selected ? '#3b82f6' : theme.searchBorder,
                },
              ]}
              onPress={() => setReplacementType(option.key)}
            >
              <Text style={[styles.optionText, { color: selected ? '#3b82f6' : theme.textPrimary }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: theme.textPrimary, marginTop: 18 }]}>Yêu cầu tự nhập</Text>
      <TextInput
        value={userRequest}
        onChangeText={setUserRequest}
        placeholder="Ví dụ: thay điểm gần hơn và ít đông người"
        placeholderTextColor={theme.textMuted}
        multiline
        style={[
          styles.textArea,
          {
            color: theme.textPrimary,
            backgroundColor: theme.searchBg,
            borderColor: theme.searchBorder,
          },
        ]}
      />

      <Pressable style={{ marginTop: 20 }} onPress={handleSubmit} disabled={loading}>
        <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.submitBtn}>
          {loading ? <ActivityIndicator color="#fff" /> : <RefreshCw size={18} color="#fff" />}
          <Text style={styles.submitText}>{loading ? 'Đang thay thế...' : 'Yêu cầu AI thay thế hoạt động'}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18 },
  header: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  currentTitle: { fontSize: 17, fontWeight: '800' },
  currentMeta: { fontSize: 13, lineHeight: 18, marginTop: 6 },
  optionWrap: { gap: 10, marginTop: 18 },
  optionBtn: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14 },
  optionText: { fontSize: 14, fontWeight: '700' },
  textArea: { borderWidth: 1, borderRadius: 16, minHeight: 120, paddingHorizontal: 14, paddingVertical: 14, textAlignVertical: 'top' },
  submitBtn: { height: 52, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
