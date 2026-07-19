import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, TextInput, Dimensions, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ChevronUp,
  MoreHorizontal,
  ChevronRight,
  Flame,
  Heart,
  MapPin,
  Star,
  CloudSun,
  Clock,
  HelpCircle,
  CheckCircle,
  Camera,
  QrCode,
  Award,
  Globe,
  User,
  ShieldCheck,
  Scan,
  Sun,
  Moon,
  LogOut,
  Settings,
  MessageSquare,
  Map as MapIcon,
  Zap,
  RefreshCw,
  Compass,
  Box,
  X,
  Mic,
  Send,
  Trash2,
  Building,
  Car,
  Wifi,
  Ticket,
  Newspaper,
} from 'lucide-react-native';
import { getDiaDiem } from '../services/diaDiemService';
import {
  allCategories,
  banners,
  destinations,
  exploreItems,
  mockMapMarkers,
  getRankDetails,
} from '../data';


const { width } = Dimensions.get('window');

// 1. HOME SCREEN COMPONENT
export function HomeScreen({
  currentTime,
  banner,
  currentBanner,
  setCurrentBanner,
  expandedCategories,
  setExpandedCategories,
  displayedCategories,
  isDarkMode,
  setIsDarkMode,
  theme,
  currentUser,
  onNavigateToExplore,
  onNavigateToTab,
  onNavigateToTour,
}) {
  //Địa điểm
  const [diaDiem, setDiaDiem] = useState([]);
//Hàm gọi API địa điểm
    const fetchDiaDiem = async () => {
      try {
        const data = await getDiaDiem()
          console.log("API trả về:", data);
      setDiaDiem(data.slice(0,4));
      } catch (error) {
            console.log("Lỗi API:", error);
      }
    }

    useEffect(() =>{
      fetchDiaDiem();
    },[])

  const rank = getRankDetails(currentUser.points || 0);
  const currentPoints = currentUser.points || 8250;
  const nextRankPoints = rank.maxPoints;
  const minRankPoints = rank.minPoints;
  const progressRatio = Math.max(0, Math.min(1, (currentPoints - minRankPoints) / (nextRankPoints - minRankPoints || 1)));
  const [searchQuery, setSearchQuery] = useState('');

  // Search & Feature States
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Bản đồ 3D', 'Vé của tôi', 'Quét AR']);

  // Service Categories Grid List
  const serviceCategories = useMemo(() => {
    const primary = [
      { key: 'hotel', label: 'Khách sạn', Icon: Building, colors: ['#ff6b6b', '#ee5253'], type: 'explore' },
      { key: 'tour', label: 'Tours Hot', Icon: Compass, colors: ['#0abde3', '#00d2d3'], type: 'explore' },
      { key: 'ticket', label: 'Vé vui chơi', Icon: Ticket, colors: ['#ff9f43', '#f39c12'], type: 'explore' },
      { key: 'car', label: 'Thuê xe', Icon: Car, colors: ['#10ac84', '#1dd1a1'], type: 'explore' },
      { key: 'sim', label: 'WiFi & SIM', Icon: Wifi, colors: ['#5f27cd', '#341f97'], type: 'explore' },
      { key: 'map', label: 'Bản đồ 3D', Icon: MapIcon, colors: ['#3b82f6', '#1d4ed8'], type: 'tab' },
      { key: 'camera', label: 'Quét AR', Icon: Scan, colors: ['#ef4444', '#b91c1c'], type: 'tab' },
      { key: 'ticketList', label: 'Vé của tôi', Icon: Ticket, colors: ['#d946ef', '#a21caf'], type: 'tab' },
    ];
    
    const secondary = [
      { key: 'social', label: 'Bảng tin', Icon: Newspaper, colors: ['#f59e0b', '#b45309'], type: 'tab' },
      { key: 'chat', label: 'Nhóm chat', Icon: MessageSquare, colors: ['#8b5cf6', '#6d28d9'], type: 'tab' },
      { key: 'profile', label: 'Cá nhân', Icon: User, colors: ['#0ea5e9', '#0369a1'], type: 'tab' },
    ];

    return expandedCategories ? [...primary, ...secondary] : primary;
  }, [expandedCategories]);

  
  const searchableFeatures = useMemo(() => {
    const categories = allCategories.map(cat => ({
      key: `cat-${cat.key}`,
      label: cat.label,
      type: 'category',
      Icon: cat.Icon,
      colors: cat.colors,
      description: `Khám phá dịch vụ ${cat.label.toLowerCase()}`,
      action: () => {
        const routeKeys = ['map', 'explore', 'social', 'chat', 'camera', 'ticketList', 'profile'];
        if (routeKeys.includes(cat.key) && onNavigateToTab) {
          onNavigateToTab(cat.key);
        } else if (onNavigateToExplore) {
          onNavigateToExplore(cat.key, '');
        }
      }
    }));

  
    const appFeatures = [
      {
        key: 'feat-map',
        label: 'Bản đồ du lịch Vivu360',
        type: 'tab',
        Icon: MapIcon,
        colors: ['#3b82f6', '#1d4ed8'],
        description: 'Xem bản đồ tương tác và virtual tour 360',
        action: () => {
          if (onNavigateToTab) {
            onNavigateToTab('map');
          }
        }
      },
      {
        key: 'feat-social',
        label: 'Cộng đồng & Bảng tin',
        type: 'tab',
        Icon: Newspaper,
        colors: ['#f59e0b', '#b45309'],
        description: 'Xem bài viết chia sẻ kinh nghiệm du lịch',
        action: () => {
          if (onNavigateToTab) {
            onNavigateToTab('social');
          }
        }
      },
      {
        key: 'feat-chat',
        label: 'Nhóm chat cộng đồng',
        type: 'tab',
        Icon: MessageSquare,
        colors: ['#8b5cf6', '#6d28d9'],
        description: 'Trò chuyện cùng các du khách khác',
        action: () => {
          if (onNavigateToTab) {
            onNavigateToTab('chat');
          }
        }
      },
      {
        key: 'feat-camera',
        label: 'Quét điểm đến AR 360°',
        type: 'tab',
        Icon: Scan,
        colors: ['#ef4444', '#b91c1c'],
        description: 'Mở camera quét phong cảnh nhận dạng 3D',
        action: () => {
          if (onNavigateToTab) {
            onNavigateToTab('camera');
          }
        }
      },
      {
        key: 'feat-profile',
        label: 'Trang cá nhân & Cài đặt',
        type: 'tab',
        Icon: User,
        colors: ['#0ea5e9', '#0369a1'],
        description: 'Cài đặt hệ thống, xem thông tin cá nhân',
        action: () => {
          if (onNavigateToTab) {
            onNavigateToTab('profile');
          }
        }
      },
      {
        key: 'feat-ticketList',
        label: 'Vé của tôi / Vé điện tử',
        type: 'tab',
        Icon: Ticket,
        colors: ['#d946ef', '#a21caf'],
        description: 'Quản lý danh sách vé đã đặt và guides',
        action: () => {
          if (onNavigateToTab) {
            onNavigateToTab('ticketList');
          }
        }
      }
    ];

    const bookingFeatures = [
      {
        key: 'book-hotel',
        label: 'Đặt Khách sạn',
        type: 'explore',
        Icon: Building,
        colors: ['#ff6b6b', '#ee5253'],
        description: 'Tìm kiếm và đặt phòng khách sạn lưu trú',
        action: () => {
          if (onNavigateToExplore) {
            onNavigateToExplore('hotel', '');
          }
        }
      },
      {
        key: 'book-tour',
        label: 'Đặt Tours du lịch Hot',
        type: 'explore',
        Icon: Compass,
        colors: ['#0abde3', '#00d2d3'],
        description: 'Đặt tour du lịch ảo 360 và thực tế',
        action: () => {
          if (onNavigateToExplore) {
            onNavigateToExplore('tour', '');
          }
        }
      },
      {
        key: 'book-ticket',
        label: 'Mua Vé vui chơi',
        type: 'explore',
        Icon: Ticket,
        colors: ['#ff9f43', '#f39c12'],
        description: 'Mua vé tham quan, vui chơi giải trí',
        action: () => {
          if (onNavigateToExplore) {
            onNavigateToExplore('ticket', '');
          }
        }
      },
      {
        key: 'book-car',
        label: 'Thuê xe tự lái',
        type: 'explore',
        Icon: Car,
        colors: ['#10ac84', '#1dd1a1'],
        description: 'Thuê xe ô tô, xe máy tự lái giá tốt',
        action: () => {
          if (onNavigateToExplore) {
            onNavigateToExplore('car', '');
          }
        }
      },
      {
        key: 'book-sim',
        label: 'Mua WiFi & SIM du lịch',
        type: 'explore',
        Icon: Wifi,
        colors: ['#5f27cd', '#341f97'],
        description: 'Mua SIM 4G, thiết bị phát WiFi',
        action: () => {
          if (onNavigateToExplore) {
            onNavigateToExplore('sim', '');
          }
        }
      }
    ];

    return [...categories, ...appFeatures, ...bookingFeatures];
  }, [onNavigateToExplore, onNavigateToTab]);

  // Global Search Engine (Local App Features Only)
  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return { features: [] };
    const query = searchQuery.toLowerCase().trim();

    const matchedFeatures = searchableFeatures.filter(feature => 
      feature.label.toLowerCase().includes(query) ||
      feature.description.toLowerCase().includes(query)
    );

    return {
      features: matchedFeatures
    };
  }, [searchQuery, searchableFeatures]);

  const hasGlobalResults = globalSearchResults.features.length > 0;

  const vrHighlights = [
    {
      id: 1,
      title: 'Vịnh Hạ Long VR 360°',
      region: 'Quảng Ninh',
      image: 'https://images.unsplash.com/photo-1524230507669-e297d477b24d?auto=format&fit=crop&w=800&q=80',
      views: '12.4k',
      spots: '6 điểm ngắm cảnh',
    },
    {
      id: 2,
      title: 'Phố Cổ Hội An VR 360°',
      region: 'Quảng Nam',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      views: '9.8k',
      spots: '5 điểm ngắm cảnh',
    },
    {
      id: 3,
      title: 'Đảo Phú Quốc VR 360°',
      region: 'Kiên Giang',
      image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80',
      views: '15.2k',
      spots: '4 điểm ngắm cảnh',
    },
  ];

  return (
    <View style={styles.tabContainer}>
      {/* HERO SECTION */}
      <View style={styles.hero}>
        <Image
          source={{ uri: 'https://i.pinimg.com/736x/8f/af/f0/8faff07aaf1c0454126c503c13c1eb06.jpg' }}
          style={styles.heroBg}
          resizeMode="cover"
        />
        <LinearGradient
          colors={isDarkMode ? ['rgba(9, 9, 11, 0.4)', 'rgba(9, 9, 11, 0.95)'] : ['rgba(255, 255, 255, 0.15)', '#f1f5f9']}
          style={styles.heroGradient}
        />

        <View style={styles.heroInner}>
          {/* Header Dashboard */}
          <View style={styles.headerRow}>
            <View style={styles.leftHeader}>
              <LinearGradient
                colors={rank.colors}
                style={styles.headerAvatarFrame}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.headerAvatarInner, { backgroundColor: theme.background }]}>
                  <Image
                    source={{ uri: currentUser.avatar }}
                    style={styles.avatarImage}
                  />
                </View>
              </LinearGradient>
              <View style={{ marginLeft: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.greetingUser, { color: theme.textPrimary }]}>{currentUser.name}</Text>
                  <LinearGradient
                    colors={rank.colors}
                    style={styles.rankBadgeMini}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.rankBadgeMiniText}>{rank.title}</Text>
                  </LinearGradient>
                </View>
                {/* Gamified XP Progress bar */}
                <View style={{ marginTop: 4, width: 130 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={{ fontSize: 8, fontWeight: '800', color: theme.textSecondary }}>{currentPoints} XP</Text>
                    <Text style={{ fontSize: 8, fontWeight: '800', color: theme.textMuted }}>{nextRankPoints} XP</Text>
                  </View>
                  <View style={[styles.progressBarBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }]}>
                    <LinearGradient
                      colors={rank.colors}
                      style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* THEME TOGGLE BUTTON */}
              <Pressable
                onPress={() => setIsDarkMode(!isDarkMode)}
                style={[
                  styles.hudIconBtn, 
                  { backgroundColor: theme.cardGlass, borderColor: theme.border }
                ]}
              >
                {isDarkMode ? <Sun size={15} color="#facc15" fill="#facc15" /> : <Moon size={15} color="#60a5fa" fill="#60a5fa" />}
              </Pressable>
            </View>
          </View>

          {/* Slogan */}
          <View style={styles.sloganBlock}>
            <View style={styles.techEngineBadgeContainer}>
              <Sparkles size={11} color="#3b82f6" fill="#3b82f6" />
              <Text style={styles.techEngineBadgeText}>3D SPATIAL RECONSTRUCTION</Text>
            </View>
            <Text style={[styles.sloganMainText, { color: theme.textPrimary }]}>
              Du Lịch Không Giới Hạn{'\n'}
              <Text style={{ color: '#3b82f6' }}>Không Gian Ảo 360°</Text>
            </Text>
          </View>



          {/* Travel Stats Dashboard */}
          <View style={styles.statsRowDashboard}>
            {[
              { label: 'TÍCH LŨY', val: `${(currentUser.points || 8250).toLocaleString()} XP`, color: '#facc15', Icon: Award },
              { label: 'BẢN ĐỒ ĐÃ ĐI', val: '5/12 tỉnh', color: '#06b6d4', Icon: MapIcon },
              { label: 'VÉ HOẠT ĐỘNG', val: '2 vé', color: '#a21caf', Icon: Ticket },
            ].map((stat, idx) => {
              const StatIcon = stat.Icon;
              return (
                <View key={idx} style={[styles.statItemDashboard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <StatIcon size={12} color={stat.color} />
                    <Text style={[styles.statLabelDashboard, { color: theme.textSecondary }]}>{stat.label}</Text>
                  </View>
                  <Text style={[styles.statValueDashboard, { color: theme.textPrimary }]}>{stat.val}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Search Box */}
      <View style={{ position: 'relative', zIndex: 999, marginTop: -26, marginHorizontal: 16 }}>
            <LinearGradient
              colors={['#3b82f6', '#60a5fa']}
              style={styles.searchContainerBorderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={[styles.searchContainer, { backgroundColor: theme.cardGlass, borderWidth: 0 }]}>
                <Search size={18} color={theme.textSecondary} />
                <TextInput
                  placeholder="Tìm kiếm tính năng (Bản đồ, Vé, Khách sạn...)..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setSearchFocused(true)}
                  style={[styles.searchInput, { color: theme.textPrimary }]}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => { setSearchQuery(''); setSearchFocused(false); }} style={{ padding: 8 }}>
                    <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '700' }}>Xóa</Text>
                  </Pressable>
                )}
              </View>
            </LinearGradient>

            {/* Search Focus Suggestions (when focused but empty) */}
            {searchFocused && searchQuery.trim().length === 0 && (
              <View style={[styles.searchDropdown, { backgroundColor: theme.card, borderColor: theme.border, padding: 14, maxHeight: 350 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: theme.textSecondary }}>TÌM KIẾM GẦN ĐÂY</Text>
                  {recentSearches.length > 0 && (
                    <Pressable onPress={() => setRecentSearches([])} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Trash2 size={11} color="#ef4444" />
                      <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#ef4444' }}>Xóa hết</Text>
                    </Pressable>
                  )}
                </View>

                {recentSearches.length === 0 ? (
                  <Text style={{ fontSize: 11, color: theme.textMuted, fontStyle: 'italic', marginBottom: 16 }}>Lịch sử trống</Text>
                ) : (
                  <View style={{ gap: 8, marginBottom: 16 }}>
                    {recentSearches.map((hist, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Pressable 
                          onPress={() => {
                            setSearchQuery(hist);
                          }}
                          style={{ flex: 1 }}
                        >
                          <Text style={{ fontSize: 12, color: theme.textPrimary, fontWeight: '600' }}>🎒 {hist}</Text>
                        </Pressable>
                        <Pressable 
                          onPress={() => setRecentSearches(prev => prev.filter((_, i) => i !== idx))}
                          style={{ padding: 4 }}
                        >
                          <X size={13} color={theme.textMuted} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={{ fontSize: 10, fontWeight: '900', color: theme.textSecondary, marginBottom: 8 }}>ĐỀ XUẤT CHO BẠN</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {[
                    'Bản đồ 3D',
                    'Vé của tôi',
                    'Quét AR',
                    'Bảng tin',
                    'Khách sạn',
                  ].map((pop, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        setSearchQuery(pop);
                      }}
                      style={{ backgroundColor: theme.searchBg, borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}
                    >
                      <Text style={{ fontSize: 10.5, fontWeight: '800', color: theme.textPrimary }}>#{pop}</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  onPress={() => setSearchFocused(false)}
                  style={{ alignSelf: 'center', paddingVertical: 6, marginTop: 4 }}
                >
                  <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#3b82f6' }}>Đóng bảng gợi ý</Text>
                </Pressable>
              </View>
            )}

            {/* Structured Search Results Dropdown */}
            {searchQuery.trim().length > 0 && (
              <View style={[styles.searchDropdown, { backgroundColor: theme.card, borderColor: theme.border, maxHeight: 380 }]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Category: App Features / Tabs & Booking Utilities */}
                  {globalSearchResults.features.length > 0 && (
                    <View style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}>
                      <Text style={{ fontSize: 9, fontWeight: '900', color: theme.textMuted, marginLeft: 14, marginTop: 8 }}>TÍNH NĂNG & DỊCH VỤ</Text>
                      {globalSearchResults.features.map((res) => {
                        const Icon = res.Icon;
                        return (
                          <Pressable
                            key={res.key}
                            onPress={() => {
                              if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
                                setRecentSearches(prev => [searchQuery.trim(), ...prev].slice(0, 5));
                              }
                              setSearchQuery('');
                              setSearchFocused(false);
                              res.action();
                            }}
                            style={styles.searchResultItem}
                          >
                            <LinearGradient
                              colors={res.colors}
                              style={styles.searchResultIconWrap}
                            >
                              <Icon size={14} color="#fff" />
                            </LinearGradient>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text style={[styles.searchResultLabel, { color: theme.textPrimary }]}>{res.label}</Text>
                              <Text style={[styles.searchResultDesc, { color: theme.textSecondary }]} numberOfLines={1}>{res.description}</Text>
                            </View>
                            <ChevronRight size={14} color={theme.textMuted} />
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {!hasGlobalResults && (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: theme.textSecondary, fontWeight: '600', textAlign: 'center' }}>
                        Không tìm thấy tính năng tương ứng.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>



      {/* CATEGORIES CARD SECTION */}
      <View style={[styles.categoriesCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b82f6' }} />
              <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>Danh mục dịch vụ</Text>
            </View>
            <Text style={[styles.cardHeaderSub, { color: theme.textSecondary }]}>Đặt chỗ nhanh chóng trong vài giây</Text>
          </View>
          <Pressable
            onPress={() => setExpandedCategories(!expandedCategories)}
            style={({ pressed }) => [
              styles.expandBtn,
              { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' },
              pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
            ]}
          >
            <Text style={styles.expandBtnText}>
              {expandedCategories ? 'Thu gọn' : 'Xem thêm'}
            </Text>
            {expandedCategories ? (
              <ChevronUp size={13} color="#3b82f6" />
            ) : (
              <ChevronRight size={13} color="#3b82f6" />
            )}
          </Pressable>
        </View>

        <View style={styles.categoryGrid}>
          {serviceCategories.map((item) => {
            const Icon = item.Icon;
            return (
              <Pressable
                key={item.key}
                onPress={() => {
                  if (item.type === 'explore' && onNavigateToExplore) {
                    onNavigateToExplore(item.key, '');
                  } else if (item.type === 'tab' && onNavigateToTab) {
                    onNavigateToTab(item.key);
                  } else if (item.type === 'ai') {
                    handleTriggerAIChat('Hãy giới thiệu về Vivu360');
                  }
                }}
                style={({ pressed }) => [
                  styles.categoryItem,
                  pressed && { transform: [{ scale: 0.95 }], opacity: 0.85 }
                ]}
              >
                <LinearGradient
                  colors={item.colors}
                  style={[
                    styles.categoryIconWrap,
                    {
                      shadowColor: item.colors[0],
                    }
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon size={22} color="#fff" />
                  {item.key === 'tour' && (
                    <View style={styles.categoryMicroBadgeHot}>
                      <Text style={styles.categoryMicroBadgeText}>HOT</Text>
                    </View>
                  )}
                  {item.key === 'camera' && (
                    <View style={styles.categoryMicroBadgeNew}>
                      <Text style={styles.categoryMicroBadgeText}>AR</Text>
                    </View>
                  )}
                  {item.key === 'ai_chatbot' && (
                    <View style={styles.categoryMicroBadgeAI}>
                      <Text style={styles.categoryMicroBadgeText}>AI</Text>
                    </View>
                  )}
                </LinearGradient>
                <Text
                  numberOfLines={2}
                  style={[styles.categoryLabel, { color: theme.textPrimary }]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* PROMOTION BANNER SLIDER */}
      <View style={styles.bannerContainer}>
        <Pressable style={[styles.bannerCard, { borderColor: theme.border }]}>
          <Image source={{ uri: banner.image }} style={styles.bannerImg} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']}
            style={styles.bannerGradient}
          />
          <View style={styles.bannerOverlayContent}>
            <View style={styles.bannerBadgeRow}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                style={styles.badgeGradient}
              >
                <View style={styles.badgeInner}>
                  <banner.BadgeIcon size={12} color={banner.color} />
                  <Text style={[styles.badgeText, { color: banner.color }]}>{banner.badge}</Text>
                </View>
              </LinearGradient>
            </View>

            <Text style={styles.bannerTitle}>
              {banner.title} <Text style={{ color: banner.color }}>{banner.highlight}</Text>
            </Text>
            <Text style={styles.bannerSub}>{banner.sub}</Text>

            <View style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Khám phá ngay</Text>
              <ChevronRight size={14} color="#fff" />
            </View>
          </View>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {banners.map((b, idx) => (
              <Pressable
                key={b.id}
                onPress={() => setCurrentBanner(idx)}
                style={[styles.dot, idx === currentBanner ? styles.dotActive : null]}
              />
            ))}
          </View>
        </Pressable>
      </View>

      {/* 3D PORTAL PREVIEW CARD */}
      <Pressable
        style={({ pressed }) => [
          styles.vrPortalCard,
          { borderColor: theme.border, backgroundColor: theme.cardGlass },
          pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] }
        ]}
        onPress={() => onNavigateToTour && onNavigateToTour(1, 0)}
      >
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80' }}
          style={styles.vrPortalBg}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.95)']}
          style={styles.vrPortalGrad}
        />
        <View style={styles.vrPortalContent}>
          <View style={styles.vrPortalBadgeRow}>
            <View style={styles.vrPortalNeonBadge}>
              <Sparkles size={11} color="#3b82f6" fill="#3b82f6" />
              <Text style={styles.vrPortalNeonBadgeText}>VIVU360 PORTAL</Text>
            </View>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' }} />
            <Text style={{ fontSize: 9, color: '#22c55e', fontWeight: '900' }}>ONLINE</Text>
          </View>

          {/* Futuristic telemetry details on top-right */}
          <View style={styles.vrPortalTelemetry}>
            <Text style={styles.vrPortalTelemetryText}>SYS: ACTIVE</Text>
            <Text style={styles.vrPortalTelemetryText}>POS: 20.9500° N, 107.0333° E</Text>
          </View>

          <Text style={styles.vrPortalTitle}>Bước vào Cổng Không Gian 3D Portal</Text>
          <Text style={styles.vrPortalDesc}>
            Trải nghiệm bay flycam 360 độ ngắm trọn vẹn cảnh sắc kỳ vĩ của núi non sông nước Việt Nam ngay lập tức.
          </Text>

          <View style={styles.vrPortalBtn}>
            <Text style={styles.vrPortalBtnText}>Khởi hành Ngay</Text>
            <ChevronRight size={14} color="#0f172a" />
          </View>
        </View>
      </Pressable>

      {/* VR 360 HIGHLIGHTS SECTION */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Khám phá Ảo 360° VR</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Trải nghiệm tham quan thực tế ảo sinh động tại chỗ</Text>
        </View>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendingScroll}
      >
        {vrHighlights.map((item) => (
          <Pressable 
            key={item.id} 
            style={[styles.vrCard, { borderColor: theme.border }]}
            onPress={() => onNavigateToTour && onNavigateToTour(item.id, 0)}
          >
            <Image source={{ uri: item.image }} style={styles.vrImg} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']}
              style={styles.vrGrad}
            />

            <View style={styles.vrCardHeader}>
              <View style={styles.vrBadge}>
                <Sparkles size={10} color="#facc15" fill="#facc15" />
                <Text style={styles.vrBadgeText}>360° VR</Text>
              </View>
            </View>

            <View style={[styles.vrCardFooter, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
              <Text style={[styles.vrTitleText, { color: '#fff' }]} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.vrSpotsText}>📍 {item.spots}</Text>
                <Text style={styles.vrViewsText}>{item.views} lượt xem</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* TRENDING DESTINATIONS */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Điểm đến thịnh hành</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Những điểm khám phá được yêu thích nhất</Text>
        </View>
        <Pressable style={styles.seeAllBtn}
        onPress={() => onNavigateToTab("allDiaDiem")}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <ChevronRight size={14} color="#3b82f6" />
        </Pressable>
      </View>

{/* diaiem */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendingScroll}
      >
        {diaDiem.map((item, index) => (
          <Pressable key={index} style={[styles.destCard, { borderColor: theme.border }]}>
            <Image source={{ uri: item.hinhAnh }} style={styles.destImg} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']}
              style={styles.destGrad}
            />

            <View style={styles.destCardHeader}>
              <View style={styles.destBadgeHot}>
                <Flame size={10} color="#f97316" fill="#f97316" />
                <Text style={styles.destBadgeText}>XU HƯỚNG</Text>
              </View>
              <Pressable style={styles.heartBtn}>
                <Heart size={16} color="#fff" fill="rgba(0,0,0,0.2)" />
              </Pressable>
            </View>

            <View style={[styles.destCardFooter, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
              <Text style={[styles.destCity, { color: theme.textPrimary }]}>{item.ten}</Text>
              <View style={styles.destRow}>
                <MapPin size={11} color={theme.textSecondary} />
                <Text style={[styles.destRegion, { color: theme.textSecondary }]}>{item.viTri}</Text>
              </View>

              <View style={styles.destRatingRow}>
                <View style={styles.ratingStars}>
                  <Text style={[styles.ratingReviews, { color: theme.textSecondary }]}>Lượt xem:({item.danhGia})</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// 2. EXPLORE SCREEN COMPONENT
export function ExploreScreen({
  isDarkMode,
  setIsDarkMode,
  theme,
  selectedTag: propSelectedTag,
  setSelectedTag: propSetSelectedTag,
  searchQuery: propSearchQuery,
  setSearchQuery: propSetSearchQuery,
  onBookSuccess,
}) {
  const [localSelectedTag, localSetSelectedTag] = useState('all');
  const [localSearchQuery, localSetSearchQuery] = useState('');

  const selectedTag = propSelectedTag !== undefined ? propSelectedTag : localSelectedTag;
  const setSelectedTag = propSetSelectedTag !== undefined ? propSetSelectedTag : localSetSelectedTag;
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;
  const setSearchQuery = propSetSearchQuery !== undefined ? propSetSearchQuery : localSetSearchQuery;

  // Sorting & Filtering State
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'priceAsc' | 'priceDesc' | 'ratingDesc'
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under1m' | '1mTo3m' | 'over3m'
  const [minRating, setMinRating] = useState('all'); // 'all' | '4.7'

  // Temporary state for Filter sheet before applying
  const [tempSortBy, setTempSortBy] = useState('default');
  const [tempPriceRange, setTempPriceRange] = useState('all');
  const [tempMinRating, setTempMinRating] = useState('all');

  // Detail & Booking Modal State
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Booking Form State
  const [bookingDate, setBookingDate] = useState('2026-06-20');
  const [quantity, setQuantity] = useState(1);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('0987654321');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' | 'vietqr' | 'later'
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [generatedTicketCode, setGeneratedTicketCode] = useState('');

  const filterTags = [
    { key: 'all', label: 'Tất cả' },
    { key: 'hotel', label: 'Khách sạn' },
    { key: 'tour', label: 'Tours hot' },
    { key: 'ticket', label: 'Vé vui chơi' },
    { key: 'car', label: 'Thuê xe' },
    { key: 'sim', label: 'Wifi & SIM' },
  ];

  // Helper function to extract numeric value from price string
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.replace(/[^0-9]/g, '');
    return parseInt(cleanStr, 10) || 0;
  };

  const filteredItems = useMemo(() => {
    let result = exploreItems.filter((item) => {
      const matchTag = selectedTag === 'all' || item.type === selectedTag;
      const matchQuery =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTag && matchQuery;
    });

    // Filter by price range
    if (priceRange !== 'all') {
      result = result.filter((item) => {
        const priceNum = parsePrice(item.price);
        if (priceRange === 'under1m') return priceNum < 1000000;
        if (priceRange === '1mTo3m') return priceNum >= 1000000 && priceNum <= 3000000;
        if (priceRange === 'over3m') return priceNum > 3000000;
        return true;
      });
    }

    // Filter by min rating
    if (minRating !== 'all') {
      result = result.filter((item) => {
        const r = parseFloat(item.rating) || 0;
        if (minRating === '4.7') return r >= 4.7;
        return true;
      });
    }

    // Sorting
    if (sortBy !== 'default') {
      result = [...result].sort((a, b) => {
        if (sortBy === 'priceAsc') return parsePrice(a.price) - parsePrice(b.price);
        if (sortBy === 'priceDesc') return parsePrice(b.price) - parsePrice(a.price);
        if (sortBy === 'ratingDesc') return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
        return 0;
      });
    }

    return result;
  }, [selectedTag, searchQuery, sortBy, priceRange, minRating]);

  // Is any filter currently active?
  const hasActiveFilters = sortBy !== 'default' || priceRange !== 'all' || minRating !== 'all';

  // Apply filters from temporary state
  const handleApplyFilters = () => {
    setSortBy(tempSortBy);
    setPriceRange(tempPriceRange);
    setMinRating(tempMinRating);
    setFilterModalVisible(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setTempSortBy('default');
    setTempPriceRange('all');
    setTempMinRating('all');
    setSortBy('default');
    setPriceRange('all');
    setMinRating('all');
    setFilterModalVisible(false);
  };

  // Open item detail
  const handleOpenItemDetail = (item) => {
    setSelectedItem(item);
    setBookingDate('2026-06-20');
    setQuantity(1);
    setPromoCode('');
    setPromoApplied(false);
    setDiscountPercent(0);
    setPaymentMethod('wallet');
    setBookingSuccess(false);
    setDetailModalVisible(true);
  };

  // Apply Promo code
  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'VIVU360') {
      setPromoApplied(true);
      setDiscountPercent(15);
      Alert.alert('Thành công', 'Đã áp dụng mã VIVU360: Giảm 15% tổng hóa đơn!');
    } else if (code === 'WELCOME') {
      setPromoApplied(true);
      setDiscountPercent(10);
      Alert.alert('Thành công', 'Đã áp dụng mã WELCOME: Giảm 10% tổng hóa đơn!');
    } else {
      Alert.alert('Lỗi', 'Mã giảm giá không chính xác hoặc đã hết hạn.');
    }
  };

  // Handle Booking checkout
  const handleCheckout = () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên và số điện thoại liên hệ!');
      return;
    }

    const pricePerUnit = parsePrice(selectedItem.price);
    const subtotal = pricePerUnit * quantity;
    const finalAmount = promoApplied ? subtotal * (1 - discountPercent / 100) : subtotal;

    const ticketCode = `VV360-EX${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedTicketCode(ticketCode);

    if (onBookSuccess) {
      onBookSuccess({
        code: ticketCode,
        title: selectedItem.title,
        region: selectedItem.location,
        date: bookingDate,
        guests: quantity,
        price: `${finalAmount.toLocaleString('vi-VN')}đ`,
        status: paymentMethod === 'wallet' ? 'Đã thanh toán (Ví)' : paymentMethod === 'vietqr' ? 'Chờ thanh toán (QR)' : 'Chờ xác nhận',
      });
    }

    setBookingSuccess(true);
  };

  return (
    <View style={styles.tabContainer}>
      <LinearGradient
        colors={isDarkMode ? ['#1e293b', '#09090b'] : ['#e2e8f0', '#f8fafc']}
        style={styles.exploreHeaderBg}
      >
        <View style={styles.exploreHeaderInner}>
          <Text style={[styles.exploreTitle, { color: theme.textPrimary }]}>Khám phá Dịch vụ</Text>
          <Text style={[styles.exploreSubtitle, { color: theme.textSecondary }]}>Tìm ưu đãi phòng khách sạn, tour du lịch và hoạt động tốt nhất</Text>

          {/* Search Row */}
          <View style={styles.searchRowWithFilter}>
            <View style={[styles.exploreSearchContainer, { flex: 1, backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
              <Search size={18} color="#9ca3af" />
              <TextInput
                placeholder="Tìm kiếm điểm đến, tên dịch vụ..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.exploreSearchInput, { color: theme.textPrimary }]}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '700' }}>Xóa</Text>
                </Pressable>
              )}
            </View>
            <Pressable 
              style={[
                styles.exploreFilterBtn, 
                { backgroundColor: theme.cardGlass, borderColor: theme.border },
                hasActiveFilters && { borderColor: '#3b82f6', borderWidth: 1.5 }
              ]}
              onPress={() => {
                setTempSortBy(sortBy);
                setTempPriceRange(priceRange);
                setTempMinRating(minRating);
                setFilterModalVisible(true);
              }}
            >
              <SlidersHorizontal size={18} color={hasActiveFilters ? '#3b82f6' : theme.textPrimary} />
              {hasActiveFilters && <View style={styles.activeFilterDot} />}
            </Pressable>
          </View>

          {/* Tags Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exploreTagsContainer}
          >
            {filterTags.map((tag) => {
              const isActive = selectedTag === tag.key;
              return (
                <Pressable
                  key={tag.key}
                  style={styles.tagPillContainer}
                  onPress={() => setSelectedTag(tag.key)}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={['#3b82f6', '#1d4ed8']}
                      style={styles.tagPillActiveGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={[styles.tagText, { color: '#fff' }]}>
                        {tag.label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.tagPill, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                      <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                        {tag.label}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* ITEMS LIST */}
      <View style={styles.exploreListSection}>
        <Text style={[styles.listSectionTitle, { color: theme.textPrimary }]}>
          Kết quả tìm kiếm ({filteredItems.length})
        </Text>

        {filteredItems.length === 0 ? (
          <View style={styles.noResultsBox}>
            <HelpCircle size={48} color={theme.textSecondary} />
            <Text style={[styles.noResultsText, { color: theme.textPrimary }]}>Không tìm thấy dịch vụ nào phù hợp</Text>
            <Text style={[styles.noResultsSub, { color: theme.textMuted }]}>Vui lòng thử tìm kiếm lại với từ khóa khác</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <Pressable 
              key={item.id} 
              style={({ pressed }) => [
                styles.exploreListItem, 
                { backgroundColor: theme.card, borderColor: theme.border },
                pressed && { opacity: 0.95, transform: [{ scale: 0.985 }] }
              ]}
              onPress={() => handleOpenItemDetail(item)}
            >
              <View style={styles.exploreItemImageContainer}>
                <Image source={{ uri: item.image }} style={styles.exploreItemImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={styles.exploreItemGrad}
                />
                <View style={styles.itemTagFloating}>
                  <Text style={styles.itemTagFloatingText}>{item.tag}</Text>
                </View>
                <View style={styles.itemRatingFloating}>
                  <Star size={12} color="#facc15" fill="#facc15" />
                  <Text style={styles.itemRatingFloatingText}>{item.rating}</Text>
                </View>
              </View>

              <View style={styles.exploreItemDetail}>
                <Text style={[styles.exploreItemTitle, { color: theme.textPrimary }]}>{item.title}</Text>

                <View style={styles.exploreItemMetaRow}>
                  <View style={styles.metaPin}>
                    <MapPin size={12} color={theme.textSecondary} />
                    <Text style={[styles.metaPinText, { color: theme.textSecondary }]}>{item.location}</Text>
                  </View>
                </View>

                <Text numberOfLines={2} style={[styles.exploreItemDesc, { color: theme.textSecondary }]}>
                  {item.description}
                </Text>

                <View style={[styles.exploreItemPriceRow, { borderTopColor: theme.border }]}>
                  <View>
                    <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Giá ưu đãi từ</Text>
                    <Text style={[styles.priceValText, { color: '#3b82f6' }]}>{item.price}</Text>
                  </View>

                  <Pressable 
                    style={styles.bookNowBtnContainer}
                    onPress={() => handleOpenItemDetail(item)}
                  >
                    <LinearGradient
                      colors={['#3b82f6', '#1d4ed8']}
                      style={styles.bookNowBtn}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.bookNowText}>Đặt ngay</Text>
                      <ChevronRight size={14} color="#fff" />
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/* FILTER & SORT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border, height: 460 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontal size={18} color="#3b82f6" />
                <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Bộ lọc & Sắp xếp</Text>
              </View>
              <Pressable style={styles.closeModalBtn} onPress={() => setFilterModalVisible(false)}>
                <X size={20} color={theme.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }}>
              {/* Sort Section */}
              <Text style={[styles.filterGroupTitle, { color: theme.textSecondary }]}>SẮP XẾP THEO</Text>
              <View style={styles.filterOptionsGrid}>
                {[
                  { key: 'default', label: 'Mặc định' },
                  { key: 'priceAsc', label: 'Giá tăng dần' },
                  { key: 'priceDesc', label: 'Giá giảm dần' },
                  { key: 'ratingDesc', label: 'Đánh giá cao nhất' },
                ].map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => setTempSortBy(opt.key)}
                    style={[
                      styles.filterOptionChip,
                      { backgroundColor: theme.searchBg, borderColor: theme.border },
                      tempSortBy === opt.key && { borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)' }
                    ]}
                  >
                    <Text style={[styles.filterOptionText, { color: theme.textPrimary }, tempSortBy === opt.key && { color: '#3b82f6', fontWeight: '800' }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Price Range Section */}
              <Text style={[styles.filterGroupTitle, { color: theme.textSecondary, marginTop: 18 }]}>KHOẢNG GIÁ</Text>
              <View style={styles.filterOptionsGrid}>
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'under1m', label: 'Dưới 1 triệu' },
                  { key: '1mTo3m', label: '1 - 3 triệu' },
                  { key: 'over3m', label: 'Trên 3 triệu' },
                ].map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => setTempPriceRange(opt.key)}
                    style={[
                      styles.filterOptionChip,
                      { backgroundColor: theme.searchBg, borderColor: theme.border },
                      tempPriceRange === opt.key && { borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)' }
                    ]}
                  >
                    <Text style={[styles.filterOptionText, { color: theme.textPrimary }, tempPriceRange === opt.key && { color: '#3b82f6', fontWeight: '800' }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Rating Section */}
              <Text style={[styles.filterGroupTitle, { color: theme.textSecondary, marginTop: 18 }]}>ĐÁNH GIÁ</Text>
              <View style={styles.filterOptionsGrid}>
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: '4.7', label: 'Từ 4.7★ trở lên' },
                ].map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => setTempMinRating(opt.key)}
                    style={[
                      styles.filterOptionChip,
                      { backgroundColor: theme.searchBg, borderColor: theme.border },
                      tempMinRating === opt.key && { borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)' }
                    ]}
                  >
                    <Text style={[styles.filterOptionText, { color: theme.textPrimary }, tempMinRating === opt.key && { color: '#3b82f6', fontWeight: '800' }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Pressable style={styles.modalCancelBtn} onPress={handleResetFilters}>
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Thiết lập lại</Text>
              </Pressable>
              <Pressable style={styles.modalSubmitBtn} onPress={handleApplyFilters}>
                <LinearGradient
                  colors={['#3b82f6', '#1d4ed8']}
                  style={styles.modalSubmitGradient}
                >
                  <Text style={styles.modalSubmitText}>Áp dụng</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* SERVICE DETAILS & BOOKING MODAL */}
      {selectedItem && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={detailModalVisible}
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border, height: '90%' }]}>
              {/* Header */}
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Thông tin chi tiết</Text>
                <Pressable style={styles.closeModalBtn} onPress={() => setDetailModalVisible(false)}>
                  <X size={20} color={theme.textPrimary} />
                </Pressable>
              </View>

              {bookingSuccess ? (
                /* Success Screen */
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                  <CheckCircle size={64} color="#10b981" fill="rgba(16,185,129,0.1)" />
                  <Text style={{ fontSize: 22, fontWeight: '900', color: theme.textPrimary, marginTop: 18, textAlign: 'center' }}>Đặt dịch vụ thành công!</Text>
                  <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 18 }}>
                    Cảm ơn bạn đã lựa chọn Vivu360. Dịch vụ của bạn đã được khởi tạo và gửi trực tiếp vào danh sách vé điện tử.
                  </Text>
                  
                  {/* Generated Ticket Info card */}
                  <View style={[styles.successTicketCard, { backgroundColor: theme.searchBg, borderColor: theme.border, width: '100%', marginTop: 24 }]}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: theme.textMuted }}>MÃ ĐẶT CHỖ</Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#3b82f6', marginTop: 2 }}>{generatedTicketCode}</Text>
                    
                    <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />
                    
                    <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textPrimary }}>{selectedItem.title}</Text>
                    <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>📍 {selectedItem.location}</Text>
                    <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>📅 Khởi hành: {bookingDate} - {quantity} khách</Text>
                    <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>💳 Trạng thái: {paymentMethod === 'wallet' ? 'Đã thanh toán (Ví)' : paymentMethod === 'vietqr' ? 'Chờ thanh toán (QR)' : 'Chờ xác nhận'}</Text>
                  </View>

                  <Pressable
                    style={[styles.enterVRBtn, { width: '100%', marginTop: 32 }]}
                    onPress={() => setDetailModalVisible(false)}
                  >
                    <Text style={styles.enterVRText}>Đóng</Text>
                  </Pressable>
                </View>
              ) : (
                /* Booking & Details Form */
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  {/* Cover Image */}
                  <View style={{ height: 200, position: 'relative' }}>
                    <Image source={{ uri: selectedItem.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.85)']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
                      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                        <View style={{ backgroundColor: '#06b6d4', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{selectedItem.tag}</Text>
                        </View>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Star size={10} color="#facc15" fill="#facc15" />
                          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{selectedItem.rating}</Text>
                        </View>
                      </View>
                      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{selectedItem.title}</Text>
                      <Text style={{ color: '#cbd5e1', fontSize: 11, marginTop: 2 }}>📍 {selectedItem.location}</Text>
                    </View>
                  </View>

                  <View style={{ padding: 16 }}>
                    {/* Description */}
                    <Text style={[styles.sectionFactTitle, { color: theme.textPrimary, fontSize: 13, marginBottom: 6 }]}>Mô tả dịch vụ</Text>
                    <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18, marginBottom: 16 }}>{selectedItem.description}</Text>

                    {/* Inclusions */}
                    <Text style={[styles.sectionFactTitle, { color: theme.textPrimary, fontSize: 13, marginBottom: 6 }]}>Dịch vụ bao gồm</Text>
                    <View style={{ gap: 6, marginBottom: 20 }}>
                      {[
                        'Bảo hiểm du lịch trọn gói cao cấp',
                        'Dịch vụ hỗ trợ khẩn cấp 24/7 từ Vivu360',
                        'VAT và phí dịch vụ liên quan',
                        'Đã bao gồm mã ưu đãi độc quyền',
                      ].map((inc, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                          <CheckCircle size={12} color="#10b981" />
                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>{inc}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Booking Form Card */}
                    <View style={[styles.successTicketCard, { backgroundColor: theme.statusBg, borderColor: theme.border, padding: 16, borderRadius: 16 }]}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: theme.textPrimary, marginBottom: 14 }}>Thông tin đặt dịch vụ</Text>
                      
                      {/* Name Input */}
                      <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6 }]}>TÊN HÀNH KHÁCH / LIÊN HỆ</Text>
                      <TextInput
                        value={contactName}
                        onChangeText={setContactName}
                        placeholder="Nhập tên người liên hệ..."
                        placeholderTextColor={theme.textMuted}
                        style={[styles.modalTextInput, { color: theme.textPrimary, backgroundColor: theme.card, borderColor: theme.border, marginBottom: 14 }]}
                      />

                      {/* Phone Input */}
                      <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6 }]}>SỐ ĐIỆN THOẠI LIÊN HỆ</Text>
                      <TextInput
                        value={contactPhone}
                        onChangeText={setContactPhone}
                        placeholder="Nhập số điện thoại..."
                        placeholderTextColor={theme.textMuted}
                        keyboardType="phone-pad"
                        style={[styles.modalTextInput, { color: theme.textPrimary, backgroundColor: theme.card, borderColor: theme.border, marginBottom: 14 }]}
                      />

                      {/* Date & Quantity Row */}
                      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                        <View style={{ flex: 1.5 }}>
                          <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6 }]}>NGÀY KHỞI HÀNH</Text>
                          <TextInput
                            value={bookingDate}
                            onChangeText={setBookingDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={theme.textMuted}
                            style={[styles.modalTextInput, { color: theme.textPrimary, backgroundColor: theme.card, borderColor: theme.border, marginBottom: 0 }]}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6 }]}>SỐ LƯỢNG</Text>
                          <View style={{ flexDirection: 'row', height: 42, borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.card, overflow: 'hidden' }}>
                            <Pressable 
                              onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                            >
                              <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '800' }}>-</Text>
                            </Pressable>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: theme.textPrimary, fontSize: 13, fontWeight: '800' }}>{quantity}</Text>
                            </View>
                            <Pressable 
                              onPress={() => setQuantity(prev => prev + 1)}
                              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                            >
                              <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '800' }}>+</Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>

                      {/* Promo Code Row */}
                      <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6 }]}>MÃ GIẢM GIÁ (Mẹo: VIVU360)</Text>
                      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                        <TextInput
                          value={promoCode}
                          onChangeText={setPromoCode}
                          placeholder="Dán mã ưu đãi..."
                          placeholderTextColor={theme.textMuted}
                          autoCapitalize="characters"
                          style={[styles.modalTextInput, { flex: 1, marginBottom: 0, color: theme.textPrimary, backgroundColor: theme.card, borderColor: theme.border }]}
                        />
                        <Pressable
                          onPress={handleApplyPromo}
                          style={{ backgroundColor: '#3b82f6', height: 42, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Áp dụng</Text>
                        </Pressable>
                      </View>

                      {/* Payment Method Selector */}
                      <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 8 }]}>PHƯƠNG THỨC THANH TOÁN</Text>
                      <View style={{ gap: 8, marginBottom: 10 }}>
                        {[
                          { key: 'wallet', label: 'Ví điện tử Vivu360', sub: 'Thanh toán tức thì bảo mật' },
                          { key: 'vietqr', label: 'Cổng VietQR chuyển khoản', sub: 'Tự động tạo mã QR' },
                          { key: 'later', label: 'Trả sau (Thanh toán sau)', sub: 'Gọi điện xác nhận dịch vụ' },
                        ].map((pm) => (
                          <Pressable
                            key={pm.key}
                            onPress={() => setPaymentMethod(pm.key)}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderWidth: 1, borderColor: paymentMethod === pm.key ? '#3b82f6' : theme.border, borderRadius: 10, backgroundColor: theme.card }}
                          >
                            <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: paymentMethod === pm.key ? '#3b82f6' : theme.textMuted, alignItems: 'center', justifyContent: 'center' }}>
                              {paymentMethod === pm.key && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' }} />}
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 11.5, fontWeight: '700', color: theme.textPrimary }}>{pm.label}</Text>
                              <Text style={{ fontSize: 8.5, color: theme.textMuted }}>{pm.sub}</Text>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    </View>

                    {/* Cost calculation summary box */}
                    <View style={[styles.successTicketCard, { backgroundColor: theme.statusBg, borderColor: theme.border, padding: 14, borderRadius: 12, marginTop: 14 }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ fontSize: 11.5, color: theme.textSecondary }}>Đơn giá:</Text>
                        <Text style={{ fontSize: 11.5, color: theme.textPrimary, fontWeight: '600' }}>{selectedItem.price}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ fontSize: 11.5, color: theme.textSecondary }}>Số lượng:</Text>
                        <Text style={{ fontSize: 11.5, color: theme.textPrimary, fontWeight: '600' }}>{quantity}</Text>
                      </View>
                      {promoApplied && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={{ fontSize: 11.5, color: '#10b981' }}>Khuyến mãi ({discountPercent}%):</Text>
                          <Text style={{ fontSize: 11.5, color: '#10b981', fontWeight: '600' }}>
                            -{((parsePrice(selectedItem.price) * quantity) * discountPercent / 100).toLocaleString('vi-VN')}đ
                          </Text>
                        </View>
                      )}
                      <View style={{ height: 0.8, backgroundColor: theme.border, marginVertical: 8 }} />
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textPrimary }}>Tổng cộng:</Text>
                        <Text style={{ fontSize: 16, fontWeight: '900', color: '#3b82f6' }}>
                          {(
                            parsePrice(selectedItem.price) * quantity * (promoApplied ? 1 - discountPercent / 100 : 1)
                          ).toLocaleString('vi-VN')}đ
                        </Text>
                      </View>
                    </View>

                    {/* Submit Action */}
                    <Pressable 
                      style={({ pressed }) => [
                        styles.enterVRBtn, 
                        { marginTop: 20 },
                        pressed && { opacity: 0.8 }
                      ]}
                      onPress={handleCheckout}
                    >
                      <Text style={styles.enterVRText}>Xác nhận đặt & thanh toán</Text>
                      <ChevronRight size={16} color="#fff" />
                    </Pressable>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// 3. CAMERA / AR SCAN SCREEN COMPONENT
export function CameraScreen({ isDarkMode, setIsDarkMode, theme, onNavigateToTour, onNavigateToTab, onViewTicket }) {
  const [scanMode, setScanMode] = useState('scene'); // 'scene' | 'object'
  const [flashOn, setFlashOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('back');
  const [isCameraTransitioning, setIsCameraTransitioning] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepText, setScanStepText] = useState('[AR] Hệ thống sẵn sàng');
  const [scanResult, setScanResult] = useState(null);
  
  // Rotating 3D Object Simulator Modal state
  const [showObject3DModal, setShowObject3DModal] = useState(false);
  const [objectRotation, setObjectRotation] = useState(0);

  // GPS Coordinates Jitter simulation
  const [gpsCoords, setGpsCoords] = useState({ lat: 20.8497, lng: 107.0563 });

  useEffect(() => {
    const gpsInterval = setInterval(() => {
      setGpsCoords(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0001,
        lng: prev.lng + (Math.random() - 0.5) * 0.0001
      }));
    }, 1500);
    return () => clearInterval(gpsInterval);
  }, []);

  // 3D Object rotating animation simulation
  useEffect(() => {
    let animationFrame;
    if (showObject3DModal) {
      const rotate = () => {
        setObjectRotation(prev => (prev + 2) % 360);
        animationFrame = requestAnimationFrame(rotate);
      };
      animationFrame = requestAnimationFrame(rotate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [showObject3DModal]);

  // Flip camera transition simulator
  const handleFlipCamera = () => {
    if (isScanning) return;
    setIsCameraTransitioning(true);
    setTimeout(() => {
      setCameraFacing(prev => prev === 'back' ? 'front' : 'back');
      setIsCameraTransitioning(false);
    }, 400);
  };

  // Toggle flash
  const handleToggleFlash = () => {
    setFlashOn(prev => !prev);
  };

  // Change scan mode
  const handleSelectMode = (mode) => {
    if (isScanning) return;
    setScanMode(mode);
    setScanResult(null);
    setScanProgress(0);
    setScanStepText(mode === 'scene' ? '[AR] Sẵn sàng quét địa danh' : '[AI] Sẵn sàng nhận diện vật thể');
  };

  // Scan simulation action
  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanResult(null);
    setScanProgress(0);
    setScanStepText(scanMode === 'scene' ? 'Đang khởi tạo cảm biến AR...' : 'Đang khởi tạo camera nhận diện...');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);

      // Update step-by-step description text
      if (scanMode === 'scene') {
        if (progress === 20) setScanStepText('Đang khóa định vị GPS và độ cao...');
        if (progress === 40) setScanStepText('Đang quét cấu trúc bề mặt 3D (LiDAR)...');
        if (progress === 60) setScanStepText('Đang đối chiếu cơ sở dữ liệu di sản Vivu360...');
        if (progress === 80) setScanStepText('Đồng bộ hóa môi trường Virtual Tour 360°...');
      } else { // object
        if (progress === 20) setScanStepText('Đang xác định đám mây điểm đặc trưng...');
        if (progress === 40) setScanStepText('Đang đo đạc tỷ lệ hình học vật thể...');
        if (progress === 60) setScanStepText('Đối chiếu thư viện hiện vật quốc gia...');
        if (progress === 80) setScanStepText('Đang dựng mô hình 3D AR lưới đa giác...');
      }

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setScanProgress(100);
        
        if (scanMode === 'scene') {
          setScanResult({
            title: 'Vịnh Hạ Long - Động Thiên Cung',
            rating: '4.9/5★',
            distance: '1.2 km cách bạn',
            type: 'scene',
            tourId: 1,
            spotIdx: 0,
            facts: [
              'Hệ thống hang động thạch nhũ kiến tạo hơn 20 triệu năm.',
              'Được UNESCO công nhận là di sản thiên nhiên thế giới.',
              'Diện tích tham quan ảo 360° đã quét: 5.400 m².',
            ]
          });
          setScanStepText('Hoàn tất: Nhận diện Động Thiên Cung');
        } else { // object
          setScanResult({
            title: 'Hòn Trống Mái - Tác phẩm thiên nhiên',
            rating: 'Nhận dạng AI: 98.4%',
            distance: 'Kích thước: ~10m chiều cao',
            type: 'object',
            facts: [
              'Biểu tượng văn hóa nổi tiếng trên Vịnh Hạ Long.',
              'Cặp khối đá hình hai con gà đối diện nhau giữa biển khơi.',
              'Mô hình 3D AR đã được tối ưu hóa với 120,000 đa giác lưới.',
            ]
          });
          setScanStepText('Hoàn tất: Nhận diện Hòn Trống Mái');
        }
      }
    }, 300);
  };

  const MOCK_POINTS_CLOUD = [
    { x: '15%', y: '35%' }, { x: '25%', y: '20%' }, { x: '35%', y: '45%' },
    { x: '45%', y: '15%' }, { x: '55%', y: '50%' }, { x: '65%', y: '25%' },
    { x: '75%', y: '40%' }, { x: '85%', y: '20%' }, { x: '90%', y: '55%' },
    { x: '20%', y: '65%' }, { x: '30%', y: '75%' }, { x: '40%', y: '60%' },
    { x: '50%', y: '80%' }, { x: '60%', y: '70%' }, { x: '70%', y: '85%' },
    { x: '80%', y: '65%' }, { x: '10%', y: '75%' }, { x: '50%', y: '30%' }
  ];

  const cameraBgImage = scanMode === 'scene' 
    ? 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80';

  return (
    <View style={[styles.tabContainer, { paddingHorizontal: 16, paddingTop: 20 }]}>
      <Text style={[styles.cameraTitle, { color: theme.textPrimary }]}>Trợ Lý Quét AR Thông Minh</Text>
      <Text style={[styles.cameraSub, { color: theme.textSecondary }]}>Nhận dạng địa danh để vào Tour 360° hoặc tương tác vật thể 3D</Text>

      {/* SCAN MODES SEGMENTED TABS */}
      <View style={[styles.arModeTabRow, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
        <Pressable 
          style={[styles.arModeTabBtn, scanMode === 'scene' && styles.arModeTabBtnActive]}
          onPress={() => handleSelectMode('scene')}
        >
          <Compass size={14} color={scanMode === 'scene' ? '#fff' : theme.textSecondary} />
          <Text style={[styles.arModeTabText, { color: scanMode === 'scene' ? '#fff' : theme.textSecondary }]}>Địa danh</Text>
        </Pressable>

        <Pressable 
          style={[styles.arModeTabBtn, scanMode === 'object' && styles.arModeTabBtnActive]}
          onPress={() => handleSelectMode('object')}
        >
          <Box size={14} color={scanMode === 'object' ? '#fff' : theme.textSecondary} />
          <Text style={[styles.arModeTabText, { color: scanMode === 'object' ? '#fff' : theme.textSecondary }]}>Vật thể AI</Text>
        </Pressable>
      </View>

      {/* AR VIEWFINDER BOX */}
      <View style={[styles.viewfinderBox, { borderColor: theme.border }]}>
        {/* Mock background placeholder - like camera image */}
        <Image
          source={{ uri: cameraBgImage }}
          blurRadius={isCameraTransitioning ? 15 : 0}
          style={[
            styles.viewfinderBg, 
            cameraFacing === 'front' && { transform: [{ scaleX: -1 }] }
          ]}
          resizeMode="cover"
        />
        
        {/* HUD grid lines */}
        <View style={styles.gridOverlay} />

        {/* L-shaped target brackets */}
        <View style={[styles.viewfinderCornerBracket, { top: 16, left: 16, borderLeftWidth: 3, borderTopWidth: 3, borderColor: '#3b82f6' }]} />
        <View style={[styles.viewfinderCornerBracket, { top: 16, right: 16, borderRightWidth: 3, borderTopWidth: 3, borderColor: '#3b82f6' }]} />
        <View style={[styles.viewfinderCornerBracket, { bottom: 16, left: 16, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: '#3b82f6' }]} />
        <View style={[styles.viewfinderCornerBracket, { bottom: 16, right: 16, borderRightWidth: 3, borderBottomWidth: 3, borderColor: '#3b82f6' }]} />

        {/* POINTS CLOUD OVERLAY (Geo Scene Mode) */}
        {scanMode === 'scene' && (
          <View style={StyleSheet.absoluteFill}>
            {MOCK_POINTS_CLOUD.map((pt, idx) => {
              // Show point gradually based on progress
              const isPointVisible = !isScanning || (idx / MOCK_POINTS_CLOUD.length) < (scanProgress / 100);
              return (
                <View 
                  key={idx} 
                  style={[
                    styles.lidarMeshDot, 
                    { left: pt.x, top: pt.y, opacity: isPointVisible ? (isScanning ? 0.9 : 0.45) : 0 },
                    isScanning && { transform: [{ scale: 1.3 }] }
                  ]} 
                />
              );
            })}
          </View>
        )}

        {/* BOUNDING BOX (Object Recognition Mode) */}
        {scanMode === 'object' && (
          <View style={styles.objectBoundingBox}>
            <View style={styles.boundingBoxLabelContainer}>
              <Text style={styles.boundingBoxLabel}>[ Hòn Trống Mái | Khớp: 98.4% ]</Text>
            </View>
            <View style={styles.boundingBoxTarget} />
          </View>
        )}

        {/* Laser Scanning Line Animation */}
        {isScanning && (
          <View style={[styles.scannerLine, { top: `${scanProgress}%` }]} />
        )}

        {/* HUD UTILITIES OVERLAYS */}
        <View style={styles.hudTopLeftUtils}>
          <Pressable 
            style={[styles.hudUtilBtn, flashOn && { backgroundColor: '#facc15' }]} 
            onPress={handleToggleFlash}
          >
            <Zap size={14} color={flashOn ? '#000' : '#fff'} />
          </Pressable>

          <Pressable 
            style={styles.hudUtilBtn} 
            onPress={handleFlipCamera}
          >
            <RefreshCw size={14} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.hudTopRight}>
          <Text style={styles.hudText}>{scanMode.toUpperCase()} ONLINE</Text>
          <View style={[styles.hudIndicator, flashOn && { backgroundColor: '#facc15' }]} />
        </View>

        <View style={styles.hudBottomLeft}>
          <Text style={styles.hudSubText}>GPS: {gpsCoords.lat.toFixed(6)} N, {gpsCoords.lng.toFixed(6)} E</Text>
          <Text style={styles.hudSubText}>ALT: 124m | TILT: {isScanning ? (12.5 + Math.sin(scanProgress)*3).toFixed(1) : 12.5}°</Text>
          <Text style={styles.hudSubText}>HEADING: 184° S | FPS: 60</Text>
        </View>

        {/* Central target reticle (when not scanning) */}
        <View style={styles.targetReticle}>
          <View style={[styles.reticleCircle, isScanning ? styles.reticleCircleActive : null]} />
          <Scan size={30} color={isScanning ? '#3b82f6' : '#fff'} style={styles.reticleScanIcon} />
        </View>

        {/* Scanning step log status bar */}
        <View style={styles.scanningStepBar}>
          <Text style={styles.scanningStepText}>{scanStepText}</Text>
        </View>

        {isScanning && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${scanProgress}%` }]} />
            </View>
          </View>
        )}
      </View>

      {/* ACTIONS */}
      <View style={styles.cameraActionRow}>
        <Pressable
          style={[styles.scanActionBtn, isScanning ? styles.scanActionBtnDisabled : null]}
          onPress={handleStartScan}
        >
          <LinearGradient
            colors={isScanning ? ['#4b5563', '#1f2937'] : ['#3b82f6', '#1d4ed8']}
            style={styles.scanBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Camera size={18} color="#fff" />
            <Text style={styles.scanBtnText}>
              {isScanning ? 'Đang phân tích cấu trúc...' : `Bắt đầu Quét ${scanMode === 'scene' ? 'Địa Danh' : 'Vật Thể AI'}`}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* SCAN RESULTS DISPLAY */}
      {scanResult && (
        <View style={[styles.scanResultCard, { backgroundColor: theme.cardGlass, borderColor: '#3b82f6' }]}>
          <LinearGradient
            colors={isDarkMode ? ['rgba(37, 99, 235, 0.15)', 'rgba(30, 41, 59, 0.7)'] : ['rgba(59, 130, 246, 0.05)', 'rgba(255, 255, 255, 0.95)']}
            style={styles.resultGrad}
          />
          <View style={styles.scanResultInner}>
            <View style={styles.resultHeader}>
              <Sparkles size={16} color="#facc15" />
              <Text style={styles.resultHeaderLabel}>PHÂN TÍCH THÀNH CÔNG</Text>
            </View>

            <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>{scanResult.title}</Text>
            <Text style={[styles.resultDistance, { color: theme.textSecondary }]}>{scanResult.distance} | {scanResult.rating}</Text>

            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />

            <Text style={[styles.sectionFactTitle, { color: theme.textPrimary }]}>Chi tiết kết quả quét:</Text>
            {scanResult.facts.map((fact, idx) => (
              <View key={idx} style={styles.factItemRow}>
                <CheckCircle size={13} color="#10b981" style={{ marginTop: 2 }} />
                <Text style={[styles.factText, { color: theme.textSecondary }]}>{fact}</Text>
              </View>
            ))}

            {scanResult.type === 'scene' && (
              <Pressable 
                style={styles.enterVRBtn}
                onPress={() => onNavigateToTour && onNavigateToTour(scanResult.tourId, scanResult.spotIdx)}
              >
                <Text style={styles.enterVRText}>Vào Tham Quan 3D Virtual Tour</Text>
                <ChevronRight size={16} color="#fff" />
              </Pressable>
            )}

            {scanResult.type === 'object' && (
              <Pressable 
                style={styles.enterVRBtn}
                onPress={() => setShowObject3DModal(true)}
              >
                <Text style={styles.enterVRText}>Tương Tác Mô Hình 3D AR</Text>
                <ChevronRight size={16} color="#fff" />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* ROTATING 3D MODEL MODAL */}
      <Modal
        visible={showObject3DModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowObject3DModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.ticketModalContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 24, padding: 24 }]}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.textPrimary, textAlign: 'center', marginBottom: 6 }}>
              Mô hình 3D AR Hòn Trống Mái
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '500', color: theme.textSecondary, textAlign: 'center', marginBottom: 20 }}>
              Sử dụng cử chỉ để xoay, thu phóng và khám phá mô hình đa giác
            </Text>

            {/* Simulated 3D Renderer area */}
            <View style={{ height: 240, backgroundColor: isDarkMode ? '#09090b' : '#f8fafc', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              
              {/* Circular rotation dial bg */}
              <View style={{ width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)', position: 'absolute' }} />
              
              {/* Rotating Wireframe/Graphic Container */}
              <View style={{ transform: [{ rotate: `${objectRotation}deg` }], alignItems: 'center', justifyContent: 'center' }}>
                {/* Visual mesh design: a double rock shape or glowing polygon */}
                <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-end' }}>
                  <View style={{ width: 36, height: 90, backgroundColor: '#3b82f6', borderTopLeftRadius: 10, borderTopRightRadius: 10, transform: [{ skewX: '-8deg' }], opacity: 0.85, shadowColor: '#3b82f6', shadowOpacity: 0.5, shadowRadius: 10, elevation: 4 }} />
                  <View style={{ width: 44, height: 100, backgroundColor: '#1d4ed8', borderTopLeftRadius: 12, borderTopRightRadius: 12, transform: [{ skewX: '8deg' }], opacity: 0.85, shadowColor: '#1d4ed8', shadowOpacity: 0.5, shadowRadius: 10, elevation: 4 }} />
                </View>
                {/* Horizontal sea mock bar */}
                <View style={{ width: 140, height: 3, backgroundColor: '#06b6d4', marginTop: 4, borderRadius: 2, opacity: 0.7 }} />
              </View>

              {/* Wireframe coordinates lock HUD overlays */}
              <View style={{ position: 'absolute', top: 12, left: 12 }}>
                <Text style={{ color: '#06b6d4', fontSize: 8, fontWeight: '800', fontFamily: 'monospace' }}>POLYS: 120,000</Text>
                <Text style={{ color: '#06b6d4', fontSize: 8, fontWeight: '800', fontFamily: 'monospace' }}>VERTS: 64,281</Text>
              </View>
              <View style={{ position: 'absolute', bottom: 12, right: 12 }}>
                <Text style={{ color: '#06b6d4', fontSize: 8, fontWeight: '800', fontFamily: 'monospace' }}>ROT: {objectRotation}°</Text>
                <Text style={{ color: '#06b6d4', fontSize: 8, fontWeight: '800', fontFamily: 'monospace' }}>SCALE: 1.0X</Text>
              </View>
            </View>

            {/* Technical details block */}
            <View style={{ marginTop: 16, gap: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: theme.textSecondary }}>
                • Địa điểm: Vịnh Hạ Long, Việt Nam.
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: theme.textSecondary }}>
                • Thuyết minh tự động: Cặp hòn đá nằm giữa vịnh hình thù giống như hai con gà trống mái đang vươn mình đối mặt nhau qua sóng nước...
              </Text>
            </View>

            <Pressable 
              style={[styles.enterVRBtn, { marginTop: 24 }]}
              onPress={() => setShowObject3DModal(false)}
            >
              <Text style={styles.enterVRText}>Đóng Trình Xem 3D AR</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Note: MapScreen has been refactored and moved to its own folder: src/map/map.js

// 5. PROFILE SCREEN COMPONENT
export function ProfileScreen({ isDarkMode, setIsDarkMode, theme, userInfo, setUserInfo, bookedTickets, onViewTicketList, onEditProfile, onLogout, onViewTiers, onViewChallenges }) {
  const rank = getRankDetails(userInfo.points || 0);

  const userStats = [
    { label: 'Chuyến đi', val: '12', color: '#3b82f6' },
    { label: 'Yêu thích', val: '48', color: '#ef4444' },
    { label: 'Đánh giá', val: '15', color: '#10b981' },
  ];

  const badges = [
    { id: 1, name: 'Phượt Thủ 360', desc: 'Tham quan 5 điểm ảo', icon: Sparkles, color: '#facc15' },
    { id: 2, name: 'Người Tiên Phong', desc: 'Đăng ký trong tháng 1', icon: Award, color: '#60a5fa' },
    { id: 3, name: 'Nhà Thám Hiểm', desc: 'Đi đủ 3 miền VN', icon: Globe, color: '#34d399' },
  ];

  return (
    <View style={[styles.tabContainer, { paddingHorizontal: 16 }]}>
      {/* PROFILE HEADER LANDSCAPE CARD */}
      <View style={[styles.profileHeaderCardNew, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <LinearGradient
          colors={isDarkMode ? ['#1e1b4b', '#0f172a'] : ['#eff6ff', '#ffffff']}
          style={styles.profileHeaderGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.profileHeaderContentNew}>
          {/* Top Row: Avatar and Info */}
          <View style={styles.profileMetaRow}>
            <View style={styles.avatarGlowContainer}>
              <LinearGradient
                colors={rank.colors}
                style={styles.profileAvatarFrame}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.profileAvatarInner, { backgroundColor: theme.card }]}>
                  <Image
                    source={{ uri: userInfo.avatar }}
                    style={styles.profileAvatarImage}
                  />
                </View>
              </LinearGradient>
              <View style={[styles.profileActiveIndicator, { borderColor: theme.card }]} />
            </View>

            <View style={styles.profileInfoColumn}>
              <Text style={[styles.profileName, { color: theme.textPrimary }]} numberOfLines={1}>{userInfo.name}</Text>
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]} numberOfLines={1}>{userInfo.email}</Text>
              
              <View style={[styles.rankBadgePill, { backgroundColor: isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)' }]}>
                <Award size={10} color="#3b82f6" fill="#3b82f6" style={{ marginRight: 2 }} />
                <Text style={[styles.rankBadgeText, { color: '#3b82f6' }]}>{rank.rankName}</Text>
              </View>
            </View>
          </View>

          {/* Explorer Level progress bar directly integrated */}
          <Pressable 
            style={({ pressed }) => [
              styles.levelProgressCardNew, 
              { backgroundColor: theme.statusBg, borderColor: theme.border },
              pressed && { opacity: 0.85 }
            ]}
            onPress={onViewTiers}
          >
            <View style={styles.levelBadgeRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Award size={12} color="#facc15" fill="#facc15" />
                <Text style={[styles.levelText, { color: theme.textPrimary, fontWeight: '800' }]}>Hạng thành viên ({userInfo.level || 'Cấp 8'})</Text>
              </View>
              <Text style={[styles.xpText, { color: '#3b82f6' }]}>{(userInfo.points || 8250).toLocaleString()} / 10,000 XP</Text>
            </View>
            <View style={[styles.xpBarBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <LinearGradient
                colors={['#3b82f6', '#06b6d4']}
                style={[styles.xpBarFill, { width: `${((userInfo.points || 8250) / 10000) * 100}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </Pressable>
        </View>
      </View>

      {/* TRIP STATS */}
      <View style={styles.statsCardGrid}>
        {userStats.map((stat, idx) => (
          <View key={idx} style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.statVal, { color: stat.color }]}>{stat.val}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* BADGES ACHIEVED */}
      <View style={styles.profileSectionTitleRow}>
        <Text style={[styles.profileSecTitle, { color: theme.textPrimary }]}>Huy hiệu đạt được</Text>
        <Sparkles size={14} color="#facc15" fill="#facc15" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesScroll}
      >
        {badges.map((b) => {
          const BIcon = b.icon;
          return (
            <View key={b.id} style={[styles.badgeItemCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <LinearGradient
                colors={[`${b.color}15`, `${b.color}05`]}
                style={styles.badgeCardBgGrad}
              />
              <View style={[styles.badgeIconWrapper, { backgroundColor: `${b.color}20`, borderColor: `${b.color}35`, borderWidth: 1 }]}>
                <BIcon size={22} color={b.color} fill={b.color === '#facc15' ? '#facc15' : 'transparent'} />
              </View>
              <Text style={[styles.badgeItemName, { color: theme.textPrimary }]} numberOfLines={1}>{b.name}</Text>
              <Text style={[styles.badgeItemDesc, { color: theme.textMuted }]} numberOfLines={2}>{b.desc}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* UPCOMING TRIPS / BOOKED ITEMS LINK CARD */}
      <Text style={[styles.profileSecTitle, { color: theme.textPrimary }]}>Hành trình của tôi</Text>
      <Pressable 
        style={({ pressed }) => [
          styles.profileActionItem, 
          { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 12, paddingVertical: 14 },
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
        ]}
        onPress={() => {
          if (onViewTicketList) onViewTicketList();
        }}
      >
        <QrCode size={18} color="#3b82f6" />
        <Text style={[styles.profileActionText, { color: theme.textPrimary, fontWeight: '700' }]}>Vé điện tử & Chuyến đi của tôi</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ backgroundColor: '#ef4444', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{bookedTickets.length}</Text>
          </View>
          <ChevronRight size={16} color={theme.textMuted} />
        </View>
      </Pressable>

      {/* PROFILE SETTINGS MENU GROUP CARD */}
      <Text style={[styles.profileSecTitle, { color: theme.textPrimary }]}>Cài đặt tài khoản</Text>
      <View style={[styles.settingsGroupCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        
        {/* LIGHT/DARK THEME TOGGLE SWITCH */}
        <Pressable
          style={styles.menuRowItem}
          onPress={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun size={16} color="#facc15" /> : <Moon size={16} color="#4f46e5" />}
          <Text style={[styles.menuRowText, { color: theme.textPrimary }]}>Chế độ tối (Dark Mode)</Text>
          <View style={{ width: 40, height: 22, borderRadius: 11, backgroundColor: isDarkMode ? '#3b82f6' : '#d1d5db', padding: 2, justifyContent: 'center' }}>
            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', alignSelf: isDarkMode ? 'flex-end' : 'flex-start' }} />
          </View>
        </Pressable>

        <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

        {/* EDIT PROFILE */}
        <Pressable
          style={styles.menuRowItem}
          onPress={onEditProfile}
        >
          <User size={16} color={theme.textSecondary} />
          <Text style={[styles.menuRowText, { color: theme.textPrimary }]}>Chỉnh sửa thông tin cá nhân</Text>
          <ChevronRight size={14} color={theme.textMuted} />
        </Pressable>

        <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

        {/* MEMBERSHIP TIERS */}
        <Pressable
          style={styles.menuRowItem}
          onPress={onViewTiers}
        >
          <Award size={16} color={theme.textSecondary} />
          <Text style={[styles.menuRowText, { color: theme.textPrimary }]}>Hạng thành viên & Đặc quyền</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: rank.borderColor }}>{rank.rankName}</Text>
            <ChevronRight size={14} color={theme.textMuted} />
          </View>
        </Pressable>

        <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

        {/* CHALLENGES */}
        <Pressable
          style={styles.menuRowItem}
          onPress={onViewChallenges}
        >
          <Zap size={16} color="#3b82f6" fill="rgba(59, 130, 246, 0.2)" />
          <Text style={[styles.menuRowText, { color: theme.textPrimary }]}>Thử thách & Nhận điểm thưởng</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ backgroundColor: '#10b981', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5 }}>
              <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>HOT</Text>
            </View>
            <ChevronRight size={14} color={theme.textMuted} />
          </View>
        </Pressable>
      </View>

      {/* LOGOUT BUTTON - RENDERED AS SEPARATE PREMIUM ROW CARD */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutCardBtn, 
          { 
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.05)', 
            borderColor: 'rgba(239, 68, 68, 0.2)' 
          },
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
        ]}
        onPress={() => Alert.alert(
          'Đăng xuất',
          `Bạn có chắc chắn muốn đăng xuất tài khoản ${userInfo.name}?`,
          [
            { text: 'Hủy bỏ', style: 'cancel' },
            {
              text: 'Đăng xuất',
              style: 'destructive',
              onPress: () => {
                if (onLogout) {
                  onLogout();
                }
              }
            }
          ]
        )}
      >
        <LogOut size={16} color="#ef4444" />
        <Text style={[styles.logoutText, { color: '#ef4444' }]}>Đăng xuất tài khoản</Text>
        <ChevronRight size={14} color="rgba(239, 68, 68, 0.4)" />
      </Pressable>
    </View>
  );
}

// ==========================================
// CSS STYLING
// ==========================================
const styles = StyleSheet.create({
  tabContainer: { width: '100%' },

  // Hero Section
  hero: { height: 290, position: 'relative', overflow: 'hidden' },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 290 },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroInner: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },

  // Header Dashboard
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  leftHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatarFrame: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  greetingHeader: { fontSize: 12, fontWeight: '500' },
  greetingUser: { fontSize: 15, fontWeight: '800' },

  hudIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },


  sloganBlock: { marginTop: 28, marginBottom: 16 },
  techEngineBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  techEngineBadgeText: {
    color: '#3b82f6',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sloganMainText: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    letterSpacing: -0.5,
  },

  // Search Box
  searchContainerBorderGradient: {
    borderRadius: 16,
    padding: 1.5,
    marginTop: 12,
  },
  searchContainer: {
    height: 52,
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 13, fontWeight: '600', marginLeft: 10 },
  aiSearchVoiceBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },



  // Categories Card Section
  categoriesCard: {
    marginTop: 14,
    marginHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardHeaderTitle: { fontSize: 16, fontWeight: '800' },
  cardHeaderSub: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expandBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3b82f6',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  categoryItem: {
    width: '25%', // 4 columns perfectly aligned
    alignItems: 'center',
    marginVertical: 10,
  },
  categoryIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 4,
    height: 32, // Fixed height keeps all grid items perfectly aligned
    lineHeight: 14,
    letterSpacing: -0.1,
  },

  // Promotion Banner Slider
  bannerContainer: { paddingHorizontal: 16, marginTop: 22 },
  bannerCard: {
    height: 200,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#1c1917',
    position: 'relative'
  },
  bannerImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bannerGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bannerOverlayContent: { flex: 1, padding: 20, justifyContent: 'center' },
  bannerBadgeRow: { flexDirection: 'row', marginBottom: 8 },
  badgeGradient: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', overflow: 'hidden' },
  badgeInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 26 },
  bannerSub: { marginTop: 4, color: '#d1d5db', fontSize: 13, fontWeight: '500' },
  bannerBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  bannerBtnText: { color: '#fff', fontWeight: '700', fontSize: 11 },

  dotsRow: { position: 'absolute', bottom: 12, right: 16, flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 14, backgroundColor: '#3b82f6' },

  // Trending Destinations Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 26,
  },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { color: '#3b82f6', fontWeight: '700', fontSize: 12 },

  trendingScroll: { paddingLeft: 16, gap: 14, paddingVertical: 12 },
  destCard: {
    width: 200,
    height: 275,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#09090b',
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  vrCard: {
    width: 220,
    height: 155,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#09090b',
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  vrImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  vrGrad: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  vrCardHeader: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  vrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  vrBadgeText: { color: '#fff', fontSize: 8.5, fontWeight: '900', letterSpacing: 0.5 },
  vrCardFooter: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  vrTitleText: { fontSize: 13, fontWeight: '900', letterSpacing: -0.2, color: '#fff' },
  vrSpotsText: { fontSize: 9.5, fontWeight: '700', color: '#cbd5e1' },
  vrViewsText: { fontSize: 9.5, fontWeight: '700', color: '#60a5fa' },
  destImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  destGrad: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  destCardHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  destBadgeHot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(9, 9, 11, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.35)',
  },
  destBadgeText: { color: '#f97316', fontSize: 8.5, fontWeight: '900', letterSpacing: 0.5 },
  heartBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(9, 9, 11, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  destCardFooter: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  destCity: { fontSize: 15.5, fontWeight: '900', letterSpacing: -0.3 },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  destRegion: { fontSize: 10, fontWeight: '600' },
  destRatingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  ratingStars: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingVal: { fontSize: 11, fontWeight: '900' },
  ratingReviews: { fontSize: 9.5, fontWeight: '600' },
  destPrice: { fontSize: 12.5, fontWeight: '900' },


  // Explore Screen Styles
  exploreHeaderBg: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  exploreHeaderInner: { width: '100%' },
  exploreTitle: { fontSize: 24, fontWeight: '900' },
  exploreSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 4, lineHeight: 16 },
  searchRowWithFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  exploreFilterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreSearchContainer: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreSearchInput: { flex: 1, fontSize: 13, fontWeight: '600', marginLeft: 10 },
  clearSearchBtn: { padding: 4 },

  exploreTagsContainer: { gap: 8, paddingVertical: 14 },
  tagPillContainer: { marginRight: 8 },
  tagPillActiveGradient: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  tagText: { fontSize: 12, fontWeight: '800' },

  exploreListSection: { paddingHorizontal: 16, marginTop: 20 },
  listSectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 14, letterSpacing: -0.3 },
  exploreListItem: {
    borderRadius: 24,
    borderWidth: 1.2,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  exploreItemImageContainer: { height: 180, position: 'relative' },
  exploreItemImage: { width: '100%', height: '100%' },
  exploreItemGrad: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  itemTagFloating: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  itemTagFloatingText: { color: '#fff', fontSize: 9.5, fontWeight: '900', letterSpacing: 0.5 },
  itemRatingFloating: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(9, 9, 11, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  itemRatingFloatingText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  exploreItemDetail: { padding: 16 },
  exploreItemMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  metaPin: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaPinText: { fontSize: 11, fontWeight: '600' },

  exploreItemDesc: { fontSize: 11.5, fontWeight: '500', marginTop: 8, lineHeight: 17 },
  exploreItemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  priceLabel: { fontSize: 10, fontWeight: '600' },
  priceValText: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  bookNowBtnContainer: { borderRadius: 14, overflow: 'hidden' },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  bookNowText: { color: '#fff', fontSize: 12.5, fontWeight: '900' },

  noResultsBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  noResultsText: { fontSize: 14, fontWeight: '700', marginTop: 14 },
  noResultsSub: { fontSize: 11, fontWeight: '500', marginTop: 4 },

  // Camera Scan Screen Styles
  cameraTitle: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  cameraSub: { fontSize: 12, fontWeight: '500', textAlign: 'center', marginTop: 4, lineHeight: 16 },

  arModeTabRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 4,
    marginTop: 16,
    gap: 4,
  },
  arModeTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  arModeTabBtnActive: {
    backgroundColor: '#3b82f6',
  },
  arModeTabText: {
    fontSize: 12,
    fontWeight: '800',
  },

  viewfinderBox: {
    width: '100%',
    height: 350,
    borderRadius: 24,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 20,
    backgroundColor: '#000',
  },
  viewfinderBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.65 },
  gridOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  viewfinderCornerBracket: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  lidarMeshDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#06b6d4',
  },
  objectBoundingBox: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: '50%',
    height: '42%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boundingBoxLabelContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    position: 'absolute',
    top: -24,
    alignSelf: 'center',
  },
  boundingBoxLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  boundingBoxTarget: {
    width: '100%',
    height: '100%',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
  },
  qrAlignmentBox: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: '50%',
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCorner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#10b981',
  },
  qrPulseBar: {
    width: '90%',
    height: 2,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  scannerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  hudTopLeftUtils: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  hudUtilBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  hudTopRight: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  hudIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  hudText: { color: '#cbd5e1', fontSize: 9, fontWeight: '800' },

  hudBottomLeft: { position: 'absolute', bottom: 50, left: 12, gap: 2, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },
  hudSubText: { color: '#a1a1aa', fontSize: 8, fontWeight: '800', fontFamily: 'monospace' },

  targetReticle: { position: 'absolute', top: '50%', left: '50%', marginTop: -25, marginLeft: -25, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  reticleCircle: { position: 'absolute', width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: '#fff', opacity: 0.35 },
  reticleCircleActive: { borderColor: '#3b82f6', width: 56, height: 56, borderRadius: 28 },
  reticleScanIcon: { opacity: 0.8 },

  scanningStepBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  scanningStepText: {
    color: '#06b6d4',
    fontSize: 9.5,
    fontWeight: '800',
    fontFamily: 'monospace',
  },

  progressContainer: { position: 'absolute', bottom: 44, left: 12, right: 12, zIndex: 10 },
  progressBarBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1.5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3b82f6' },

  cameraActionRow: { marginTop: 16, alignItems: 'center' },
  scanActionBtn: { width: '100%', height: 46, borderRadius: 12, overflow: 'hidden' },
  scanActionBtnDisabled: { opacity: 0.6 },
  scanBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  scanBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  scanResultCard: {
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1.2,
    overflow: 'hidden',
    position: 'relative',
  },
  resultGrad: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  scanResultInner: { padding: 16 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultHeaderLabel: { color: '#facc15', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  resultTitle: { fontSize: 17, fontWeight: '800', marginTop: 6 },
  resultDistance: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  dividerLine: { height: 1, marginVertical: 12 },
  sectionFactTitle: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  factItemRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  factText: { fontSize: 11, fontWeight: '500', flex: 1, lineHeight: 15 },
  enterVRBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 14,
  },
  enterVRText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // Map Screen Styles
  mapTitleHeader: { paddingHorizontal: 16, paddingTop: 20, marginBottom: 12 },
  mapTitle: { fontSize: 24, fontWeight: '900' },
  mapSub: { fontSize: 12, fontWeight: '500', marginTop: 4 },

  mapCanvas: {
    height: 380,
    marginHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden'
  },
  mapBgLineContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  mockMapSland: {
    position: 'absolute',
    left: '42%',
    top: '10%',
    width: '20%',
    height: '80%',
    borderWidth: 3,
    borderStyle: 'dashed',
    borderRadius: 50,
  },
  seaGridLineHorizontal1: { position: 'absolute', left: 0, right: 0, top: '33%', height: 1 },
  seaGridLineHorizontal2: { position: 'absolute', left: 0, right: 0, top: '66%', height: 1 },
  seaGridLineVertical1: { position: 'absolute', top: 0, bottom: 0, left: '33%', width: 1 },
  seaGridLineVertical2: { position: 'absolute', top: 0, bottom: 0, left: '66%', width: 1 },

  mapRoute1: { position: 'absolute', top: '22%', left: '56%', width: '12%', height: '33%', borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderStyle: 'dotted', borderBottomLeftRadius: 10 },
  mapRoute2: { position: 'absolute', top: '55%', left: '32%', width: '36%', height: '33%', borderRightWidth: 1.5, borderTopWidth: 1.5, borderStyle: 'dotted', borderTopRightRadius: 15 },

  seaText1: { position: 'absolute', right: '15%', top: '60%', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  seaText2: { position: 'absolute', right: '10%', top: '25%', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  seaText3: { position: 'absolute', left: '10%', top: '85%', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  mapPinWrapper: { position: 'absolute', alignItems: 'center' },
  pinCircleGlowContainer: { alignItems: 'center', justifyContent: 'center' },
  pinPulseCircle: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(59, 130, 246, 0.25)' },
  pinPulseCircleActive:  { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(59, 130, 246, 0.45)' },
  pinDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#4b5563', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' },
  pinDotActive: { backgroundColor: '#3b82f6' },
  pinLabelCard: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, marginTop: 4 },
  pinLabelCardActive: { borderColor: '#3b82f6', backgroundColor: '#09090b' },
  pinLabelText: { fontSize: 8, fontWeight: '800' },

  mapActiveCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    gap: 12,
  },
  mapActiveCardImage: { width: 90, height: 90, borderRadius: 12 },
  mapActiveCardInfo: { flex: 1, justifyContent: 'center' },
  activeCardTitle: { fontSize: 15, fontWeight: '800' },
  activeCardRegion: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  activeCardRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  activeCardRatingVal: { fontSize: 10, fontWeight: '800' },
  activeCardReviews: { fontSize: 9, fontWeight: '500' },
  activeCardPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  activeCardPriceVal: { fontSize: 13, fontWeight: '800' },
  activeCardDetailBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#3b82f6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  activeCardBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Profile Screen Styles
  profileHeaderCardNew: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  profileHeaderGrad: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  profileHeaderContentNew: { padding: 16 },
  profileMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  profileInfoColumn: { flex: 1, justifyContent: 'center' },
  rankBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  rankBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  avatarGlowContainer: { position: 'relative' },
  profileAvatarFrame: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  profileActiveIndicator: { position: 'absolute', bottom: 0, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#18181b' },
  profileName: { fontSize: 17, fontWeight: '900' },
  profileEmail: { fontSize: 11, fontWeight: '500', marginTop: 1 },

  levelProgressCardNew: { width: '100%', marginTop: 14, borderRadius: 14, padding: 10, borderWidth: 1 },
  levelBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  levelText: { fontSize: 10, fontWeight: '700' },
  xpText: { fontSize: 9.5, fontWeight: '800' },
  xpBarBg: { height: 5, borderRadius: 2.5, overflow: 'hidden' },
  xpBarFill: { height: '100%' },

  statsCardGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginHorizontal: 4 },
  statVal: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', marginTop: 4 },

  profileSecTitle: { fontSize: 11, fontWeight: '900', marginTop: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  profileSectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, marginBottom: 8 },
  badgesScroll: { gap: 12 },
  badgeItemCard: { width: 105, borderWidth: 1, borderRadius: 16, padding: 10, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  badgeCardBgGrad: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  badgeIconWrapper: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  badgeItemName: { fontSize: 9, fontWeight: '800', textAlign: 'center', zIndex: 2 },
  badgeItemDesc: { fontSize: 7.5, fontWeight: '500', textAlign: 'center', marginTop: 2, zIndex: 2 },

  profileActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  profileActionText: { flex: 1, fontSize: 12, fontWeight: '700', marginLeft: 12 },

  // Settings Menu Group Card
  settingsGroupCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  menuRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuRowText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  logoutCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 32,
  },
  logoutText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 12,
  },

  // Search dropdown results
  searchDropdown: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchResultIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultLabel: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  searchResultDesc: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketModalContainer: {
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  ticketCardMain: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ticketHeaderDecor: {
    height: 120,
    position: 'relative',
  },
  ticketHeaderBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ticketHeaderGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ticketHeaderContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  ticketHeaderLogo: {
    position: 'absolute',
    top: 14,
    left: 16,
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  ticketHeaderTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  ticketHeaderRegion: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  ticketBody: {
    padding: 20,
  },
  ticketInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  ticketValue: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  ticketStatusPill: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  ticketStatusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  ticketCutLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  ticketCutLeftCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -30,
  },
  ticketCutRightCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: -30,
  },
  ticketCutDottedLine: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    height: 1,
  },
  ticketQrSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  qrCodeWrapper: {
    width: 130,
    height: 130,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeImage: {
    width: '100%',
    height: '100%',
  },
  qrCodeTipText: {
    fontSize: 9.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 14,
    paddingHorizontal: 16,
  },
  ticketCloseBtn: {
    height: 44,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ticketCloseGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketCloseBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  // Explore Improvement Styles
  activeFilterDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
    borderWidth: 1.5,
    borderColor: '#09090b',
  },
  modalCard: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  closeModalBtn: {
    padding: 6,
    borderRadius: 8,
  },
  filterGroupTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  filterOptionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '800',
  },
  modalSubmitBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSubmitGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  successTicketCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  modalTextInput: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    fontSize: 12.5,
    fontWeight: '700',
  },


  statsRowDashboard: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  statItemDashboard: {
    flex: 1,
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 10,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabelDashboard: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statValueDashboard: {
    fontSize: 12.5,
    fontWeight: '900',
    marginTop: 4,
  },
  vrPortalCard: {
    height: 180,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1.2,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  vrPortalBg: {
    ...StyleSheet.absoluteFillObject,
  },
  vrPortalGrad: {
    ...StyleSheet.absoluteFillObject,
  },
  vrPortalContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  vrPortalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    top: 14,
    left: 16,
  },
  vrPortalNeonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  vrPortalNeonBadgeText: {
    color: '#fff',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
  vrPortalTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  vrPortalDesc: {
    color: '#cbd5e1',
    fontSize: 10.5,
    fontWeight: '500',
    lineHeight: 14,
    marginTop: 4,
    marginBottom: 10,
  },
  vrPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  vrPortalBtnText: {
    color: '#0f172a',
    fontSize: 10.5,
    fontWeight: '900',
  },


  // Premium Overhaul Styles
  rankBadgeMini: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 2,
  },
  rankBadgeMiniText: {
    color: '#0f172a',
    fontSize: 8,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  aiSearchVoiceBtnFrame: {
    width: 34,
    height: 34,
    borderRadius: 10,
    overflow: 'hidden',
  },
  aiSearchVoiceBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryMicroBadgeHot: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  categoryMicroBadgeNew: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  categoryMicroBadgeAI: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#a855f7',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  categoryMicroBadgeText: {
    color: '#fff',
    fontSize: 6.5,
    fontWeight: '950',
    letterSpacing: 0.2,
  },
  vrPortalTelemetry: {
    position: 'absolute',
    top: 14,
    right: 16,
    alignItems: 'flex-end',
  },
  vrPortalTelemetryText: {
    color: '#22c55e',
    fontSize: 7.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    opacity: 0.85,
  },

});
