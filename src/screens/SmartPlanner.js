import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Send,
  Zap,
  CheckCircle,
  Clock,
  Navigation,
  Share2,
  ChevronRight,
  Sun,
  Award,
} from 'lucide-react-native';

export function SmartPlannerScreen({
  theme,
  isDarkMode,
  selectedPlaceName,
  onNavigateToTab,
  onNavigateToTour,
}) {
  const [destination, setDestination] = useState(selectedPlaceName || 'Đà Nẵng & Hội An');
  const [days, setDays] = useState('3 Ngày 2 Đêm');
  const [style, setStyle] = useState('Check-in 360° 📸');
  const [budget, setBudget] = useState('Tiêu chuẩn 💳');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);

  // Khôi phục lịch trình đã lưu từ AsyncStorage khi mở lại ứng dụng
  React.useEffect(() => {
    AsyncStorage.getItem('@vivu360_saved_smart_itinerary').then((dataStr) => {
      if (dataStr) {
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed && parsed.schedule) {
            setGeneratedItinerary(parsed);
            if (parsed.destination) setDestination(parsed.destination);
          }
        } catch (_) {}
      }
    }).catch(() => {});
  }, []);

  const saveItineraryPersistent = (itineraryData) => {
    setGeneratedItinerary(itineraryData);
    if (itineraryData) {
      AsyncStorage.setItem('@vivu360_saved_smart_itinerary', JSON.stringify(itineraryData)).catch(() => {});
    }
  };

  React.useEffect(() => {
    if (selectedPlaceName && selectedPlaceName.trim()) {
      setDestination(selectedPlaceName);
      setIsGenerating(true);
      const timer = setTimeout(() => {
        setIsGenerating(false);
        saveItineraryPersistent({
          destination: selectedPlaceName,
          days: '3 Ngày 2 Đêm',
          style: 'Check-in 360° 📸',
          budget: 'Tiêu chuẩn 💳',
          totalCost: '3.800.000đ / người',
          schedule: [
            {
              day: 'Ngày 1',
              title: `Khám phá trung tâm ${selectedPlaceName}`,
              activities: [
                { time: '08:00', title: `Ăn sáng đặc sản địa phương & Thưởng thức cà phê ngắm cảnh ${selectedPlaceName}`, spot: selectedPlaceName },
                { time: '10:30', title: `Tham quan các danh thắng di sản nổi tiếng tại ${selectedPlaceName} (Xem VR 360°)`, spot: selectedPlaceName },
                { time: '15:00', title: `Check-in trải nghiệm văn hóa độc đáo & các điểm sống ảo cực đẹp`, spot: selectedPlaceName },
                { time: '19:00', title: `Thưởng thức ẩm thực đêm & Ngắm cảnh thành phố về đêm`, spot: selectedPlaceName },
              ]
            },
            {
              day: 'Ngày 2',
              title: `Hành trình trải nghiệm & Khám phá thiên nhiên ${selectedPlaceName}`,
              activities: [
                { time: '08:30', title: `Khởi hành ghé thăm khu du lịch sinh thái & danh lam thắng cảnh xung quanh`, spot: selectedPlaceName },
                { time: '11:30', title: `Thưởng thức các món đặc sản truyền thống chuẩn vị địa phương`, spot: selectedPlaceName },
                { time: '16:00', title: `Trải nghiệm các hoạt động giải trí ngoài trời & ngắm hoàng hôn`, spot: selectedPlaceName },
                { time: '20:00', title: `Tham gia phố đi bộ & mua quà lưu niệm đặc sản`, spot: selectedPlaceName },
              ]
            },
            {
              day: 'Ngày 3',
              title: 'Thư giãn & Mua sắm quà lưu niệm',
              activities: [
                { time: '07:30', title: `Tản bộ ngắm bình minh & Thưởng thức điểm tâm sáng`, spot: selectedPlaceName },
                { time: '10:00', title: `Ghé chợ đặc sản địa phương chọn mua quà cho người thân và bạn bè`, spot: selectedPlaceName },
                { time: '14:00', title: 'Check-out khách sạn & Khởi hành trở về', spot: selectedPlaceName },
              ]
            }
          ]
        });
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [selectedPlaceName]);

  const travelStyles = ['Check-in 360° 📸', 'Phượt Tây Bắc 🎒', 'Nghỉ dưỡng 🏖️', 'Văn hoá 🏛️'];
  const budgetOptions = ['Tiết kiệm 💵', 'Tiêu chuẩn 💳', 'Sang trọng VIP 👑'];

  const handleGenerate = () => {
    if (!destination.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập điểm đến bạn muốn lên lịch trình.');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      saveItineraryPersistent({
        destination,
        days,
        style,
        budget,
        totalCost: budget.includes('Tiết kiệm') ? '2.500.000đ / người' : budget.includes('Sang trọng') ? '8.900.000đ / người' : '4.200.000đ / người',
        schedule: [
          {
            day: 'Ngày 1',
            title: 'Khám phá Trung Tâm & Check-in 360°',
            activities: [
              { time: '08:00', title: 'Ăn sáng Mỳ Quảng Bà Mua & Cà phê biển', spot: 'Sơn Trà' },
              { time: '10:30', title: 'Tham quan Chùa Linh Ứng & Bán đảo Sơn Trà (Xem Virtual Tour 360)', spot: 'Bán đảo Sơn Trà' },
              { time: '15:00', title: 'Check-in Cầu Vàng Bà Nà Hills & Cáp treo Kỷ lục', spot: 'Bà Nà' },
              { time: '19:00', title: 'Ngắm Cầu Rồng phun lửa & Du thuyền sông Hàn', spot: 'Sông Hàn' },
            ]
          },
          {
            day: 'Ngày 2',
            title: 'Hành trình Di sản Phố cổ Hội An',
            activities: [
              { time: '08:30', title: 'Khởi hành đi Hội An - Ghé Tháp Chàm Mỹ Sơn', spot: 'Quảng Nam' },
              { time: '11:30', title: 'Thưởng thức Cao Lầu & Cơm gà Hội An truyền thống', spot: 'Phố cổ' },
              { time: '16:00', title: 'Dạo bước phố đèn lồng & Đi thuyền thả hoa đăng trên sông Hoài', spot: 'Sông Hoài' },
              { time: '20:00', title: 'Xem Show diễn "Ký Ức Hội An" hoành tráng', spot: 'Công viên Ấn Tượng' },
            ]
          },
          {
            day: 'Ngày 3',
            title: 'Thư giãn biển Mỹ Khê & Mua quà lưu niệm',
            activities: [
              { time: '07:00', title: 'Tắm biển Mỹ Khê & Ngắm bình minh trên biển', spot: 'Mỹ Khê' },
              { time: '10:00', title: 'Mua đặc sản Chợ Hàn (Mực một nắng, Chả bò)', spot: 'Chợ Hàn' },
              { time: '14:00', title: 'Check-out & Khởi hành trở về', spot: 'Sân bay Đà Nẵng' },
            ]
          }
        ]
      });
    }, 1200);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* HERO HEADER */}
      <View style={styles.header}>
        <LinearGradient
          colors={isDarkMode ? ['rgba(220, 38, 38, 0.25)', 'rgba(245, 158, 11, 0.15)', 'transparent'] : ['rgba(220, 38, 38, 0.12)', 'rgba(245, 158, 11, 0.08)', 'transparent']}
          style={styles.headerGradient}
        />
        <View style={styles.badgeRow}>
          <Sparkles size={14} color="#f59e0b" fill="#f59e0b" />
          <Text style={styles.badgeText}>TÍNH NĂNG ĐỘC QUYỀN VIVU360</Text>
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Trợ Lý Lên Lịch Trình AI 360° 🤖✨
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Tự động thiết kế hành trình du lịch tối ưu cá nhân hóa chỉ trong 3 giây
        </Text>
      </View>

      {/* INPUT FORM CARD */}
      <View style={[styles.formCard, { backgroundColor: isDarkMode ? '#11131c' : '#ffffff', borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(220, 38, 38, 0.2)' }]}>
        {/* Destination */}
        <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>📍 Bạn muốn du lịch ở đâu?</Text>
        <View style={[styles.inputBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: theme.border }]}>
          <MapPin size={16} color="#ef4444" />
          <TextInput
            value={destination}
            onChangeText={setDestination}
            placeholder="Nhập thành phố (VD: Hà Giang, Phú Quốc, Sapa...)"
            placeholderTextColor="#9ca3af"
            style={[styles.textInput, { color: theme.textPrimary }]}
          />
        </View>

        {/* Days / Duration */}
        <Text style={[styles.fieldLabel, { color: theme.textPrimary, marginTop: 14 }]}>⏱️ Thời gian chuyến đi</Text>
        <View style={[styles.inputBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: theme.border }]}>
          <Calendar size={16} color="#f59e0b" />
          <TextInput
            value={days}
            onChangeText={setDays}
            placeholder="VD: 3 Ngày 2 Đêm, 2 Ngày 1 Đêm..."
            placeholderTextColor="#9ca3af"
            style={[styles.textInput, { color: theme.textPrimary }]}
          />
        </View>

        {/* Travel Style Chips */}
        <Text style={[styles.fieldLabel, { color: theme.textPrimary, marginTop: 14 }]}>🎒 Phong cách trải nghiệm</Text>
        <View style={styles.chipRow}>
          {travelStyles.map((s, idx) => (
            <Pressable
              key={idx}
              onPress={() => setStyle(s)}
              style={[
                styles.chip,
                {
                  backgroundColor: style === s ? 'rgba(245, 158, 11, 0.2)' : isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  borderColor: style === s ? '#f59e0b' : theme.border,
                }
              ]}
            >
              <Text style={[styles.chipText, { color: style === s ? '#f59e0b' : theme.textSecondary }]}>{s}</Text>
            </Pressable>
          ))}
        </View>

        {/* Budget Chips */}
        <Text style={[styles.fieldLabel, { color: theme.textPrimary, marginTop: 14 }]}>💳 Ngân sách dự kiến</Text>
        <View style={styles.chipRow}>
          {budgetOptions.map((b, idx) => (
            <Pressable
              key={idx}
              onPress={() => setBudget(b)}
              style={[
                styles.chip,
                {
                  backgroundColor: budget === b ? 'rgba(220, 38, 38, 0.2)' : isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  borderColor: budget === b ? '#ef4444' : theme.border,
                }
              ]}
            >
              <Text style={[styles.chipText, { color: budget === b ? '#ef4444' : theme.textSecondary }]}>{b}</Text>
            </Pressable>
          ))}
        </View>

        {/* Submit Button */}
        <Pressable style={styles.generateBtn} onPress={handleGenerate} disabled={isGenerating}>
          <LinearGradient
            colors={['#dc2626', '#b91c1c', '#f59e0b']}
            style={styles.generateGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Zap size={18} color="#fff" fill="#fff" />
                <Text style={styles.generateBtnText}>TẠO LỊCH TRÌNH AI NGAY</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>

      {/* GENERATED ITINERARY RESULT CARD */}
      {generatedItinerary && (
        <View style={[styles.resultCard, { backgroundColor: isDarkMode ? '#11131c' : '#ffffff', borderColor: 'rgba(245, 158, 11, 0.4)' }]}>
          <View style={styles.resultHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={18} color="#22c55e" />
                <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>Lịch Trình Đề Xuất Bởi AI</Text>
              </View>
              <Text style={[styles.resultSub, { color: theme.textSecondary }]}>
                {generatedItinerary.destination} · {generatedItinerary.days}
              </Text>
            </View>
            <View style={styles.costBadge}>
              <Text style={styles.costText}>{generatedItinerary.totalCost}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Schedule Days */}
          {generatedItinerary.schedule.map((dayItem, dIdx) => (
            <View key={dIdx} style={styles.dayBlock}>
              <View style={styles.dayHeaderRow}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{dayItem.day}</Text>
                </View>
                <Text style={[styles.dayTitleText, { color: theme.textPrimary }]}>{dayItem.title}</Text>
              </View>

              <View style={styles.timelineList}>
                {dayItem.activities.map((act, aIdx) => (
                  <View key={aIdx} style={styles.timelineItem}>
                    <View style={styles.timeWrap}>
                      <Clock size={11} color="#f59e0b" />
                      <Text style={styles.timeText}>{act.time}</Text>
                    </View>
                    <View style={styles.actDetail}>
                      <Text style={[styles.actTitle, { color: theme.textPrimary }]}>{act.title}</Text>
                      <Text style={styles.actSpot}>📍 {act.spot}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Action buttons */}
          <View style={styles.resultActionRow}>
            <Pressable
              style={styles.savePlanBtn}
              onPress={() => Alert.alert('Thành công', 'Đã lưu Lịch trình AI vào danh sách chuyến đi cá nhân!')}
            >
              <Text style={styles.savePlanText}>Lưu lịch trình</Text>
            </Pressable>
            <Pressable
              style={styles.mapBtn}
              onPress={() => onNavigateToTab && onNavigateToTab('map')}
            >
              <Text style={styles.mapBtnText}>Xem Bản đồ 360°</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 54,
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 18,
  },
  formCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13.5,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  generateBtn: {
    marginTop: 18,
    borderRadius: 16,
    overflow: 'hidden',
  },
  generateGradient: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  resultCard: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  resultSub: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
  },
  costBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  costText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 14,
  },
  dayBlock: {
    marginBottom: 16,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dayBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dayBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  dayTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  timelineList: {
    paddingLeft: 10,
    gap: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 60,
    marginTop: 2,
  },
  timeText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '800',
  },
  actDetail: {
    flex: 1,
  },
  actTitle: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  actSpot: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '600',
  },
  resultActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  savePlanBtn: {
    flex: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  savePlanText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '800',
  },
  mapBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  mapBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
