import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Pressable, 
  StyleSheet, 
  SafeAreaView, 
  Platform, 
  StatusBar, 
  Alert, 
  TextInput, 
  Dimensions,
  ScrollView,
  Animated,
  PanResponder
} from 'react-native';
import { 
  MapPin, 
  Star, 
  ChevronRight, 
  Search, 
  X, 
  Compass,
  Sparkles,
  CloudSun,
  Volume2,
  VolumeX,
  Activity,
  Wind
} from 'lucide-react-native';

import { mockMapMarkers } from '../data';
import { TOUR_DATA } from './virtualTour';
import { getImageSource } from './pinterestExtractor';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const MAP_CANVAS_SIZE = Math.min(screenWidth - 32, screenHeight * 0.38);

const vietnamMapImg = require('./vietnam_digital_map.png');

const CROWDED_PROVINCES = [
  'Bắc Ninh', 'Hưng Yên', 'Hải Dương', 'Vĩnh Phúc', 'Hà Nam', 
  'Nam Định', 'Thái Bình', 'Ninh Bình', 'Hòa Bình', 'Bắc Kạn', 
  'Thái Nguyên', 'Phú Thọ', 'Bắc Giang', 'Long An', 'Tiền Giang', 
  'Bến Tre', 'Hậu Giang'
];

const provinceLabels = [
  // 5 Thành phố trực thuộc Trung ương (Hiển thị nhãn)
  { name: 'Thủ đô Hà Nội', top: '19%', left: '40%', isCapital: true, targetMarkerId: 5 },
  { name: 'Hải Phòng', top: '21%', left: '51%', showLabel: true },
  { name: 'Huế', top: '47%', left: '52%', showLabel: true },
  { name: 'Đà Nẵng', top: '50%', left: '57%', targetMarkerId: 2, showLabel: true },
  { name: 'Cần Thơ', top: '88%', left: '26%', showLabel: true },
  { name: 'TP. Hồ Chí Minh', top: '83%', left: '40%', showLabel: true },

  // Các tỉnh thành có thư viện hình ảnh & thông tin du lịch khả dụng
  { name: 'Lai Châu', top: '11%', left: '16%' },
  { name: 'Lào Cai', top: '10%', left: '24%', showLabel: true },
  { name: 'Yên Bái', top: '14%', left: '29%', targetMarkerId: 4, showLabel: true },
  { name: 'Hà Giang', top: '7%', left: '30%', showLabel: true },
  { name: 'Cao Bằng', top: '7%', left: '39%' },
  { name: 'Lạng Sơn', top: '11%', left: '48%' },
  { name: 'Sơn La', top: '17%', left: '20%' },
  { name: 'Quảng Ninh', top: '22%', left: '56%', targetMarkerId: 1, showLabel: true },
  { name: 'Bắc Ninh', top: '18%', left: '44.8%' },
  { name: 'Khánh Hòa', top: '71%', left: '64%', showLabel: true },
  { name: 'Lâm Đồng', top: '75%', left: '51%', showLabel: true },
  { name: 'Kiên Giang', top: '90%', left: '26%', targetMarkerId: 3, showLabel: true }
];

const getWeatherData = (id) => {
  switch (id) {
    case 1: return { temp: '29°C', desc: 'Có mây, gió nhẹ', icon: '⛅', uv: '3 (Thấp)', humidity: '72%', wind: '12 km/h' };
    case 2: return { temp: '31°C', desc: 'Nắng đẹp', icon: '☀️', uv: '8 (Cao)', humidity: '64%', wind: '15 km/h' };
    case 3: return { temp: '32°C', desc: 'Nắng gió nhiệt đới', icon: '🏝️', uv: '9 (Rất cao)', humidity: '78%', wind: '18 km/h' };
    case 4: return { temp: '22°C', desc: 'Sương mù, mát mẻ', icon: '🌫️', uv: '2 (Thấp)', humidity: '85%', wind: '8 km/h' };
    case 5: return { temp: '26°C', desc: 'Nắng nhẹ dịu mát', icon: '🌤️', uv: '5 (Vừa)', humidity: '60%', wind: '10 km/h' };
    default: return { temp: '28°C', desc: 'Thời tiết đẹp', icon: '☀️', uv: '4 (Vừa)', humidity: '70%', wind: '11 km/h' };
  }
};

const getAIRecommendation = (id) => {
  switch (id) {
    case 1: return 'Tháng 10 - tháng 4 là thời điểm đẹp nhất. Nên kết hợp ngắm cảnh từ trực thăng và tham quan làng chài.';
    case 2: return 'Tháng 2 - tháng 4 tiết trời mát mẻ. Bạn nên dạo phố cổ đèn lồng buổi tối và thử ẩm thực Cao Lầu.';
    case 3: return 'Tháng 11 - tháng 4 (mùa khô). Lý tưởng để lặn ngắm san hô bãi Sao và đón hoàng hôn Sunset Sanato.';
    case 4: return 'Tháng 9 - tháng 10 ngắm ruộng bậc thang chín vàng rực. Hãy chuẩn bị máy ảnh đón bình minh thung lũng.';
    case 5: return 'Mùa thu Hà Nội se lạnh là trải nghiệm tuyệt vời nhất. Thử đi dạo Hồ Gươm sớm và uống cà phê trứng.';
    default: return 'Lên lịch trình sớm để nhận ưu đãi tour ảo chất lượng cao 3D VR.';
  }
};

