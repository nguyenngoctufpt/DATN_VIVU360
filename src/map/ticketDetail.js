import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Dimensions, Alert, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Trash2, Calendar, Users, QrCode, ShieldAlert, MapPin, Download, Clock } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getCountdownString = (dateStr) => {
  try {
    if (!dateStr) return 'Sắp khởi hành';
    const depDate = new Date(dateStr);
    if (isNaN(depDate.getTime())) return 'Sắp khởi hành';
    const today = new Date('2026-06-16'); // Mock current date matching conversation state
    const diffTime = depDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Đã diễn ra';
    if (diffDays === 0) return 'Khởi hành hôm nay!';
    return `Khởi hành sau ${diffDays} ngày nữa`;
  } catch (e) {
    return 'Sắp khởi hành';
  }
};

export function TicketDetailScreen({ theme, isDarkMode, ticket, onBack, onCancelTicket }) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Laser scanning animation reference
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 120, // Height of scanner wrapper
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  if (!ticket) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.textSecondary }}>Không tìm thấy thông tin vé.</Text>
        <Pressable style={[styles.backBtn, { backgroundColor: theme.card }]} onPress={onBack}>
          <Text style={{ color: theme.textPrimary }}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }



  const handleCancelPress = () => {
    Alert.alert(
      'Xác nhận hủy vé',
      `Bạn có chắc chắn muốn hủy vé ${ticket.code} đi ${ticket.title}?\n\nSố tiền thanh toán sẽ được hoàn trả vào ví Vivu360 của bạn (nếu đã thanh toán).`,
      [
        { text: 'Không, giữ lại', style: 'cancel' },
        { 
          text: 'Đồng ý hủy', 
          style: 'destructive', 
          onPress: () => {
            if (onCancelTicket) {
              onCancelTicket(ticket.code);
            }
          }
        }
      ]
    );
  };

  const handleDownloadOffline = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      Alert.alert(
        'Tải vé thành công',
        `Vé điện tử ${ticket.code} đã được lưu trữ offline thành công. Bạn có thể sử dụng mã QR này tại quầy kiểm soát mà không cần kết nối mạng!`
      );
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER BAR */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable style={[styles.iconBtn, { backgroundColor: theme.statusBg }]} onPress={onBack}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Chi Tiết Vé Điện Tử</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TICKET WRAPPER */}
        <View style={styles.ticketCardWrapper}>
          <LinearGradient
            colors={isDarkMode ? ['#1e1b4b', '#0f172a'] : ['#eff6ff', '#ffffff']}
            style={[styles.ticketCard, { borderColor: theme.border }]}
          >
            {/* Top banner image */}
            <View style={styles.ticketBanner}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80' }}
                style={styles.bannerImg}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.bannerGrad}
              />
              <View style={styles.bannerContent}>
                <Text style={styles.logoText}>VIVU360 TICKET</Text>
                <Text style={styles.tourTitle}>{ticket.title}</Text>
                <View style={styles.regionRow}>
                  <MapPin size={12} color="#cbd5e1" />
                  <Text style={styles.regionText}>{ticket.region}</Text>
                </View>
              </View>
            </View>

            {/* Countdown Badge overlay */}
            <View style={styles.countdownBadge}>
              <Clock size={11} color="#fff" />
              <Text style={styles.countdownText}>{getCountdownString(ticket.date)}</Text>
            </View>

            {/* Ticket Information */}
            <View style={styles.ticketDetails}>
              {/* Row 1 */}
              <View style={styles.infoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.textMuted }]}>MÃ ĐẶT CHỖ</Text>
                  <Text style={[styles.value, { color: '#3b82f6', fontWeight: '900' }]}>{ticket.code}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={[styles.label, { color: theme.textMuted }]}>TRẠNG THÁI</Text>
                  <View style={[styles.statusPill, { 
                    backgroundColor: ticket.status && (ticket.status.includes('Đã thanh toán') || ticket.status === 'Đã xác nhận') 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : 'rgba(245, 158, 11, 0.15)' 
                  }]}>
                    <Text style={[styles.statusText, { 
                      color: ticket.status && (ticket.status.includes('Đã thanh toán') || ticket.status === 'Đã xác nhận') 
                        ? '#10b981' 
                        : '#f59e0b' 
                    }]}>
                      {ticket.status}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Row 2 */}
              <View style={[styles.infoRow, { marginTop: 18 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.textMuted }]}>NGÀY KHỞI HÀNH</Text>
                  <Text style={[styles.value, { color: theme.textPrimary }]}>{ticket.date}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={[styles.label, { color: theme.textMuted }]}>SỐ LƯỢNG KHÁCH</Text>
                  <Text style={[styles.value, { color: theme.textPrimary }]}>{ticket.guests} người</Text>
                </View>
              </View>

              {/* Row 3 */}
              <View style={[styles.infoRow, { marginTop: 18 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.textMuted }]}>GIÁ VÉ TRỌN GÓI</Text>
                  <Text style={[styles.value, { color: theme.textPrimary }]}>{ticket.price}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={[styles.label, { color: theme.textMuted }]}>LOẠI VÉ</Text>
                  <Text style={[styles.value, { color: theme.textPrimary }]}>E-Ticket Di Sản 3D</Text>
                </View>
              </View>

              {/* Dotted cut line */}
              <View style={styles.cutLineContainer}>
                <View style={[styles.cutCircleLeft, { backgroundColor: theme.background, borderColor: theme.border }]} />
                <View style={[styles.dottedLine, { borderColor: theme.border }]} />
                <View style={[styles.cutCircleRight, { backgroundColor: theme.background, borderColor: theme.border }]} />
              </View>

              {/* QR Code Section with Neon Scanning laser HUD */}
              <View style={styles.qrSection}>
                <View style={styles.scannerViewport}>
                  {/* Neon Scanner corners */}
                  <View style={[styles.scannerCorner, { top: 0, left: 0, borderLeftWidth: 2, borderTopWidth: 2, borderColor: '#10b981' }]} />
                  <View style={[styles.scannerCorner, { top: 0, right: 0, borderRightWidth: 2, borderTopWidth: 2, borderColor: '#10b981' }]} />
                  <View style={[styles.scannerCorner, { bottom: 0, left: 0, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: '#10b981' }]} />
                  <View style={[styles.scannerCorner, { bottom: 0, right: 0, borderRightWidth: 2, borderBottomWidth: 2, borderColor: '#10b981' }]} />

                  {/* Animated laser line */}
                  <Animated.View style={[styles.laserLine, { transform: [{ translateY: laserAnim }] }]} />

                  <View style={styles.qrWrapper}>
                    <Image
                      source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.code)}` }}
                      style={styles.qrImg}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <Text style={[styles.qrTip, { color: theme.textSecondary }]}>Trình mã QR này tại cổng soát vé hoặc máy quét tự động.</Text>
              </View>
            </View>
          </LinearGradient>
        </View>


        {/* POLICY CARD */}
        <View style={[styles.policyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.policyHeader}>
            <ShieldAlert size={16} color="#ef4444" />
            <Text style={[styles.policyTitle, { color: theme.textPrimary }]}>Quy định hủy vé & Bảo mật</Text>
          </View>
          <Text style={[styles.policyText, { color: theme.textSecondary }]}>
            • Hủy trước ngày khởi hành 24h: Hoàn tiền 100% về ví Vivu360 của bạn.{"\n"}
            • Hủy trong vòng 24h: Phí dịch vụ 10% giá trị đặt vé.{"\n"}
            • Mã vé đã được mã hóa Knox Security bảo vệ, tránh sao chép lậu.
          </Text>
        </View>

        {/* FOOTER ACTIONS */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          {/* OFFLINE SAVE BUTTON */}
          <Pressable 
            style={({ pressed }) => [
              styles.downloadBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && { opacity: 0.85 }
            ]}
            onPress={handleDownloadOffline}
            disabled={isDownloading}
          >
            <Download size={16} color={theme.textPrimary} />
            <Text style={[styles.downloadText, { color: theme.textPrimary }]}>
              {isDownloading ? 'Đang lưu...' : 'Lưu Offline'}
            </Text>
          </Pressable>

          {/* CANCEL TICKET BUTTON */}
          <Pressable 
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
            ]}
            onPress={handleCancelPress}
          >
            <Trash2 size={16} color="#fff" />
            <Text style={styles.cancelBtnText}>Hủy Vé</Text>
          </Pressable>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  ticketCardWrapper: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  ticketCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ticketBanner: {
    height: 120,
    position: 'relative',
  },
  bannerImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  logoText: {
    position: 'absolute',
    top: 14,
    left: 16,
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tourTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  regionText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  countdownBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countdownText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  ticketDetails: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 4,
  },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  statusText: {
    fontSize: 8.5,
    fontWeight: '900',
  },
  cutLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  cutCircleLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -30,
    borderWidth: 1,
  },
  cutCircleRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: -30,
    borderWidth: 1,
  },
  dottedLine: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    height: 1,
  },
  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerViewport: {
    width: 140,
    height: 140,
    padding: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerCorner: {
    position: 'absolute',
    width: 16,
    height: 16,
  },
  laserLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: '#10b981',
    zIndex: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  qrWrapper: {
    width: 120,
    height: 120,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImg: {
    width: '100%',
    height: '100%',
  },
  qrTip: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 13,
    paddingHorizontal: 10,
  },

  policyCard: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  policyTitle: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  policyText: {
    fontSize: 10.5,
    fontWeight: '500',
    lineHeight: 15,
  },
  downloadBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  downloadText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    height: 48,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
