import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, Text, Image, Pressable, ScrollView, Alert, Animated, StyleSheet, Modal, Switch, Platform, Dimensions, TextInput, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles, Award, Globe, QrCode, ChevronRight,
  Sun, Moon, User, Zap, LogOut, MapPin, Heart,
  Star, Camera, Settings, Shield, Bell, Pencil,
  Info, X, Award as AwardIcon, Trophy, Image as ImageIcon, Play,
  Users, CheckCircle, Search, Send, UserCheck, MessageSquare
} from 'lucide-react-native';
import { getRankDetails } from '../data';
import { searchFriends, getUserStats } from '../services/userService';
import { getFriendships } from '../services/friendshipService';
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
  const [showFindFriendsModal, setShowFindFriendsModal] = useState(false);
  const [friendSearchText, setFriendSearchText] = useState('');
  const [friendSearchResults, setFriendSearchResults] = useState([]);
  const [isSearchingFriends, setIsSearchingFriends] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);
  const [actualFriendsCount, setActualFriendsCount] = useState(0);
  const [realStats, setRealStats] = useState({ posts: 0, followers: 0, following: 0 });

  const fetchRealStats = useCallback(() => {
    const currentUid = userInfo?.firebaseUid || userInfo?.id;
    if (!currentUid) return;

    getUserStats(currentUid)
      .then(st => {
        if (st) setRealStats(st);
      })
      .catch(() => {});

    getFriendships(currentUid, 'accepted')
      .then(friends => {
        if (Array.isArray(friends)) {
          setActualFriendsCount(friends.length);
        }
      })
      .catch(() => {});
  }, [userInfo?.firebaseUid, userInfo?.id]);

  useEffect(() => {
    fetchRealStats();
    const timer = setInterval(fetchRealStats, 5000);
    return () => clearInterval(timer);
  }, [fetchRealStats]);

  useEffect(() => {
    const query = friendSearchText.trim();
    if (query.length < 2) {
      setFriendSearchResults([]);
      setIsSearchingFriends(false);
      return;
    }

    let active = true;
    setIsSearchingFriends(true);
    const timer = setTimeout(() => {
      searchFriends(query, userInfo?.id)
        .then(users => active && setFriendSearchResults(Array.isArray(users) ? users : []))
        .catch(() => active && setFriendSearchResults([]))
        .finally(() => active && setIsSearchingFriends(false));
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [friendSearchText, userInfo?.id]);

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
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524230507669-e297d477b24d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  ];

  const userReels = [
    { id: '1', title: 'Hoàng hôn Fansipan cực chất ☁️🏔️', cover: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=300&q=80', views: '12K' },
    { id: '2', title: 'Vịnh Hạ Long từ flycam 360° ⛵⚓', cover: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&q=80', views: '26K' }
  ];

  const gridPhotos = useMemo(() => {
    return userPhotos;
  }, [userPhotos]);

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
      icon: Award, label: 'Gói VIP Pass Premium 👑', color: '#f59e0b',
      right: <View style={{ backgroundColor: 'rgba(245,158,11,0.2)', borderWidth: 1, borderColor: '#facc15', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
        <Text style={{ color: '#facc15', fontSize: 9, fontWeight: '900' }}>VIP PASS</Text>
      </View>,
      onPress: onViewTiers,
    },
    {
      icon: User, label: 'Chỉnh sửa thông tin cá nhân', color: '#3b82f6',
      right: null, onPress: onEditProfile,
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

      {/* B. LUXURY PASSPORT CARD */}
      <View style={[profStyles.passportCard, { backgroundColor: isDarkMode ? '#11131c' : '#ffffff', borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.35)' : 'rgba(220, 38, 38, 0.25)' }]}>
        {/* Cover Photo Header */}
        <View style={profStyles.passportCoverContainer}>
          <Image
            source={{ uri: userInfo.cover || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80' }}
            style={profStyles.passportCoverImg}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(17,19,28,0.3)', isDarkMode ? '#11131c' : '#ffffff']}
            style={profStyles.passportCoverGradient}
          />
        </View>

        {/* Passport Details */}
        <View style={profStyles.passportBody}>
          <View style={profStyles.passportHeader}>
            <LinearGradient
              colors={rank.colors}
              style={profStyles.avatarRing}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[profStyles.avatarInner, { backgroundColor: isDarkMode ? '#11131c' : '#fff' }]}>
                <Image source={{ uri: userInfo?.avatar || 'https://i.pravatar.cc/150?img=68' }} style={profStyles.avatarImage} />
              </View>
            </LinearGradient>

            <View style={profStyles.passportMeta}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[profStyles.displayName, { color: theme.textPrimary }]}>{userInfo.name}</Text>
                <CheckCircle size={17} color="#fff" fill="#f59e0b" />
              </View>
              {isExperimentMember ? (
                <Text style={{ fontSize: 10.5, color: '#f59e0b', fontWeight: '850', marginTop: 2 }}>
                  Hội viên thử nghiệm 🧪
                </Text>
              ) : (
                <Text style={[profStyles.handleText, { color: theme.textSecondary }]}>
                  @{(userInfo.name || 'traveler').toLowerCase().replace(/\s/g, '.')}
                </Text>
              )}

              <View style={profStyles.rankRow}>
                <View style={[profStyles.levelBadge, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.4)', borderWidth: 1 }]}>
                  <Text style={[profStyles.levelText, { color: '#f59e0b' }]}>{displayLevel}</Text>
                </View>
              </View>
            </View>

            <Pressable onPress={onEditProfile} style={[profStyles.pencilBtn, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)', borderColor: '#f59e0b', borderWidth: 1.2 }]}>
              <Pencil size={15} color="#f59e0b" />
            </Pressable>
          </View>

          {/* Bio capsule block */}
          {userInfo?.bio && (
            <View style={[profStyles.bioCapsule, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.03)', borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.18)' }]}>
              <Text style={[profStyles.bioText, { color: theme.textSecondary }]}>"{userInfo.bio}"</Text>
            </View>
          )}

          {/* Followers & Following Stats Bar */}
          <View style={[profStyles.followStatsContainer, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.05)', borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)' }]}>
            <View style={profStyles.followStatItem}>
              <Text style={[profStyles.followStatVal, { color: '#f59e0b' }]}>
                {realStats.posts ?? 0}
              </Text>
              <Text style={profStyles.followStatLabel}>Bài viết</Text>
            </View>
            <View style={[profStyles.followStatDivider, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.2)' }]} />
            <View style={profStyles.followStatItem}>
              <Text style={[profStyles.followStatVal, { color: '#f59e0b' }]}>
                {realStats.followers ?? actualFriendsCount}
              </Text>
              <Text style={profStyles.followStatLabel}>Người theo dõi</Text>
            </View>
            <View style={[profStyles.followStatDivider, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.2)' }]} />
            <View style={profStyles.followStatItem}>
              <Text style={[profStyles.followStatVal, { color: '#f59e0b' }]}>
                {realStats.following ?? actualFriendsCount}
              </Text>
              <Text style={profStyles.followStatLabel}>Đang theo dõi</Text>
            </View>
          </View>
        </View>
      </View>

      {/* C. STATS & SETTINGS SECTION */}
      <View style={{ marginTop: 12 }}>


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
              profStyles.logoutBtnWrap,
              pressed && { opacity: 0.85 }
            ]}
            onPress={onLogout}
          >
            <LinearGradient
              colors={['#dc2626', '#b91c1c', '#f59e0b']}
              style={profStyles.logoutBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <LogOut size={16} color="#fff" />
              <Text style={profStyles.logoutBtnText}>Đăng xuất tài khoản</Text>
            </LinearGradient>
          </Pressable>
        </View>



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

      {/* MODAL: DEDICATED FIND FRIENDS SCREEN */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFindFriendsModal}
        onRequestClose={() => setShowFindFriendsModal(false)}
      >
        <View style={profStyles.modalBackdrop}>
          <View style={[profStyles.findFriendsModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[profStyles.notifHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Users size={18} color="#3b82f6" />
                <Text style={[profStyles.notifTitle, { color: theme.textPrimary }]}>Tìm bạn đồng hành Vivu360</Text>
              </View>
              <Pressable style={profStyles.notifClose} onPress={() => setShowFindFriendsModal(false)}>
                <X size={20} color={theme.textPrimary} />
              </Pressable>
            </View>

            {/* Search Input Bar */}
            <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
              <View style={[profStyles.searchBarBox, { backgroundColor: isDarkMode ? '#1e1b2e' : '#f1f5f9', borderColor: theme.border }]}>
                <Search size={16} color={theme.textMuted} />
                <TextInput
                  style={[profStyles.searchBarInput, { color: theme.textPrimary }]}
                  placeholder="Nhập tên, email hoặc số điện thoại..."
                  placeholderTextColor={theme.textMuted}
                  value={friendSearchText}
                  onChangeText={setFriendSearchText}
                />
                {friendSearchText ? (
                  <Pressable onPress={() => setFriendSearchText('')}>
                    <X size={16} color={theme.textMuted} />
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* Search Results List */}
            <ScrollView style={{ paddingHorizontal: 16, paddingTop: 10, maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {isSearchingFriends ? (
                <View style={{ paddingVertical: 30, alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Đang tìm kiếm bạn đồng hành...</Text>
                </View>
              ) : friendSearchResults.length > 0 ? (
                friendSearchResults.map((friend) => (
                  <View
                    key={friend.firebaseUid || friend.id}
                    style={[profStyles.friendResultCard, { backgroundColor: isDarkMode ? '#1e1b2e' : '#f8fafc', borderColor: theme.border }]}
                  >
                    <Image
                      source={{ uri: friend.avatar || 'https://i.pravatar.cc/150?img=11' }}
                      style={profStyles.friendResultAvatar}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[profStyles.friendResultName, { color: theme.textPrimary }]}>{friend.name}</Text>
                      <Text style={[profStyles.friendResultMeta, { color: theme.textSecondary }]}>
                        {friend.email || 'Hội viên Vivu360'}
                      </Text>
                    </View>
                    <Pressable
                      style={profStyles.chatWithFriendBtn}
                      onPress={() => {
                        setShowFindFriendsModal(false);
                        onNavigateToTab && onNavigateToTab('chat');
                      }}
                    >
                      <MessageSquare size={14} color="#fff" />
                      <Text style={profStyles.chatWithFriendBtnText}>Chat</Text>
                    </Pressable>
                  </View>
                ))
              ) : friendSearchText.trim().length >= 2 ? (
                <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Không tìm thấy người dùng phù hợp.</Text>
                </View>
              ) : (
                <View style={{ paddingVertical: 30, alignItems: 'center', gap: 6 }}>
                  <Users size={32} color={theme.textMuted} />
                  <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>
                    Nhập tên hoặc email bạn bè để kết nối chuyến đi du lịch 360°!
                  </Text>
                </View>
              )}
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
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  passportCoverContainer: {
    height: 110,
    width: '100%',
    position: 'relative',
  },
  passportCoverImg: {
    width: '100%',
    height: '100%',
  },
  passportCoverGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  passportBody: {
    padding: 18,
    paddingTop: 0,
  },
  passportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    marginTop: -36,
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
  followStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  followStatItem: {
    alignItems: 'center',
  },
  followStatVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  followStatLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 2,
  },
  followStatDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  xpProgressCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 16,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  gridContainer: {
    marginTop: 4,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: (width - 48) / 3,
    height: (width - 48) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  playOverlayText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
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
  logoutBtnWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 30,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  logoutBtnGrad: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
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
  findFriendsModalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    paddingBottom: 16,
    maxHeight: '80%',
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchBarInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
  },
  friendResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  friendResultAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  friendResultName: {
    fontSize: 14,
    fontWeight: '800',
  },
  friendResultMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  chatWithFriendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chatWithFriendBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
