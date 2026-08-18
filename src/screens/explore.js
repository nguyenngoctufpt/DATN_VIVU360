import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, TextInput, Alert, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  ChevronRight,
  X,
  CircleHelp,
  CircleCheck,
  Download,
  Sparkles,
  Compass
} from 'lucide-react-native';

import { exploreItems } from '../data';
import { styles } from './screens.js';
import { globalSharedState } from '../social/socialShared';

import { getHostIp } from '../utils/hostIp';

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
  onNavigateToTour,
  onNavigateToTab,
  onAddPoints,
}) {
  const [localSelectedTag, localSetSelectedTag] = useState('Tất cả');
  const [localSearchQuery, localSetSearchQuery] = useState('');

  const selectedTag = propSelectedTag !== undefined ? propSelectedTag : localSelectedTag;
  const setSelectedTag = propSetSelectedTag !== undefined ? propSetSelectedTag : localSetSelectedTag;
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;
  const setSearchQuery = propSetSearchQuery !== undefined ? propSetSearchQuery : localSetSearchQuery;

  // Database destinations state
  const [diaDiem, setDiaDiem] = useState([]);
  useEffect(() => {
    let active = true;
    getDiaDiem()
      .then(data => {
        if (active) setDiaDiem(Array.isArray(data) ? data : []);
      })
      .catch(err => console.log('Lỗi API ở ExploreScreen:', err));
    return () => { active = false; };
  }, []);

  const locations = useMemo(() => {
    const list = Array.isArray(diaDiem) ? diaDiem.map(item => item.viTri).filter(Boolean) : [];
    return ["Tất cả", ...new Set(list)];
  }, [diaDiem]);

  const combinedExploreItems = useMemo(() => {
    const list = Array.isArray(diaDiem) ? diaDiem : [];
    const dbItems = list.map((item, idx) => ({
      id: `db-${item._id || idx}`,
      title: item.ten,
      type: 'hotel',
      location: item.viTri,
      image: item.hinhAnh,
      rating: String((4.5 + (item.ten.length % 5) / 10).toFixed(1)),
      price: 'Miễn phí',
      tag: 'Địa danh nổi tiếng 📍',
      description: item.moTa || 'Chưa có mô tả chi tiết.',
      doDung: item.doDung,
    }));
    return [...dbItems, ...exploreItems];
  }, [diaDiem]);

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
  const [contactName, setContactName] = useState('Nguyễn Minh');
  const [contactPhone, setContactPhone] = useState('0987654321');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' | 'vietqr' | 'later'
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [generatedTicketCode, setGeneratedTicketCode] = useState('');
  const [isSavingTicket, setIsSavingTicket] = useState(false);
  const [companionType, setCompanionType] = useState('Một mình 🎒');
  const [tripNotes, setTripNotes] = useState('Khám phá thiên nhiên và chụp hình lưu niệm');
  const [autoShare, setAutoShare] = useState(true);

  const filterTags = [
    { key: 'all', label: 'Tất cả' },
    { key: 'hotel', label: 'Địa danh 📍' },
    { key: 'tour', label: 'Ẩm thực 🍲' },
  ];

  const trendingSearches = [
    { label: '🔥 Vịnh Hạ Long', query: 'Hạ Long' },
    { label: '🌴 Phú Quốc', query: 'Phú Quốc' },
    { label: '🏨 Vinpearl', query: 'Vinpearl' },
    { label: '🛥️ Du thuyền', query: 'Du thuyền' },
  ];

  const getItemFeatures = (item) => {
    switch (item.type) {
      case 'hotel':
        if (Array.isArray(item.doDung)) {
          return item.doDung;
        }
        return item.doDung && typeof item.doDung === 'string'
          ? item.doDung.split(',').map(s => s.trim()).filter(Boolean)
          : ['Bản đồ 3D 🏊‍♂️', 'Khám phá 🌊'];
      case 'tour':
        return ['Flycam 📸', 'Đón tiễn 🚐'];
      case 'ticket':
        return ['Vé nhanh ⚡', 'Gia đình 👨‍👩‍👧', 'Vui nhộn 🎢'];
      case 'car':
        return ['Accent 🚗', 'Giao xe ✈️', 'Số tự động 🕹️'];
      case 'sim':
        return ['Internet 4G 📶', 'Không giới hạn ♾️', 'Sóng khỏe 📡'];
      default:
        return ['Độc quyền 🌟', 'Vivu360 🌐'];
    }
  };

  const getAIMatchScore = (item) => {
    const score = 90 + (item.title.length % 10);
    return `${score}% AI Match`;
  };

  // Helper function to extract numeric value from price string
  const parsePrice = (priceStr) => {
    if (!priceStr || priceStr === 'Miễn phí') return 0;
    const cleanStr = priceStr.replace(/[^0-9]/g, '');
    return parseInt(cleanStr, 10) || 0;
  };

  const getTourIdForLocation = (loc) => {
    const l = loc.toLowerCase();
    if (l.includes('hạ long') || l.includes('ninh')) return 1;
    if (l.includes('hội an') || l.includes('nam')) return 2;
    if (l.includes('phú quốc') || l.includes('giang')) return 3;
    if (l.includes('sapa') || l.includes('sa pa') || l.includes('yên bái') || l.includes('lào cai')) return 4;
    return 5; // Hà Nội
  };

  const filteredItems = useMemo(() => {
    let result = combinedExploreItems.filter((item) => {
      let matchTag = false;
      if (selectedTag === 'Tất cả') {
        matchTag = true;
      } else if (['hotel', 'tour', 'ticket', 'car', 'sim'].includes(selectedTag)) {
        matchTag = item.type === selectedTag;
      } else {
        matchTag = item.location && item.location.toLowerCase().includes(selectedTag.toLowerCase());
      }
      const matchQuery =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
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
    if (!contactName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên lữ khách!');
      return;
    }

    const ticketCode = `PASSPORT-EX${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedTicketCode(ticketCode);

    if (onBookSuccess) {
      onBookSuccess({
        code: ticketCode,
        title: selectedItem.title,
        region: selectedItem.location,
        date: bookingDate,
        guests: companionType,
        price: tripNotes.trim() ? tripNotes : 'Không ghi chú',
        status: 'Đang hoạt động',
      });
    }

    if (autoShare) {
      globalSharedState.addPost({
        id: Date.now(),
        title: `Lịch trình khám phá: ${selectedItem.title}`,
        category: 'Cẩm nang',
        source: contactName,
        time: 'Vừa xong',
        location: selectedItem.location,
        duration: 'Hành trình tự túc',
        companions: [],
        images: [selectedItem.image],
        content: `Tôi vừa lập lịch trình chi tiết khám phá "${selectedItem.title}" tại ${selectedItem.location}. Dự kiến khởi hành ngày ${bookingDate}. Bạn đồng hành: ${companionType}. Ghi chú: "${tripNotes}". Ai muốn lập hội đi cùng không? 🎒✨`,
        image: selectedItem.image,
        likes: 0,
        commentsCount: 0,
        likedByUser: false,
        comments: [],
        user: {
          name: contactName,
          avatar: 'https://i.pravatar.cc/150?img=11',
          level: 'Cấp 8',
          points: 8250
        }
      });
    }

    if (onAddPoints) {
      onAddPoints(100);
    }

    setBookingSuccess(true);
  };

  // Simulate saving ticket image to gallery
  const handleSaveTicketToGallery = () => {
    setIsSavingTicket(true);
    setTimeout(() => {
      setIsSavingTicket(false);
      Alert.alert('Thành công! 📸', 'Đã lưu hình ảnh vé điện tử và mã QR vào bộ nhớ thiết bị của bạn thành công!');
    }, 1200);
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.background }} 
      contentContainerStyle={{ paddingBottom: 100 }} 
      showsVerticalScrollIndicator={false}
    >
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

          {/* Trending Searches */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 10, marginBottom: 2 }}>
            <Text style={{ fontSize: 10.5, color: theme.textMuted, fontWeight: '800', marginRight: 4 }}>Xu hướng:</Text>
            {trendingSearches.map((ts) => (
              <Pressable
                key={ts.label}
                onPress={() => setSearchQuery(ts.query)}
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 10.5, color: theme.textSecondary, fontWeight: '600' }}>{ts.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Tags Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exploreTagsContainer}
          >
            {locations.map((loc) => {
              const isActive = selectedTag === loc;
              return (
                <Pressable
                  key={loc}
                  style={styles.tagPillContainer}
                  onPress={() => setSelectedTag(loc)}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={['#3b82f6', '#1d4ed8']}
                      style={styles.tagPillActiveGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={[styles.tagText, { color: '#fff' }]}>
                        {loc}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.tagPill, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                      <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                        {loc}
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
            <CircleHelp size={48} color={theme.textSecondary} />
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
                
                {/* Floating Badges */}
                <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {/* Tag Badge */}
                  <View 
                    style={{ 
                      backgroundColor: '#3b82f6', 
                      paddingHorizontal: 8, 
                      paddingVertical: 3, 
                      borderRadius: 6,
                      shadowColor: '#3b82f6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 9.5, fontWeight: '900', letterSpacing: 0.5 }}>{item.tag}</Text>
                  </View>
                  
                  {/* AI Match Score Badge */}
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 3,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      shadowColor: '#10b981',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Sparkles size={10} color="#fff" fill="#fff" />
                    <Text style={{ color: '#fff', fontSize: 9.5, fontWeight: '900' }}>{getAIMatchScore(item)}</Text>
                  </LinearGradient>
                </View>
                
                {/* Rating Badge */}
                <View style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: 'rgba(9, 9, 11, 0.75)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                }}>
                  <Star size={12} color="#facc15" fill="#facc15" />
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{item.rating}</Text>
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

                {/* Key features chips */}
                <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6, flexWrap: 'wrap' }}>
                  {getItemFeatures(item).map((feat, index) => (
                    <View 
                      key={index}
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.06)',
                        borderWidth: 0.8,
                        borderColor: isDarkMode ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.15)',
                        borderRadius: 6,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                      }}
                    >
                      <Text style={{ fontSize: 9.5, color: '#3b82f6', fontWeight: '700' }}>{feat}</Text>
                    </View>
                  ))}
                </View>

                <Text numberOfLines={2} style={[styles.exploreItemDesc, { color: theme.textSecondary }]}>
                  {item.description}
                </Text>

                <View style={[styles.exploreItemPriceRow, { borderTopColor: theme.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 }]}>
                  <View style={{ flex: 1.1 }}>
                    <Text style={[styles.priceLabel, { color: theme.textMuted, fontSize: 10, fontWeight: '700' }]}>Mức chi phí</Text>
                    <Text style={[styles.priceValText, { color: isDarkMode ? '#10b981' : '#059669', fontSize: 13.5, fontWeight: '900', marginTop: 2 }]} numberOfLines={1}>
                      {item.price}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6, flex: 2, justifyContent: 'flex-end' }}>
                    {/* VR 360 Button */}
                    <Pressable
                      style={({ pressed }) => [
                        {
                          backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)',
                          borderColor: 'rgba(59, 130, 246, 0.25)',
                          borderWidth: 1,
                          borderRadius: 10,
                          paddingHorizontal: 8,
                          paddingVertical: 7,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 3,
                        },
                        pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }
                      ]}
                      onPress={() => {
                        const tId = getTourIdForLocation(item.location || '');
                        if (onNavigateToTour) onNavigateToTour(tId, 0);
                      }}
                    >
                      <Compass size={12} color="#3b82f6" />
                      <Text style={{ color: '#3b82f6', fontSize: 10, fontWeight: '850' }}>Xem 360°</Text>
                    </Pressable>

                    {/* AI Planner Button */}
                    <Pressable
                      style={({ pressed }) => [
                        {
                          borderRadius: 10,
                          overflow: 'hidden',
                        },
                        pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }
                      ]}
                      onPress={() => handleOpenItemDetail(item)}
                    >
                      <LinearGradient
                        colors={['#3b82f6', '#1d4ed8']}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 3,
                        }}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Sparkles size={11} color="#fff" fill="#fff" />
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>Lập lịch</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
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
                /* Premium Simulated Passport Ticket Success Screen */
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                  <CircleCheck size={56} color="#10b981" fill="rgba(16,185,129,0.1)" />
                  <Text style={{ fontSize: 20, fontWeight: '900', color: theme.textPrimary, marginTop: 14, textAlign: 'center' }}>Lịch trình đã lưu thành công!</Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4, textAlign: 'center', paddingHorizontal: 16, lineHeight: 16 }}>
                    Hành trình của bạn đã được ghi nhận. Thẻ thông hành du lịch (Vivu360 Passport) đã được kích hoạt.
                  </Text>
                  
                  {/* Physical Style Ticket Layout with left/right cutout circles */}
                  <View 
                    style={{
                      width: '100%',
                      marginTop: 20,
                      backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                      borderRadius: 16,
                      borderWidth: 1.5,
                      borderColor: '#3b82f6',
                      padding: 18,
                      position: 'relative',
                      overflow: 'hidden',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.15,
                      shadowRadius: 10,
                      elevation: 5
                    }}
                  >
                    {/* Left Cutout Circle */}
                    <View style={{ position: 'absolute', left: -10, top: '55%', width: 20, height: 20, borderRadius: 10, backgroundColor: theme.card, borderWidth: 1.5, borderColor: '#3b82f6', zIndex: 10 }} />
                    {/* Right Cutout Circle */}
                    <View style={{ position: 'absolute', right: -10, top: '55%', width: 20, height: 20, borderRadius: 10, backgroundColor: theme.card, borderWidth: 1.5, borderColor: '#3b82f6', zIndex: 10 }} />
                    
                    {/* Ticket Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text style={{ fontSize: 10, fontWeight: '900', color: '#3b82f6', letterSpacing: 1.2 }}>VIVU360 PASSPORT</Text>
                      <View style={{ backgroundColor: '#10b981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>ĐANG HOẠT ĐỘNG</Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 14, fontWeight: '900', color: theme.textPrimary }}>{selectedItem.title}</Text>
                    <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 3 }}>📍 {selectedItem.location}</Text>

                    <View style={{ height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.border, marginVertical: 14 }} />

                    {/* Ticket details grid */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
                      <View style={{ width: '45%' }}>
                        <Text style={{ fontSize: 8, fontWeight: '800', color: theme.textMuted }}>MÃ THÔNG HÀNH</Text>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: theme.textPrimary, marginTop: 1 }}>{generatedTicketCode}</Text>
                      </View>
                      <View style={{ width: '45%' }}>
                        <Text style={{ fontSize: 8, fontWeight: '800', color: theme.textMuted }}>NGÀY BẮT ĐẦU</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textPrimary, marginTop: 1 }}>{bookingDate}</Text>
                      </View>
                      <View style={{ width: '45%' }}>
                        <Text style={{ fontSize: 8, fontWeight: '800', color: theme.textMuted }}>TRƯỞNG NHÓM</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textPrimary, marginTop: 1 }} numberOfLines={1}>{contactName}</Text>
                      </View>
                      <View style={{ width: '45%' }}>
                        <Text style={{ fontSize: 8, fontWeight: '800', color: theme.textMuted }}>ĐỒNG HÀNH</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textPrimary, marginTop: 1 }}>{companionType}</Text>
                      </View>
                      <View style={{ width: '90%' }}>
                        <Text style={{ fontSize: 8, fontWeight: '800', color: theme.textMuted }}>GHI CHÚ HÀNH TRÌNH</Text>
                        <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 1 }} numberOfLines={2}>{tripNotes}</Text>
                      </View>
                    </View>

                    <View style={{ height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.border, marginVertical: 14 }} />

                    {/* Barcode Simulator */}
                    <View style={{ alignItems: 'center', marginTop: 4 }}>
                      <Text style={{ letterSpacing: 4, fontSize: 16, color: theme.textSecondary, fontFamily: 'monospace', opacity: 0.6, height: 22 }}>
                        ||||||||| | ||||| | ||| || |||||||| ||
                      </Text>
                      <Text style={{ fontSize: 9, color: theme.textMuted, marginTop: 2 }}>QUÉT MÃ QR TẠI ĐIỂM CHECK-IN VẬT LÝ</Text>
                    </View>
                  </View>

                  {/* Actions buttons */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 24, width: '100%' }}>
                    <Pressable
                      style={({ pressed }) => [
                        {
                          flex: 1.2,
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          borderColor: theme.border,
                          borderWidth: 1,
                          height: 44,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 6
                        },
                        pressed && { opacity: 0.8 }
                      ]}
                      onPress={handleSaveTicketToGallery}
                    >
                      {isSavingTicket ? (
                        <ActivityIndicator size="small" color={theme.textPrimary} />
                      ) : (
                        <>
                          <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '800' }}>Lưu Passport</Text>
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          borderRadius: 12,
                          overflow: 'hidden',
                          height: 44,
                        },
                        pressed && { opacity: 0.8 }
                      ]}
                      onPress={() => setDetailModalVisible(false)}
                    >
                      <LinearGradient
                        colors={['#3b82f6', '#1d4ed8']}
                        style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Hoàn tất</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              ) : (
                /* Itinerary Details Form */
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
                    <Text style={[styles.sectionFactTitle, { color: theme.textPrimary, fontSize: 13, marginBottom: 6 }]}>Giới thiệu cẩm nang</Text>
                    <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18, marginBottom: 16 }}>{selectedItem.description}</Text>

                    {/* Features included */}
                    <Text style={[styles.sectionFactTitle, { color: theme.textPrimary, fontSize: 13, marginBottom: 6 }]}>Quyền lợi trải nghiệm</Text>
                    <View style={{ gap: 6, marginBottom: 20 }}>
                      {[
                        'Cập nhật bản đồ số 3D ngoại tuyến ngoại cảnh',
                        'Tự động đồng bộ lịch trình vào Nhật ký cá nhân',
                        'Mở khóa danh hiệu du lịch độc quyền từ Vivu360',
                        'Tham gia cộng đồng chat nhóm phượt cùng điểm đến',
                      ].map((inc, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                          <CircleCheck size={12} color="#10b981" />
                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>{inc}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Itinerary Form Card */}
                    <View style={[styles.successTicketCard, { backgroundColor: theme.statusBg, borderColor: theme.border, padding: 16, borderRadius: 16 }]}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: theme.textPrimary, marginBottom: 14 }}>Kế hoạch hành trình</Text>
                      
                      {/* Name Input */}
                      <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6 }]}>TÊN LỮ KHÁCH / TRƯỞNG NHÓM</Text>
                      <TextInput
                        value={contactName}
                        onChangeText={setContactName}
                        placeholder="Nhập tên lữ khách..."
                        placeholderTextColor={theme.textMuted}
                        style={[styles.modalTextInput, { color: theme.textPrimary, backgroundColor: theme.card, borderColor: theme.border, marginBottom: 14 }]}
                      />

                      {/* Date Input */}
                      <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6 }]}>NGÀY KHỞI HÀNH DỰ KIẾN</Text>
                      <TextInput
                        value={bookingDate}
                        onChangeText={setBookingDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={theme.textMuted}
                        style={[styles.modalTextInput, { color: theme.textPrimary, backgroundColor: theme.card, borderColor: theme.border, marginBottom: 14 }]}
                      />

                      {/* Companion Selector */}
                      <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6 }]}>BẠN ĐỒNG HÀNH</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                        {[
                          'Một mình 🎒',
                          'Cặp đôi 💑',
                          'Gia đình 👨‍👩‍👧',
                          'Nhóm phượt ⛺',
                        ].map((type) => {
                          const isActive = companionType === type;
                          return (
                            <Pressable
                              key={type}
                              onPress={() => setCompanionType(type)}
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: isActive ? '#3b82f6' : theme.border,
                                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : theme.card,
                              }}
                            >
                              <Text style={{ fontSize: 11, color: isActive ? '#3b82f6' : theme.textSecondary, fontWeight: isActive ? '800' : '500' }}>
                                {type}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      {/* Trip Notes */}
                      <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6 }]}>GHI CHÚ HÀNH TRÌNH</Text>
                      <TextInput
                        value={tripNotes}
                        onChangeText={setTripNotes}
                        placeholder="Ví dụ: Mang theo máy ảnh, cắm trại qua đêm..."
                        placeholderTextColor={theme.textMuted}
                        multiline={true}
                        numberOfLines={3}
                        style={[styles.modalTextInput, { color: theme.textPrimary, backgroundColor: theme.card, borderColor: theme.border, height: 60, textAlignVertical: 'top', padding: 8, marginBottom: 14 }]}
                      />

                      {/* Auto Post Social Checkbox */}
                      <Pressable
                        onPress={() => setAutoShare(!autoShare)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 }}
                      >
                        <View style={{ width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: autoShare ? '#10b981' : theme.textMuted, alignItems: 'center', justifyContent: 'center', backgroundColor: autoShare ? '#10b981' : 'transparent' }}>
                          {autoShare && <Text style={{ color: '#fff', fontSize: 9, fontWeight: '950' }}>✓</Text>}
                        </View>
                        <Text style={{ fontSize: 11.5, color: theme.textSecondary, fontWeight: '700' }}>
                          Tự động chia sẻ lịch trình lên Bảng tin (+100 XP)
                        </Text>
                      </Pressable>
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
                      <Text style={styles.enterVRText}>Lưu lịch trình & Kích hoạt Passport 🚀</Text>
                      <ChevronRight size={16} color="#fff" />
                    </Pressable>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}
