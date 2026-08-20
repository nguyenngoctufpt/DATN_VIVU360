import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, ChevronLeft, Clock3, Edit3, MapPinned, RefreshCw, Route, Search, Sparkles, Trash2, X } from 'lucide-react-native';
import {
  deleteSavedAIItinerary,
  generateAIItinerary,
  getSavedAIItinerary,
  getSavedAIItineraries,
} from '../../services/aiItineraryService';
import { createPlannerInitialInput, parseFormToPayload } from '../../utils/aiItinerary';
import { VIETNAM_DESTINATION_OPTIONS, normalizeDestinationText } from '../../utils/vietnamDestinations';

const INTEREST_OPTIONS = ['nature', 'food', 'culture', 'history', 'photography', 'shopping', 'entertainment', 'beach', 'adventure', 'family'];
const TRANSPORT_OPTIONS = ['walking', 'motorbike', 'car', 'taxi', 'bus', 'mixed'];
const PACE_OPTIONS = ['relaxed', 'normal', 'intensive'];

const OPTION_LABELS = {
  nature: 'Thiên nhiên',
  food: 'Ẩm thực',
  culture: 'Văn hóa',
  history: 'Lịch sử',
  photography: 'Chụp ảnh',
  shopping: 'Mua sắm',
  entertainment: 'Giải trí',
  beach: 'Biển',
  adventure: 'Phiêu lưu',
  family: 'Gia đình',
  walking: 'Đi bộ',
  motorbike: 'Xe máy',
  car: 'Ô tô',
  taxi: 'Taxi',
  bus: 'Xe buýt',
  mixed: 'Kết hợp',
  relaxed: 'Thư giãn',
  normal: 'Cân bằng',
  intensive: 'Dày lịch',
};

