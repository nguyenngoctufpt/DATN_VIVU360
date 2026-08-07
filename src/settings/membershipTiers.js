import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  Image,
  Modal,
  Alert
} from 'react-native';
import { 
  ArrowLeft, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Shield, 
  Flame, 
  Compass, 
  Lock,
  ChevronRight,
  TrendingUp,
  QrCode,
  X
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getSafeImageSource } from '../utils/image';

const { width: screenWidth } = Dimensions.get('window');

export const TIERS_DATA = [
  {
    key: 'bronze',
    name: 'Hạng Đồng',
    engName: 'BRONZE MEMBER',
    minPoints: 0,
    maxPoints: 2000,
    gradient: ['#a16207', '#78350f'], // Bronze warm gradient
    badgeColor: '#b45309',
    perks: [
      { text: 'Tích lũy điểm khi đi du lịch thực tế (Hệ số x1.0)', icon: Flame },
      { text: 'Ưu đãi giảm giá 5% khi mua vé tham quan du lịch trên app', icon: Award },
      { text: 'Truy cập cẩm nang du lịch cơ bản offline', icon: Compass },
    ]
  },
  {
    key: 'silver',
    name: 'Hạng Bạc',
    engName: 'SILVER EXCLUSIVE',
    minPoints: 2001,
    maxPoints: 5000,
    gradient: ['#64748b', '#334155'], // Silver gray
    badgeColor: '#94a3b8',
    perks: [
      { text: 'Tích lũy điểm khi đi du lịch thực tế (Hệ số x1.2)', icon: Flame },
      { text: 'Ưu đãi giảm giá 10% khi mua vé tham quan du lịch trên app', icon: Award },
      { text: 'Truy cập cẩm nang du lịch nâng cao offline', icon: Compass },
      { text: 'Ưu đãi giảm giá 5% khi đặt khách sạn & resort trên app', icon: Sparkles },
    ]
  },
  {
    key: 'gold',
    name: 'Hạng Vàng',
    engName: 'GOLD VIP MEMBER',
    minPoints: 5001,
    maxPoints: 10000,
    gradient: ['#d97706', '#92400e', '#451a03'], // Shiny Gold
    badgeColor: '#fbbf24',
    perks: [
      { text: 'Tích lũy điểm khi đi du lịch thực tế (Hệ số x1.5)', icon: Flame },
      { text: 'Ưu đãi giảm giá 15% khi mua vé tham quan du lịch trên app', icon: Award },
      { text: 'Đọc toàn bộ cẩm nang du lịch ngoại tuyến offline', icon: Compass },
      { text: 'Ưu đãi giảm giá 10% khi đặt khách sạn & resort trên app', icon: Sparkles },
      { text: 'Hỗ trợ khách hàng ưu tiên qua tổng đài CSKH 24/7', icon: Shield },
    ]
  },
  {
    key: 'platinum',
    name: 'Hạng Bạch Kim',
    engName: 'PLATINUM ELITE',
    minPoints: 10001,
    maxPoints: 20000,
    gradient: ['#0891b2', '#0369a1', '#1e3a8a'], // Cyber Blue-Teal
    badgeColor: '#22d3ee',
    perks: [
      { text: 'Tích lũy điểm khi đi du lịch thực tế (Hệ số x1.8)', icon: Flame },
      { text: 'Ưu đãi giảm giá 20% khi mua toàn bộ vé du lịch trên app', icon: Award },
      { text: 'Ưu đãi giảm giá 15% khi đặt khách sạn & resort trên app', icon: Sparkles },
      { text: 'Tặng 1 lượt vào phòng chờ thương gia sân bay VIP/năm', icon: Shield },
      { text: 'Trải nghiệm sớm các địa điểm ảo VR 360 độ thế hệ mới', icon: Compass },
    ]
  },
  {
    key: 'diamond',
    name: 'Hạng Kim Cương',
    engName: 'DIAMOND SUPREME',
    minPoints: 20001,
    maxPoints: 100000,
    gradient: ['#7c3aed', '#4f46e5', '#31108f'], // Royal Purple
    badgeColor: '#a855f7',
    perks: [
      { text: 'Tích lũy điểm khi đi du lịch thực tế (Hệ số x2.0)', icon: Flame },
      { text: 'Ưu đãi giảm giá 25% khi mua tất cả vé & dịch vụ', icon: Award },
      { text: 'Ưu đãi giảm giá 20% khi đặt khách sạn & resort 5 sao', icon: Sparkles },
      { text: 'Phòng chờ thương gia VIP tại mọi sân bay không giới hạn', icon: Shield },
      { text: 'Thiết kế lịch trình riêng biệt từ Trợ lý ảo AI cá nhân', icon: Compass },
      { text: 'Tặng quà tri ân sinh nhật VIP trị giá 2.000.000đ', icon: Award },
    ]
  }
];

