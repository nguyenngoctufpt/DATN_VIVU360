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
  Alert
} from 'react-native';
import { 
  ArrowLeft, 
  Award, 
  Sparkles, 
  CircleCheck, 
  ChevronRight,
  TrendingUp,
  Circle,
  CircleHelp,
  Trophy,
  Navigation
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const CHALLENGES_INIT = [
  {
    id: 'ch1',
    title: 'Khám Phá Danh Thắng Tây Bắc',
    desc: 'Tham quan 3 địa danh Tây Bắc trên bản đồ tương tác (Lào Cai, Yên Bái, Hà Giang).',
    reward: 500,
    progress: 2,
    target: 3,
    type: 'map',
    claimed: false,
    linkTab: 'map'
  },
  {
    id: 'ch2',
    title: 'Thợ Săn Hoàng Hôn Phú Quốc',
    desc: 'Trải nghiệm toàn vẹn chuyến đi ảo 360° tại Bãi Trường Sunset Phú Quốc.',
    reward: 400,
    progress: 1,
    target: 1,
    type: 'tour',
    claimed: false,
    linkTab: 'map'
  },
  {
    id: 'ch3',
    title: 'Reviewer Du Lịch Tích Cực',
    desc: 'Đăng ít nhất 3 bài chia sẻ nhật ký hành trình của bạn trên Bảng tin.',
    reward: 300,
    progress: 2,
    target: 3,
    type: 'social',
    claimed: false,
    linkTab: 'social'
  },
  {
    id: 'ch4',
    title: 'Chuyên Gia Đặt Chuyến Đi',
    desc: 'Đặt thành công 2 vé du lịch ảo hoặc combo khách sạn trên ứng dụng.',
    reward: 600,
    progress: 2,
    target: 2,
    type: 'explore',
    claimed: false,
    linkTab: 'explore'
  },
  {
    id: 'ch5',
    title: 'Bạn Đồng Hành Thân Thiện',
    desc: 'Tham gia và gửi 5 tin nhắn chia sẻ trong Nhóm chat du lịch cộng đồng.',
    reward: 200,
    progress: 5,
    target: 5,
    type: 'chat',
    claimed: true,
    linkTab: 'chat'
  },
  {
    id: 'ch6',
    title: 'Thành Viên Tiên Phong',
    desc: 'Cập nhật đầy đủ hồ sơ cá nhân và kết nối bảo mật Knox Security.',
    reward: 150,
    progress: 2,
    target: 2,
    type: 'profile',
    claimed: true,
    linkTab: 'profile'
  }
];

export function TravelChallengesScreen({ theme, isDarkMode, userInfo, onBack, onAddPoints, onNavigateToTab }) {
  const points = userInfo.points || 8250;
  const [challenges, setChallenges] = useState(CHALLENGES_INIT);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'completed'

  // Filter challenges list based on selected tab filter
  const filteredChallenges = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return challenges.filter(c => c.progress < c.target);
      case 'completed':
        return challenges.filter(c => c.progress === c.target);
      case 'all':
      default:
        return challenges;
    }
  }, [challenges, activeFilter]);

  // Handle claiming points for a completed challenge
  const handleClaimPoints = (id, reward, title) => {
    setChallenges(prev => 
      prev.map(c => c.id === id ? { ...c, claimed: true } : c)
    );
    onAddPoints(reward);
    Alert.alert(
      'Nhận thưởng thành công! 🎉',
      `Bạn đã được cộng +${reward.toLocaleString()} XP vào tài khoản từ thử thách "${title}".`
    );
  };

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
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Thử Thách Tích Điểm</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* SUMMARY PROGRESS BAR */}
      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Điểm Tích Lũy Hiện Tại</Text>
            <Text style={[styles.summaryPoints, { color: '#3b82f6' }]}>
              {points.toLocaleString()} <Text style={{ fontSize: 13, fontWeight: '750', color: theme.textSecondary }}>XP</Text>
            </Text>
          </View>
          <View style={styles.trophyWrapper}>
            <Trophy size={28} color="#eab308" fill="rgba(234, 179, 8, 0.2)" />
          </View>
        </View>
        <Text style={[styles.summarySubText, { color: theme.textSecondary }]}>
          Hoàn thành các thử thách du lịch dưới đây để tích lũy XP thăng cấp thứ hạng và nhận thêm nhiều đặc quyền ưu đãi khách sạn, vé máy bay!
        </Text>
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterTabsRow}>
        <Pressable 
          onPress={() => setActiveFilter('all')}
          style={[
            styles.filterTab, 
            activeFilter === 'all' && [styles.filterTabActive, { backgroundColor: '#3b82f6' }]
          ]}
        >
          <Text style={[
            styles.filterTabText, 
            { color: activeFilter === 'all' ? '#fff' : theme.textSecondary }
          ]}>
            Tất cả ({challenges.length})
          </Text>
        </Pressable>

        <Pressable 
          onPress={() => setActiveFilter('active')}
          style={[
            styles.filterTab, 
            activeFilter === 'active' && [styles.filterTabActive, { backgroundColor: '#3b82f6' }]
          ]}
        >
          <Text style={[
            styles.filterTabText, 
            { color: activeFilter === 'active' ? '#fff' : theme.textSecondary }
          ]}>
            Đang làm ({challenges.filter(c => c.progress < c.target).length})
          </Text>
        </Pressable>

        <Pressable 
          onPress={() => setActiveFilter('completed')}
          style={[
            styles.filterTab, 
            activeFilter === 'completed' && [styles.filterTabActive, { backgroundColor: '#3b82f6' }]
          ]}
        >
          <Text style={[
            styles.filterTabText, 
            { color: activeFilter === 'completed' ? '#fff' : theme.textSecondary }
          ]}>
            Hoàn thành ({challenges.filter(c => c.progress === c.target).length})
          </Text>
        </Pressable>
      </View>

      {/* CHALLENGES LIST */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredChallenges.length > 0 ? (
          filteredChallenges.map((item) => {
            const isCompleted = item.progress === item.target;
            const isClaimed = item.claimed;
            const pct = Math.min(Math.max((item.progress / item.target) * 100, 0), 100);

            return (
              <View 
                key={item.id} 
                style={[
                  styles.challengeCard, 
                  { 
                    backgroundColor: theme.card, 
                    borderColor: isCompleted && !isClaimed ? '#10b981' : theme.border,
                    borderWidth: isCompleted && !isClaimed ? 1.5 : 1
                  }
                ]}
              >
                {/* Top Info */}
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                  </View>
                  <View style={styles.rewardBadge}>
                    <Text style={styles.rewardText}>+{item.reward} XP</Text>
                  </View>
                </View>

                {/* Progress Indicator */}
                <View style={styles.progressSection}>
                  <View style={styles.progressTextRow}>
                    <Text style={[styles.progressCaption, { color: theme.textMuted }]}>Tiến độ</Text>
                    <Text style={[styles.progressFraction, { color: theme.textPrimary }]}>
                      {item.progress} / {item.target}
                    </Text>
                  </View>
                  <View style={[styles.progressBarBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                    <View style={[
                      styles.progressBarFill, 
                      { 
                        width: `${pct}%`,
                        backgroundColor: isCompleted ? '#10b981' : '#3b82f6'
                      }
                    ]} />
                  </View>
                </View>

                {/* Action button */}
                <View style={styles.cardActionRow}>
                  {isCompleted ? (
                    isClaimed ? (
                      <View style={styles.claimedBadge}>
                        <CircleCheck size={13} color="#94a3b8" />
                        <Text style={styles.claimedText}>ĐÃ NHẬN THƯỞNG</Text>
                      </View>
                    ) : (
                      <Pressable 
                        style={({ pressed }) => [
                          styles.claimBtn,
                          pressed && { opacity: 0.8 }
                        ]}
                        onPress={() => handleClaimPoints(item.id, item.reward, item.title)}
                      >
                        <LinearGradient
                          colors={['#10b981', '#059669']}
                          style={styles.btnGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <Award size={13} color="#fff" />
                          <Text style={styles.btnText}>NHẬN +{item.reward} XP</Text>
                        </LinearGradient>
                      </Pressable>
                    )
                  ) : (
                    <Pressable 
                      style={({ pressed }) => [
                        styles.actionBtn,
                        pressed && { opacity: 0.8 }
                      ]}
                      onPress={() => {
                        onBack();
                        if (onNavigateToTab) {
                          onNavigateToTab(item.linkTab);
                        }
                      }}
                    >
                      <Navigation size={13} color="#3b82f6" />
                      <Text style={[styles.actionBtnText, { color: '#3b82f6' }]}>THỰC HIỆN THỬ THÁCH</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <CircleHelp size={44} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Không có thử thách nào phù hợp bộ lọc.
            </Text>
          </View>
        )}
      </ScrollView>
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
    gap: 14,
  },
  
  // Summary status card styling
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  summaryPoints: {
    fontSize: 24,
    fontWeight: '950',
    marginTop: 2,
  },
  trophyWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.15)',
  },
  summarySubText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    marginTop: 10,
  },

  // Filter Tabs
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 0.8,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  filterTabActive: {
    borderColor: 'transparent',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '750',
  },

  // Challenge card layout
  challengeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '850',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 10.5,
    fontWeight: '600',
    lineHeight: 14,
  },
  rewardBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0.8,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  rewardText: {
    color: '#3b82f6',
    fontSize: 10.5,
    fontWeight: '900',
  },
  progressSection: {
    marginTop: 12,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressCaption: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  progressFraction: {
    fontSize: 10,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  cardActionRow: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  claimedText: {
    color: '#94a3b8',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  claimBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    height: 30,
    width: 130,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: 'rgba(59, 130, 246, 0.15)',
    height: 30,
  },
  actionBtnText: {
    fontSize: 9,
    fontWeight: '900',
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  btnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },

  // Empty state styling
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
