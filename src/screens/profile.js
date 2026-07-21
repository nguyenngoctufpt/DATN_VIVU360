import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View, Text, Image, Pressable, ScrollView, Alert, Animated, StyleSheet, Modal, Switch, Platform, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles, Award, Globe, QrCode, ChevronRight,
  Sun, Moon, User, Zap, LogOut, MapPin, Heart,
  Star, Camera, Settings, Shield, Bell, Pencil,
  Info, X, Award as AwardIcon, Trophy, Image as ImageIcon, Play,
  Users
} from 'lucide-react-native';
import { getRankDetails } from '../data';
// socialShared đã được thay thế — friends quản lý qua API
const { width } = Dimensions.get('window');

export function ProfileScreen({
  isDarkMode, setIsDarkMode, theme, userInfo, setUserInfo,
  onEditProfile, onLogout,
  onViewTiers, onViewChallenges, onNavigateToTab
}) {
  const points = userInfo?.points || 0;
  const rank = getRankDetails(points);
  const displayLevel = useMemo(() => {
    const lvl = userInfo?.level || '8';
    return String(lvl).startsWith('Cấp') ? lvl : `Cấp ${lvl}`;
  }, [userInfo?.level]);
  const xpAnim = useRef(new Animated.Value(0)).current;
  const xpProgress = (points % 1000) / 1000; // Progress toward next level
  const currentLevelXp = points % 1000;
  const nextLevelXp = 1000;

  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'reels' | 'settings'
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    newFeatures: true,
    trips: true,
    badges: true,
    news: false,
    marketing: false,
  });

  const toggleNotif = (key) =>
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const notifEnabledCount = Object.values(notifSettings).filter(Boolean).length;

  useEffect(() => {
    Animated.timing(xpAnim, {
      toValue: xpProgress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [xpProgress]);

  const barWidth = xpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const userPhotos = [
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1524230507669-e297d477b24d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
  ];

  const userReels = [
    { id: '1', title: 'Hoàng hôn Fansipan cực chất ☁️🏔️', cover: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=300&q=80', views: '12K' },
    { id: '2', title: 'Vịnh Hạ Long từ flycam 360° ⛵⚓', cover: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&q=80', views: '26K' }
  ];

  const gridPhotos = useMemo(() => {
    return [...new Set(userPhotos)];
  }, []);

  const userStats = [
    { label: 'Chuyến đi', val: '12', icon: MapPin, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', action: () => Alert.alert('Hành trình', 'Bạn đã hoàn thành 12 chuyến đi khám phá trên toàn quốc!') },
    { label: 'Yêu thích', val: '48', icon: Heart, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', action: () => Alert.alert('Yêu thích', 'Bạn đã lưu 48 địa điểm tham quan ảo yêu thích!') },
    { label: 'Đánh giá', val: '15', icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', action: () => Alert.alert('Đánh giá', 'Đóng góp 15 đánh giá chất lượng cao giúp cộng đồng du lịch Vivu360.') },
    { label: 'Ảnh đăng', val: String(gridPhotos.length), icon: Camera, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', action: () => Alert.alert('Kho ảnh', `Bạn đã chia sẻ ${gridPhotos.length} bức ảnh phong cảnh đẹp mắt trên bảng tin!`) },
  ];

  const badges = [
    { id: 1, name: 'Phượt Thủ 360', desc: 'Tham quan 5 điểm ảo', icon: Sparkles, color: '#facc15', earned: true, perk: 'Nhận thêm +10% XP khi tham gia tour ảo 360° tiếp theo.' },
    { id: 2, name: 'Tiên Phong', desc: 'Đăng ký tháng đầu', icon: Award, color: '#60a5fa', earned: true, perk: 'Khung viền Avatar đặc biệt lấp lánh biểu tượng Explorer.' },
    { id: 3, name: 'Nhà Thám Hiểm', desc: 'Đủ 3 miền Việt Nam', icon: Globe, color: '#34d399', earned: true, perk: 'Mở khóa nhãn hiệu "Bản đồ số nâng cao" hiển thị định vị 3D.' },
    { id: 4, name: 'Chuyên Gia', desc: 'Đánh giá 10+ điểm', icon: Shield, color: '#a78bfa', earned: false, perk: 'Nhận huy hiệu kim cương xanh lá nổi bật trên trang cá nhân.' },
  ];

  const handleOpenBadge = (badge) => {
    setSelectedBadge(badge);
    setBadgeModalVisible(true);
  };

  const isExperimentMember = userInfo?.name === 'Nguyễn Ngọc Tú';

  const settingsMenu = [
    {
      icon: User, label: 'Chỉnh sửa thông tin', color: '#3b82f6',
      right: null, onPress: onEditProfile,
    },
    {
      icon: Award, label: 'Hạng thành viên & Đặc quyền', color: '#facc15',
      right: <Text style={{ fontSize: 10, fontWeight: '850', color: rank.borderColor }}>{rank.rankName}</Text>,
      onPress: onViewTiers,
    },
    {
      icon: Zap, label: 'Thử thách & Điểm thưởng', color: '#10b981',
      right: <View style={{ backgroundColor: '#10b981', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 }}>
        <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>HOT</Text>
      </View>,
      onPress: onViewChallenges,
    },
    {
      icon: Bell, label: 'Thông báo', color: '#f59e0b',
      right: <View style={{ backgroundColor: notifEnabledCount > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.15)', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
        <Text style={{ color: notifEnabledCount > 0 ? '#f59e0b' : '#94a3b8', fontSize: 9, fontWeight: '800' }}>{notifEnabledCount} BẬT</Text>
      </View>,
      onPress: () => setShowNotifModal(true),
    },
    {
      icon: Globe, label: 'Ngôn ngữ', color: '#8b5cf6',
      right: <Text style={{ fontSize: 10, fontWeight: '700', color: '#8b5cf6' }}>Tiếng Việt</Text>,
      onPress: () => Alert.alert(
        'Chọn ngôn ngữ',
        'Ngôn ngữ hiển thị ứng dụng:',
        [
          { text: '🇻🇳  Tiếng Việt', onPress: () => {} },
          { text: '🇬🇧  English', onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển.') },
          { text: 'Hủy', style: 'cancel' },
        ]
      ),
    },
    {
      icon: Info, label: 'Về ứng dụng Vivu360', color: '#64748b',
      right: <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748b' }}>v2.4.1</Text>,
      onPress: () => setShowAboutModal(true),
    },
  ];

  return (
    <ScrollView
      style={[profStyles.root, { backgroundColor: isDarkMode ? '#000000' : theme.background }]}
      contentContainerStyle={profStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* A. PREMIUM GREETING HEADER */}
      <View style={profStyles.headerContainer}>
        <Text style={[profStyles.headerTitle, { color: theme.textPrimary }]}>Hồ Sơ Du Lịch</Text>
        <Pressable onPress={() => setIsDarkMode(!isDarkMode)} style={[profStyles.headerIconBtn, { marginRight: 8 }]}>
          {isDarkMode ? <Sun size={18} color="#fff" /> : <Moon size={18} color="#0f172a" />}
        </Pressable>
      </View>

      {/* B. PASSPORT AVATAR CARD */}
      <View style={[profStyles.passportCard, { backgroundColor: isDarkMode ? 'rgba(24, 24, 27, 0.4)' : 'rgba(255, 255, 255, 0.7)', borderColor: theme.border }]}>
        <View style={profStyles.passportHeader}>
          <LinearGradient
            colors={rank.colors}
            style={profStyles.avatarRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[profStyles.avatarInner, { backgroundColor: isDarkMode ? '#18181b' : '#fff' }]}>
              <Image source={{ uri: userInfo.avatar }} style={profStyles.avatarImage} />
            </View>
          </LinearGradient>

          <View style={profStyles.passportMeta}>
            <Text style={[profStyles.displayName, { color: theme.textPrimary }]}>{userInfo.name}</Text>
            {isExperimentMember ? (
              <Text style={{ fontSize: 10, color: '#bef264', fontWeight: '850', marginTop: 1 }}>
                Hội viên thử nghiệm 🧪
              </Text>
            ) : (
              <Text style={[profStyles.handleText, { color: theme.textSecondary }]}>
                @{(userInfo.name || 'traveler').toLowerCase().replace(/\s/g, '.')}
              </Text>
            )}

            <View style={profStyles.rankRow}>
              <LinearGradient
                colors={rank.colors}
                style={profStyles.rankPill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <AwardIcon size={10} color="#0f172a" fill="#0f172a" />
                <Text style={profStyles.rankPillText}>{rank.rankName}</Text>
              </LinearGradient>
              <View style={[profStyles.levelBadge, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.04)' }]}>
                <Text style={[profStyles.levelText, { color: theme.textSecondary }]}>{displayLevel}</Text>
              </View>
            </View>
          </View>

          <Pressable onPress={onEditProfile} style={[profStyles.pencilBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)' }]}>
            <Pencil size={13} color={theme.textPrimary} />
          </Pressable>
        </View>

        {/* Bio capsule block */}
        {userInfo.bio && (
          <View style={[profStyles.bioCapsule, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.03)', borderColor: theme.border }]}>
            <Text style={[profStyles.bioText, { color: theme.textSecondary }]}>"{userInfo.bio}"</Text>
          </View>
        )}
      </View>

      {/* C. XP PROGRESS BAR */}
      <View style={[profStyles.xpProgressCard, { backgroundColor: isDarkMode ? 'rgba(24, 24, 27, 0.4)' : 'rgba(255,255,255,0.7)', borderColor: theme.border }]}>
        <View style={profStyles.xpLabelRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="#3b82f6" fill="#3b82f6" />
            <Text style={[profStyles.xpTitle, { color: theme.textPrimary }]}>Tiến trình điểm thưởng</Text>
          </View>
          <Text style={{ fontSize: 11.5, fontWeight: '850', color: '#3b82f6' }}>
            {points.toLocaleString()} XP
          </Text>
        </View>

        <View style={[profStyles.xpTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }]}>
          <Animated.View style={[profStyles.xpThumb, { width: barWidth }]}>
            <LinearGradient
              colors={['#3b82f6', '#06b6d4', '#8b5cf6']}
              style={{ flex: 1, borderRadius: 5 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: '750', color: theme.textMuted }}>{displayLevel}</Text>
          <Text style={{ fontSize: 10, fontWeight: '750', color: theme.textMuted }}>{currentLevelXp}/{nextLevelXp} XP ({Math.round(xpProgress * 100)}%)</Text>
        </View>
      </View>

      {/* INSTAGRAM STYLE TABS FOR PASS PASS PORT SCREEN */}
      <View style={[profStyles.tabBarContainer, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => setActiveTab('grid')} style={[profStyles.tabBarItem, activeTab === 'grid' && { borderBottomColor: theme.textPrimary }]}>
          <ImageIcon size={20} color={activeTab === 'grid' ? theme.textPrimary : theme.textMuted} />
        </Pressable>
        <Pressable onPress={() => setActiveTab('reels')} style={[profStyles.tabBarItem, activeTab === 'reels' && { borderBottomColor: theme.textPrimary }]}>
          <Play size={20} color={activeTab === 'reels' ? theme.textPrimary : theme.textMuted} />
        </Pressable>
        <Pressable onPress={() => setActiveTab('friends')} style={[profStyles.tabBarItem, activeTab === 'friends' && { borderBottomColor: theme.textPrimary }]}>
          <Users size={20} color={activeTab === 'friends' ? theme.textPrimary : theme.textMuted} />
        </Pressable>
        <Pressable onPress={() => setActiveTab('settings')} style={[profStyles.tabBarItem, activeTab === 'settings' && { borderBottomColor: theme.textPrimary }]}>
          <Settings size={20} color={activeTab === 'settings' ? theme.textPrimary : theme.textMuted} />
        </Pressable>
      </View>

      {activeTab === 'grid' && (
        <View style={profStyles.gridContainer}>
          <View style={profStyles.gridRow}>
            {gridPhotos.map((url, index) => (
              <Pressable key={index} style={profStyles.gridItem} onPress={() => Alert.alert('Bài đăng', 'Ảnh lưu niệm hành trình của bạn!')}>
                <Image source={{ uri: url }} style={profStyles.gridImage} />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'reels' && (
        <View style={profStyles.gridContainer}>
          <View style={profStyles.gridRow}>
            {userReels.map((reel) => (
              <Pressable key={reel.id} style={profStyles.gridItem} onPress={() => Alert.alert('Video Reels', `Phát video: ${reel.title}`)}>
                <Image source={{ uri: reel.cover }} style={profStyles.gridImage} />
                <View style={profStyles.playOverlay}>
                  <Play size={12} color="#fff" fill="#fff" />
                  <Text style={profStyles.playOverlayText}>{reel.views}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'friends' && (
        <View style={{ paddingHorizontal: 16, paddingTop: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: theme.textPrimary, marginBottom: 12 }}>
            Bạn đồng hành
          </Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 50 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: isDarkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Users size={34} color="#3b82f6" />
            </View>
            <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '800', marginBottom: 6 }}>Chưa có bạn đồng hành</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 }}>
              Tìm bạn bè qua tab Bảng tin → nhập email hoặc số điện thoại vào ô tìm kiếm.
            </Text>
            <Pressable
              style={{ marginTop: 18, backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}
              onPress={() => onNavigateToTab && onNavigateToTab('social')}
            >
              <Users size={14} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Tìm bạn đồng hành</Text>
            </Pressable>
          </View>
        </View>
      )}

      {activeTab === 'settings' && (
        <View style={{ marginTop: 12 }}>
          {/* D. BORDERLESS CIRCULAR STATS GRID (Matching Categories grid) */}
          <View style={profStyles.sectionHeader}>
            <Text style={[profStyles.sectionTitleText, { color: theme.textPrimary }]}>Thống kê cá nhân</Text>
          </View>
          <View style={profStyles.statsRowGrid}>
            {userStats.map((s, i) => {
              const SIcon = s.icon;
              return (
                <Pressable
                  key={i}
                  style={[profStyles.statCardCell, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={s.action}
                >
                  <View style={[profStyles.statIconCircle, { backgroundColor: s.bg }]}>
                    <SIcon size={16} color={s.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[profStyles.statLabelCellText, { color: theme.textSecondary }]}>{s.label}</Text>
                    <Text style={[profStyles.statValueCellText, { color: theme.textPrimary }]}>{s.val}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* E. EARNED BADGES DISPLAY */}
          <View style={profStyles.sectionHeader}>
            <Text style={[profStyles.sectionTitleText, { color: theme.textPrimary }]}>Huy hiệu đã đạt</Text>
          </View>
          <View style={profStyles.badgesContainer}>
            {badges.map((b) => {
              const BIcon = b.icon;
              return (
                <Pressable
                  key={b.id}
                  onPress={() => handleOpenBadge(b)}
                  style={[
                    profStyles.badgeCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    !b.earned && { opacity: 0.4 }
                  ]}
                >
                  <BIcon size={20} color={b.color} />
                  <Text numberOfLines={1} style={[profStyles.badgeNameText, { color: theme.textPrimary }]}>{b.name}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* F. SETTINGS MENU CARD (Instagram style rows) */}
          <View style={profStyles.sectionHeader}>
            <Text style={[profStyles.sectionTitleText, { color: theme.textPrimary }]}>Tiện ích & Cài đặt</Text>
          </View>
          <View style={[profStyles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {settingsMenu.map((m, i) => {
              const MIcon = m.icon;
              return (
                <View key={i}>
                  <Pressable
                    style={({ pressed }) => [profStyles.menuItem, pressed && { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}
                    onPress={m.onPress}
                  >
                    <View style={profStyles.menuLeft}>
                      <View style={[profStyles.menuIconWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <MIcon size={16} color={m.color} />
                      </View>
                      <Text style={[profStyles.menuLabelText, { color: theme.textPrimary }]}>{m.label}</Text>
                    </View>
                    <View style={profStyles.menuRight}>
                      {m.right}
                      <ChevronRight size={16} color={theme.textMuted} />
                    </View>
                  </Pressable>
                  {i < settingsMenu.length - 1 && <View style={[profStyles.divider, { backgroundColor: theme.border }]} />}
                </View>
              );
            })}
          </View>

          {/* LOGOUT BUTTON */}
          <Pressable
            style={({ pressed }) => [
              profStyles.logoutBtn,
              pressed && { opacity: 0.8 }
            ]}
            onPress={onLogout}
          >
            <LogOut size={16} color="#fff" />
            <Text style={profStyles.logoutBtnText}>Đăng xuất tài khoản</Text>
          </Pressable>
        </View>
      )}

      {/* MODAL: BADGE INFO */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={badgeModalVisible}
        onRequestClose={() => setBadgeModalVisible(false)}
      >
        <View style={profStyles.modalBackdrop}>
          <View style={[profStyles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {selectedBadge && (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <View style={[profStyles.modalBadgeIconCircle, { backgroundColor: selectedBadge.color + '22' }]}>
                  <selectedBadge.icon size={38} color={selectedBadge.color} />
                </View>
                <Text style={[profStyles.modalBadgeName, { color: theme.textPrimary }]}>{selectedBadge.name}</Text>
                <Text style={[profStyles.modalBadgeDesc, { color: theme.textSecondary }]}>{selectedBadge.desc}</Text>
                
                <View style={[profStyles.perkBox, { backgroundColor: theme.searchBg, borderColor: theme.border }]}>
                  <Trophy size={16} color="#bef264" />
                  <Text style={[profStyles.perkText, { color: theme.textSecondary }]}>Đặc quyền: {selectedBadge.perk}</Text>
                </View>

                <Pressable style={profStyles.modalCloseBtn} onPress={() => setBadgeModalVisible(false)}>
                  <Text style={profStyles.modalCloseBtnText}>Đóng</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL: NOTIFICATIONS SETTINGS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNotifModal}
        onRequestClose={() => setShowNotifModal(false)}
      >
        <View style={profStyles.modalBackdrop}>
          <View style={[profStyles.notifModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[profStyles.notifHeader, { borderBottomColor: theme.border }]}>
              <Text style={[profStyles.notifTitle, { color: theme.textPrimary }]}>Cài đặt thông báo</Text>
              <Pressable style={profStyles.notifClose} onPress={() => setShowNotifModal(false)}>
                <X size={20} color={theme.textPrimary} />
              </Pressable>
            </View>
            <View style={{ padding: 16 }}>
              {[
                { key: 'newFeatures', label: 'Tính năng & Cập nhật mới' },
                { key: 'trips', label: 'Lịch trình du lịch & Khám phá' },
                { key: 'badges', label: 'Huy hiệu & Điểm thưởng XP' },
                { key: 'news', label: 'Tin tức & Khuyến mại phòng vé' },
                { key: 'marketing', label: 'Bản tin gợi ý hành trình' }
              ].map((item, idx) => (
                <View key={idx} style={[profStyles.notifRow, { borderBottomColor: theme.border }]}>
                  <Text style={[profStyles.notifRowLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                  <Switch
                    value={notifSettings[item.key]}
                    onValueChange={() => toggleNotif(item.key)}
                    trackColor={{ false: '#767577', true: '#3b82f6' }}
                    thumbColor={notifSettings[item.key] ? '#f4f3f4' : '#f4f3f4'}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: ABOUT APPLICATION */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAboutModal}
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={profStyles.modalBackdrop}>
          <View style={[profStyles.aboutCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={profStyles.notifHeader}>
              <Text style={[profStyles.notifTitle, { color: theme.textPrimary }]}>Thông tin Vivu360</Text>
              <Pressable onPress={() => setShowAboutModal(false)} style={profStyles.notifClose}>
                <X size={20} color={theme.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/826/826070.png' }} style={{ width: 64, height: 64 }} />
                <Text style={[profStyles.aboutAppName, { color: theme.textPrimary }]}>Vivu360 App</Text>
                <Text style={{ fontSize: 11, color: theme.textMuted, fontWeight: '700' }}>Phiên bản v2.4.1 (Stable)</Text>
              </View>
              <Text style={[profStyles.aboutDesc, { color: theme.textSecondary }]}>
                Vivu360 là ứng dụng số hóa bản đồ du lịch, cung cấp tour ảo 3D/360° tương tác định vị GPS toàn diện đầu tiên tại Việt Nam.
              </Text>
              <Text style={[profStyles.aboutDesc, { color: theme.textSecondary }]}>
                Phát triển bởi đội ngũ kỹ sư Việt Nam đam mê công nghệ AR và quảng bá danh thắng nước nhà.
              </Text>
              <Text style={[profStyles.aboutDesc, { color: theme.textSecondary }]}>
                Cảm ơn bạn đã đồng hành và trở thành hội viên danh giá của Vivu360! 🇻🇳✨
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const profStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '950',
    letterSpacing: -0.5,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passportCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  passportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    position: 'relative',
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  passportMeta: {
    flex: 1,
  },
  displayName: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  handleText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rankPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 8,
    fontWeight: '900',
  },
  pencilBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioCapsule: {
    marginTop: 14,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  bioText: {
    fontSize: 11.5,
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 17,
  },
  xpProgressCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  xpTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  xpTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpThumb: {
    height: '100%',
    borderRadius: 5,
  },
  sectionHeader: {
    marginVertical: 14,
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statsRowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  statCardCell: {
    width: (width - 42) / 2,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabelCellText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  statValueCellText: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 1,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    width: (width - 42) / 2,
  },
  badgeNameText: {
    fontSize: 11,
    fontWeight: '800',
  },
  menuCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabelText: {
    fontSize: 13,
    fontWeight: '750',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  logoutBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 30,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  modalBadgeIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalBadgeName: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  modalBadgeDesc: {
    fontSize: 12.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  perkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    marginBottom: 20,
  },
  perkText: {
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  modalCloseBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    height: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  notifModalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    paddingBottom: 16,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  notifClose: {
    padding: 4,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  notifRowLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  aboutCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    paddingBottom: 20,
    maxHeight: 420,
  },
  aboutAppName: {
    fontSize: 17,
    fontWeight: '950',
    marginTop: 10,
  },
  aboutDesc: {
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 0.5,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: 'transparent',
  },
  gridContainer: {
    padding: 1,
    marginTop: 6,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: (width - 32) / 3 - 0.7,
    height: (width - 32) / 3 - 0.7,
    margin: 0.3,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  playOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  playOverlayText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
});