const getTravelSpecs = (id) => {
  switch (id) {
    case 1: return { distance: '165 km', time: '2.5 giờ (Limousine)', route: 'Hà Nội - Cao tốc Hải Phòng - Quảng Ninh' };
    case 2: return { distance: '800 km', time: '1.2 giờ (Máy bay)', route: 'Sân bay Nội Bài - Sân bay Đà Nẵng' };
    case 3: return { distance: '1200 km', time: '2.1 giờ (Bay thẳng)', route: 'Sân bay Nội Bài - Sân bay Phú Quốc' };
    case 4: return { distance: '280 km', time: '5 giờ (Xe giường nằm)', route: 'Hà Nội - Yên Bái - QL32' };
    case 5: return { distance: '0 km', time: 'Trung tâm thành phố', route: 'Phố đi bộ Hồ Gươm' };
    default: return { distance: 'Chưa xác định', time: '--', route: '--' };
  }
};

const getPlaceCoords = (place) => {
  if (!place) return { lat: '21.0285° N', lon: '105.8542° E' };
  
  if (place.type === 'marker') {
    switch (place.id) {
      case 1: return { lat: '20.9500° N', lon: '107.0333° E' };
      case 2: return { lat: '15.8801° N', lon: '108.3380° E' };
      case 3: return { lat: '10.2289° N', lon: '103.9572° E' };
      case 4: return { lat: '21.8486° N', lon: '104.1481° E' };
      case 5: return { lat: '21.0285° N', lon: '105.8542° E' };
      default: return { lat: '21.0285° N', lon: '105.8542° E' };
    }
  } else {
    const nameClean = (place.name || '').replace('Thủ đô ', '').trim();
    switch (nameClean) {
      case 'Hà Nội': return { lat: '21.0285° N', lon: '105.8542° E' };
      case 'Hải Phòng': return { lat: '20.8449° N', lon: '106.6881° E' };
      case 'Huế': return { lat: '16.4637° N', lon: '107.5908° E' };
      case 'Đà Nẵng': return { lat: '16.0544° N', lon: '108.2022° E' };
      case 'TP. Hồ Chí Minh': return { lat: '10.8231° N', lon: '106.6297° E' };
      case 'Cần Thơ': return { lat: '10.0452° N', lon: '105.7469° E' };
      case 'Lai Châu': return { lat: '22.3859° N', lon: '103.4619° E' };
      case 'Lào Cai': return { lat: '22.4856° N', lon: '103.9707° E' };
      case 'Yên Bái': return { lat: '21.7229° N', lon: '104.9113° E' };
      case 'Hà Giang': return { lat: '22.8233° N', lon: '104.9836° E' };
      case 'Cao Bằng': return { lat: '22.6786° N', lon: '106.2581° E' };
      case 'Lạng Sơn': return { lat: '21.8538° N', lon: '106.7618° E' };
      case 'Sơn La': return { lat: '21.3259° N', lon: '103.9123° E' };
      case 'Bắc Ninh': return { lat: '21.1861° N', lon: '106.0763° E' };
      case 'Khánh Hòa': return { lat: '12.2388° N', lon: '109.1967° E' };
      case 'Lâm Đồng': return { lat: '11.9404° N', lon: '108.4583° E' };
      case 'Kiên Giang': return { lat: '10.0125° N', lon: '105.0809° E' };
      default: return { lat: '16.0471° N', lon: '108.2062° E' };
    }
  }
};

const getProvinceDesc = (name) => {
  const cleanName = (name || '').replace('Thủ đô ', '').trim();
  switch (cleanName) {
    case 'Hà Nội':
      return 'Thủ đô ngàn năm văn hiến, nổi tiếng với nét đẹp cổ kính của Hồ Hoàn Kiếm, Lăng Bác và phố cổ tấp nập.';
    case 'Hải Phòng':
      return 'Thành phố Cảng hoa phượng đỏ, nổi tiếng với đảo ngọc Cát Bà hoang sơ, biển Đồ Sơn và ẩm thực phong phú.';
    case 'Huế':
      return 'Cố đô cổ kính thơ mộng bên dòng sông Hương, nổi tiếng với di sản cung điện triều Nguyễn và các lăng tẩm cổ kính.';
    case 'Đà Nẵng':
      return 'Thành phố đáng sống bậc nhất Việt Nam, được thiên nhiên ban tặng Ngũ Hành Sơn, Bà Nà Hills và biển Mỹ Khê.';
    case 'TP. Hồ Chí Minh':
      return 'Đô thị sầm uất và năng động nhất nước, giao thoa giữa nét hiện đại và các công trình lịch sử nổi tiếng.';
    case 'Cần Thơ':
      return 'Thủ phủ miền Tây sông nước trù phú với Chợ nổi Cái Răng nhộn nhịp và những vườn cây ăn trái trĩu quả.';
    case 'Lai Châu':
      return 'Vùng núi Tây Bắc hoang sơ hiểm trở, nổi tiếng với cung đường đèo mây phủ quanh năm và thung lũng lúa xanh mướt.';
    case 'Lào Cai':
      return 'Nơi có thị trấn Sa Pa mờ sương, đỉnh Fansipan hùng vĩ - nóc nhà Đông Dương, và các bản làng văn hóa độc đáo.';
    case 'Yên Bái':
      return 'Nổi tiếng với danh thắng ruộng bậc thang Mù Cang Chải vàng óng mùa lúa chín và cung đường đèo Khau Phạ hiểm trở.';
    case 'Hà Giang':
      return 'Vùng địa đầu Tổ quốc với cao nguyên đá Đồng Văn kỳ vĩ, đèo Mã Pí Lèng hùng vĩ và mùa hoa tam giác mạch.';
    case 'Cao Bằng':
      return 'Sở hữu thác Bản Giốc - thác nước tự nhiên lớn nhất Đông Nam Á và khu di tích lịch sử Pác Bó thơ mộng.';
    case 'Lạng Sơn':
      return 'Mảnh đất biên thùy xứ Lạng với chợ Kỳ Lừa sầm uất, danh thắng động Tam Thanh và ẩm thực vịt quay đặc sắc.';
    case 'Sơn La':
      return 'Vùng thảo nguyên Mộc Châu mát mẻ trong lành, đồi chè trái tim xanh mướt và những mùa hoa cải, hoa mận nở rộ.';
    case 'Bắc Ninh':
      return 'Quê hương của những làn điệu dân ca Quan họ Kinh Bắc đằm thắm và những ngôi chùa cổ kính linh thiêng.';
    case 'Khánh Hòa':
      return 'Thành phố biển Nha Trang xinh đẹp với vịnh biển trong xanh, cát trắng mịn và các khu nghỉ dưỡng đẳng cấp.';
    case 'Lâm Đồng':
      return 'Cao nguyên Đà Lạt thơ mộng mờ sương, khí hậu ôn đới quanh năm mát mẻ cùng ngàn hoa khoe sắc.';
    case 'Kiên Giang':
      return 'Tỉnh ven biển miền Tây sở hữu đảo ngọc Phú Quốc xinh đẹp cùng quần đảo Nam Du, Hải Tặc hoang sơ.';
    default:
      return 'Điểm đến du lịch hấp dẫn, mang đậm bản sắc văn hóa Việt Nam với cảnh quan thiên nhiên trù phú.';
  }
};

