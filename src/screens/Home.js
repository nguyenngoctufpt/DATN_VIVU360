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
  TouchableOpacity,
  Alert
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
import { getRankDetails } from '../data';
import { getHostIp } from '../utils/hostIp';
import { styles } from './screens.js';

const getDiaDiem = async () => {
  try {
    const hostIp = getHostIp();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    let response = await fetch(`http://${hostIp}:7321/api/diadiem`, { signal: controller.signal })
      .catch(() => null);

    if (!response || !response.ok) {
      response = await fetch(`http://${hostIp}:3000/api/diadiem`, { signal: controller.signal })
        .catch(() => null);
    }
    clearTimeout(timer);

    if (response && response.ok) {
      const result = await response.json();
      if (Array.isArray(result) && result.length > 0) return result;
    }
    return [];
  } catch (error) {
    console.log("Lỗi tải địa điểm:", error.message);
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
  onViewTiers,
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
  const [allDiaDiemList, setAllDiaDiemList] = useState([]);

  useEffect(() => {
    let active = true;
    getDiaDiem()
      .then(data => {
        if (active) {
          const list = Array.isArray(data) ? data : [];
          setAllDiaDiemList(list);
          setDiaDiem(list.slice(0, 6));
        }
      })
      .catch(err => console.log("Lỗi tải địa điểm trang chủ:", err));
    return () => { active = false; };
  }, []);

  // Search & Feature States
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Bản đồ 360°', 'Tours du lịch 360°', 'Bảng tin']);

  // Service Categories Grid List
  const serviceCategories = useMemo(() => {
    const primary = [
      { key: 'tour', label: 'Tours 360°', Icon: Compass, colors: ['#155e75', '#164e63'], type: 'explore' },
      { key: 'map', label: 'Bản đồ 360°', Icon: MapIcon, colors: ['#991b1b', '#7f1d1d'], type: 'tab' },
      { key: 'social', label: 'Bảng tin', Icon: Newspaper, colors: ['#5b21b6', '#3b0764'], type: 'tab' },
      { key: 'chat', label: 'Nhóm du lịch', Icon: MessageSquare, colors: ['#9f1239', '#881337'], type: 'tab' },
    ];
    
    const secondary = [
      { key: 'profile', label: 'Cá nhân', Icon: User, colors: ['#065f46', '#044e37'], type: 'tab' },
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
      }
    ];

    const bookingFeatures = [
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
      }
    ];

    return [...categories, ...appFeatures, ...bookingFeatures];
  }, [onNavigateToExplore, onNavigateToTab]);

  // Global Search Engine (Real Destinations + Local Features)
  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return { places: [], features: [] };
    const query = searchQuery.toLowerCase().trim();

    const matchedPlaces = allDiaDiemList.filter(item =>
      (item.ten || '').toLowerCase().includes(query) ||
      (item.viTri || '').toLowerCase().includes(query) ||
      (item.moTa || '').toLowerCase().includes(query)
    );

    const matchedFeatures = searchableFeatures.filter(feature => 
      feature.label.toLowerCase().includes(query) ||
      feature.description.toLowerCase().includes(query)
    );

    return {
      places: matchedPlaces,
      features: matchedFeatures
    };
  }, [searchQuery, allDiaDiemList, searchableFeatures]);

  const hasGlobalResults = globalSearchResults.places.length > 0 || globalSearchResults.features.length > 0;

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
          colors={isDarkMode ? ['rgba(9, 10, 15, 0.45)', 'rgba(9, 10, 15, 0.98)'] : ['rgba(255, 255, 255, 0.15)', '#f8fafc']}
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
                    source={{ uri: currentUser?.avatar || 'https://i.pravatar.cc/150?img=68' }}
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
                    <Text style={styles.rankBadgeMiniText}>Khám phá viên</Text>
                  </LinearGradient>
                </View>
                <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2, fontWeight: '600' }}>
                  Chào mừng trở lại Vivu360! ✈️
                </Text>
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
              <Sparkles size={11} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.techEngineBadgeText}>BẢN ĐỒ DU LỊCH ẢO 360°</Text>
            </View>
            <Text style={[styles.sloganMainText, { color: theme.textPrimary }]}>
              Du Lịch Không Giới Hạn{'\n'}
              <Text style={{ color: '#ef4444' }}>Cùng Vivu360°</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Search Box */}
      <View style={{ position: 'relative', zIndex: 999, marginTop: -26, marginHorizontal: 16 }}>
            <LinearGradient
              colors={['#991b1b', '#b45309', '#5b21b6']}
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
                    'Bản đồ 360°',
                    'Khách sạn',
                    'Tours du lịch',
                    'Bảng tin',
                    'Cá nhân',
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
              <View style={[styles.searchDropdown, { backgroundColor: theme.card, borderColor: theme.border, maxHeight: 400 }]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Real Destinations Search Results */}
                  {globalSearchResults.places.length > 0 && (
                    <View style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}>
                      <Text style={{ fontSize: 9, fontWeight: '900', color: '#f59e0b', marginLeft: 14, marginTop: 8, letterSpacing: 0.5 }}>📍 ĐỊA ĐIỂM DU LỊCH ({globalSearchResults.places.length})</Text>
                      {globalSearchResults.places.map((place, idx) => (
                        <Pressable
                          key={place.id || idx}
                          onPress={() => {
                            if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
                              setRecentSearches(prev => [searchQuery.trim(), ...prev].slice(0, 5));
                            }
                            setSearchQuery('');
                            setSearchFocused(false);
                            if (onSelectDiaDiem) {
                              onSelectDiaDiem(place);
                            }
                          }}
                          style={styles.searchResultItem}
                        >
                          <Image
                            source={{ uri: place.hinhAnh || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=200&q=80' }}
                            style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: '#334155' }}
                          />
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.searchResultLabel, { color: theme.textPrimary, fontWeight: '800' }]}>{place.ten}</Text>
                            <Text style={[styles.searchResultDesc, { color: theme.textSecondary }]} numberOfLines={1}>📍 {place.viTri}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Text style={{ fontSize: 10, color: '#f59e0b', fontWeight: '800' }}>{place.danhGia || '4.9 ⭐'}</Text>
                            <ChevronRight size={14} color={theme.textMuted} />
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {/* App Features & Utilities Search Results */}
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
                        Không tìm thấy địa điểm hoặc dịch vụ tương ứng.
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
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#dc2626' }} />
              <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>Danh mục dịch vụ du lịch</Text>
            </View>
            <Text style={[styles.cardHeaderSub, { color: theme.textSecondary }]}>Khám phá & Đặt dịch vụ nhanh chóng</Text>
          </View>
          <Pressable
            onPress={() => setExpandedCategories(!expandedCategories)}
            style={({ pressed }) => [
              styles.expandBtn,
              { backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.08)' },
              pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
            ]}
          >
            <Text style={[styles.expandBtnText, { color: '#dc2626' }]}>
              {expandedCategories ? 'Thu gọn' : 'Xem thêm'}
            </Text>
            {expandedCategories ? (
              <ChevronUp size={13} color="#dc2626" />
            ) : (
              <ChevronRight size={13} color="#dc2626" />
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
                    if (onNavigateToTab) onNavigateToTab('chat');
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

      {/* VIVU360 VIP PREMIUM PAID SUBSCRIPTION CARD */}
      <Pressable
        style={{ marginHorizontal: 16, marginTop: 12, borderRadius: 22, overflow: 'hidden', borderWidth: 1.2, borderColor: 'rgba(245, 158, 11, 0.4)' }}
        onPress={() => onViewTiers && onViewTiers()}
      >
        <LinearGradient
          colors={['#7c2d12', '#991b1b', '#451a03']}
          style={{ padding: 16 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245, 158, 11, 0.2)', borderWidth: 1, borderColor: '#facc15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Award size={12} color="#facc15" fill="#facc15" />
              <Text style={{ color: '#facc15', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>VIVU360 VIP PASS 👑</Text>
            </View>
            <Text style={{ color: '#facc15', fontSize: 13, fontWeight: '900' }}>99.000đ / tháng</Text>
          </View>

          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '900', marginTop: 10 }}>Nâng Cấp Gói Hội Viên Trả Phí VIP Premium</Text>
          <Text style={{ color: '#fed7aa', fontSize: 11, fontWeight: '600', marginTop: 6, lineHeight: 17 }}>
            • Mở khóa VR 360° 8K Ultra HD không giới hạn{'\n'}
            • Thuyết minh Audio Guide AI giọng đọc thực tế tại danh thắng{'\n'}
            • Ưu đãi giảm ngay 20% khi đặt vé tham quan & Tours du lịch 360°
          </Text>

          <View style={{ marginTop: 14, alignSelf: 'flex-start' }}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 14 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Sparkles size={14} color="#0f172a" fill="#0f172a" />
              <Text style={{ color: '#0f172a', fontSize: 11.5, fontWeight: '900', letterSpacing: 0.3 }}>ĐĂNG KÝ VIP NGAY</Text>
              <ChevronRight size={14} color="#0f172a" />
            </LinearGradient>
          </View>
        </LinearGradient>
      </Pressable>

      {/* EXCLUSIVE TRAVEL DEALS & WEATHER RADAR WIDGET */}
      <View style={[
        styles.travelWidgetCard,
        {
          backgroundColor: isDarkMode ? '#11131c' : '#ffffff',
          borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.35)' : 'rgba(220, 38, 38, 0.22)',
        }
      ]}>
        {/* Weather Row */}
        <View style={styles.weatherRow}>
          <View style={styles.weatherIconWrap}>
            <Sun size={18} color="#f59e0b" fill="#f59e0b" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.weatherTitleText, { color: theme.textPrimary }]}>Thời Tiết Du Lịch Hôm Nay</Text>
              <View style={styles.liveGreenDot} />
            </View>
            <Text style={[styles.weatherSubText, { color: theme.textSecondary }]}>Nắng nhẹ 28°C · Thích hợp phượt & ngắm cảnh 360°</Text>
          </View>
        </View>

        <View style={[styles.widgetDivider, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.18)' : 'rgba(0,0,0,0.06)' }]} />

        {/* Voucher Row */}
        <View style={styles.voucherRow}>
          <LinearGradient
            colors={['#dc2626', '#f59e0b']}
            style={styles.voucherTagGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Gift size={11} color="#fff" />
            <Text style={styles.voucherTagText}>-200K</Text>
          </LinearGradient>

          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={[styles.voucherMainText, { color: theme.textPrimary }]} numberOfLines={1}>
              Giảm 200.000đ khi Đặt Tour Du Lịch 360°
            </Text>
            <Text style={[styles.voucherCodeText, { color: theme.textSecondary }]}>
              Hạn dùng: 31/08/2026 · Mã: <Text style={{ color: '#f59e0b', fontWeight: '900' }}>VIVU360HOT</Text>
            </Text>
          </View>

          <Pressable
            style={styles.voucherActionBtn}
            onPress={() => Alert.alert('Ưu đãi', 'Đã lưu mã VIVU360HOT (-200k) vào Ví voucher cá nhân!')}
          >
            <LinearGradient
              colors={['#dc2626', '#b91c1c']}
              style={styles.voucherActionBtnGradient}
            >
              <Text style={styles.voucherActionBtnText}>Nhận mã</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      {/* NEW SECTION: TRAVEL GUIDES & INSIDER EXPERIENCE */}
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Newspaper size={16} color="#ef4444" />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Cẩm Nang & Kinh Nghiệm Bổ Ích</Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Mẹo hay & bí quyết du lịch từ cộng đồng</Text>
        </View>
        <Pressable onPress={() => onNavigateToTab && onNavigateToTab('social')} style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>Xem bài viết</Text>
          <ChevronRight size={14} color="#3b82f6" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendingScroll}
      >
        {[
          {
            id: 'guide-1',
            title: '10 Điểm Check-In Đẹp Như Mơ Tại Sa Pa Mùa Thu',
            targetName: 'Sa Pa',
            targetLocation: 'Lào Cai',
            category: 'Cẩm Nang',
            readTime: '5 phút đọc',
            author: 'Ban Truyền Thông Vivu360',
            image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
            rating: '4.9 ⭐',
            desc: 'Sa Pa mùa thu khoác lên mình màu vàng óng ả của ruộng bậc thang, mây vờn đỉnh Fansipan mờ ảo. Cẩm nang tổng hợp các góc check-in sống ảo triệu view không thể bỏ qua.'
          },
          {
            id: 'guide-2',
            title: 'Bí Quyết Du Lịch Phú Quốc Tiết Kiệm Cho Gia Đình',
            targetName: 'Phú Quốc',
            targetLocation: 'Kiên Giang',
            category: 'Kinh Nghiệm',
            readTime: '4 phút đọc',
            author: 'Góc Ẩm Thực & Du Lịch',
            image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80',
            rating: '4.8 ⭐',
            desc: 'Kinh nghiệm du lịch Phú Quốc tối ưu chi phí từ vé máy bay, resort ven biển Bãi Sao cho đến bí quyết thưởng thức hải sản ngon rẻ ở Chợ đêm Dương Đông.'
          },
          {
            id: 'guide-3',
            title: 'Khám Phá Vẻ Đẹp Phố Cổ Hội An Về Đêm Rực Rỡ',
            targetName: 'Hội An',
            targetLocation: 'Quảng Nam',
            category: 'Văn Hoá',
            readTime: '6 phút đọc',
            author: 'Tạp Chí Phượt Việt',
            image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
            rating: '5.0 ⭐',
            desc: 'Trải nghiệm ngắm phố cổ Hội An lên đèn lồng hoa đăng rực rỡ bên dòng sông Thu Bồn, thưởng thức đặc sản cao lầu và cơm gà trứ danh.'
          },
        ].map((item) => (
          <Pressable
            key={item.id}
            style={[styles.destCard, { borderColor: theme.border, width: 240, height: 260 }]}
            onPress={() => {
              const matched = diaDiem.find(d => (d.ten || '').toLowerCase().includes(item.targetName.toLowerCase()));
              if (onSelectDiaDiem) {
                onSelectDiaDiem(matched || {
                  ten: item.targetName,
                  viTri: item.targetLocation,
                  hinhAnh: item.image,
                  moTa: item.desc,
                  doDung: 'Mũ nón, Kem chống nắng, Giày thể thao, Máy ảnh',
                });
              } else if (onNavigateToTab) {
                onNavigateToTab('explore');
              }
            }}
          >
            <Image source={{ uri: item.image }} style={styles.destImg} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.88)']}
              style={styles.destGrad}
            />

            <View style={styles.destCardHeader}>
              <View style={[styles.destBadgeHot, { backgroundColor: '#dc2626' }]}>
                <Sparkles size={10} color="#fff" />
                <Text style={[styles.destBadgeText, { color: '#fff' }]}>{item.category}</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ fontSize: 10, color: '#facc15', fontWeight: '800' }}>{item.readTime}</Text>
              </View>
            </View>

            <View style={[styles.destCardFooter, { backgroundColor: theme.cardGlass, borderColor: theme.border, padding: 12 }]}>
              <Text style={[styles.destCity, { color: theme.textPrimary, fontSize: 13, lineHeight: 18 }]} numberOfLines={2}>{item.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 10, color: theme.textSecondary, fontWeight: '600' }}>✍️ {item.author}</Text>
                <Text style={{ fontSize: 10, color: '#f59e0b', fontWeight: '800' }}>{item.rating}</Text>
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

