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
} from 'lucide-react-native';

export function GroupScheduleTab({
  selectedGroup,
  theme,
  isDarkMode,
  onOpenAIPlanner,
  onEditActivity,
  onDeleteActivity,
}) {
  const rawItinerary = selectedGroup?.itinerary;
  
  // Adapter chuyển đổi dữ liệu thật sang cấu trúc hiển thị
  const getDisplayItinerary = () => {
    if (!rawItinerary || !Array.isArray(rawItinerary.days) || rawItinerary.days.length === 0) {
      // Mock data Đà Lạt chất lượng cao mặc định nếu chưa sinh lịch trình
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

    // Convert real data
    const days = rawItinerary.days.map((d, index) => {
      const weatherTemp = d.weather ? `${d.weather.minTemp || 18}°C - ${d.weather.maxTemp || 25}°C` : '22°C';
      const weatherIcon = d.weather?.iconText || '🌤️';
      
      const activities = (d.slots || []).map((slot, sIdx) => {
        let type = 'sightseeing';
        let color = '#f43f5e'; // đỏ hồng mặc định
        let bgColor = 'rgba(244, 63, 94, 0.06)';
        const text = slot.text || '';
        
        if (text.includes('Bay') || text.includes('sân bay') || text.includes('di chuyển')) {
          type = 'flight';
          color = '#3b82f6';
          bgColor = 'rgba(59, 130, 246, 0.06)';
        } else if (text.includes('khách sạn') || text.includes('nhận phòng') || text.includes('homestay')) {
          type = 'hotel';
          color = '#10b981';
          bgColor = 'rgba(16, 185, 129, 0.06)';
        } else if (text.includes('Ăn') || text.includes('lẩu') || text.includes('cafe') || text.includes('uống')) {
          type = 'food';
          color = '#f97316';
          bgColor = 'rgba(249, 115, 22, 0.06)';
        }

        let time = '08:00';
        let period = 'SÁNG';
        if (sIdx === 1) {
          time = '14:00';
          period = 'CHIỀU';
        } else if (sIdx === 2) {
          time = '19:00';
          period = 'TỐI';
        }

        return {
          id: `act-${index}-${sIdx}`,
          dayIndex: index,
          slotIndex: sIdx,
          time,
          period,
          title: slot.title || (sIdx === 0 ? 'Hoạt động Sáng' : sIdx === 1 ? 'Hoạt động Chiều' : 'Hoạt động Tối'),
          description: text,
          note: sIdx === 0 ? d.note : null,
          type,
          color,
          bgColor,
        };
      });

      // Tạo ngày hiển thị đẹp mắt
      let dayName = d.label || `Ngày ${index + 1}`;
      if (d.date) {
        try {
          const formattedDate = new Date(d.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
          dayName = `${d.label || `Ngày ${index + 1}`} (${formattedDate})`;
        } catch (e) {}
      }

      return {
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
      startDate: rawItinerary.startDate ? new Date(rawItinerary.startDate).toLocaleDateString('vi-VN') : 'Bắt đầu',
      endDate: rawItinerary.endDate ? new Date(rawItinerary.endDate).toLocaleDateString('vi-VN') : 'Kết thúc',
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
      {/* HEADER CARD */}
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.headerInfoRow}>
          <View style={[styles.mapIconBg, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}>
            <MapPin size={22} color="#f43f5e" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.tripTitle, { color: theme.textPrimary }]}>{itinerary.title}</Text>
            <View style={styles.dateRow}>
              <Calendar size={13} color={theme.textMuted} />
              <Text style={[styles.dateText, { color: theme.textMuted }]}>
                {itinerary.startDate} - {itinerary.endDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Nút Xuất PDF & Thêm Lịch trình & Gợi ý AI */}
        <View style={styles.headerActionsRow}>
          <Pressable
            style={[styles.pdfBtn, { backgroundColor: theme.searchBg, borderColor: theme.border }]}
            onPress={() => Alert.alert('Xuất PDF', 'Đang tạo bản in lịch trình PDF...')}
          >
            <FileText size={14} color="#ef4444" />
            <Text style={[styles.pdfBtnText, { color: theme.textPrimary }]}>PDF</Text>
          </Pressable>

          <Pressable
            style={styles.addBtn}
            onPress={() => Alert.alert('Thêm lịch trình', 'Chức năng thêm hoạt động lịch trình mới')}
          >
            <Plus size={14} color="#fff" />
            <Text style={styles.addBtnText}>Thêm</Text>
          </Pressable>

          <Pressable
            style={styles.aiBtn}
            onPress={onOpenAIPlanner}
          >
            <LinearGradient colors={['#a21caf', '#db2777', '#f43f5e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aiBtnGradient}>
              <Sparkles size={13} color="#fff" />
              <Text style={styles.aiBtnText}>AI gợi ý</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

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
          </View>

          {/* Activities List */}
          <View style={styles.activitiesContainer}>
            {day.activities.map((activity, index) => {
              const isLast = index === day.activities.length - 1;
              return (
                <View key={activity.id} style={styles.activityRow}>
                  {/* Left Time Column */}
                  <View style={styles.timeColumn}>
                    <Text style={[styles.activityTime, { color: theme.textPrimary }]}>{activity.time}</Text>
                    <Text style={[styles.activityPeriod, { color: theme.textMuted }]}>{activity.period}</Text>
                  </View>

                  {/* Vertical Line Connector */}
                  <View style={styles.connectorColumn}>
                    <View style={[styles.timelineDot, { backgroundColor: activity.color }]} />
                    {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
                  </View>

                  {/* Activity Card */}
                  <View
                    style={[
                      styles.activityCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        borderLeftColor: activity.color,
                        borderStyle: activity.description ? 'solid' : 'dashed',
                        opacity: activity.description ? 1 : 0.75,
                      },
                    ]}
                  >
                    {activity.description ? (
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[styles.activityTitle, { color: theme.textPrimary, flex: 1 }]}>
                            {activity.title}
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 12, marginRight: 4 }}>
                            <Pressable onPress={() => onEditActivity(activity.dayIndex, activity.slotIndex, activity.title, activity.description)}>
                              <Edit size={13} color="#3b82f6" />
                            </Pressable>
                            <Pressable onPress={() => onDeleteActivity(activity.dayIndex, activity.slotIndex)}>
                              <Trash2 size={13} color="#f43f5e" />
                            </Pressable>
                          </View>
                        </View>
                        <Text numberOfLines={2} style={[styles.activityDesc, { color: theme.textSecondary, marginTop: 4 }]}>
                          {activity.description}
                        </Text>
                        {activity.note && (
                          <Text numberOfLines={1} style={[styles.activityNote, { color: theme.textMuted, marginTop: 4 }]}>
                            ⚠️ {activity.note}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <View style={{ flex: 1, paddingRight: 8, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 13, color: theme.textMuted, fontStyle: 'italic' }}>
                          Chưa thiết lập hoạt trình ({activity.title})
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

                    {/* Right Icon Circle */}
                    <View style={[styles.typeIconCircle, { backgroundColor: activity.bgColor }]}>
                      {getIconForType(activity.type, activity.color)}
                    </View>
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
  headerActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 14,
  },
  pdfBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pdfBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  addBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f43f5e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  aiBtn: {
    flex: 1.5,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
  },
  aiBtnGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  aiBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '850',
    letterSpacing: -0.2,
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
    height: 90,
  },
  timeColumn: {
    width: 44,
    alignItems: 'flex-start',
    paddingTop: 6,
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
    position: 'relative',
    height: '100%',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 10,
    zIndex: 2,
  },
  timelineLine: {
    width: 1.5,
    position: 'absolute',
    top: 18,
    bottom: 0,
    zIndex: 1,
  },
  activityCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4.5,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    height: 80,
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
