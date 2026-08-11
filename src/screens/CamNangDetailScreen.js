import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StatusBar,
  Platform,
  ImageBackground,
  Share,
} from 'react-native';
import { ArrowLeft, Share2, Compass, CheckCircle2, Clock, Ticket, Maximize2, Landmark, Sun, X } from 'lucide-react-native';
import { getCamNangByLocation } from '../services/camNangService';

export default function CamNangDetailScreen({
  theme,
  isDarkMode,
  placeName,
  provinceName,
  onBack,
  onNavigateToTour,
}) {
  const [loading, setLoading] = useState(true);
  const [guideData, setGuideData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getCamNangByLocation(placeName || 'Vịnh Hạ Long')
      .then((data) => {
        if (isMounted) {
          setGuideData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [placeName]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `📖 Cẩm nang du lịch ${placeName || 'Địa điểm'}: Giờ mở cửa (${guideData?.openingHours || '07:00'} - ${guideData?.closingHours || '18:00'}), Giá vé: ${guideData?.ticketPrice || 'Miễn phí'}. Khám phá ngay trên Vivu360!`,
      });
    } catch (error) {
      console.warn('Share error:', error.message);
    }
  };

  const bgStyle = { backgroundColor: isDarkMode ? '#0b1329' : '#f8fafc' };
  const cardBg = { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' };
  const textPrimary = { color: isDarkMode ? '#f8fafc' : '#0f172a' };
  const textSecondary = { color: isDarkMode ? '#94a3b8' : '#475569' };

  const itemsToBringList = () => {
    if (!guideData?.itemsToBring) return [];
    if (Array.isArray(guideData.itemsToBring)) return guideData.itemsToBring;
    if (typeof guideData.itemsToBring === 'string') {
      try { return JSON.parse(guideData.itemsToBring); } catch (e) { return []; }
    }
    return [];
  };

  return (
    <View style={[styles.container, bgStyle]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Hero Header */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
        }}
        style={styles.heroBanner}
      >
        <View style={styles.heroOverlay}>
          {/* Top Bar */}
          <View style={styles.topNav}>
            <Pressable style={styles.iconBtn} onPress={onBack}>
              <ArrowLeft size={20} color="#ffffff" />
            </Pressable>
            <View style={styles.topRightBtns}>
              <Pressable style={styles.iconBtn} onPress={handleShare}>
                <Share2 size={18} color="#ffffff" />
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={onBack}>
                <X size={20} color="#ffffff" />
              </Pressable>
            </View>
          </View>

          {/* Title Info */}
          <View style={styles.heroContent}>
            <Text style={styles.badgeText}>CẨM NANG ĐỊA ĐIỂM</Text>
            <Text style={styles.heroTitle}>{placeName || 'Địa Điểm Du Lịch'}</Text>
            <View style={styles.locationRow}>
              <Compass size={13} color="#93c5fd" />
              <Text style={styles.locationText}>{provinceName || 'Việt Nam'}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Main Body */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, textSecondary]}>Đang tải dữ liệu cẩm nang từ API...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Stat Grid (Matches Web) */}
          <View style={styles.gridContainer}>
            <View style={[styles.statBox, cardBg]}>
              <Text style={styles.statLabel}>DIỆN TÍCH</Text>
              <Text style={[styles.statValue, textPrimary]}>
                {guideData?.areaSize || 'Quy mô vùng du lịch'}
              </Text>
            </View>

            <View style={[styles.statBox, cardBg]}>
              <Text style={styles.statLabel}>GIÁ VÉ</Text>
              <Text style={[styles.statValue, { color: '#10b981' }]}>
                {guideData?.ticketPrice || 'Miễn phí / Tự túc'}
              </Text>
            </View>

            <View style={[styles.statBox, cardBg, styles.fullWidthStat]}>
              <Text style={styles.statLabel}>THỜI GIAN MỞ CỬA</Text>
              <Text style={[styles.statValue, textPrimary]}>
                {guideData?.openingHours || '07:00'} - {guideData?.closingHours || '18:00'} hằng ngày
              </Text>
            </View>
          </View>

          {/* 1. Thông tin địa điểm */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, textPrimary]}>Thông tin địa điểm</Text>
            <Text style={[styles.paragraphText, textSecondary]}>
              {guideData?.description || `${placeName} là địa danh du lịch nổi tiếng với nét đẹp thiên nhiên và văn hóa đặc sắc.`}
            </Text>
          </View>

          {/* 2. Lịch sử hình thành (Amber Card - Matches Web) */}
          <View style={[styles.amberCard, { backgroundColor: isDarkMode ? '#271c0c' : '#fffbeb', borderColor: isDarkMode ? '#451a03' : '#fef3c7' }]}>
            <Text style={[styles.amberTitle, { color: isDarkMode ? '#fcd34d' : '#92400e' }]}>🏛️ Lịch sử hình thành</Text>
            <Text style={[styles.amberParagraph, { color: isDarkMode ? '#fef3c7' : '#78350f' }]}>
              {guideData?.history || `${placeName} có bề dày lịch sử lâu đời gắn liền với tiến trình văn hóa dân tộc Việt Nam qua nhiều thế hệ.`}
            </Text>
          </View>

          {/* 3. Đồ dùng thiết yếu nên mang theo (Bullet points with green dots - Matches Web) */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, textPrimary]}>Đồ dùng thiết yếu nên mang theo</Text>
            <View style={styles.bulletList}>
              {itemsToBringList().length > 0 ? (
                itemsToBringList().map((item, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <View style={styles.greenDot} />
                    <Text style={[styles.bulletText, textSecondary]}>{item}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.bulletRow}>
                  <View style={styles.greenDot} />
                  <Text style={[styles.bulletText, textSecondary]}>Trang phục thoải mái, nón lá, kem chống nắng và điện thoại chụp hình.</Text>
                </View>
              )}
            </View>
          </View>

          {/* 4. Thời điểm nên đi (Sky Blue Card - Matches Web) */}
          <View style={[styles.skyCard, { backgroundColor: isDarkMode ? '#0c2338' : '#f0f9ff', borderColor: isDarkMode ? '#075985' : '#e0f2fe' }]}>
            <Text style={[styles.skyTitle, { color: isDarkMode ? '#38bdf8' : '#0369a1' }]}>☀️ Thời điểm nên đi</Text>
            <Text style={[styles.skyParagraph, { color: isDarkMode ? '#bae6fd' : '#075985' }]}>
              {guideData?.bestTime || 'Nên đi từ tháng 1 đến tháng 5 và tháng 9 đến tháng 11 khi thời tiết ráo mát, thuận lợi cho tham quan ngắm cảnh.'}
            </Text>
          </View>

        </ScrollView>
      )}

      {/* Bottom Floating Bar */}
      <View style={[styles.bottomBar, { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderTopColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
        <Pressable
          style={styles.actionBtnDirections}
          onPress={() => {
            if (onOpenMapDirections) {
              onOpenMapDirections(placeName || 'Hồ Hoàn Kiếm');
            } else if (onBack) {
              onBack();
            }
          }}
        >
          <Text style={styles.actionBtnText}>🚗 Chỉ Đường</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtnVR}
          onPress={() => onNavigateToTour && onNavigateToTour(1, 0)}
        >
          <Text style={styles.actionBtnText}>🥽 Tour VR 360°</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtnClose}
          onPress={onBack}
        >
          <Text style={styles.closeBtnText}>Đóng</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroBanner: {
    height: 200,
    width: '100%',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 46,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topRightBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    gap: 3,
  },
  badgeText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    padding: 10,
    borderRadius: 16,
  },
  statBox: {
    width: '48.5%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  fullWidthStat: {
    width: '100%',
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  sectionBlock: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  paragraphText: {
    fontSize: 13.5,
    lineHeight: 22,
  },
  amberCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  amberTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  amberParagraph: {
    fontSize: 13,
    lineHeight: 21,
  },
  bulletList: {
    gap: 8,
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginTop: 7,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  skyCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  skyTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  skyParagraph: {
    fontSize: 13,
    lineHeight: 21,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
  },
  actionBtnDirections: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnVR: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtnClose: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
});