const getProvinceImage = (name) => {
  const cleanName = (name || '').replace('Thủ đô ', '').trim();
  switch (cleanName) {
    case 'Hà Nội':
      return 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80';
    case 'Hải Phòng':
      return 'https://images.unsplash.com/photo-1509060464153-4466739f78ad?auto=format&fit=crop&w=400&q=80';
    case 'Huế':
      return 'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=400&q=80';
    case 'Đà Nẵng':
      return 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=400&q=80';
    case 'TP. Hồ Chí Minh':
      return 'https://images.unsplash.com/photo-1509060464153-4466739f78ad?auto=format&fit=crop&w=400&q=80';
    case 'Cần Thơ':
      return 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=400&q=80';
    case 'Lai Châu':
      return 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80';
    case 'Lào Cai':
      return 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=400&q=80';
    case 'Yên Bái':
      return 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=400&q=80';
    case 'Hà Giang':
      return 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=400&q=80';
    case 'Cao Bằng':
      return 'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=400&q=80';
    case 'Lạng Sơn':
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';
    case 'Sơn La':
      return 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=400&q=80';
    case 'Bắc Ninh':
      return 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=400&q=80';
    case 'Khánh Hòa':
      return 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80';
    case 'Lâm Đồng':
      return 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=400&q=80';
    case 'Kiên Giang':
      return 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=400&q=80';
    default:
      return 'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=400&q=80';
  }
};

