import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  Pressable, 
  Dimensions, 
  Animated, 
  Modal, 
  TextInput, 
  TouchableOpacity 
} from 'react-native';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Heart, 
  Flame, 
  MapPin, 
  Search, 
  Bell, 
  Compass, 
  Sparkles, 
  Gift, 
  Award, 
  User, 
  Smartphone, 
  Zap, 
  Star,
  ChevronRight,
  Sun,
  Moon,
  Building,
  Ticket,
  Car,
  Wifi,
  Map as MapIcon,
  Scan,
  Newspaper,
  MessageSquare,
  ChevronUp,
  Trash2,
  X,
  Globe
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { getRankDetails } from '../data';
import { styles } from './screens.js';

const getHostIp = () => {
  let host = Constants.expoConfig?.hostUri;
  if (!host && Constants.manifest) {
    host = Constants.manifest.debuggerHost;
  }
  if (!host && Constants.manifest2?.extra?.expoGo) {
    host = Constants.manifest2.extra.expoGo.debuggerHost;
  }
  if (host) {
    const ip = host.split(':')[0];
    if (ip) return ip;
  }
  return '192.168.100.101'; // Default fallback IP
};

const getDiaDiem = async () => {
  try {
    const hostIp = getHostIp();
    const response = await fetch(`http://${hostIp}:7321/api/diadiem`);
    if (response.ok) {
      const result = await response.json();
      if (Array.isArray(result)) return result;
    }
    return [];
  } catch (error) {
    console.log("Lỗi tải địa điểm từ SQLite API (cổng 7321):", error.message);
    return [];
  }
};

const { width } = Dimensions.get('window');

export function HomeScreen({
  currentTime,
  banners,
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
  allCategories,
  onSelectDiaDiem,
}) {
  const rank = getRankDetails(currentUser.points || 0);
  const currentPoints = currentUser.points || 8250;
  const nextRankPoints = rank.maxPoints;
  const minRankPoints = rank.minPoints;
  const progressRatio = Math.max(0, Math.min(1, (currentPoints - minRankPoints) / (nextRankPoints - minRankPoints || 1)));
  const [searchQuery, setSearchQuery] = useState('');
  const [diaDiem, setDiaDiem] = useState([]);

  useEffect(() => {
    let active = true;
    getDiaDiem()
      .then(data => {
        if (active) {
          const list = Array.isArray(data) ? data : [];
          setDiaDiem(list.slice(0, 4));
        }
      })
      .catch(err => console.log("Lỗi tải địa điểm trang chủ:", err));
    return () => { active = false; };
  }, []);

  // Search & Feature States
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Bản đồ 3D', 'Vé của tôi', 'Quét AR']);

  // Service Categories Grid List
  const serviceCategories = useMemo(() => {
    const primary = [
      { key: 'hotel', label: 'Địa danh', Icon: MapPin, colors: ['#ff6b6b', '#ee5253'], type: 'explore' },
      { key: 'tour', label: 'Ẩm thực', Icon: Compass, colors: ['#ff9f43', '#f39c12'], type: 'explore' },
      { key: 'ticket', label: 'Bản đồ số', Icon: MapIcon, colors: ['#3b82f6', '#1d4ed8'], type: 'explore' },
      { key: 'car', label: 'Bí kíp phượt', Icon: Newspaper, colors: ['#10ac84', '#1dd1a1'], type: 'explore' },
      { key: 'sim', label: 'Di chuyển', Icon: Car, colors: ['#5f27cd', '#341f97'], type: 'explore' },
      { key: 'map', label: 'Bản đồ 3D', Icon: Globe, colors: ['#0abde3', '#00d2d3'], type: 'tab' },
      { key: 'camera', label: 'Quét AR', Icon: Scan, colors: ['#ef4444', '#b91c1c'], type: 'tab' },
      { key: 'ticketList', label: 'Vé của tôi', Icon: Ticket, colors: ['#d946ef', '#a21caf'], type: 'tab' },
    ];
    
    const secondary = [
      { key: 'social', label: 'Bảng tin', Icon: Newspaper, colors: ['#f59e0b', '#b45309'], type: 'tab' },
      { key: 'chat', label: 'Nhóm du lịch', Icon: MessageSquare, colors: ['#8b5cf6', '#6d28d9'], type: 'tab' },
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
        label: 'Nhóm du lịch cộng đồng',
        type: 'tab',
        Icon: MessageSquare,
        colors: ['#8b5cf6', '#6d28d9'],
        description: 'Lên kế hoạch và trò chuyện cùng thành viên chuyến đi',
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
        <Pressable onPress={() => onNavigateToTab && onNavigateToTab('explore')} style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <ChevronRight size={14} color="#3b82f6" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendingScroll}
      >
        {diaDiem.map((item, index) => (
          <Pressable 
            key={index} 
            style={[styles.destCard, { borderColor: theme.border }]}
            onPress={() => onSelectDiaDiem && onSelectDiaDiem(item)}
          >
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

