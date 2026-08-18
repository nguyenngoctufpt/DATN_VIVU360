// Expo Metro Cache Purged & Synchronized: 2026-08-03T22:36:15
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
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, X, Clock, CalendarDays, MapPin, Compass, Camera, Coffee, Mountain, ChevronDown, Check } from 'lucide-react-native';

const { height } = Dimensions.get('window');

const TRAVEL_STYLES = [
  { id: 'photo', name: 'Check-in 📸' },
  { id: 'phuot', name: 'Phượt 🎒' },
  { id: 'relax', name: 'Nghỉ dưỡng 🏖️' },
  { id: 'food', name: 'Food Tour 🍜' },
];

const BUDGET_OPTIONS = [
  { id: 'budget', name: 'Tiết kiệm 💵' },
  { id: 'standard', name: 'Tiêu chuẩn 💳' },
  { id: 'vip', name: 'Sang trọng 👑' },
];

const formatVietnameseDate = (isoStr) => {
  if (!isoStr) return '';
  const parts = String(isoStr).split('-');
  if (parts.length === 3) {
    return `Ngày ${parts[2]} Tháng ${parts[1]} Năm ${parts[0]}`;
  }
  return isoStr;
};

const getTodayIso = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const shiftIsoDate = (isoStr, days) => {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    d.setDate(d.getDate() + Number(days));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (e) {
    return isoStr;
  }
};

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
  selectedStyleId = 'photo',
  setSelectedStyleId,
  selectedBudgetId = 'standard',
  setSelectedBudgetId,
  isGeneratingPlan,
  TRAVEL_DESTINATIONS,
  onSubmit,
  onNavigateToMapWithPlace,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calMonth, setCalMonth] = useState(8);
  const [calYear, setCalYear] = useState(2026);
  const activeDest = (TRAVEL_DESTINATIONS || []).find(d => d.id === selectedDestinationId) || (TRAVEL_DESTINATIONS || [])[0];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.cardGlass, borderColor: theme.border, height: 580 }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={18} color="#f43f5e" />
              <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>AI Smart Planner 360°</Text>
            </View>
            <Pressable 
              style={styles.closeModalBtn} 
              onPress={onClose}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            >
              <X size={20} color={theme.textPrimary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
            {/* Khối chọn Điểm Đến Du Lịch */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 0 }]}>📍 Điểm Đến Du Lịch</Text>
                {activeDest && (
                  <Pressable
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(59, 130, 246, 0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}
                    onPress={() => {
                      if (onNavigateToMapWithPlace) {
                        onClose();
                        onNavigateToMapWithPlace(activeDest.name);
                      }
                    }}
                  >
                    <Compass size={12} color="#3b82f6" />
                    <Text style={{ fontSize: 10.5, fontWeight: '850', color: '#3b82f6' }}>🗺️ Xem trên Bản đồ</Text>
                  </Pressable>
                )}
              </View>

              {/* Banner hiển thị điểm đến đang chọn + Nút đổi */}
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.searchBg,
                  borderRadius: 14,
                  padding: 10,
                  borderWidth: 1.5,
                  borderColor: '#f43f5e',
                  gap: 10,
                }}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Image source={{ uri: activeDest?.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500' }} style={{ width: 36, height: 36, borderRadius: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#f43f5e' }}>
                    {activeDest?.name || 'Đà Lạt'}
                  </Text>
                  <Text style={{ fontSize: 10, color: theme.textMuted, marginTop: 1 }}>
                    {activeDest?.region || 'Việt Nam'} • 📍 Tọa độ GPS có sẵn
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(244, 63, 94, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 10.5, fontWeight: '850', color: '#f43f5e' }}>{isDropdownOpen ? 'Đóng ▲' : 'Đổi điểm ▼'}</Text>
                </View>
              </Pressable>

              {/* Danh sách cuộn ngang Chip các điểm đến nổi bật */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }} contentContainerStyle={{ gap: 6 }}>
                {(TRAVEL_DESTINATIONS || []).map((dest) => {
                  const isSelected = selectedDestinationId === dest.id;
                  return (
                    <Pressable
                      key={dest.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 12,
                        borderWidth: 1,
                        backgroundColor: isSelected ? 'rgba(244, 63, 94, 0.12)' : theme.searchBg,
                        borderColor: isSelected ? '#f43f5e' : theme.border,
                        gap: 6,
                      }}
                      onPress={() => {
                        if (setSelectedDestinationId) setSelectedDestinationId(dest.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: isSelected ? '900' : '600', color: isSelected ? '#f43f5e' : theme.textPrimary }}>
                        📍 {dest.name}
                      </Text>
                      {isSelected && <Check size={12} color="#f43f5e" />}
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Lưới Dropdown + Ô tìm kiếm mở rộng khi nhấn "Đổi điểm" */}
              {isDropdownOpen && (
                <View style={{ marginTop: 8, padding: 8, backgroundColor: theme.searchBg, borderRadius: 14, borderWidth: 1, borderColor: theme.border }}>
                  {/* Ô Tìm kiếm trực tiếp trên Bản đồ */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.cardGlass || 'rgba(0,0,0,0.2)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, marginBottom: 8, borderWidth: 1, borderColor: theme.border }}>
                    <Compass size={14} color="#f43f5e" style={{ marginRight: 6 }} />
                    <TextInput
                      placeholder="🔍 Tìm địa điểm trên Bản đồ..."
                      placeholderTextColor={theme.textMuted}
                      value={searchFilter}
                      onChangeText={setSearchFilter}
                      style={{ flex: 1, fontSize: 11.5, color: theme.textPrimary, padding: 0 }}
                    />
                    {searchFilter ? (
                      <Pressable onPress={() => setSearchFilter('')}>
                        <X size={14} color={theme.textMuted} />
                      </Pressable>
                    ) : null}
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {(TRAVEL_DESTINATIONS || [])
                      .filter(d => !searchFilter || d.name.toLowerCase().includes(searchFilter.toLowerCase()) || (d.region && d.region.toLowerCase().includes(searchFilter.toLowerCase())))
                      .map((dest) => {
                        const isSelected = selectedDestinationId === dest.id;
                        return (
                          <Pressable
                            key={`dropdown-${dest.id}`}
                            style={{
                              width: '48%',
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: 6,
                              borderRadius: 10,
                              backgroundColor: isSelected ? 'rgba(244, 63, 94, 0.12)' : 'transparent',
                              gap: 6,
                            }}
                            onPress={() => {
                              if (setSelectedDestinationId) setSelectedDestinationId(dest.id);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <Image source={{ uri: dest.image }} style={{ width: 24, height: 24, borderRadius: 6 }} />
                            <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: isSelected ? '800' : '600', color: isSelected ? '#f43f5e' : theme.textPrimary, flex: 1 }}>
                              {dest.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </View>
                </View>
              )}
            </View>

            {/* Phong cách chuyến đi */}
            <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 14 }]}>🎒 Phong cách du lịch</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {TRAVEL_STYLES.map((st) => {
                const isSel = (selectedStyleId || 'photo') === st.id;
                return (
                  <Pressable
                    key={st.id}
                    onPress={() => setSelectedStyleId && setSelectedStyleId(st.id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      borderWidth: 1,
                      backgroundColor: isSel ? 'rgba(59, 130, 246, 0.1)' : theme.searchBg,
                      borderColor: isSel ? '#3b82f6' : theme.border,
                    }}
                  >
                    <Text style={{ fontSize: 11.5, fontWeight: isSel ? '800' : '600', color: isSel ? '#3b82f6' : theme.textPrimary }}>
                      {st.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Ngân sách dự kiến */}
            <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 14 }]}>💰 Ngân sách dự kiến</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              {BUDGET_OPTIONS.map((bg) => {
                const isSel = (selectedBudgetId || 'standard') === bg.id;
                return (
                  <Pressable
                    key={bg.id}
                    onPress={() => setSelectedBudgetId && setSelectedBudgetId(bg.id)}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 7,
                      borderRadius: 12,
                      borderWidth: 1,
                      backgroundColor: isSel ? 'rgba(16, 185, 129, 0.1)' : theme.searchBg,
                      borderColor: isSel ? '#10b981' : theme.border,
                    }}
                  >
                    <Text style={{ fontSize: 11.5, fontWeight: isSel ? '800' : '600', color: isSel ? '#10b981' : theme.textPrimary }}>
                      {bg.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Bộ chọn Ngày khởi hành & Kết thúc (Ngày / Tháng / Năm) */}
            <View style={{ marginTop: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 0 }]}>📅 Ngày khởi hành (Ngày / Tháng / Năm)</Text>
              </View>

              {/* Nút chọn nhanh Ngày khởi hành */}
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, marginBottom: 8 }}>
                <Pressable
                  style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.12)', borderWidth: 1, borderColor: '#3b82f6' }}
                  onPress={() => {
                    const today = getTodayIso();
                    if (setPlanStartDate) setPlanStartDate(today);
                    const daysNum = parseInt(planDaysInput || '3', 10);
                    if (setPlanEndDate) setPlanEndDate(shiftIsoDate(today, daysNum - 1));
                  }}
                >
                  <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#3b82f6' }}>📅 Hôm nay</Text>
                </Pressable>

                <Pressable
                  style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: '#10b981' }}
                  onPress={() => {
                    const tomorrow = shiftIsoDate(getTodayIso(), 1);
                    if (setPlanStartDate) setPlanStartDate(tomorrow);
                    const daysNum = parseInt(planDaysInput || '3', 10);
                    if (setPlanEndDate) setPlanEndDate(shiftIsoDate(tomorrow, daysNum - 1));
                  }}
                >
                  <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#10b981' }}>☀️ Ngày mai</Text>
                </Pressable>

                <Pressable
                  style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(244,63,94,0.12)', borderWidth: 1, borderColor: '#f43f5e' }}
                  onPress={() => {
                    const nextSat = shiftIsoDate(getTodayIso(), 2);
                    if (setPlanStartDate) setPlanStartDate(nextSat);
                    const daysNum = parseInt(planDaysInput || '3', 10);
                    if (setPlanEndDate) setPlanEndDate(shiftIsoDate(nextSat, daysNum - 1));
                  }}
                >
                  <Text style={{ fontSize: 10.5, fontWeight: '850', color: '#f43f5e' }}>🏖️ Cuối tuần</Text>
                </Pressable>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {/* Số ngày du lịch */}
                <View style={{ width: 100 }}>
                  <Text style={[styles.inputLabel, { color: theme.textPrimary, fontSize: 11 }]}>Số ngày đi</Text>
                  <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 4, height: 42 }]}>
                    <Clock size={15} color="#f43f5e" />
                    <TextInput
                      placeholder="3"
                      placeholderTextColor={theme.textMuted}
                      value={planDaysInput}
                      onChangeText={(val) => {
                        if (setPlanDaysInput) setPlanDaysInput(val);
                        const daysNum = parseInt(val || '1', 10);
                        if (planStartDate && setPlanEndDate) {
                          setPlanEndDate(shiftIsoDate(planStartDate, Math.max(daysNum - 1, 0)));
                        }
                      }}
                      keyboardType="numeric"
                      style={[styles.formTextInput, { color: theme.textPrimary, fontSize: 13, fontWeight: '800' }]}
                    />
                  </View>
                </View>

                {/* Ngày khởi hành Input + Bấm mở Lịch */}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.textPrimary, fontSize: 11 }]}>Ngày / Tháng / Năm</Text>
                  <Pressable
                    style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: '#3b82f6', borderWidth: 1.5, marginTop: 4, height: 42 }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <CalendarDays size={15} color="#3b82f6" />
                    <Text style={{ flex: 1, color: theme.textPrimary, fontSize: 12.5, fontWeight: '800', marginLeft: 6 }}>
                      {planStartDate || '2026-08-13'}
                    </Text>
                    <View style={{ backgroundColor: 'rgba(59,130,246,0.12)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: '850', color: '#3b82f6' }}>Mở Lịch 📅</Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Banner hiển thị chuẩn định dạng Tiếng Việt Ngày/Tháng/Năm + Bấm mở Lịch */}
              <Pressable
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.searchBg, borderRadius: 10, padding: 8, marginTop: 8, borderWidth: 0.5, borderColor: theme.border }}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '750', color: theme.textPrimary }}>
                    🚀 Khởi hành: <Text style={{ color: '#3b82f6' }}>{formatVietnameseDate(planStartDate)}</Text>
                  </Text>
                  <Text style={{ fontSize: 10.5, fontWeight: '750', color: theme.textMuted, marginTop: 2 }}>
                    🏁 Trở về: <Text style={{ color: '#10b981' }}>{formatVietnameseDate(planEndDate)}</Text>
                  </Text>
                </View>
                <View style={{ backgroundColor: '#3b82f6', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontSize: 10.5, fontWeight: '850' }}>Đổi ngày 📅</Text>
                </View>
              </Pressable>
            </View>

            <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 14, fontStyle: 'italic', lineHeight: 16 }}>
              💡 Trợ lý AI Vivu360 tự động phân tích thời tiết thực tế, tọa độ điểm đến và phong cách của nhóm bạn để tạo lịch trình tối ưu nhất.
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
                    <Text style={styles.modalSubmitText}>AI Lập Lịch Trình Tối Ưu</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Modal Lịch Chọn Ngày Trực Quan (Visual Calendar Modal Sheet 31 ngày) */}
      <Modal animationType="fade" transparent visible={showDatePicker} onRequestClose={() => setShowDatePicker(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{ width: '100%', maxWidth: 360, backgroundColor: theme.cardGlass || '#0f172a', borderRadius: 24, borderWidth: 1, borderColor: theme.border, padding: 16, backdropFilter: 'blur(16px)' }}>
            {/* Header Lịch */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CalendarDays size={18} color="#3b82f6" />
                <Text style={{ fontSize: 15, fontWeight: '900', color: theme.textPrimary }}>
                  Tháng {calMonth}, {calYear}
                </Text>
              </View>
              <Pressable onPress={() => setShowDatePicker(false)} style={{ padding: 4 }}>
                <X size={18} color={theme.textPrimary} />
              </Pressable>
            </View>

            {/* Điều hướng Tháng */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Pressable
                style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: theme.searchBg, borderWidth: 1, borderColor: theme.border }}
                onPress={() => {
                  if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1); }
                  else setCalMonth(m => m - 1);
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.textPrimary }}>◀ Tháng trước</Text>
              </Pressable>

              <Pressable
                style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: theme.searchBg, borderWidth: 1, borderColor: theme.border }}
                onPress={() => {
                  if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1); }
                  else setCalMonth(m => m + 1);
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.textPrimary }}>Tháng sau ▶</Text>
              </Pressable>
            </View>

            {/* Thứ trong tuần */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 }}>
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                <Text key={d} style={{ width: 38, textAlign: 'center', fontSize: 11, fontWeight: '800', color: theme.textMuted }}>{d}</Text>
              ))}
            </View>

            {/* Lưới 31 ô Ngày chọn trực tiếp */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const isoStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = planStartDate === isoStr;
                const isToday = getTodayIso() === isoStr;
                return (
                  <Pressable
                    key={day}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? '#3b82f6' : isToday ? 'rgba(16,185,129,0.15)' : theme.searchBg,
                      borderWidth: isSelected ? 2 : isToday ? 1.5 : 0.5,
                      borderColor: isSelected ? '#ffffff' : isToday ? '#10b981' : theme.border,
                    }}
                    onPress={() => {
                      if (setPlanStartDate) setPlanStartDate(isoStr);
                      const daysNum = parseInt(planDaysInput || '3', 10);
                      if (setPlanEndDate) setPlanEndDate(shiftIsoDate(isoStr, Math.max(daysNum - 1, 0)));
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: isSelected || isToday ? '900' : '600', color: isSelected ? '#ffffff' : isToday ? '#10b981' : theme.textPrimary }}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Nút xác nhận */}
            <Pressable
              style={{ marginTop: 14, backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>✓ Xác nhận chọn ngày</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