export function MapScreen({ isDarkMode, setIsDarkMode, theme, onNavigateToTour, onNavigateToProvince, userInfo = { checkedIn: [] }, onCheckIn }) {
  const [selectedPlace, setSelectedPlace] = useState({ type: 'marker', id: 1, name: 'Vịnh Hạ Long' });
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  
  const mapContainerRef = useRef(null);
  
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [mapMode, setMapMode] = useState('normal'); // 'normal' | 'lidar'

  const scanAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (mapMode === 'lidar') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [mapMode]);

  const laserTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, MAP_CANVAS_SIZE - 4],
  });

  const handleLocalCheckIn = (placeId, placeTitle) => {
    if (!onCheckIn) return;
    setIsCheckingIn(true);
    setTimeout(() => {
      setIsCheckingIn(false);
      onCheckIn(placeId, 200);
      Alert.alert(
        'Check-in Thành Công! 📍',
        `Hệ thống định vị GPS xác nhận bạn đang ở thực địa "${placeTitle}". Bạn được cộng +200 XP!`
      );
    }, 1500);
  };

  const filteredMarkers = useMemo(() => {
    let list = mockMapMarkers;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.region.toLowerCase().includes(query)
      );
    }
    return list;
  }, [searchQuery]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    
    // 1. Search in mockMapMarkers (specific attractions)
    const matchedMarkers = mockMapMarkers.filter(m => 
      m.title.toLowerCase().includes(query) ||
      m.region.toLowerCase().includes(query)
    ).map(m => ({
      id: `marker-${m.id}`,
      name: m.title,
      sub: `${m.region} (Điểm du lịch)`,
      type: 'marker',
      markerId: m.id,
      provinceName: m.region
    }));

    // 2. Search in provinceLabels (63 provinces/cities)
    const matchedProvinces = provinceLabels.filter(p => 
      p.name.toLowerCase().includes(query)
    ).map(p => ({
      id: `province-${p.name}`,
      name: p.name,
      sub: 'Tỉnh / Thành phố',
      type: 'province',
      provinceName: p.name === 'Thủ đô Hà Nội' ? 'Hà Nội' : p.name
    }));

    return [...matchedMarkers, ...matchedProvinces].slice(0, 5);
  }, [searchQuery]);

  const filteredProvinces = useMemo(() => {
    if (!searchQuery.trim()) return provinceLabels;
    const query = searchQuery.toLowerCase().trim();
    
    // Check if any matching marker belongs to a province
    const matchingRegions = mockMapMarkers
      .filter(m => m.title.toLowerCase().includes(query) || m.region.toLowerCase().includes(query))
      .map(m => m.region.toLowerCase());

    return provinceLabels.filter(p => {
      const pNameLower = p.name.toLowerCase();
      // Match province name directly
      if (pNameLower.includes(query)) return true;
      // Or if it is the parent region of a matching marker
      if (matchingRegions.some(reg => reg.includes(pNameLower) || pNameLower.includes(reg))) return true;
      return false;
    });
  }, [searchQuery]);

  const activeMarker = useMemo(() => {
    const safePlace = selectedPlace || { type: 'marker', id: 1, name: 'Vịnh Hạ Long' };
    if (safePlace.type === 'marker') {
      return mockMapMarkers.find(m => m.id === safePlace.id) || mockMapMarkers[0];
    } else {
      const activeProv = provinceLabels.find(p => p.name === safePlace.name);
      return activeProv ? {
        top: activeProv.top,
        left: activeProv.left,
        id: 9,
        title: activeProv.name
      } : mockMapMarkers[0];
    }
  }, [selectedPlace]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.tabContainer}>
        
        {/* HEADER */}
        <View style={styles.mapTitleHeader}>
          <Text style={[styles.mapTitle, { color: theme.textPrimary }]}>Bản đồ Tương tác</Text>
          <Text style={[styles.mapSub, { color: theme.textSecondary }]}>Chọn điểm du lịch để tham quan 360° VR hoặc bấm vào các tỉnh thành để khám phá hình ảnh du lịch địa phương!</Text>
        </View>

        {/* SEARCH WRAPPER FOR FLOATING DROPDOWN */}
        <View style={{ zIndex: 9999, position: 'relative' }}>
          {/* SEARCH BAR */}
          <View style={[styles.searchContainer, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginBottom: 8 }]}>
            <Search size={18} color={theme.textMuted} />
            <TextInput
              ref={searchInputRef}
              placeholder="Tìm địa danh trên bản đồ..."
              placeholderTextColor={theme.textMuted}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: theme.textPrimary }]}
            />
            {searchQuery ? (
              <Pressable 
                onPress={() => {
                  setSearchQuery('');
                  if (searchInputRef.current) {
                    searchInputRef.current.clear();
                  }
                }} 
                style={styles.clearSearchBtn}
              >
                <X size={16} color={theme.textSecondary} />
              </Pressable>
            ) : null}
          </View>

          {/* SEARCH RESULTS DROPDOWN */}
          {searchResults.length > 0 && (
            <View style={[
              styles.searchDropdown, 
              { 
                backgroundColor: isDarkMode ? 'rgba(24, 24, 27, 0.96)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: theme.border,
              }
            ]}>
              {searchResults.map((item, index) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    { borderBottomColor: theme.border },
                    index === searchResults.length - 1 && { borderBottomWidth: 0 },
                    pressed && { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }
                  ]}
                  onPress={() => {
                    setSearchQuery('');
                    if (searchInputRef.current) {
                      searchInputRef.current.clear();
                    }
                    if (item.type === 'marker') {
                      setSelectedPlace({ type: 'marker', id: item.markerId, name: item.name });
                    } else {
                      setSelectedPlace({ type: 'province', name: item.provinceName });
                    }
                  }}
                >
                  <View style={styles.dropdownItemLeft}>
                    <MapPin size={14} color={item.type === 'marker' ? '#ef4444' : '#3b82f6'} />
                    <Text style={[styles.dropdownItemName, { color: theme.textPrimary }]}>{item.name}</Text>
                  </View>
                  <Text style={[styles.dropdownItemSub, { color: theme.textMuted }]}>{item.sub}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* MAP CANVAS CONTAINER */}
        <View 
          ref={mapContainerRef}
          style={[styles.mapCanvas, { backgroundColor: isDarkMode ? '#070a13' : '#dbeafe', borderColor: theme.border }]}
        >
          {/* Static Map Content */}
          <View style={{
            width: '100%',
            height: '100%',
          }}>
            {/* Clipped background and mesh overlays */}
            <View style={[StyleSheet.absoluteFill, { borderRadius: 26, overflow: 'hidden' }]}>
              <Image 
                source={vietnamMapImg} 
                style={styles.mapCanvasBgImage} 
                resizeMode="stretch"
              />



              {/* Canvas Pressable handler */}
              <Pressable 
                style={StyleSheet.absoluteFill} 
                onPress={() => {
                  setSearchQuery('');
                  if (searchInputRef.current) {
                    searchInputRef.current.clear();
                  }
                }} 
              />
            </View>



            {/* Sea Labels */}
            <Text style={[styles.seaText1, { color: isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(30, 58, 138, 0.25)' }]}>BIỂN ĐÔNG</Text>
            <Text style={[styles.seaText2, { color: isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(30, 58, 138, 0.25)' }]}>VỊNH BẮC BỘ</Text>
            <Text style={[styles.seaText3, { color: isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(30, 58, 138, 0.25)' }]}>VỊNH THÁI LAN</Text>

            {/* SOVEREIGNTY ISLANDS */}
            <View style={[styles.islandContainer, { top: '38%', left: '72%' }]}>
              <View style={styles.islandCluster}>
                <View style={styles.islandDotTiny} />
                <View style={[styles.islandDotTiny, { top: 4, left: 6 }]} />
                <View style={[styles.islandDotTiny, { top: -2, left: 10 }]} />
              </View>
              <Text style={[styles.islandLabel, { color: isDarkMode ? '#cbd5e1' : '#0f172a' }]}>Q.đ Hoàng Sa{"\n"}(Việt Nam)</Text>
            </View>

            <View style={[styles.islandContainer, { top: '68%', left: '70%' }]}>
              <View style={styles.islandCluster}>
                <View style={styles.islandDotTiny} />
                <View style={[styles.islandDotTiny, { top: 6, left: -4 }]} />
                <View style={[styles.islandDotTiny, { top: 2, left: 10 }]} />
                <View style={[styles.islandDotTiny, { top: -6, left: 6 }]} />
                <View style={[styles.islandDotTiny, { top: 8, left: 8 }]} />
              </View>
              <Text style={[styles.islandLabel, { color: isDarkMode ? '#cbd5e1' : '#0f172a' }]}>Q.đ Trường Sa{"\n"}(Việt Nam)</Text>
            </View>

            {/* SPECIAL PHU QUOC ISLAND PIN & SOVEREIGNTY LABEL */}
            {(() => {
              const isSelected = selectedPlace && selectedPlace.type === 'marker' && selectedPlace.id === 3;
              const marker = mockMapMarkers.find(m => m.id === 3) || mockMapMarkers[2];
              return (
                <Pressable 
                  style={[
                    styles.mapPinWrapper,
                    { top: '84%', left: '13%', zIndex: 100 }
                  ]}
                  onPress={() => {
                    setSelectedPlace({ type: 'marker', id: 3, name: 'Đảo Phú Quốc' });
                  }}
                >
                  <View style={styles.pinCircleGlowContainer}>
                    {isSelected && (
                      <View style={styles.pinPulseCircleActive} />
                    )}
                    <View style={[
                      styles.pinDot,
                      isSelected ? styles.pinDotActive : styles.phuQuocDotInactive
                    ]}>
                      {isSelected ? (
                        <Image 
                          source={getImageSource(marker.image) || { uri: marker.image }} 
                          style={styles.pinImageThumbnail} 
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.phuQuocDotCenter} />
                      )}
                    </View>
                  </View>
                  
                  {isSelected ? (
                    <View style={[
                      styles.pinLabelCard,
                      { 
                        backgroundColor: isDarkMode ? 'rgba(9, 9, 11, 0.85)' : 'rgba(255, 255, 255, 0.95)', 
                        borderColor: '#06b6d4',
                        borderWidth: 1.2,
                      }
                    ]}>
                      <Text style={[styles.pinLabelText, { color: theme.textPrimary }]} numberOfLines={1}>{marker.title}</Text>
                      <View style={[styles.vrLabelBadge, { backgroundColor: '#06b6d4', shadowColor: '#06b6d4', paddingHorizontal: 2.5, paddingVertical: 0.8, marginLeft: 2 }]}>
                        <Text style={styles.vrLabelBadgeText}>360° VR</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.phuQuocSovereigntyLabel}>
                      <Text style={[
                        styles.islandLabel, 
                        { color: isDarkMode ? '#cbd5e1' : '#0f172a', fontWeight: '850', fontSize: 7.2, marginTop: 4 }
                      ]}>
                        Đảo Phú Quốc{"\n"}(Việt Nam)
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })()}

          {/* CAPITAL STAR (HANOI) */}
          {filteredProvinces.some(p => p.isCapital) && (() => {
            const isSelected = selectedPlace && selectedPlace.type === 'marker' && selectedPlace.id === 5;
            return (
              <Pressable 
                style={[styles.provContainer, { top: '19%', left: '40%', zIndex: 99 }]} 
                onPress={() => {
                  setSelectedPlace({ type: 'marker', id: 5, name: 'Hồ Hoàn Kiếm' });
                }}
              >
                <View style={styles.capitalStarWrapper}>
                  {isSelected && <View style={styles.capitalStarPulse} />}
                  <Star size={16} color="#ef4444" fill={isSelected ? "#facc15" : "rgba(250, 204, 21, 0.6)"} strokeWidth={1.5} />
                </View>
              </Pressable>
            );
          })()}

          {/* OTHER PROVINCES TEXT LABELS */}
          {filteredProvinces.map((prov, index) => {
            if (prov.isCapital || prov.targetMarkerId) return null;
            const isSelected = selectedPlace && selectedPlace.type === 'province' && selectedPlace.name === prov.name;
            return (
              <Pressable 
                key={index} 
                style={[
                  styles.provContainer, 
                  { top: prov.top, left: prov.left }
                ]} 
                onPress={() => {
                  setSelectedPlace({ type: 'province', name: prov.name });
                }}
              >
                <View style={[styles.provDot, isSelected && styles.provDotActive]} />
                <Text style={[
                  styles.provLabelText, 
                  { 
                    color: isSelected ? '#3b82f6' : (isDarkMode ? 'rgba(241, 245, 249, 0.65)' : 'rgba(15, 23, 42, 0.65)'),
                    fontWeight: isSelected ? '900' : '650',
                    fontSize: isSelected ? 7.5 : 6.2,
                    textShadowColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                    textShadowOffset: { width: 0.5, height: 0.5 },
                    textShadowRadius: 1
                  }
                ]}>
                  {prov.name}
                </Text>
              </Pressable>
            );
          })}

          {/* DYNAMIC MAP PINS */}
          {filteredMarkers.map((marker) => {
            if (marker.id === 5 || marker.id === 3) return null; // Hà Nội and Phú Quốc are rendered by their special handlers
            const isSelected = selectedPlace && selectedPlace.type === 'marker' && selectedPlace.id === marker.id;
            return (
              <Pressable
                key={marker.id}
                style={[
                  styles.mapPinWrapper,
                  { top: marker.top, left: marker.left }
                ]}
                onPress={() => {
                  setSelectedPlace({ type: 'marker', id: marker.id, name: marker.title });
                }}
              >
                <View style={styles.pinCircleGlowContainer}>
                  {isSelected && (
                    <View style={styles.pinPulseCircleActive} />
                  )}
                  <View style={[
                    styles.pinDot,
                    isSelected ? styles.pinDotActive : styles.pinDotInactive
                  ]}>
                    {isSelected ? (
                      <Image 
                        source={getImageSource(marker.image) || { uri: marker.image }} 
                        style={styles.pinImageThumbnail} 
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.pinDotCenter} />
                    )}
                  </View>
                </View>
                {isSelected && (
                  <View style={[
                    styles.pinLabelCard,
                    { 
                      backgroundColor: isDarkMode ? 'rgba(9, 9, 11, 0.85)' : 'rgba(255, 255, 255, 0.95)', 
                      borderColor: '#06b6d4',
                      borderWidth: 1.2,
                    }
                  ]}>
                    <Text style={[styles.pinLabelText, { color: theme.textPrimary }]} numberOfLines={1}>{marker.title}</Text>
                    <View style={[styles.vrLabelBadge, { backgroundColor: '#06b6d4', shadowColor: '#06b6d4', paddingHorizontal: 2.5, paddingVertical: 0.8, marginLeft: 2 }]}>
                      <Text style={styles.vrLabelBadgeText}>360° VR</Text>
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}

            {/* COMPACT FLOATING RADAR SCAN TOGGLE */}
            <Pressable 
              onPress={() => setMapMode(prev => prev === 'normal' ? 'lidar' : 'normal')}
              style={({ pressed }) => [
                styles.hudCompass, 
                { 
                  top: 12, 
                  left: 12,
                  right: undefined,
                  backgroundColor: mapMode === 'lidar' ? '#06b6d4' : (isDarkMode ? 'rgba(24, 24, 27, 0.85)' : 'rgba(255, 255, 255, 0.9)'),
                  borderColor: mapMode === 'lidar' ? '#22d3ee' : theme.border,
                  opacity: pressed ? 0.8 : 1,
                  zIndex: 999
                }
              ]}
            >
              {mapMode === 'lidar' && (
                <View style={[styles.capitalStarPulse, { width: 44, height: 44, borderRadius: 22 }]} />
              )}
              <Activity size={14} color={mapMode === 'lidar' ? '#fff' : theme.textSecondary} />
            </Pressable>

            {/* LIDAR SCAN MODE OVERLAYS */}
            {mapMode === 'lidar' && (
              <>
                <View style={styles.lidarOverlayTint} />
                <View style={styles.lidarMeshGrid}>
                  <View style={styles.lidarGridLineH1} />
                  <View style={styles.lidarGridLineH2} />
                  <View style={styles.lidarGridLineV1} />
                  <View style={styles.lidarGridLineV2} />
                  <Animated.View style={[styles.lidarScanLaser, { transform: [{ translateY: laserTranslateY }] }]} />
                </View>
                
                {/* Locks target reticle concentric rings around active marker */}
                <View style={[styles.lidarTargetReticle, { top: activeMarker.top, left: activeMarker.left }]}>
                  <View style={styles.lidarLockRingOuter} />
                  <View style={styles.lidarLockRingInner} />
                </View>
              </>
            )}

          </View>

        </View>

        {/* DETAILS CARD BELOW MAP */}
        {(() => {
          const safePlace = selectedPlace || { type: 'marker', id: 1, name: 'Vịnh Hạ Long' };
          const isMarker = safePlace.type === 'marker';
          let title = '';
          let region = '';
          let image = '';
          let rating = '4.8';
          let weather = { temp: '28°C', desc: 'Thời tiết đẹp', icon: '☀️' };
          let specs = null;
          let desc = '';

          if (isMarker) {
            const marker = mockMapMarkers.find(m => m.id === safePlace.id) || mockMapMarkers[0];
            title = marker.title;
            region = marker.region;
            image = marker.image;
            rating = marker.rating;
            weather = getWeatherData(marker.id);
            specs = getTravelSpecs(marker.id);
            desc = getAIRecommendation(marker.id);
          } else {
            const provName = safePlace.name || '';
            title = provName.replace('Thủ đô ', '');
            region = 'Việt Nam';
            image = getProvinceImage(provName);
            weather = { temp: '28°C', desc: 'Nắng nhẹ dịu mát', icon: '🌤️' };
            desc = getProvinceDesc(provName);
          }

          return (
            <View style={[
              styles.placeDetailsCard, 
              { 
                backgroundColor: theme.card, 
                borderColor: theme.border 
              }
            ]}>
              <View style={styles.cardHeaderRow}>
                <Image source={{ uri: image }} style={styles.cardCoverPhoto} />
                <View style={styles.cardTextContent}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Text style={[styles.cardTitleText, { color: theme.textPrimary }]} numberOfLines={1}>{title}</Text>
                    <View style={styles.cardRatingBadge}>
                      <Star size={10} color="#eab308" fill="#eab308" style={{ marginRight: 2 }} />
                      <Text style={styles.cardRatingText}>{rating}</Text>
                    </View>
                  </View>
                  <Text style={[styles.cardRegionText, { color: theme.textSecondary }]}>📍 {region}</Text>
                  
                  {/* Weather and Specs row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    <View style={styles.metaBadge}>
                      <Text style={styles.metaBadgeText}>{weather.icon} {weather.temp}</Text>
                    </View>
                    {specs && (
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaBadgeText}>🕒 {specs.time}</Text>
                      </View>
                    )}
                    <View style={[styles.metaBadge, { backgroundColor: isDarkMode ? 'rgba(6, 182, 212, 0.08)' : 'rgba(6, 182, 212, 0.04)' }]}>
                      <Text style={[styles.metaBadgeText, { color: isDarkMode ? '#22d3ee' : '#0891b2' }]}>
                        🛰️ {getPlaceCoords(safePlace).lat.split('°')[0]}°, {getPlaceCoords(safePlace).lon.split('°')[0]}°
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={[styles.cardDescText, { color: theme.textSecondary }]} numberOfLines={1}>
                {desc}
              </Text>

              {/* Action Buttons Row */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  style={({ pressed }) => [
                    styles.exploreActionBtn,
                    { flex: 1, opacity: pressed ? 0.8 : 1 }
                  ]}
                  onPress={() => {
                    if (isMarker) {
                      if (onNavigateToTour) {
                        onNavigateToTour(safePlace.id, 0);
                      }
                    } else {
                      if (onNavigateToProvince) {
                        onNavigateToProvince(safePlace.name);
                      }
                    }
                  }}
                >
                  <LinearGradient
                    colors={isMarker ? ['#06b6d4', '#3b82f6'] : ['#10b981', '#059669']}
                    style={styles.exploreBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Compass size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.exploreBtnText} numberOfLines={1}>
                      {isMarker ? '360° VR Tour' : 'Xem Ảnh Du Lịch'}
                    </Text>
                  </LinearGradient>
                </Pressable>

                {isMarker && (() => {
                  const checkedInList = userInfo.checkedIn || [];
                  const isCheckedIn = checkedInList.includes(safePlace.id);
                  return (
                    <Pressable
                      style={({ pressed }) => [
                        styles.exploreActionBtn,
                        { flex: 1, opacity: (pressed || isCheckedIn || isCheckingIn) ? 0.85 : 1 }
                      ]}
                      disabled={isCheckedIn || isCheckingIn}
                      onPress={() => handleLocalCheckIn(safePlace.id, title)}
                    >
                      <LinearGradient
                        colors={isCheckedIn ? ['#10b981', '#059669'] : ['#3b82f6', '#1d4ed8']}
                        style={styles.exploreBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <MapPin size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.exploreBtnText} numberOfLines={1}>
                          {isCheckingIn ? 'Xác thực GPS...' : isCheckedIn ? 'Đã Check-in' : 'Check-in GPS (+200 XP)'}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  );
                })()}
              </View>
            </View>
          );
        })()}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: Platform.OS === 'ios' ? 54 : 80, // Prevent bottom tab bar from covering map details action buttons and avoid double safe area on iOS
  },
  tabContainer: { width: '100%' },

  // Header Styles
  mapTitleHeader: { paddingHorizontal: 16, paddingTop: 12, marginBottom: 6 },
  mapTitle: { fontSize: 22, fontWeight: '900' },
  mapSub: { fontSize: 11, fontWeight: '500', marginTop: 3 },

  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.2,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },

  // Map Canvas
  mapCanvas: {
    height: MAP_CANVAS_SIZE,
    marginHorizontal: 16,
    borderRadius: 28,
    borderWidth: 1.2,
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  mapCanvasBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.88,
  },

  seaText1: { position: 'absolute', right: '15%', top: '60%', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  seaText2: { position: 'absolute', right: '10%', top: '25%', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  seaText3: { position: 'absolute', left: '10%', top: '85%', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  // Pins Styling
  mapPinWrapper: { position: 'absolute', alignItems: 'center', zIndex: 50 },
  pinCircleGlowContainer: { alignItems: 'center', justifyContent: 'center' },
  pinPulseCircleActive: { position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(6, 182, 212, 0.35)' },
  pinDot: { borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pinDotActive: { width: 28, height: 28, borderColor: '#06b6d4', borderWidth: 2 },
  pinDotInactive: { 
    width: 13, 
    height: 13, 
    borderRadius: 6.5, 
    borderWidth: 1.5, 
    borderColor: '#fff', 
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  pinDotCenter: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff' },
  pinImageThumbnail: { width: '100%', height: '100%' },
  pinLabelCard: { 
    position: 'absolute',
    top: -30,
    backgroundColor: 'rgba(9, 9, 11, 0.82)',
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pinLabelText: { fontSize: 9, fontWeight: '800', flexShrink: 0 },

  // Compass
  hudCompass: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(9, 9, 11, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  compassNeedle: { width: 2, height: 14, backgroundColor: '#ef4444' },
  compassText: { position: 'absolute', top: 1, color: '#fff', fontSize: 6.5, fontWeight: '900' },

  // Islands
  islandContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  islandCluster: { width: 20, height: 15, position: 'relative', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  islandDotTiny: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: '#60a5fa' },
  islandLabel: { fontSize: 7, fontWeight: '900', textAlign: 'center', lineHeight: 8 },

  // Province labels
  provContainer: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 3, zIndex: 10 },
  provDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(148, 163, 184, 0.7)' },
  provDotActive: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#3b82f6', borderWidth: 1.5, borderColor: '#fff' },
  provLabelText: { fontSize: 8, fontWeight: '750' },
  capitalStarWrapper: { alignItems: 'center', justifyContent: 'center', width: 26, height: 26 },
  capitalStarPulse: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(254, 240, 138, 0.35)', borderWidth: 1.2, borderColor: '#ef4444' },
  capitalLabelCard: { 
    borderWidth: 1.2, 
    borderColor: '#ef4444', 
    borderRadius: 6, 
    paddingHorizontal: 7, 
    paddingVertical: 3, 
    marginLeft: 4,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  capitalLabelText: { fontWeight: '950', fontSize: 8.5, letterSpacing: 0.5 },

  // LiDAR scan modes styling
  lidarOverlayTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    zIndex: 1,
  },
  lidarMeshGrid: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  lidarGridLineH1: {
    position: 'absolute',
    left: 0, right: 0, top: '25%',
    height: 0.5, backgroundColor: 'rgba(6, 182, 212, 0.25)',
  },
  lidarGridLineH2: {
    position: 'absolute',
    left: 0, right: 0, top: '75%',
    height: 0.5, backgroundColor: 'rgba(6, 182, 212, 0.25)',
  },
  lidarGridLineV1: {
    position: 'absolute',
    top: 0, bottom: 0, left: '25%',
    width: 0.5, backgroundColor: 'rgba(6, 182, 212, 0.25)',
  },
  lidarGridLineV2: {
    position: 'absolute',
    top: 0, bottom: 0, left: '75%',
    width: 0.5, backgroundColor: 'rgba(6, 182, 212, 0.25)',
  },
  lidarScanLaser: {
    position: 'absolute',
    left: 0, right: 0, height: 2,
    backgroundColor: '#06b6d4',
    opacity: 0.6,
    top: '45%',
  },

  // Map toggle buttons styling
  mapModeToggleContainer: {
    position: 'absolute',
    left: 12,
    top: 12,
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 2,
    zIndex: 99,
    gap: 2,
  },
  mapModeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mapModeToggleBtnActive: {
    backgroundColor: '#3b82f6',
  },
  mapModeToggleText: {
    fontSize: 9.5,
    fontWeight: '800',
  },

  // Lock-on concentric rings styling
  lidarTargetReticle: {
    position: 'absolute',
    width: 80,
    height: 80,
    marginTop: -40,
    marginLeft: -40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lidarLockRingOuter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#06b6d4',
    borderStyle: 'dashed',
    opacity: 0.8,
  },
  lidarLockRingInner: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#ef4444',
    opacity: 0.6,
  },

  // High tech radar panel styling
  radarHudWidget: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 8,
    width: 110,
    zIndex: 30,
  },
  radarHudTitle: {
    color: '#06b6d4',
    fontSize: 7.5,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  radarHudMeta: {
    color: '#94a3b8',
    fontSize: 7.5,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  hudLedIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  radarHudStatusText: {
    fontSize: 7.5,
    fontWeight: '900',
    fontFamily: 'monospace',
  },

  // Search Results Dropdown
  searchDropdown: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    borderRadius: 14,
    borderWidth: 1.2,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.8,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownItemName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  dropdownItemSub: {
    fontSize: 10,
    fontWeight: '600',
  },
  vrLabelBadge: {
    backgroundColor: '#06b6d4',
    borderRadius: 3,
    paddingHorizontal: 2.5,
    paddingVertical: 0.8,
    marginLeft: 2.5,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 2,
  },
  vrLabelBadgeText: {
    color: '#fff',
    fontSize: 4.8,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  vrLocationSubText: {
    fontSize: 4.5,
    fontWeight: '800',
    color: '#06b6d4',
    marginTop: 0.5,
  },
  provDotVR: {
    backgroundColor: '#06b6d4',
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },

  // Place Details Card
  placeDetailsCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardCoverPhoto: {
    width: 68,
    height: 68,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
    marginRight: 6,
  },
  cardRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cardRatingText: {
    color: '#eab308',
    fontSize: 10,
    fontWeight: '800',
  },
  cardRegionText: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 1,
  },
  metaBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#3b82f6',
  },
  cardDescText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    marginBottom: 8,
  },
  exploreActionBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exploreBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  pinPulseCircleActiveOuter: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },

  // Floating widgets inside map canvas
  floatingWeatherWidget: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 104,
    borderRadius: 16,
    borderWidth: 0.8,
    padding: 6,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  weatherWidgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherWidgetIcon: {
    fontSize: 16,
  },
  weatherWidgetTemp: {
    fontSize: 11,
    fontWeight: '900',
  },
  weatherWidgetDesc: {
    fontSize: 7.2,
    fontWeight: '700',
    marginTop: 0.5,
  },
  weatherDivider: {
    height: 0.6,
    marginVertical: 4,
    width: '100%',
  },
  weatherStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statMiniCol: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 5.5,
    fontWeight: '900',
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  statValue: {
    fontSize: 7.2,
    fontWeight: '800',
    marginTop: 0.8,
  },
  floatingTelemetryWidget: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    borderRadius: 14,
    borderWidth: 0.8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pulseLedGreen: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  telemetryLabel: {
    fontSize: 6.2,
    fontWeight: '900',
    color: '#10b981',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 0.3,
  },
  telemetryCoordsText: {
    fontSize: 7.2,
    fontWeight: '900',
    color: '#3b82f6',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginTop: 2,
  },
  phuQuocDotInactive: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.2,
    borderColor: '#fff',
    backgroundColor: '#10b981',
  },
  phuQuocDotCenter: {
    width: 0,
    height: 0,
  },
  phuQuocPulseInactive: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 0.8,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  phuQuocSovereigntyLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
