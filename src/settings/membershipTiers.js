import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Award,
  Sparkles,
  Shield,
  Compass,
  CheckCircle,
  QrCode,
  X,
  CreditCard,
  Zap,
  Gift,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

export function MembershipTiersScreen({ theme, isDarkMode, userInfo, onBack }) {
  const [selectedPlan, setSelectedPlan] = useState('year'); // 'month' | 'year'
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const plans = [
    {
      key: 'month',
      name: 'Gói VIP Tháng',
      price: '99.000đ',
      period: '/ tháng',
      badge: 'LINH HOẠT',
      badgeColor: '#3b82f6',
      desc: 'Phù hợp trải nghiệm ngắn hạn cho chuyến du lịch sắp tới của bạn.',
      perks: [
        'Xem VR 360° 8K Ultra HD không giới hạn',
        'Thuyết minh AI Audio Guide tại các điểm đến',
        'Ưu đãi giảm giá 10% khi đặt tour du lịch',
      ],
    },
    {
      key: 'year',
      name: 'Gói VIP Năm (Khuyên Dùng)',
      price: '899.000đ',
      period: '/ năm',
      badge: 'TIẾT KIỆM 25%',
      badgeColor: '#f59e0b',
      isPopular: true,
      desc: 'Chỉ 74.000đ/tháng. Tối ưu chi phí & nhận trọn vẹn đặc quyền VIP cao cấp nhất.',
      perks: [
        'Xem VR 360° 8K Ultra HD không giới hạn',
        'Thuyết minh AI Audio Guide tại các điểm đến',
        'Ưu đãi giảm giá 20% toàn bộ vé tham quan & tour',
        'Tặng 1 lượt vào phòng chờ thương gia sân bay VIP/năm',
        'Tặng bộ cẩm nang du lịch ngoại tuyến Offline VIP',
      ],
    },
  ];

  const activePlanObj = plans.find(p => p.key === selectedPlan);

  const handleActivateVIP = () => {
    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
      setQrModalVisible(false);
      Alert.alert(
        'Thành Công! 🎉',
        `Chúc mừng bạn đã đăng ký thành công ${activePlanObj.name}! Tài khoản của bạn đã được nâng cấp lên VIP PASS Premium.`
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Pressable
          style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.35)', borderWidth: 1.2 }]}
          onPress={onBack}
          hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
        >
          <ArrowLeft size={20} color="#f59e0b" />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Gói VIP Premium 👑</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* HERO VIP BANNER */}
        <View style={styles.heroBannerWrap}>
          <LinearGradient
            colors={['#7c2d12', '#991b1b', '#451a03']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.vipBadgeRow}>
              <Award size={14} color="#facc15" fill="#facc15" />
              <Text style={styles.vipBadgeText}>VIVU360 VIP PASS PREMIUM 👑</Text>
            </View>

            <Text style={styles.heroTitle}>Nâng Cấp Trải Nghiệm Du Lịch Không Giới Hạn</Text>
            <Text style={styles.heroDesc}>
              Trải nghiệm công nghệ Virtual Tour 360° 8K Ultra HD, trợ lý thuyết minh giọng đọc AI thực tế và hàng ngàn ưu đãi đặc quyền.
            </Text>
          </LinearGradient>
        </View>

        {/* PERKS HIGHLIGHT GRID */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Đặc Quyền Hội Viên VIP</Text>
        </View>

        <View style={styles.perksGrid}>
          {[
            { title: 'VR 360° 8K Ultra HD', desc: 'Xem không giới hạn mọi điểm đến ảo toàn cảnh 8K', icon: Sparkles, color: '#f59e0b' },
            { title: 'Audio Guide AI 360°', desc: 'Thuyết minh tự động đa ngôn ngữ tại danh thắng', icon: Compass, color: '#ef4444' },
            { title: 'Ưu Đãi Giảm Giá 20%', desc: 'Chiết khấu trực tiếp toàn bộ vé tham quan & tour', icon: Gift, color: '#22c55e' },
            { title: 'Phòng Chờ VIP Sân Bay', desc: 'Tặng 1 vé vào phòng chờ thương gia cao cấp/năm', icon: Shield, color: '#3b82f6' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <View
                key={idx}
                style={[
                  styles.perkCard,
                  {
                    backgroundColor: isDarkMode ? '#11131c' : '#ffffff',
                    borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.25)' : 'rgba(0,0,0,0.08)',
                  }
                ]}
              >
                <View style={[styles.perkIconWrap, { backgroundColor: item.color + '20' }]}>
                  <Icon size={18} color={item.color} />
                </View>
                <Text style={[styles.perkTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.perkDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
              </View>
            );
          })}
        </View>

        {/* PLAN SELECTOR */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Chọn Gói Đăng Ký</Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((p) => {
            const isSelected = selectedPlan === p.key;
            return (
              <Pressable
                key={p.key}
                onPress={() => setSelectedPlan(p.key)}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: isDarkMode ? '#11131c' : '#ffffff',
                    borderColor: isSelected ? '#f59e0b' : theme.border,
                    borderWidth: isSelected ? 2 : 1,
                  }
                ]}
              >
                {p.isPopular && (
                  <View style={styles.popularBadge}>
                    <Star size={10} color="#fff" fill="#fff" />
                    <Text style={styles.popularText}>KHUYÊN DÙNG</Text>
                  </View>
                )}

                <View style={styles.planHeaderRow}>
                  <View>
                    <Text style={[styles.planName, { color: theme.textPrimary }]}>{p.name}</Text>
                    <Text style={[styles.planDesc, { color: theme.textSecondary }]}>{p.desc}</Text>
                  </View>
                  <View style={[styles.badgePill, { backgroundColor: p.badgeColor + '20', borderColor: p.badgeColor }]}>
                    <Text style={[styles.badgePillText, { color: p.badgeColor }]}>{p.badge}</Text>
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceVal}>{p.price}</Text>
                  <Text style={[styles.pricePeriod, { color: theme.textSecondary }]}>{p.period}</Text>
                </View>

                <View style={styles.planPerksList}>
                  {p.perks.map((perkStr, i) => (
                    <View key={i} style={styles.planPerkItem}>
                      <CheckCircle size={14} color="#f59e0b" />
                      <Text style={[styles.planPerkText, { color: theme.textSecondary }]}>{perkStr}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* BOTTOM ACTION BUTTON */}
        <Pressable
          style={styles.subscribeBtn}
          onPress={() => setQrModalVisible(true)}
        >
          <LinearGradient
            colors={['#f59e0b', '#d97706']}
            style={styles.subscribeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Zap size={18} color="#0f172a" fill="#0f172a" />
            <Text style={styles.subscribeBtnText}>
              ĐĂNG KÝ GÓI VIP ({activePlanObj.price})
            </Text>
            <ChevronRight size={18} color="#0f172a" />
          </LinearGradient>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* QR PAYMENT MODAL */}
      <Modal
        visible={qrModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDarkMode ? '#11131c' : '#ffffff', borderColor: 'rgba(245, 158, 11, 0.4)' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Thanh Toán QR Code VIP</Text>
              <Pressable onPress={() => setQrModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color={theme.textMuted} />
              </Pressable>
            </View>

            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Quét mã QR bằng ứng dụng Ngân hàng / MoMo / ZaloPay để hoàn tất đăng ký <Text style={{ color: '#f59e0b', fontWeight: '800' }}>{activePlanObj?.name}</Text> ({activePlanObj?.price}).
            </Text>

            {/* Simulated VietQR image */}
            <View style={styles.qrImageContainer}>
              <Image
                source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VIVU360_VIP_MEMBERSHIP_PAYMENT' }}
                style={styles.qrImage}
              />
            </View>

            <View style={styles.bankInfoBox}>
              <Text style={styles.bankText}>Ngân hàng: <Text style={{ fontWeight: '800' }}>MBBank (MB Bank)</Text></Text>
              <Text style={styles.bankText}>Số tài khoản: <Text style={{ fontWeight: '800', color: '#f59e0b' }}>9999 360 888</Text></Text>
              <Text style={styles.bankText}>Chủ tài khoản: <Text style={{ fontWeight: '800' }}>VIVU360 VIETNAM</Text></Text>
              <Text style={styles.bankText}>Nội dung: <Text style={{ fontWeight: '800', color: '#ef4444' }}>VIP {userInfo?.name || 'USER'}</Text></Text>
            </View>

            <Pressable
              style={styles.confirmPayBtn}
              onPress={handleActivateVIP}
              disabled={isActivating}
            >
              <LinearGradient
                colors={['#dc2626', '#b91c1c']}
                style={styles.confirmPayGradient}
              >
                <Text style={styles.confirmPayText}>
                  {isActivating ? 'Đang xác thực giao dịch...' : 'KÍCH HOẠT VIP NGAY'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heroBannerWrap: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: 20,
  },
  heroGradient: {
    padding: 18,
  },
  vipBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: '#facc15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  vipBadgeText: {
    color: '#facc15',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
    lineHeight: 24,
  },
  heroDesc: {
    color: '#fed7aa',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  perksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 22,
    gap: 10,
  },
  perkCard: {
    width: (screenWidth - 42) / 2,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  perkIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  perkTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  perkDesc: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 14,
  },
  plansContainer: {
    gap: 14,
    marginBottom: 20,
  },
  planCard: {
    padding: 16,
    borderRadius: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularText: {
    color: '#fff',
    fontSize: 8.5,
    fontWeight: '900',
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: {
    fontSize: 15,
    fontWeight: '900',
  },
  planDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
    lineHeight: 16,
    maxWidth: screenWidth - 140,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '900',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    gap: 4,
  },
  priceVal: {
    color: '#f59e0b',
    fontSize: 22,
    fontWeight: '900',
  },
  pricePeriod: {
    fontSize: 12,
    fontWeight: '600',
  },
  planPerksList: {
    marginTop: 12,
    gap: 6,
  },
  planPerkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planPerkText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subscribeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscribeGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  subscribeBtnText: {
    color: '#0f172a',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 4,
  },
  modalSub: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 17,
  },
  qrImageContainer: {
    alignSelf: 'center',
    marginVertical: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  qrImage: {
    width: 170,
    height: 170,
  },
  bankInfoBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: 12,
    borderRadius: 14,
    gap: 4,
    marginBottom: 16,
  },
  bankText: {
    fontSize: 11.5,
    color: '#94a3b8',
  },
  confirmPayBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmPayGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmPayText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
});