export const PARTNERS_DATA = [
  { name: 'Bamboo Airways', perk: 'Check-in VIP & x1.5 Điểm tích lũy', desc: 'Hàng không đối tác chiến lược', color: '#10b981', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=120&h=120&q=80' },
  { name: 'Vinpearl Resorts', perk: 'Ưu đãi 20% & Nâng hạng phòng', desc: 'Hệ thống nghỉ dưỡng 5 sao', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=120&h=120&q=80' },
  { name: 'InterContinental', perk: 'Miễn phí Buffet sáng & Spa VIP', desc: 'Chuỗi khách sạn cao cấp', color: '#ef4444', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=120&h=120&q=80' },
  { name: 'Sun World Parks', perk: 'Lối đi ưu tiên Fast Track', desc: 'Tổ hợp vui chơi hàng đầu', color: '#8b5cf6', image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=120&h=120&q=80' },
];

export const ACTIVITY_HISTORY = [
  { id: 'act1', title: 'Check-in GPS Đảo Phú Quốc', date: '16/06/2026', points: '+200 XP', detail: 'Xác thực toạ độ thực địa thành công' },
  { id: 'act2', title: 'Hoàn thành thử thách "Tây Bắc"', date: '15/06/2026', points: '+500 XP', detail: 'Đã nhận thưởng thử thách' },
  { id: 'act3', title: 'Đặt Vé du lịch Vịnh Hạ Long', date: '12/06/2026', points: '+500 XP', detail: 'Điểm tích lũy đặt vé điện tử' },
  { id: 'act4', title: 'Hoạt động Nhóm chat cộng đồng', date: '11/06/2026', points: '+10 XP', detail: 'Đóng góp thông tin hữu ích' },
];

export function MembershipTiersScreen({ theme, isDarkMode, userInfo, onBack }) {
  const points = userInfo.points || 8250;
  
  // Calculate active tier index based on user points
  const activeTierIdx = useMemo(() => {
    if (points <= 2000) return 0; // Bronze
    if (points <= 5000) return 1; // Silver
    if (points <= 10000) return 2; // Gold
    if (points <= 20000) return 3; // Platinum
    return 4; // Diamond
  }, [points]);

  const [selectedIdx, setSelectedIdx] = useState(activeTierIdx);
  const selectedTier = TIERS_DATA[selectedIdx];

  const [qrModalVisible, setQrModalVisible] = useState(false);

  // Calculate progress stats to the next tier
  const progressStats = useMemo(() => {
    if (activeTierIdx >= 4) {
      return {
        nextTierName: '',
        pointsNeeded: 0,
        pct: 100
      };
    }
    const currentTier = TIERS_DATA[activeTierIdx];
    const nextTier = TIERS_DATA[activeTierIdx + 1];
    const range = nextTier.minPoints - currentTier.minPoints;
    const currentProgress = points - currentTier.minPoints;
    const pct = Math.min(Math.max((currentProgress / range) * 100, 0), 100);
    const pointsNeeded = nextTier.minPoints - points;

    return {
      nextTierName: nextTier.name,
      pointsNeeded,
      pct
    };
  }, [activeTierIdx, points]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* HEADER NAVBAR */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable 
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]} 
          onPress={onBack}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Hạng Thành Viên & Đặc Quyền</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SUMMARY STATUS */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Điểm Tích Lũy</Text>
              <Text style={[styles.summaryPoints, { color: '#3b82f6' }]}>{points.toLocaleString()} <Text style={{ fontSize: 13, fontWeight: '750', color: theme.textSecondary }}>XP</Text></Text>
            </View>
            <View style={[styles.activeTierBadge, { backgroundColor: TIERS_DATA[activeTierIdx].badgeColor + '20', borderColor: TIERS_DATA[activeTierIdx].badgeColor }]}>
              <Award size={14} color={TIERS_DATA[activeTierIdx].badgeColor} fill={TIERS_DATA[activeTierIdx].badgeColor} />
              <Text style={[styles.activeTierBadgeText, { color: TIERS_DATA[activeTierIdx].badgeColor }]}>
                {TIERS_DATA[activeTierIdx].name}
              </Text>
            </View>
          </View>

          {activeTierIdx < 4 ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressLabelRow}>
                <Text style={[styles.progressLabelText, { color: theme.textSecondary }]}>
                  Tiến độ thăng hạng tiếp theo
                </Text>
                <Text style={[styles.progressNeededText, { color: '#10b981' }]}>
                  +{progressStats.pointsNeeded.toLocaleString()} XP
                </Text>
              </View>
              <View style={[styles.xpBarBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                <LinearGradient
                  colors={TIERS_DATA[activeTierIdx + 1].gradient.slice(0, 2)}
                  style={[styles.xpBarFill, { width: `${progressStats.pct}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={[styles.progressCaption, { color: theme.textMuted }]}>
                Hạng tiếp theo: <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{progressStats.nextTierName}</Text>
              </Text>
            </View>
          ) : (
            <View style={styles.maxRankRow}>
              <Sparkles size={16} color="#a855f7" fill="#a855f7" />
              <Text style={[styles.maxRankText, { color: theme.textPrimary }]}>Bạn đã đạt hạng thẻ cao nhất!</Text>
            </View>
          )}
        </View>

        {/* TABS SELECTOR (HORIZONTAL CARD CONTAINER) */}
        <View style={styles.sliderSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Danh sách thẻ thành viên</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsScrollContent}
            snapToInterval={screenWidth * 0.76 + 16}
            decelerationRate="fast"
          >
            {TIERS_DATA.map((tier, idx) => {
              const isCurrent = idx === activeTierIdx;
              const isSelected = idx === selectedIdx;
              return (
                <Pressable
                  key={tier.key}
                  onPress={() => {
                    setSelectedIdx(idx);
                    if (isCurrent) {
                      setQrModalVisible(true);
                    }
                  }}
                  style={[
                    styles.cardContainer,
                    isSelected && { transform: [{ scale: 1.02 }] }
                  ]}
                >
                  <LinearGradient
                    colors={tier.gradient}
                    style={[
                      styles.membershipCard,
                      isSelected && {
                        shadowColor: tier.badgeColor,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 8,
                        borderColor: '#fff',
                        borderWidth: 1,
                      }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {/* Glassmorphic light gloss sheen */}
                    <LinearGradient
                      colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.01)', 'transparent']}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    
                    {/* Top Row: Brand & Tier Name */}
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Compass size={18} color="#fff" />
                        <Text style={styles.cardBrandText}>VIVU360</Text>
                      </View>
                      <Text style={styles.cardTierText}>{tier.engName}</Text>
                    </View>

                    {/* Center Row: Mock Chip & Points */}
                    <View style={styles.cardCenterRow}>
                      {/* Realistic Golden Microchip */}
                      <View style={styles.cardChipContainer}>
                        <View style={styles.cardChipBody} />
                        <View style={styles.cardChipLine1} />
                        <View style={styles.cardChipLine2} />
                        <View style={styles.cardChipLineH} />
                      </View>
                      <View style={styles.cardNfcIcon}>
                        <View style={styles.nfcWave} />
                        <View style={[styles.nfcWave, { width: 10, height: 16 }]} />
                        <View style={[styles.nfcWave, { width: 6, height: 12 }]} />
                      </View>
                    </View>

                    {/* Card Number & Info */}
                    <Text style={styles.cardNumberText}>
                      VV360 {idx.toString().padStart(2, '0')}{points.toString().padStart(4, '0')} 000{idx + 1}
                    </Text>

                    {/* Bottom Row: Name, Exp, Status Badge */}
                    <View style={styles.cardBottomRow}>
                      <View>
                        <Text style={styles.cardHolderLabel}>CHỦ THẺ</Text>
                        <Text style={styles.cardHolderName}>{userInfo.name.toUpperCase()}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        {isCurrent ? (
                          <View style={styles.statusActiveBadge}>
                            <Text style={styles.statusActiveText}>ĐANG DÙNG</Text>
                          </View>
                        ) : idx < activeTierIdx ? (
                          <View style={[styles.statusActiveBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                            <Text style={styles.statusActiveText}>ĐÃ ĐẠT</Text>
                          </View>
                        ) : (
                          <View style={[styles.statusActiveBadge, { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.25)', borderWidth: 0.8 }]}>
                            <Lock size={8} color="#fff" style={{ marginRight: 2 }} />
                            <Text style={styles.statusActiveText}>CHƯA ĐẠT</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </LinearGradient>
                  <Text style={[
                    styles.tabIndicatorText, 
                    { 
                      color: isSelected ? theme.textPrimary : theme.textMuted,
                      fontWeight: isSelected ? '850' : '600'
                    }
                  ]}>
                    {tier.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={[styles.cardTapHintText, { color: theme.textMuted }]}>
            👆 Chạm vào thẻ đang dùng của bạn để hiển thị mã QR check-in VIP
          </Text>
        </View>

        {/* SELECTED CARD PRIVILEGES */}
        <View style={[styles.perksSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.perksHeaderRow}>
            <Award size={18} color={selectedTier.badgeColor} fill={selectedTier.badgeColor} />
            <Text style={[styles.perksTitle, { color: theme.textPrimary }]}>
              Đặc quyền {selectedTier.name}
            </Text>
          </View>
          <Text style={[styles.perksSub, { color: theme.textMuted }]}>
            Yêu cầu: tích lũy từ {selectedTier.minPoints.toLocaleString()} đến {selectedTier.maxPoints === 100000 ? 'trên' : ''} {selectedTier.maxPoints.toLocaleString()} XP
          </Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {selectedTier.perks.map((perk, idx) => {
            const PerkIcon = perk.icon;
            return (
              <View key={idx} style={styles.perkItem}>
                <View style={[styles.perkIconFrame, { backgroundColor: selectedTier.badgeColor + '15' }]}>
                  <PerkIcon size={14} color={selectedTier.badgeColor} />
                </View>
                <Text style={[styles.perkText, { color: theme.textSecondary }]}>{perk.text}</Text>
              </View>
            );
          })}
        </View>

        {/* APPLICABLE PARTNERS */}
        <View style={styles.partnersSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Đối tác đặc quyền VIP</Text>
          <Text style={[styles.cardTapHintText, { color: theme.textMuted, textAlign: 'left', marginTop: -6, marginBottom: 12 }]}>
            Xuất trình thẻ thành viên Vivu360 để nhận đặc quyền tại các hệ thống đối tác
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.partnersScrollContent}
          >
            {PARTNERS_DATA.map((partner, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.partnerCard, 
                  { backgroundColor: theme.card, borderColor: theme.border }
                ]}
              >
                <Image source={getSafeImageSource(partner.image)} style={styles.partnerLogo} />
                <View style={styles.partnerInfo}>
                  <Text style={[styles.partnerName, { color: theme.textPrimary }]}>{partner.name}</Text>
                  <Text style={[styles.partnerDesc, { color: theme.textMuted }]}>{partner.desc}</Text>
                  <View style={[styles.partnerPerkBadge, { backgroundColor: partner.color + '12', borderColor: partner.color }]}>
                    <Text style={[styles.partnerPerkText, { color: partner.color }]}>{partner.perk}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* POINT TRANSACTION HISTORY */}
        <View style={[styles.historySection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.historyHeaderRow}>
            <TrendingUp size={16} color="#3b82f6" />
            <Text style={[styles.historyTitle, { color: theme.textPrimary }]}>Lịch Sử Tích Lũy XP Gần Đây</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.historyList}>
            {ACTIVITY_HISTORY.map((act) => (
              <View key={act.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={[styles.historyIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                    <Flame size={12} color="#10b981" />
                  </View>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={[styles.historyItemTitle, { color: theme.textPrimary }]} numberOfLines={1}>{act.title}</Text>
                    <Text style={[styles.historyItemDetail, { color: theme.textMuted }]} numberOfLines={1}>{act.detail}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                  <Text style={[styles.historyPoints, { color: '#10b981' }]}>{act.points}</Text>
                  <Text style={styles.historyDate}>{act.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* HOW TO ACCUMULATE POINTS */}
        <View style={[styles.howToEarnCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.earnHeaderRow}>
            <TrendingUp size={16} color="#10b981" />
            <Text style={[styles.earnTitle, { color: theme.textPrimary }]}>Hướng Dẫn Tích Điểm XP</Text>
          </View>
          <Text style={[styles.earnSubText, { color: theme.textMuted }]}>
            Dễ dàng tăng cấp hạng thẻ thành viên bằng cách thực hiện các hoạt động du lịch và khám phá ảo trên Vivu360!
          </Text>

          <View style={styles.earnList}>
            <View style={styles.earnItem}>
              <CheckCircle2 size={13} color="#10b981" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.earnItemTitle, { color: theme.textPrimary }]}>Đặt Tour ảo 360° VR thành công</Text>
                <Text style={[styles.earnItemPoints, { color: '#10b981' }]}>+500 XP mỗi lượt đặt</Text>
              </View>
            </View>

            <View style={styles.earnItem}>
              <CheckCircle2 size={13} color="#10b981" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.earnItemTitle, { color: theme.textPrimary }]}>Khám phá 1 địa điểm ảo mới</Text>
                <Text style={[styles.earnItemPoints, { color: '#10b981' }]}>+100 XP mỗi địa điểm</Text>
              </View>
            </View>

            <View style={styles.earnItem}>
              <CheckCircle2 size={13} color="#10b981" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.earnItemTitle, { color: theme.textPrimary }]}>Đăng nhật ký chuyến đi trên Bảng tin</Text>
                <Text style={[styles.earnItemPoints, { color: '#10b981' }]}>+50 XP mỗi bài chia sẻ</Text>
              </View>
            </View>

            <View style={styles.earnItem}>
              <CheckCircle2 size={13} color="#10b981" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.earnItemTitle, { color: theme.textPrimary }]}>Tham gia nhóm chat du lịch cộng đồng</Text>
                <Text style={[styles.earnItemPoints, { color: '#10b981' }]}>+10 XP mỗi tin nhắn có ích</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* WALLET / QR CARD DETAIL MODAL */}
      <Modal
        visible={qrModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setQrModalVisible(false)} />
          
          <View style={[styles.qrModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.qrModalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.qrModalHeaderTitle, { color: theme.textPrimary }]}>Thẻ VIP Check-in</Text>
              <Pressable 
                onPress={() => setQrModalVisible(false)} 
                style={({ pressed }) => [styles.qrCloseBtn, pressed && { opacity: 0.7 }]}
              >
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView 
              contentContainerStyle={styles.qrModalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Card Mini Preview */}
              <LinearGradient
                colors={TIERS_DATA[activeTierIdx].gradient}
                style={styles.qrCardMiniPreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Compass size={14} color="#fff" />
                    <Text style={[styles.cardBrandText, { fontSize: 10 }]}>VIVU360 MEMBER</Text>
                  </View>
                  <Text style={[styles.cardTierText, { fontSize: 7 }]}>{TIERS_DATA[activeTierIdx].engName}</Text>
                </View>
                <Text style={[styles.qrCardTitle, { color: '#fff' }]}>{TIERS_DATA[activeTierIdx].name}</Text>
                <Text style={[styles.cardNumberText, { fontSize: 11, marginTop: 10 }]}>
                  VV360 {activeTierIdx.toString().padStart(2, '0')}{points.toString().padStart(4, '0')} 000{activeTierIdx + 1}
                </Text>
              </LinearGradient>

              {/* QR Code */}
              <View style={styles.qrCodeContainer}>
                <View style={[styles.qrCodeWrapper, { borderColor: TIERS_DATA[activeTierIdx].badgeColor }]}>
                  <QrCode size={130} color={isDarkMode ? '#f8fafc' : '#0f172a'} />
                  <View style={[styles.qrLogoCenter, { backgroundColor: theme.card }]}>
                    <Compass size={16} color={TIERS_DATA[activeTierIdx].badgeColor} />
                  </View>
                </View>
                <Text style={[styles.qrTimerText, { color: theme.textMuted }]}>
                  🔄 Mã cập nhật tự động sau 45 giây
                </Text>
              </View>

              {/* Member details */}
              <View style={[styles.memberDetailsCard, { backgroundColor: theme.searchBg, borderColor: theme.border }]}>
                <View style={styles.memberDetailsRow}>
                  <Text style={[styles.memberDetailLabel, { color: theme.textMuted }]}>Hội viên:</Text>
                  <Text style={[styles.memberDetailVal, { color: theme.textPrimary }]}>{userInfo.name}</Text>
                </View>
                <View style={styles.memberDetailsRow}>
                  <Text style={[styles.memberDetailLabel, { color: theme.textMuted }]}>Mã số thẻ:</Text>
                  <Text style={[styles.memberDetailVal, { color: theme.textPrimary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                    VV360-0{activeTierIdx}-{points}
                  </Text>
                </View>
                <View style={styles.memberDetailsRow}>
                  <Text style={[styles.memberDetailLabel, { color: theme.textMuted }]}>Trạng thái:</Text>
                  <Text style={[styles.memberDetailVal, { color: '#10b981', fontWeight: '800' }]}>Hoạt động (Active)</Text>
                </View>
              </View>

              {/* Simulated Barcode */}
              <View style={styles.barcodeWrapper}>
                <View style={styles.barcodeContainer}>
                  {[1.5, 3, 1, 4, 1.5, 2, 3.5, 1, 2, 4, 1.5, 3, 2, 1, 3.5, 1.5, 2, 4, 1, 2, 3.5, 1.5].map((w, idx) => (
                    <View key={idx} style={[styles.barcodeLine, { width: w, backgroundColor: isDarkMode ? '#e2e8f0' : '#1e293b' }]} />
                  ))}
                </View>
                <Text style={[styles.barcodeValue, { color: theme.textMuted }]}>*000{activeTierIdx + 1}0{points}*</Text>
              </View>

              {/* Add to Wallet Buttons */}
              <View style={styles.walletButtonsRow}>
                <Pressable 
                  style={styles.walletBtn}
                  onPress={() => Alert.alert('Apple Wallet', 'Đã tạo và đồng bộ thẻ thành viên Vivu360 vào Apple Wallet của bạn!')}
                >
                  <Image 
                    source={{ uri: 'https://developer.apple.com/wallet/images/add-to-apple-wallet-logo.png' }} 
                    style={styles.appleWalletImage}
                    resizeMode="contain"
                  />
                </Pressable>
                
                <Pressable 
                  style={[styles.walletBtn, styles.googleWalletBtn]}
                  onPress={() => Alert.alert('Google Wallet', 'Đã thêm thẻ thành viên Vivu360 vào Google Wallet của bạn!')}
                >
                  <Text style={styles.googleWalletBtnText}>Add to Google Wallet</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  
  // Summary status card styling
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryPoints: {
    fontSize: 26,
    fontWeight: '950',
    marginTop: 2,
  },
  activeTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeTierBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
  },
  progressContainer: {
    marginTop: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressNeededText: {
    fontSize: 11.5,
    fontWeight: '900',
  },
  xpBarBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressCaption: {
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 6,
  },
  maxRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    justifyContent: 'center',
  },
  maxRankText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Slider Section
  sliderSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
  },
  cardsScrollContent: {
    paddingRight: 32,
    paddingBottom: 8,
    gap: 16,
  },
  cardContainer: {
    width: screenWidth * 0.76,
    alignItems: 'center',
  },
  membershipCard: {
    width: '100%',
    height: 172,
    borderRadius: 18,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBrandText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '950',
    letterSpacing: 0.5,
  },
  cardTierText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 8.5,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 0.5,
  },
  cardCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardChipContainer: {
    width: 28,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 0.8,
    borderColor: '#92400e',
  },
  cardChipBody: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  cardChipLine1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 0.6,
    backgroundColor: '#92400e',
  },
  cardChipLine2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 0.6,
    backgroundColor: '#92400e',
  },
  cardChipLineH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 0.6,
    backgroundColor: '#92400e',
  },
  cardNfcIcon: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2.5,
    opacity: 0.55,
  },
  nfcWave: {
    width: 14,
    height: 20,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#fff',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  cardNumberText: {
    color: '#fff',
    fontSize: 14.5,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardHolderLabel: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 5.8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardHolderName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '850',
    letterSpacing: 0.3,
  },
  statusActiveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    borderWidth: 0.8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusActiveText: {
    color: '#fff',
    fontSize: 7.2,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  tabIndicatorText: {
    fontSize: 11,
    marginTop: 6,
  },

  // Perks section styling
  perksSection: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  perksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perksTitle: {
    fontSize: 14.5,
    fontWeight: '900',
  },
  perksSub: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 3,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  perkIconFrame: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '650',
    lineHeight: 16,
  },

  // How to earn card styling
  howToEarnCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  earnHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  earnTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  earnSubText: {
    fontSize: 10.5,
    fontWeight: '600',
    lineHeight: 14,
    marginBottom: 12,
  },
  earnList: {
    gap: 12,
  },
  earnItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  earnItemTitle: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  earnItemPoints: {
    fontSize: 10,
    fontWeight: '850',
    marginTop: 1,
  },

  // Tap hint
  cardTapHintText: {
    fontSize: 10.5,
    fontWeight: '750',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },

  // Partners section
  partnersSection: {
    marginBottom: 24,
  },
  partnersScrollContent: {
    paddingRight: 16,
    gap: 12,
    paddingBottom: 4,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.2,
    width: 270,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  partnerLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 13,
    fontWeight: '900',
  },
  partnerDesc: {
    fontSize: 10,
    fontWeight: '650',
    marginTop: 1,
  },
  partnerPerkBadge: {
    alignSelf: 'flex-start',
    borderWidth: 0.8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  partnerPerkText: {
    fontSize: 9,
    fontWeight: '900',
  },

  // Point history section
  historySection: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyTitle: {
    fontSize: 14.5,
    fontWeight: '900',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  historyItemDetail: {
    fontSize: 9.5,
    fontWeight: '650',
    marginTop: 1,
  },
  historyPoints: {
    fontSize: 12,
    fontWeight: '900',
  },
  historyDate: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 2,
  },

  // QR Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  qrModalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
  },
  qrModalHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  qrCloseBtn: {
    padding: 4,
  },
  qrModalBody: {
    padding: 20,
    alignItems: 'center',
    gap: 20,
  },
  qrCardMiniPreview: {
    width: '100%',
    borderRadius: 16,
    padding: 14,
    height: 104,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  qrCardTitle: {
    fontSize: 16,
    fontWeight: '950',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  qrCodeContainer: {
    alignItems: 'center',
    gap: 8,
  },
  qrCodeWrapper: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  qrLogoCenter: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  qrTimerText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  memberDetailsCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  memberDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberDetailLabel: {
    fontSize: 11.5,
    fontWeight: '750',
  },
  memberDetailVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  barcodeWrapper: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  barcodeContainer: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeLine: {
    height: '100%',
    marginHorizontal: 0.6,
  },
  barcodeValue: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
    fontWeight: '700',
  },
  walletButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
    marginTop: 10,
  },
  walletBtn: {
    height: 38,
    width: 142,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleWalletImage: {
    width: '100%',
    height: '100%',
  },
  googleWalletBtn: {
    backgroundColor: '#000',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleWalletBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
});