function ChipSelector({ options, value, onChange, multi = false, theme, isDarkMode }) {
  return (
    <View style={styles.chipWrap}>
      {options.map((option) => {
        const selected = multi ? value.includes(option) : value === option;
        return (
          <Pressable
            key={option}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? 'rgba(59,130,246,0.16)' : theme.searchBg,
                borderColor: selected ? '#3b82f6' : theme.searchBorder,
              },
            ]}
            onPress={() => {
              if (!multi) {
                onChange(option);
                return;
              }

              onChange(
                selected
                  ? value.filter((item) => item !== option)
                  : [...value, option]
              );
            }}
          >
            <Text style={[styles.chipText, { color: selected ? '#3b82f6' : (isDarkMode ? '#dbeafe' : theme.textSecondary) }]}>
              {OPTION_LABELS[option] || option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Field({ label, value, onChangeText, theme, placeholder, keyboardType = 'default', multiline = false }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          {
            color: theme.textPrimary,
            backgroundColor: theme.searchBg,
            borderColor: theme.searchBorder,
            minHeight: multiline ? 88 : 48,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
    </View>
  );
}

function DestinationPickerModal({
  visible,
  value,
  searchValue,
  onSearchChange,
  onSelect,
  onClose,
  options,
  theme,
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.destinationModalCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
          <View style={styles.destinationModalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.destinationModalTitle, { color: theme.textPrimary }]}>Chọn điểm đến</Text>
              <Text style={[styles.destinationModalSubtitle, { color: theme.textSecondary }]}>
                Danh sách gồm 34 tỉnh/thành cấp tỉnh hiện hành của Việt Nam.
              </Text>
            </View>
            <Pressable style={[styles.destinationCloseBtn, { backgroundColor: theme.searchBg }]} onPress={onClose}>
              <X size={18} color={theme.textPrimary} />
            </Pressable>
          </View>

          <View style={[styles.destinationSearchBox, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
            <Search size={16} color={theme.textMuted} />
            <TextInput
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder="Tìm tỉnh hoặc thành phố"
              placeholderTextColor={theme.textMuted}
              style={[styles.destinationSearchInput, { color: theme.textPrimary }]}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.destinationList}>
            {options.length ? options.map((item) => {
              const selected = value === item.value;
              return (
                <Pressable
                  key={item.value}
                  style={[
                    styles.destinationItem,
                    {
                      backgroundColor: selected ? 'rgba(59,130,246,0.16)' : theme.searchBg,
                      borderColor: selected ? '#3b82f6' : theme.searchBorder,
                    },
                  ]}
                  onPress={() => onSelect(item.value)}
                >
                  <Text style={[styles.destinationItemText, { color: selected ? '#3b82f6' : theme.textPrimary }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            }) : (
              <View style={[styles.emptyDestinationState, { borderColor: theme.searchBorder }]}>
                <Text style={[styles.emptyDestinationText, { color: theme.textSecondary }]}>
                  Không tìm thấy tỉnh/thành phù hợp với từ khóa này.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function formatSavedUpdatedAt(value) {
  if (!value) return '';

  try {
    return new Date(value).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '';
  }
}

export function AITripPlannerScreen({
  theme,
  isDarkMode,
  ownerId,
  currentUser,
  context,
  userSettings,
  onBack,
  onNavigateToPreview,
}) {
  const initialInput = useMemo(() => {
    const nextInput = createPlannerInitialInput(context);
    const savedInput = context?.savedSnapshot?.input || context?.itinerary?.input || {};
    const savedInterests = Array.isArray(savedInput.interests)
      ? savedInput.interests
      : String(savedInput.interests || '').trim();
    const hasSavedInterests = Array.isArray(savedInterests) ? savedInterests.length > 0 : Boolean(savedInterests);
    const hasSavedPace = Boolean(savedInput.travelPace);
    const aiSettingsEnabled = userSettings?.aiRecommendations?.enabled !== false;
    const preferredInterests = Array.isArray(userSettings?.travelPreferences)
      ? userSettings.travelPreferences.filter((item) => INTEREST_OPTIONS.includes(item))
      : [];
    const preferredPace = PACE_OPTIONS.includes(userSettings?.aiRecommendations?.pace)
      ? userSettings.aiRecommendations.pace
      : 'normal';

    if (aiSettingsEnabled) {
      if (!hasSavedInterests && preferredInterests.length) {
        nextInput.interests = preferredInterests;
      }
      if (!hasSavedPace) {
        nextInput.travelPace = preferredPace;
      }
    }

    return nextInput;
  }, [context, userSettings]);
  const [form, setForm] = useState(initialInput);
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [destinationPickerVisible, setDestinationPickerVisible] = useState(false);
  const [destinationKeyword, setDestinationKeyword] = useState('');
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState('');
  const [savedActionKey, setSavedActionKey] = useState('');
  const recentSavedTripId = String(context?.savedTripId || '').trim();
  const recentSavedItem = recentSavedTripId
    ? savedItineraries.find((item) => String(item.tripId) === recentSavedTripId)
    : null;

  const filteredDestinations = useMemo(() => {
    const keyword = normalizeDestinationText(destinationKeyword);
    if (!keyword) return VIETNAM_DESTINATION_OPTIONS;

    return VIETNAM_DESTINATION_OPTIONS.filter((item) => (
      normalizeDestinationText(item.label).includes(keyword)
    ));
  }, [destinationKeyword]);

  useEffect(() => {
    setForm(initialInput);
  }, [initialInput]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadSavedItineraries = async () => {
    if (!ownerId) {
      setSavedItineraries([]);
      setSavedError('');
      return;
    }

    setSavedLoading(true);
    setSavedError('');

    try {
      const items = await getSavedAIItineraries(ownerId, { groupId: context?.groupId || '' });
      setSavedItineraries(Array.isArray(items) ? items : []);
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể tải danh sách lịch trình đã lưu.';
      setSavedError(message);
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!ownerId) {
        if (active) {
          setSavedItineraries([]);
          setSavedError('');
          setSavedLoading(false);
        }
        return;
      }

      if (active) {
        setSavedLoading(true);
        setSavedError('');
      }

      try {
        const items = await getSavedAIItineraries(ownerId, { groupId: context?.groupId || '' });
        if (!active) return;
        setSavedItineraries(Array.isArray(items) ? items : []);
      } catch (error) {
        if (!active) return;
        const message = error.response?.data?.message || 'Không thể tải danh sách lịch trình đã lưu.';
        setSavedError(message);
      } finally {
        if (active) setSavedLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [ownerId, context?.groupId]);

  const handleOpenSavedItinerary = async (item) => {
    if (!item?.tripId) return;

    setSavedActionKey(`open:${item.tripId}`);
    setSavedError('');

    try {
      const detail = await getSavedAIItinerary(ownerId, item.tripId, { groupId: item.groupId || context?.groupId || '' });
      onNavigateToPreview({
        ...context,
        ...detail,
        tripId: item.tripId,
        groupId: item.groupId || context?.groupId || '',
        savedTripId: item.tripId,
        groupName: context?.groupName || '',
        itinerary: detail.itinerary,
        input: detail.input,
        candidatePlaces: detail.candidatePlaces || [],
        warnings: detail.warnings || [],
        historyMode: 'saved',
        origin: 'aiTripPlanner',
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể mở lịch trình đã lưu.';
      setSavedError(message);
      Alert.alert('Không thể mở lịch trình', message);
    } finally {
      setSavedActionKey('');
    }
  };

  const handleDeleteSavedItinerary = (item) => {
    if (!item?.tripId) return;

    Alert.alert(
      'Xóa lịch trình đã lưu',
      `Bạn có chắc muốn xóa lịch trình "${item.title || item.destination || item.tripId}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setSavedActionKey(`delete:${item.tripId}`);
            setSavedError('');
            try {
              await deleteSavedAIItinerary(ownerId, item.tripId, { groupId: item.groupId || context?.groupId || '' });
              setSavedItineraries((prev) => prev.filter((savedItem) => savedItem.tripId !== item.tripId));
              Alert.alert('Đã xóa', 'Lịch trình đã được xóa khỏi danh sách đã lưu.');
            } catch (error) {
              const message = error.response?.data?.message || 'Không thể xóa lịch trình đã lưu.';
              setSavedError(message);
              Alert.alert('Xóa thất bại', message);
            } finally {
              setSavedActionKey('');
            }
          },
        },
      ]
    );
  };

  const validateBeforeSubmit = () => {
    const payload = parseFormToPayload(form);

    if (!payload.destination) return 'Điểm đến là bắt buộc.';
    if (payload.endDate < payload.startDate) return 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu.';
    if (payload.dailyEndTime <= payload.dailyStartTime) return 'Giờ kết thúc trong ngày phải lớn hơn giờ bắt đầu.';
    if (payload.numberOfPeople <= 0) return 'Số người phải lớn hơn 0.';
    if (payload.totalBudget < 0) return 'Ngân sách không được âm.';

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setGenerating(true);
    setErrorMessage('');

    try {
      const payload = parseFormToPayload(form);
      if (userSettings?.aiRecommendations?.enabled !== false) {
        const aiNotes = [];
        if (userSettings?.aiRecommendations?.keepBudget && Number(payload.totalBudget || 0) > 0) {
          aiNotes.push('Ưu tiên giữ tổng chi phí gần với ngân sách đã đặt.');
        }
        if (userSettings?.aiRecommendations?.hiddenGems) {
          aiNotes.push('Gợi ý thêm các điểm đến độc đáo hoặc ít đông hơn nếu phù hợp.');
        }
        if (aiNotes.length) {
          payload.additionalRequest = [payload.additionalRequest, ...aiNotes].filter(Boolean).join(' ');
        }
      }
      const response = await generateAIItinerary(ownerId, payload);
      onNavigateToPreview({
        ...context,
        tripId: payload.tripId,
        groupId: payload.groupId,
        savedTripId: '',
        groupName: context?.groupName || '',
        requestId: response.requestId,
        itinerary: response.itinerary,
        input: response.input,
        candidatePlaces: response.candidatePlaces || [],
        warnings: response.warnings || [],
        historyMode: 'generate',
        origin: 'aiTripPlanner',
      });
    } catch (error) {
      const message = error.response?.data?.details?.[0]
        || error.response?.data?.message
        || 'Không thể tạo lịch trình. Vui lòng thay đổi yêu cầu và thử lại.';
      setErrorMessage(message);
      Alert.alert('Tạo lịch trình thất bại', message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable style={[styles.backBtn, { backgroundColor: theme.searchBg }]} onPress={onBack}>
          <ChevronLeft size={20} color={theme.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Lập lịch trình AI</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            AI sẽ gợi ý lịch trình theo từng khung giờ trong ngày cho nhóm {context?.groupName || currentUser?.name || 'Vivu360'}.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
          <View style={styles.heroTitleRow}>
            <Sparkles size={18} color="#3b82f6" />
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>AI hỗ trợ tạo lịch trình theo giờ</Text>
          </View>
          <Text style={[styles.heroText, { color: theme.textSecondary }]}>
            {generating
              ? 'AI đang xây dựng lịch trình phù hợp cho bạn...'
              : 'AI sẽ bám theo điểm đến, sở thích, ngân sách và nhịp độ chuyến đi để gợi ý lịch trình chi tiết.'}
          </Text>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Điểm đến</Text>
          <Pressable
            style={[styles.selectorInput, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}
            onPress={() => setDestinationPickerVisible(true)}
          >
            <View style={styles.selectorValueWrap}>
              <MapPinned size={16} color="#3b82f6" />
              <Text style={[styles.selectorValue, { color: form.destination ? theme.textPrimary : theme.textMuted }]}>
                {form.destination || 'Chọn tỉnh hoặc thành phố'}
              </Text>
            </View>
            <Text style={styles.selectorAction}>Chọn</Text>
          </Pressable>
          <Text style={[styles.helperText, { color: theme.textSecondary }]}>
            AI sẽ chỉ gợi ý địa điểm nằm trong tỉnh/thành bạn đã chọn.
          </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Field label="Ngày bắt đầu" value={form.startDate} onChangeText={(value) => updateField('startDate', value)} placeholder="YYYY-MM-DD" theme={theme} />
          </View>
          <View style={styles.half}>
            <Field label="Ngày kết thúc" value={form.endDate} onChangeText={(value) => updateField('endDate', value)} placeholder="YYYY-MM-DD" theme={theme} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Field label="Giờ bắt đầu mỗi ngày" value={form.dailyStartTime} onChangeText={(value) => updateField('dailyStartTime', value)} placeholder="07:00" theme={theme} />
          </View>
          <View style={styles.half}>
            <Field label="Giờ kết thúc mỗi ngày" value={form.dailyEndTime} onChangeText={(value) => updateField('dailyEndTime', value)} placeholder="22:00" theme={theme} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Field label="Số người tham gia" value={form.numberOfPeople} onChangeText={(value) => updateField('numberOfPeople', value)} placeholder="2" keyboardType="numeric" theme={theme} />
          </View>
          <View style={styles.half}>
            <Field label="Tổng ngân sách" value={form.totalBudget} onChangeText={(value) => updateField('totalBudget', value)} placeholder="12000000" keyboardType="numeric" theme={theme} />
          </View>
        </View>

        <Field label="Địa chỉ nơi lưu trú" value={form.accommodationAddress} onChangeText={(value) => updateField('accommodationAddress', value)} placeholder="Ví dụ: Biển Mỹ Khê" theme={theme} />

        <View style={[styles.sectionCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Route size={16} color="#3b82f6" />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Phương tiện di chuyển</Text>
          </View>
          <ChipSelector options={TRANSPORT_OPTIONS} value={form.transportType} onChange={(value) => updateField('transportType', value)} theme={theme} isDarkMode={isDarkMode} />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <CalendarDays size={16} color="#10b981" />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Nhịp độ chuyến đi</Text>
          </View>
          <ChipSelector options={PACE_OPTIONS} value={form.travelPace} onChange={(value) => updateField('travelPace', value)} theme={theme} isDarkMode={isDarkMode} />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <MapPinned size={16} color="#f59e0b" />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Sở thích</Text>
          </View>
          <ChipSelector options={INTEREST_OPTIONS} value={form.interests} onChange={(value) => updateField('interests', value)} multi theme={theme} isDarkMode={isDarkMode} />
        </View>

        <Field
          label="Địa điểm muốn đi"
          value={form.preferredPlaces.join(', ')}
          onChangeText={(value) => updateField('preferredPlaces', value.split(',').map((item) => item.trim()).filter(Boolean))}
          placeholder="Ví dụ: Bà Nà Hills, Cầu Rồng"
          theme={theme}
        />
        <Field
          label="Địa điểm không muốn đi"
          value={form.excludedPlaces.join(', ')}
          onChangeText={(value) => updateField('excludedPlaces', value.split(',').map((item) => item.trim()).filter(Boolean))}
          placeholder="Nhập các địa điểm cần loại trừ"
          theme={theme}
        />
        <Field
          label="Sở thích ăn uống"
          value={form.foodPreferences.join(', ')}
          onChangeText={(value) => updateField('foodPreferences', value.split(',').map((item) => item.trim()).filter(Boolean))}
          placeholder="Ví dụ: Hải sản, ăn chay, cà phê"
          theme={theme}
        />
        <Field
          label="Yêu cầu bổ sung"
          value={form.additionalRequest}
          onChangeText={(value) => updateField('additionalRequest', value)}
          placeholder="Ví dụ: ưu tiên điểm gần nhau, ít đông người"
          theme={theme}
          multiline
        />

        {!!errorMessage && (
          <View style={[styles.errorCard, { backgroundColor: isDarkMode ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)' }]}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={[styles.savedCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
          <View style={styles.savedHeaderRow}>
            <View style={styles.savedHeaderTitleWrap}>
              <Clock3 size={16} color="#8b5cf6" />
              <Text style={[styles.savedHeaderTitle, { color: theme.textPrimary }]}>Lịch trình đã lưu</Text>
            </View>
            <Pressable
              style={[styles.savedRefreshBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}
              onPress={loadSavedItineraries}
              disabled={savedLoading}
            >
              {savedLoading ? <ActivityIndicator size="small" color="#8b5cf6" /> : <RefreshCw size={14} color="#8b5cf6" />}
              <Text style={[styles.savedRefreshText, { color: theme.textPrimary }]}>Tải lại</Text>
            </Pressable>
          </View>

          {!!savedError && (
            <View style={[styles.savedInlineError, { backgroundColor: isDarkMode ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)' }]}>
              <Text style={styles.errorText}>{savedError}</Text>
            </View>
          )}

          {!!recentSavedTripId && (
            <View style={[styles.savedRecentBanner, { backgroundColor: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.28)' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.savedRecentTitle, { color: theme.textPrimary }]}>
                  Lịch trình vừa lưu
                </Text>
                <Text style={[styles.savedRecentText, { color: theme.textSecondary }]}>
                  {recentSavedItem
                    ? `${recentSavedItem.title || recentSavedItem.destination || recentSavedItem.tripId} đã xuất hiện trong danh sách bên dưới.`
                    : 'Lịch trình vừa lưu đã được đưa vào danh sách đã lưu và sẽ hiển thị bên dưới sau khi tải xong.'}
                </Text>
              </View>
              {!!recentSavedItem && (
                <Pressable
                  style={[styles.savedRecentBtn, { backgroundColor: '#3b82f6' }]}
                  onPress={() => handleOpenSavedItinerary(recentSavedItem)}
                  disabled={savedActionKey === `open:${recentSavedItem.tripId}`}
                >
                  <Text style={styles.savedRecentBtnText}>Xem ngay</Text>
                </Pressable>
              )}
            </View>
          )}

          {savedLoading ? (
            <View style={styles.savedLoadingWrap}>
              <ActivityIndicator color="#8b5cf6" />
              <Text style={[styles.savedLoadingText, { color: theme.textSecondary }]}>Đang tải lịch trình đã lưu...</Text>
            </View>
          ) : savedItineraries.length ? (
            <View style={styles.savedList}>
              {savedItineraries.map((item) => {
                const openKey = `open:${item.tripId}`;
                const deleteKey = `delete:${item.tripId}`;
                const isOpenLoading = savedActionKey === openKey;
                const isDeleteLoading = savedActionKey === deleteKey;
                const displayTitle = item.title || item.destination || item.tripId;
                const dateRange = [item.startDate, item.endDate].filter(Boolean).join(' - ');
                const updatedLabel = formatSavedUpdatedAt(item.updatedAt);
                const isRecentSavedItem = recentSavedTripId && recentSavedTripId === String(item.tripId);

                return (
                  <View
                    key={item.tripId}
                    style={[
                      styles.savedItemCard,
                      {
                        backgroundColor: theme.searchBg,
                        borderColor: isRecentSavedItem ? '#3b82f6' : theme.searchBorder,
                        shadowColor: isRecentSavedItem ? '#3b82f6' : 'transparent',
                      },
                    ]}
                  >
                    <View style={styles.savedItemTopRow}>
                      <View style={{ flex: 1 }}>
                        {isRecentSavedItem && (
                          <View style={[styles.savedNewBadge, { backgroundColor: 'rgba(59,130,246,0.16)' }]}>
                            <Text style={styles.savedNewBadgeText}>Vừa lưu</Text>
                          </View>
                        )}
                        <Text style={[styles.savedItemTitle, { color: theme.textPrimary }]}>{displayTitle}</Text>
                        <Text style={[styles.savedItemSubtitle, { color: theme.textSecondary }]}>
                          {item.destination || 'Chưa có điểm đến'}{dateRange ? ` • ${dateRange}` : ''}
                        </Text>
                        <Text style={[styles.savedItemSummary, { color: theme.textSecondary }]} numberOfLines={2}>
                          {item.summary || 'Chưa có mô tả cho lịch trình đã lưu.'}
                        </Text>
                      </View>
                      <View style={styles.savedCostPill}>
                        <Text style={styles.savedCostText}>
                          {Number(item.estimatedTotalCost || 0).toLocaleString('vi-VN')}đ
                        </Text>
                      </View>
                    </View>

                    <View style={styles.savedMetaRow}>
                      <Text style={[styles.savedMetaText, { color: theme.textMuted }]}>
                        {item.daysCount || 0} ngày
                      </Text>
                      {!!updatedLabel && (
                        <Text style={[styles.savedMetaText, { color: theme.textMuted }]}>
                          Cập nhật: {updatedLabel}
                        </Text>
                      )}
                    </View>

                    <View style={styles.savedActionRow}>
                      <Pressable
                        style={[styles.savedActionBtn, { backgroundColor: 'rgba(59,130,246,0.14)', borderColor: 'rgba(59,130,246,0.22)' }]}
                        onPress={() => handleOpenSavedItinerary(item)}
                        disabled={isOpenLoading || isDeleteLoading}
                      >
                        {isOpenLoading ? <ActivityIndicator size="small" color="#3b82f6" /> : <Edit3 size={14} color="#3b82f6" />}
                        <Text style={styles.savedActionText}>Sửa</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.savedActionBtn, { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.2)' }]}
                        onPress={() => handleDeleteSavedItinerary(item)}
                        disabled={isOpenLoading || isDeleteLoading}
                      >
                        {isDeleteLoading ? <ActivityIndicator size="small" color="#ef4444" /> : <Trash2 size={14} color="#ef4444" />}
                        <Text style={[styles.savedActionText, { color: '#ef4444' }]}>Xóa</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.savedEmptyWrap}>
              <Text style={[styles.savedEmptyTitle, { color: theme.textPrimary }]}>Chưa có lịch trình nào được lưu</Text>
              <Text style={[styles.savedEmptyText, { color: theme.textSecondary }]}>
                Khi bạn lưu một lịch trình AI, nó sẽ xuất hiện tại đây để bạn mở lại, chỉnh sửa hoặc xóa.
              </Text>
            </View>
          )}
        </View>

        <Pressable onPress={handleSubmit} disabled={generating}>
          <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.submitBtn}>
            {generating ? <ActivityIndicator color="#fff" /> : <Sparkles size={18} color="#fff" />}
            <Text style={styles.submitBtnText}>
              {generating ? 'Đang tạo lịch trình AI...' : 'Tạo lịch trình bằng AI'}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>

      <DestinationPickerModal
        visible={destinationPickerVisible}
        value={form.destination}
        searchValue={destinationKeyword}
        onSearchChange={setDestinationKeyword}
        onSelect={(value) => {
          updateField('destination', value);
          setDestinationKeyword('');
          setDestinationPickerVisible(false);
        }}
        onClose={() => {
          setDestinationKeyword('');
          setDestinationPickerVisible(false);
        }}
        options={filteredDestinations}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  content: { padding: 18, paddingBottom: 36, gap: 14 },
  heroCard: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 8 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroTitle: { fontSize: 15, fontWeight: '800' },
  heroText: { fontSize: 13, lineHeight: 19 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  fieldBlock: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  selectorInput: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  selectorValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  selectorValue: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  selectorAction: { color: '#3b82f6', fontSize: 13, fontWeight: '800' },
  helperText: { fontSize: 12, lineHeight: 18 },
  sectionCard: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderRadius: 999 },
  chipText: { fontSize: 13, fontWeight: '700' },
  errorCard: { borderRadius: 14, padding: 12 },
  errorText: { color: '#ef4444', fontWeight: '700', lineHeight: 19 },
  savedCard: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 12 },
  savedHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  savedHeaderTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  savedHeaderTitle: { fontSize: 14, fontWeight: '800' },
  savedRefreshBtn: {
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 36,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  savedRefreshText: { fontSize: 12, fontWeight: '800' },
  savedInlineError: { borderRadius: 14, padding: 10 },
  savedRecentBanner: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  savedRecentTitle: { fontSize: 13, fontWeight: '800' },
  savedRecentText: { fontSize: 12, lineHeight: 17, marginTop: 3 },
  savedRecentBtn: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedRecentBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  savedLoadingWrap: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  savedLoadingText: { fontSize: 12, fontWeight: '600' },
  savedList: { gap: 10 },
  savedItemCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  savedItemTopRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  savedItemTitle: { fontSize: 15, fontWeight: '800' },
  savedItemSubtitle: { fontSize: 12, fontWeight: '700', marginTop: 4, lineHeight: 17 },
  savedItemSummary: { fontSize: 12, lineHeight: 17, marginTop: 6 },
  savedNewBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 6,
  },
  savedNewBadgeText: { color: '#3b82f6', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.2 },
  savedCostPill: {
    minWidth: 90,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(16,185,129,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedCostText: { color: '#10b981', fontSize: 12, fontWeight: '800' },
  savedMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  savedMetaText: { fontSize: 11.5, fontWeight: '600' },
  savedActionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  savedActionBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedActionText: { fontSize: 12, fontWeight: '800', color: '#3b82f6' },
  savedEmptyWrap: { paddingVertical: 8, gap: 8 },
  savedEmptyTitle: { fontSize: 14, fontWeight: '800' },
  savedEmptyText: { fontSize: 12, lineHeight: 18 },
  submitBtn: { height: 54, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  destinationModalCard: { borderWidth: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, maxHeight: '88%' },
  destinationModalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  destinationModalTitle: { fontSize: 18, fontWeight: '800' },
  destinationModalSubtitle: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  destinationCloseBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  destinationSearchBox: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  destinationSearchInput: { flex: 1, minHeight: 46, fontSize: 14 },
  destinationList: { gap: 10, paddingBottom: 12 },
  destinationItem: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13 },
  destinationItemText: { fontSize: 14, fontWeight: '700' },
  emptyDestinationState: { borderWidth: 1, borderRadius: 14, padding: 16 },
  emptyDestinationText: { fontSize: 13, lineHeight: 19 },
});
