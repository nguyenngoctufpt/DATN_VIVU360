import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChevronLeft,
  Edit3,
  MapPinned,
  Plus,
  RefreshCw,
  Route,
  Save,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import { getSafeImageSource } from '../../utils/image';
import {
  addActivityToDraftDay,
  buildChatGroupItinerarySnapshot,
  deleteActivityFromDraft,
  ensureItineraryActivityIds,
  formatAIItineraryShareMessage,
  moveActivityInDraft,
  recalculateDraftTotals,
  updateActivityInDraft,
} from '../../utils/aiItinerary';
import {
  optimizeAIItinerary,
  regenerateAIItinerary,
  regenerateAIItineraryDay,
  saveAIItinerary,
  updateSavedAIItinerary,
} from '../../services/aiItineraryService';
import { sendChatMessage, updateChatGroupWorkspace } from '../../services/chatService';

function shouldHideActivityCost(activity = {}) {
  return activity?.activityType === 'food' || Number(activity?.estimatedCost || 0) <= 0;
}

function ActivityEditorModal({ visible, theme, draft, onClose, onSave }) {
  const [localState, setLocalState] = useState(draft);

  useEffect(() => {
    setLocalState(draft);
  }, [draft]);

  if (!localState) return null;

  const updateField = (key, value) => setLocalState((prev) => ({ ...prev, [key]: value }));
  const fields = [
    ['activityName', 'Tên hoạt động'],
    ['startTime', 'Giờ bắt đầu'],
    ['endTime', 'Giờ kết thúc'],
    ['placeName', 'Địa điểm'],
    ['address', 'Địa chỉ'],
    ['activityType', 'Loại hoạt động'],
    ['description', 'Mô tả'],
    ['reason', 'Lý do AI đề xuất'],
    ['note', 'Ghi chú'],
  ];

  if (localState.activityType !== 'food') {
    fields.splice(6, 0, ['estimatedCost', 'Chi phí']);
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Chỉnh sửa hoạt động</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {fields.map(([key, label]) => {
              const multiline = ['description', 'reason', 'note'].includes(key);
              return (
                <View key={key} style={{ marginBottom: 12 }}>
                  <Text style={[styles.modalLabel, { color: theme.textPrimary }]}>{label}</Text>
                  <TextInput
                    value={String(localState[key] ?? '')}
                    onChangeText={(value) => updateField(key, key === 'estimatedCost' ? value.replace(/[^\d]/g, '') : value)}
                    multiline={multiline}
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.modalInput,
                      {
                        color: theme.textPrimary,
                        backgroundColor: theme.searchBg,
                        borderColor: theme.searchBorder,
                        minHeight: multiline ? 84 : 46,
                        textAlignVertical: multiline ? 'top' : 'center',
                      },
                    ]}
                  />
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.modalActionRow}>
            <Pressable style={[styles.modalAction, { backgroundColor: theme.searchBg }]} onPress={onClose}>
              <Text style={[styles.modalActionText, { color: theme.textPrimary }]}>Hủy</Text>
            </Pressable>
            <Pressable
              style={[styles.modalAction, { backgroundColor: '#3b82f6' }]}
              onPress={() => onSave({
                ...localState,
                estimatedCost: localState.activityType === 'food'
                  ? 0
                  : Number(localState.estimatedCost || 0),
              })}
            >
              <Text style={[styles.modalActionText, { color: '#fff' }]}>Lưu chỉnh sửa</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function buildPlaceMap(candidatePlaces = []) {
  const lookup = new Map();
  candidatePlaces.forEach((place) => lookup.set(String(place.placeId), place));
  return lookup;
}

export function AIItineraryPreviewScreen({
  theme,
  isDarkMode,
  ownerId,
  context,
  onBack,
  onOpenReplaceActivity,
  onNavigateToTab,
  onUpdateContext,
}) {
  const initialDraft = useMemo(() => ensureItineraryActivityIds(context?.itinerary), [context?.itinerary]);
  const [draftItinerary, setDraftItinerary] = useState(initialDraft);
  const [loadingKey, setLoadingKey] = useState('');
  const [editorState, setEditorState] = useState(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [surfaceError, setSurfaceError] = useState('');

  const placeMap = useMemo(() => buildPlaceMap(context?.candidatePlaces || []), [context?.candidatePlaces]);
  const itineraryTripId = String(context?.tripId || context?.groupId || '').trim();
  const chatGroupId = String(context?.groupId || '').trim();

  useEffect(() => {
    setDraftItinerary(ensureItineraryActivityIds(context?.itinerary));
  }, [context?.itinerary]);

  const syncDraft = (nextDraft) => {
    const normalized = ensureItineraryActivityIds(recalculateDraftTotals(nextDraft));
    setDraftItinerary(normalized);
    return normalized;
  };

  const handleOpenEditor = (dayNumber, activity) => {
    setEditorState({ dayNumber, activity });
    setEditorVisible(true);
  };

  const handleSaveEditor = (updatedActivity) => {
    const nextDraft = updateActivityInDraft(
      draftItinerary,
      editorState.dayNumber,
      editorState.activity.activityId,
      updatedActivity
    );
    syncDraft(nextDraft);
    setEditorVisible(false);
  };

  const handleRegenerateAll = async () => {
    setLoadingKey('regenerate-all');
    setSurfaceError('');
    try {
      const result = await regenerateAIItinerary(ownerId, itineraryTripId, {
        groupId: chatGroupId,
        currentItinerary: draftItinerary,
        input: context.input,
      });
      const nextDraft = ensureItineraryActivityIds(result.itinerary);
      setDraftItinerary(nextDraft);
      onUpdateContext?.({
        ...context,
        requestId: result.requestId,
        itinerary: nextDraft,
        input: result.input,
        candidatePlaces: result.candidatePlaces || [],
        warnings: result.warnings || [],
      });
    } catch (error) {
      const message = error.response?.data?.details?.[0]
        || error.response?.data?.message
        || 'Không thể tạo lại toàn bộ lịch trình.';
      setSurfaceError(message);
      Alert.alert('AI không thể tạo lại', message);
    } finally {
      setLoadingKey('');
    }
  };

  const handleRegenerateDay = async (dayNumber) => {
    setLoadingKey(`day-${dayNumber}`);
    setSurfaceError('');
    try {
      const result = await regenerateAIItineraryDay(ownerId, itineraryTripId, dayNumber, {
        groupId: chatGroupId,
        currentItinerary: draftItinerary,
        input: context.input,
      });
      const nextDraft = ensureItineraryActivityIds(result.itinerary);
      setDraftItinerary(nextDraft);
      onUpdateContext?.({
        ...context,
        requestId: result.requestId,
        itinerary: nextDraft,
        input: result.input,
        candidatePlaces: result.candidatePlaces || [],
        warnings: result.warnings || [],
      });
    } catch (error) {
      const message = error.response?.data?.details?.[0]
        || error.response?.data?.message
        || 'Không thể tạo lại ngày này.';
      setSurfaceError(message);
      Alert.alert('AI không thể tạo lại ngày', message);
    } finally {
      setLoadingKey('');
    }
  };

  const handleOptimize = async () => {
    setLoadingKey('optimize');
    setSurfaceError('');
    try {
      const result = await optimizeAIItinerary(ownerId, itineraryTripId, {
        groupId: chatGroupId,
        currentItinerary: draftItinerary,
        input: context.input,
      });
      const nextDraft = ensureItineraryActivityIds(result.itinerary);
      setDraftItinerary(nextDraft);
      onUpdateContext?.({
        ...context,
        requestId: result.requestId,
        itinerary: nextDraft,
        input: result.input,
        candidatePlaces: result.candidatePlaces || [],
        warnings: result.warnings || [],
      });
    } catch (error) {
      const message = error.response?.data?.details?.[0]
        || error.response?.data?.message
        || 'Không thể tối ưu lịch trình vào lúc này.';
      setSurfaceError(message);
      Alert.alert('Tối ưu thất bại', message);
    } finally {
      setLoadingKey('');
    }
  };

  const handleSave = async () => {
    setLoadingKey('save');
    setSurfaceError('');
    try {
      const isUpdatingSavedTrip = Boolean(context?.savedTripId || context?.historyMode === 'saved');
      const saveHandler = isUpdatingSavedTrip ? updateSavedAIItinerary : saveAIItinerary;
      const saveTargetTripId = context?.savedTripId || itineraryTripId;

      const result = await saveHandler(ownerId, saveTargetTripId, {
        groupId: chatGroupId,
        requestId: context.requestId,
        input: context.input,
        itinerary: draftItinerary,
      });

      const savedTripId = String(result.tripId || saveTargetTripId || '').trim();
      const snapshot = buildChatGroupItinerarySnapshot({
        tripId: savedTripId || itineraryTripId,
        input: result.input,
        itinerary: result.itinerary,
      });

      if (chatGroupId) {
        await updateChatGroupWorkspace(chatGroupId, ownerId, {
          itinerary: snapshot,
          announcement: `AI itinerary đã được lưu cho nhóm ${context.groupName || ''}`.trim(),
        });
      }

      onUpdateContext?.({
        ...context,
        tripId: savedTripId || itineraryTripId,
        savedTripId: savedTripId || itineraryTripId,
        historyMode: 'saved',
        itinerary: result.itinerary || draftItinerary,
        input: result.input || context.input,
        candidatePlaces: context.candidatePlaces || [],
        warnings: context.warnings || [],
      });

      Alert.alert(
        isUpdatingSavedTrip ? 'Đã cập nhật lịch trình' : 'Đã lưu lịch trình',
        chatGroupId
          ? (isUpdatingSavedTrip
            ? 'Lịch trình AI đã được cập nhật trong chuyến đi hiện tại của nhóm.'
            : 'Lịch trình AI đã được lưu vào chuyến đi hiện tại của nhóm.')
          : (isUpdatingSavedTrip
            ? 'Lịch trình AI đã được cập nhật trong danh sách đã lưu.'
            : 'Lịch trình AI đã được lưu vào danh sách đã lưu.')
      );

      if (onNavigateToTab) {
        onNavigateToTab('aiTripPlanner', {
          ...context,
          groupId: chatGroupId || context?.groupId || '',
          tripId: savedTripId || itineraryTripId,
          savedTripId: savedTripId || itineraryTripId,
          origin: 'aiItineraryPreview',
        });
      } else {
        onBack?.();
      }
    } catch (error) {
      const message = error.response?.data?.details?.[0]
        || error.response?.data?.message
        || 'Không thể lưu lịch trình AI.';
      setSurfaceError(message);
      Alert.alert('Lưu thất bại', message);
    } finally {
      setLoadingKey('');
    }
  };

  const handleShare = async () => {
    setLoadingKey('share');
    try {
      if (!chatGroupId) {
        Alert.alert('Thiếu nhóm chat', 'Lịch trình này chưa gắn với nhóm chat để chia sẻ.');
        return;
      }
      await sendChatMessage(chatGroupId, ownerId, formatAIItineraryShareMessage(draftItinerary));
      Alert.alert('Đã chia sẻ', 'Lịch trình đã được chia sẻ vào nhóm chat.');
    } catch (error) {
      Alert.alert('Chia sẻ thất bại', error.response?.data?.message || 'Không thể chia sẻ lịch trình vào nhóm chat.');
    } finally {
      setLoadingKey('');
    }
  };

  const openMapForActivity = (activity) => {
    if (!activity?.placeName && !activity?.address) {
      Alert.alert('Thiếu địa điểm', 'Hoạt động này chưa có địa điểm để mở trên bản đồ.');
      return;
    }

    onNavigateToTab?.('map', {
      placeName: activity.placeName || activity.activityName,
      address: activity.address,
      latitude: activity.latitude,
      longitude: activity.longitude,
      source: 'ai-itinerary',
    });
  };

  if (!draftItinerary) {
    return (
      <View style={[styles.centerScreen, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Không có dữ liệu lịch trình để hiển thị.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable style={[styles.backBtn, { backgroundColor: theme.searchBg }]} onPress={onBack}>
          <ChevronLeft size={20} color={theme.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Xem trước lịch trình AI</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Xem, chỉnh sửa, thay thế hoạt động, tối ưu và lưu lịch trình AI vào chuyến đi hiện tại.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.summaryCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
          <View style={styles.summaryHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>
                {draftItinerary.tripTitle || context?.input?.destination || 'Lịch trình AI Vivu360'}
              </Text>
              <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
                {draftItinerary.summary || 'Chưa có mô tả tổng quan.'}
              </Text>
            </View>
            <Sparkles size={18} color="#3b82f6" />
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.metaBadge, { backgroundColor: theme.searchBg }]}>
              <CalendarDays size={14} color="#3b82f6" />
              <Text style={[styles.metaBadgeText, { color: theme.textPrimary }]}>{draftItinerary.days.length} ngày</Text>
            </View>
            <View style={[styles.metaBadge, { backgroundColor: theme.searchBg }]}>
              <Route size={14} color="#10b981" />
              <Text style={[styles.metaBadgeText, { color: theme.textPrimary }]}>
                {Number(draftItinerary.estimatedTotalCost || 0).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </View>

          {!!(context?.warnings || draftItinerary.warnings || []).length && (
            <View style={[styles.warningCard, { backgroundColor: isDarkMode ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)' }]}>
              {(context?.warnings || draftItinerary.warnings || []).slice(0, 3).map((warning) => (
                <Text key={warning} style={styles.warningText}>• {warning}</Text>
              ))}
            </View>
          )}

          <View style={styles.actionWrap}>
            {[
              { key: 'regenerate-all', label: 'Tạo lại toàn bộ', icon: <RefreshCw size={16} color="#fff" />, onPress: handleRegenerateAll },
              { key: 'optimize', label: 'Tối ưu thời gian', icon: <Route size={16} color="#fff" />, onPress: handleOptimize },
              { key: 'save', label: 'Lưu lịch trình', icon: <Save size={16} color="#fff" />, onPress: handleSave },
              { key: 'share', label: 'Chia sẻ vào nhóm chat', icon: <Send size={16} color="#fff" />, onPress: handleShare },
            ].map((action) => (
              <Pressable key={action.key} style={styles.actionBtnShell} onPress={action.onPress} disabled={loadingKey === action.key}>
                <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.actionBtn}>
                  {loadingKey === action.key ? <ActivityIndicator color="#fff" /> : action.icon}
                  <Text style={styles.actionBtnText}>{action.label}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </View>

        {!!surfaceError && (
          <View style={[styles.warningCard, { backgroundColor: isDarkMode ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)' }]}>
            <Text style={[styles.warningText, { color: '#ef4444' }]}>{surfaceError}</Text>
          </View>
        )}

        {draftItinerary.days.map((day) => (
          <View key={`${day.dayNumber}-${day.date}`} style={[styles.dayCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
            <View style={styles.dayHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dayTitle, { color: theme.textPrimary }]}>{day.title || `Ngày ${day.dayNumber}`}</Text>
                <Text style={[styles.dayDate, { color: theme.textSecondary }]}>
                  {day.date} • {Number(day.estimatedCost || 0).toLocaleString('vi-VN')}đ
                </Text>
              </View>
              <Pressable
                style={[styles.regenerateDayBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}
                onPress={() => handleRegenerateDay(day.dayNumber)}
                disabled={loadingKey === `day-${day.dayNumber}`}
              >
                {loadingKey === `day-${day.dayNumber}`
                  ? <ActivityIndicator size="small" color="#3b82f6" />
                  : <RefreshCw size={14} color="#3b82f6" />}
                <Text style={styles.regenerateDayText}>Tạo lại ngày này</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.inlineAddBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}
              onPress={() => syncDraft(addActivityToDraftDay(draftItinerary, day.dayNumber))}
            >
              <Plus size={14} color="#3b82f6" />
              <Text style={[styles.inlineAddText, { color: theme.textPrimary }]}>Thêm hoạt động</Text>
            </Pressable>

            {(day.activities || []).map((activity) => {
              const place = activity.placeId ? placeMap.get(String(activity.placeId)) : null;
              const hideCost = shouldHideActivityCost(activity);

              return (
                <View key={activity.activityId} style={[styles.activityCard, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
                  <View style={styles.activityTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                        {activity.startTime} - {activity.endTime}
                      </Text>
                      <Text style={[styles.activityTitle, { color: theme.textPrimary }]}>{activity.activityName}</Text>
                      <Text style={[styles.activityMeta, { color: theme.textSecondary }]}>
                        {activity.placeName || activity.address || 'Không gắn địa điểm'} • {activity.activityType}
                      </Text>
                    </View>
                    {place?.images?.[0] ? (
                      <Image source={getSafeImageSource(place.images[0] || '')} style={styles.activityImage} />
                    ) : null}
                  </View>

                  {!!activity.reason && (
                    <Text style={[styles.reasonText, { color: theme.textSecondary }]}>{activity.reason}</Text>
                  )}

                  <View style={styles.activityStats}>
                    {!hideCost ? (
                      <Text style={[styles.activityStatText, { color: theme.textSecondary }]}>
                        Chi phí: {Number(activity.estimatedCost || 0).toLocaleString('vi-VN')}đ
                      </Text>
                    ) : null}
                    <Text style={[styles.activityStatText, { color: theme.textSecondary }]}>
                      Di chuyển: {activity.travelTimeMinutes || 0} phút • {activity.transportType || 'mixed'}
                    </Text>
                  </View>

                  <View style={styles.activityActionRow}>
                    <Pressable style={styles.iconBtn} onPress={() => handleOpenEditor(day.dayNumber, activity)}>
                      <Edit3 size={16} color="#3b82f6" />
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => syncDraft(deleteActivityFromDraft(draftItinerary, day.dayNumber, activity.activityId))}>
                      <Trash2 size={16} color="#ef4444" />
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => syncDraft(moveActivityInDraft(draftItinerary, day.dayNumber, activity.activityId, 'up'))}>
                      <ArrowUp size={16} color={theme.textPrimary} />
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => syncDraft(moveActivityInDraft(draftItinerary, day.dayNumber, activity.activityId, 'down'))}>
                      <ArrowDown size={16} color={theme.textPrimary} />
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => openMapForActivity(activity)}>
                      <MapPinned size={16} color="#10b981" />
                    </Pressable>
                    <Pressable
                      style={[styles.replaceBtn, { backgroundColor: isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)' }]}
                      onPress={() => onOpenReplaceActivity({
                        ...context,
                        itinerary: draftItinerary,
                        activity,
                      })}
                    >
                      <Text style={styles.replaceBtnText}>Thay thế hoạt động</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <ActivityEditorModal
        visible={editorVisible}
        theme={theme}
        draft={editorState?.activity}
        onClose={() => setEditorVisible(false)}
        onSave={handleSaveEditor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  content: { padding: 18, paddingBottom: 42, gap: 14 },
  summaryCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 14 },
  summaryHeader: { flexDirection: 'row', gap: 10 },
  summaryTitle: { fontSize: 17, fontWeight: '800' },
  summaryText: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },
  metaBadgeText: { fontSize: 12, fontWeight: '700' },
  warningCard: { borderRadius: 14, padding: 12 },
  warningText: { color: '#f59e0b', fontWeight: '700', lineHeight: 18 },
  actionWrap: { gap: 10 },
  actionBtnShell: { width: '100%' },
  actionBtn: { minHeight: 48, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12 },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  dayCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  dayHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  dayTitle: { fontSize: 16, fontWeight: '800' },
  dayDate: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  regenerateDayBtn: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  regenerateDayText: { color: '#3b82f6', fontWeight: '700', fontSize: 12 },
  inlineAddBtn: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  inlineAddText: { fontSize: 13, fontWeight: '700' },
  activityCard: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 10 },
  activityTopRow: { flexDirection: 'row', gap: 12 },
  activityImage: { width: 64, height: 64, borderRadius: 14 },
  activityTime: { fontSize: 12, fontWeight: '700' },
  activityTitle: { fontSize: 15, fontWeight: '800', marginTop: 3 },
  activityMeta: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  reasonText: { fontSize: 13, lineHeight: 18 },
  activityStats: { gap: 4 },
  activityStatText: { fontSize: 12 },
  activityActionRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  replaceBtn: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14 },
  replaceBtnText: { color: '#3b82f6', fontWeight: '800', fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { borderWidth: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, maxHeight: '88%' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  modalLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  modalInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14 },
  modalActionRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  modalAction: { flex: 1, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modalActionText: { fontWeight: '800', fontSize: 14 },
});
