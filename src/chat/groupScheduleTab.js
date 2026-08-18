import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FileText,
  Plus,
  MapPin,
  Calendar,
  Sun,
  Plane,
  Home,
  Utensils,
  ChevronRight,
  CloudSun,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle,
  Compass,
} from 'lucide-react-native';

export function GroupScheduleTab({
  selectedGroup,
  theme,
  isDarkMode,
  onOpenAIPlanner,
  onEditActivity,
  onDeleteActivity,
  onDeleteDay,
  onClearAllDays,
  onNavigateToMapWithPlace,
}) {
  const [checkIns, setCheckIns] = React.useState({
    'act-0-0': '08:15',
  });

  const handleCheckIn = (actId, title) => {
    const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setCheckIns(prev => ({
      ...prev,
      [actId]: timeNow,
    }));
    Alert.alert('📍 Check-in thành công!', `Đã ghi nhận check-in tại "${title}" lúc ${timeNow}.`);
  };

  const rawItinerary = selectedGroup && selectedGroup.itinerary;
  
  // Adapter chuyển đổi dữ liệu thật sang cấu trúc hiển thị
  const getDisplayItinerary = () => {
    if (!rawItinerary || !Array.isArray(rawItinerary.days)) {
      // Mock data Đà Lạt chất lượng cao mặc định nếu chưa khởi tạo lần nào
      return {
        title: 'Du lịch Đà Lạt 3 Ngày 2 Đêm',
        startDate: '25/08/2026',
        endDate: '27/08/2026',
        days: [
          {
            dayNumber: 1,
            dayName: 'Ngày 1 - Khởi hành',
            temp: '22°C',
            weatherIcon: '⛅',
            activities: [
              {
                id: 'act-1',
                dayIndex: 0,
                slotIndex: 0,
                time: '08:00',
                period: 'SÁNG',
                title: 'Tập trung & Bay đi Đà Lạt',
                description: 'Chuyến bay VN123 - Sân bay Nội Bài (HAN) đi Liên Khương',
                note: 'Mang theo CCCD gốc và vé điện tử.',
                type: 'flight',
                color: '#f43f5e',
                bgColor: 'rgba(244, 63, 94, 0.06)',
              },
              {
                id: 'act-2',
                dayIndex: 0,
                slotIndex: 1,
                time: '14:00',
                period: 'CHIỀU',
                title: 'Check-in nhận phòng khách sạn',
                description: 'Colline Hotel - 10 Phan Bội Châu, Phường 1, Đà Lạt',
                note: 'Khách sạn trung tâm, thuận tiện đi lại.',
                type: 'hotel',
                color: '#10b981',
                bgColor: 'rgba(16, 185, 129, 0.06)',
              },
              {
                id: 'act-3',
                dayIndex: 0,
                slotIndex: 2,
                time: '18:30',
                period: 'TỐI',
                title: 'Ăn tối Lẩu Gà Lá É',
                description: 'Quán ăn ngon truyền thức Đà Lạt',
                note: 'Món ăn đặc sản ấm cúng buổi tối se lạnh.',
                type: 'food',
                color: '#f97316',
                bgColor: 'rgba(249, 115, 22, 0.06)',
              },
            ],
          }
        ]
      };
    }

    if (rawItinerary.days.length === 0) {
      return {
        title: 'Chưa có lịch trình du lịch nào',
        startDate: '--/--/----',
        endDate: '--/--/----',
        days: [],
      };
    }

    const formatSafeDate = (dateVal, fallback) => {
      if (!dateVal) return fallback;
      if (typeof dateVal === 'string' && dateVal.includes('/')) return dateVal;
      try {
        const str = String(dateVal).split('T')[0];
        const parts = str.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('vi-VN');
        }
      } catch (e) {}
      return String(dateVal);
    };

    // Convert real data
    const days = rawItinerary.days.map((d, index) => {
      const weatherTemp = d.weather ? `${d.weather.minTemp || 18}°C - ${d.weather.maxTemp || 25}°C` : '22°C';
      const weatherIcon = (d.weather && d.weather.iconText) || '🌤️';
      
      const rawSlots = (Array.isArray(d.slots) && d.slots.length > 0)
        ? d.slots
        : ((Array.isArray(d.activities) && d.activities.length > 0) ? d.activities : []);

      const activities = rawSlots.map((slot, sIdx) => {
        let type = 'sightseeing';
        let color = '#f43f5e'; // đỏ hồng mặc định
        let bgColor = 'rgba(244, 63, 94, 0.06)';
        
        const slotObj = typeof slot === 'string' ? { text: slot, title: slot } : (slot || {});
        const text = slotObj.text || slotObj.description || slotObj.content || (typeof slot === 'string' ? slot : '');
        
        if (text.includes('Bay') || text.includes('sân bay') || text.includes('di chuyển')) {
          type = 'flight';
          color = '#3b82f6';
          bgColor = 'rgba(59, 130, 246, 0.06)';
        } else if (text.includes('khách sạn') || text.includes('nhận phòng') || text.includes('homestay')) {
          type = 'hotel';
          color = '#10b981';
          bgColor = 'rgba(16, 185, 129, 0.06)';
        } else if (text.includes('Ăn') || text.includes('lẩu') || text.includes('cafe') || text.includes('uống') || text.includes('trưa')) {
          type = 'food';
          color = '#f97316';
          bgColor = 'rgba(249, 115, 22, 0.06)';
        }

        const defaultTimes = ['08:00', '12:00', '14:30', '19:00'];
        const defaultPeriods = ['SÁNG', 'TRƯA', 'CHIỀU', 'TỐI'];

        let time = slotObj.time || defaultTimes[sIdx] || '08:00';
        let period = slotObj.period || defaultPeriods[sIdx] || 'SÁNG';

        return {
          id: slotObj.id || `act-${index}-${sIdx}`,
          dayIndex: index,
          slotIndex: sIdx,
          time,
          period,
          title: slotObj.title || (period ? `Hoạt động ${period}` : `Hoạt động ${sIdx + 1}`),
          description: text,
          note: sIdx === 0 ? d.note : null,
          type,
          color,
          bgColor,
        };
      });

      // Tạo ngày hiển thị đẹp mắt kèm Ngày/Tháng/Năm
      let dayName = d.label || `Ngày ${index + 1}`;
      if (d.date) {
        dayName = `${d.label || `Ngày ${index + 1}`} - ${formatSafeDate(d.date, d.date)}`;
      }

      return {
        dayIndex: index,
        dayNumber: index + 1,
        dayName,
        temp: weatherTemp,
        weatherIcon,
        activities,
      };
    });

    const destinationName = rawItinerary.destinationName || 'Hành trình';
    const region = rawItinerary.region ? `, ${rawItinerary.region}` : '';

    return {
      title: `Lịch trình đi ${destinationName}${region}`,
      startDate: formatSafeDate(rawItinerary.startDate, 'Bắt đầu'),
      endDate: formatSafeDate(rawItinerary.endDate, 'Kết thúc'),
      days,
    };
  };

  const itinerary = getDisplayItinerary();

  const getIconForType = (type, color) => {
    switch (type) {
      case 'flight':
        return <Plane size={18} color={color} />;
      case 'hotel':
        return <Home size={18} color={color} />;
      case 'food':
        return <Utensils size={18} color={color} />;
      default:
        return <MapPin size={18} color={color} />;
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER CARD — Gradient Banner */}
      <LinearGradient
        colors={isDarkMode ? ['#1e1b4b', '#312e81', '#1e293b'] : ['#eff6ff', '#f0fdf4', '#fff']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.headerCard, { borderColor: isDarkMode ? 'rgba(139,92,246,0.3)' : 'rgba(59,130,246,0.15)', borderWidth: 1 }]}
      >
        {/* Trip title + date */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            style={{ width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}
          >
            <MapPin size={22} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.tripTitle, { color: theme.textPrimary }]} numberOfLines={2}>{itinerary.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <Calendar size={12} color="#8b5cf6" />
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#8b5cf6' }}>
                {itinerary.startDate} → {itinerary.endDate}
              </Text>
            </View>
          </View>
        </View>

        {/* AI Primary Button */}
        <Pressable style={styles.aiPrimaryBtn} onPress={onOpenAIPlanner}>
          <LinearGradient
            colors={['#7c3aed', '#db2777', '#f43f5e']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.aiPrimaryGradient}
          >
            <Sparkles size={16} color="#fff" />
            <Text style={styles.aiPrimaryText}>✨ AI Lập Lịch Trình Thông Minh 360°</Text>
          </LinearGradient>
        </Pressable>

        {/* Action Row */}
        <View style={styles.headerSecondaryActions}>
          <Pressable
            style={[styles.secondaryActionBtn, { borderColor: 'rgba(59,130,246,0.35)', backgroundColor: isDarkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.07)' }]}
            onPress={() => {
              const targetLoc = itinerary.title.replace('Lịch trình đi ', '').replace('Du lịch ', '');
              onNavigateToMapWithPlace ? onNavigateToMapWithPlace(targetLoc) : Alert.alert('🗺️ Bản đồ 360', `Mở "${targetLoc}" trên bản đồ.`);
            }}
          >
            <Compass size={14} color="#3b82f6" />
            <Text style={[styles.secondaryActionText, { color: '#3b82f6' }]}>Bản đồ</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryActionBtn, { borderColor: 'rgba(239,68,68,0.35)', backgroundColor: isDarkMode ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)' }]}
            onPress={() => Alert.alert('📄 Xuất PDF', 'Đã tạo file lịch trình PDF thành công!')}
          >
            <FileText size={14} color="#ef4444" />
            <Text style={[styles.secondaryActionText, { color: '#ef4444' }]}>Xuất PDF</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryActionBtn, { borderColor: 'rgba(16,185,129,0.35)', backgroundColor: isDarkMode ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)' }]}
            onPress={onOpenAIPlanner}
          >
            <Plus size={14} color="#10b981" />
            <Text style={[styles.secondaryActionText, { color: '#10b981' }]}>Thêm điểm</Text>
          </Pressable>
        </View>

        {/* Nút Xóa toàn bộ lịch trình AI */}
        {itinerary.days && itinerary.days.length > 0 && (
          <Pressable
            style={[
              styles.clearAllBtn,
              { borderColor: 'rgba(244,63,94,0.4)', backgroundColor: isDarkMode ? 'rgba(244,63,94,0.1)' : 'rgba(244,63,94,0.06)' },
            ]}
            onPress={() => {
              Alert.alert(
                '🗑️ Xóa toàn bộ lịch trình?',
                `Tất cả ${itinerary.days.length} ngày do AI gợi ý sẽ bị xóa hoàn toàn. Bạn có chắc không?`,
                [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Xóa hết',
                    style: 'destructive',
                    onPress: () => onClearAllDays && onClearAllDays(),
                  },
                ],
              );
            }}
          >
            <Trash2 size={14} color="#f43f5e" />
            <Text style={[styles.secondaryActionText, { color: '#f43f5e' }]}>Xóa toàn bộ lịch trình</Text>
          </Pressable>
        )}
      </LinearGradient>

      {/* TIMELINE LIST */}
      {itinerary.days.map((day) => (
        <View key={`day-${day.dayNumber}`} style={{ marginTop: 24 }}>
          {/* Day Label */}
          <View style={styles.dayLabelRow}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>N{day.dayNumber}</Text>
            </View>
            <Text style={[styles.dayNameText, { color: theme.textPrimary }]}>{day.dayName}</Text>

            {/* Weather Widget */}
            <View style={[styles.weatherWidget, { backgroundColor: isDarkMode ? 'rgba(250, 204, 21, 0.15)' : 'rgba(250, 204, 21, 0.08)' }]}>
              <Text style={{ fontSize: 13, marginRight: 2 }}>{day.weatherIcon}</Text>
              <Text style={styles.weatherTempText}>{day.temp}</Text>
            </View>

            {/* Nút xóa ngày */}
            <Pressable
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                marginLeft: 8,
                padding: 5,
                borderRadius: 8,
                backgroundColor: isDarkMode ? 'rgba(244,63,94,0.15)' : 'rgba(244,63,94,0.08)',
              }}
              onPress={() => {
                Alert.alert(
                  `🗑️ Xóa ngày ${day.dayNumber}?`,
                  `Bạn có chắc muốn xóa toàn bộ "${day.dayName}" khỏi lịch trình không?`,
                  [
                    { text: 'Hủy', style: 'cancel' },
                    {
                      text: 'Xóa ngày',
                      style: 'destructive',
                      onPress: () => onDeleteDay && onDeleteDay(day.dayIndex ?? (day.dayNumber - 1)),
                    },
                  ],
                );
              }}
            >
              <Trash2 size={15} color="#f43f5e" />
            </Pressable>
          </View>

          {/* Check-in Progress Bar per Day */}
          {(() => {
            const completedCount = day.activities.filter(a => Boolean(checkIns[a.id])).length;
            const totalCount = day.activities.length;
            const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 8, paddingHorizontal: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '750', color: theme.textSecondary }}>
                  📍 Tiến độ Check-in: {completedCount}/{totalCount} điểm ({progressPercent}%)
                </Text>
                <View style={{ width: 100, height: 5, borderRadius: 2.5, backgroundColor: theme.border, marginLeft: 10, overflow: 'hidden' }}>
                  <View style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#10b981', borderRadius: 2.5 }} />
                </View>
              </View>
            );
          })()}

          {/* Activities List */}
          <View style={styles.activitiesContainer}>
            {day.activities.map((activity, index) => {
              const isLast = index === day.activities.length - 1;
              const checkInTime = checkIns[activity.id];
              return (
                <View key={activity.id} style={styles.activityRow}>
                  {/* Left: Time */}
                  <View style={styles.timeColumn}>
                    <Text style={[styles.activityTime, { color: theme.textPrimary }]}>{activity.time}</Text>
                    <Text style={[styles.activityPeriod, { color: theme.textMuted }]}>{activity.period}</Text>
                  </View>

                  {/* Connector */}
                  <View style={styles.connectorColumn}>
                    <View style={[styles.timelineDot, { backgroundColor: checkInTime ? '#10b981' : activity.color }]} />
                    {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
                  </View>

                  {/* Activity Card — Redesigned */}
                  <View style={[
                    styles.activityCard,
                    {
                      backgroundColor: isDarkMode ? 'rgba(30,41,59,0.85)' : '#fff',
                      borderColor: checkInTime ? 'rgba(16,185,129,0.5)' : (isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'),
                      borderLeftColor: checkInTime ? '#10b981' : activity.color,
                      borderLeftWidth: 4,
                      shadowColor: activity.color,
                      shadowOpacity: 0.08,
                      shadowOffset: { width: 0, height: 2 },
                      shadowRadius: 6,
                      elevation: 2,
                    },
                  ]}>
                    {activity.description ? (
                      <View style={{ flex: 1 }}>
                        {/* Top row: title + type icon */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                          <View style={[styles.typeIconCircle, { backgroundColor: activity.bgColor, marginTop: 1 }]}>
                            {getIconForType(activity.type, activity.color)}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.activityTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                              {activity.title}
                            </Text>
                            <Text numberOfLines={2} style={[styles.activityDesc, { color: theme.textSecondary, marginTop: 3 }]}>
                              {activity.description}
                            </Text>
                          </View>
                        </View>

                        {/* Note */}
                        {activity.note && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7, backgroundColor: isDarkMode ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.08)', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4 }}>
                            <Text style={{ fontSize: 10, color: '#d97706', fontWeight: '700', flex: 1 }} numberOfLines={2}>⚠️ {activity.note}</Text>
                          </View>
                        )}

                        {/* Bottom action row */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                          {/* Check-in */}
                          {checkInTime ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                              <CheckCircle size={11} color="#10b981" />
                              <Text style={{ fontSize: 10, fontWeight: '800', color: '#10b981' }}>Check-in {checkInTime}</Text>
                            </View>
                          ) : (
                            <Pressable
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}
                              onPress={() => handleCheckIn(activity.id, activity.title)}
                            >
                              <MapPin size={11} color="#3b82f6" />
                              <Text style={{ fontSize: 10, fontWeight: '800', color: '#3b82f6' }}>Check-in</Text>
                            </Pressable>
                          )}

                          {/* Map */}
                          <Pressable
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: isDarkMode ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 }}
                            onPress={() => {
                              const place = activity.title || activity.description || 'Đà Lạt';
                              onNavigateToMapWithPlace ? onNavigateToMapWithPlace(place) : Alert.alert('🗺️ Bản đồ', `Mở "${place}" trên bản đồ.`);
                            }}
                          >
                            <Compass size={11} color="#8b5cf6" />
                            <Text style={{ fontSize: 10, fontWeight: '800', color: '#8b5cf6' }}>Bản đồ</Text>
                          </Pressable>

                          <View style={{ flex: 1 }} />

                          {/* Edit */}
                          <Pressable
                            onPress={() => onEditActivity(activity.dayIndex, activity.slotIndex, activity.title, activity.description)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{ padding: 4, borderRadius: 7, backgroundColor: isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)' }}
                          >
                            <Edit size={14} color="#3b82f6" />
                          </Pressable>
                          {/* Delete */}
                          <Pressable
                            onPress={() => onDeleteActivity(activity.dayIndex, activity.slotIndex)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{ padding: 4, borderRadius: 7, backgroundColor: isDarkMode ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.08)' }}
                          >
                            <Trash2 size={14} color="#f43f5e" />
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 13, color: theme.textMuted, fontStyle: 'italic' }}>
                          Chưa thiết lập ({activity.title})
                        </Text>
                        <Pressable
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}
                          onPress={() => onEditActivity(activity.dayIndex, activity.slotIndex, activity.title, '')}
                        >
                          <Plus size={12} color="#f43f5e" />
                          <Text style={{ fontSize: 11, color: '#f43f5e', fontWeight: '800' }}>Thêm hoạt động</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  aiPrimaryBtn: {
    width: '100%',
    height: 42,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 14,
    elevation: 3,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  aiPrimaryGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  aiPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  headerSecondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  secondaryActionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  secondaryActionText: {
    fontSize: 11.5,
    fontWeight: '850',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 10,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
  },
  dayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  dayNameText: {
    fontSize: 13.5,
    fontWeight: '900',
    marginLeft: 8,
    flex: 1,
  },
  weatherWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weatherTempText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#ca8a04',
  },
  activitiesContainer: {
    marginTop: 14,
    paddingLeft: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeColumn: {
    width: 48,
    alignItems: 'flex-start',
    paddingTop: 14,
  },
  activityTime: {
    fontSize: 12.5,
    fontWeight: '900',
  },
  activityPeriod: {
    fontSize: 8.5,
    fontWeight: '800',
    marginTop: 2,
  },
  connectorColumn: {
    width: 20,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 14,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: 0,
    zIndex: 1,
  },
  activityCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 12,
    flexDirection: 'column',
  },
  activityTitle: {
    fontSize: 12.5,
    fontWeight: '850',
    letterSpacing: -0.1,
  },
  activityDesc: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  activityNote: {
    fontSize: 9.5,
    fontWeight: '500',
    marginTop: 3,
  },
  typeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
