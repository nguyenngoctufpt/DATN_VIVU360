import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  Linking
} from 'react-native';
import { ArrowLeft, Plus, X, Sparkles, AlertCircle, MapPin, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { extractPinterestImage, getImageSource, fetchRealProvinceImages } from './pinterestExtractor';
import { getSafeImageSource } from '../utils/image';
import { getCamNangByLocation } from '../services/camNangService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Predefined mock database of scenic images for provinces
const PROVINCE_IMAGES = {
  'Bắc Ninh': [
    'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598977123418-45f04b61b49e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=800&q=80'
  ],
  'Hà Giang': [
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=800&q=80'
  ],
  'Lai Châu': [
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  ],
  'Lào Cai': [
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  ],
  'Cao Bằng': [
    'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80'
  ],
  'Lạng Sơn': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80'
  ],
  'Sơn La': [
    'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=800&q=80'
  ],
  'TP. Hồ Chí Minh': [
    'https://images.unsplash.com/photo-1509060464153-4466739f78ad?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  ],
  'Đà Nẵng': [
    'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80'
  ],
  'Hà Nội': [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509060464153-4466739f78ad?auto=format&fit=crop&w=800&q=80'
  ],
  'Quảng Ninh': [
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  ],
  'Quảng Nam': [
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=800&q=80'
  ],
  'Yên Bái': [
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80'
  ],
  'Kiên Giang': [
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'
  ],
  'Lâm Đồng': [
    'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=800&q=80'
  ],
  'Khánh Hòa': [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  ],
  'Huế': [
    'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80'
  ],
  'Cần Thơ': [
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  ],
  'Hải Phòng': [
    'https://images.unsplash.com/photo-1509060464153-4466739f78ad?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=800&q=80'
  ]
};

// Fallback images array
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
];

// Mock database of tourism guides for provinces
const PROVINCE_DETAILS = {
  'Hà Nội': {
    description: 'Thủ đô ngàn năm văn hiến, nổi tiếng với nét đẹp cổ kính của Khu phố cổ, Hồ Hoàn Kiếm linh thiêng và nét ẩm thực thanh tao, tinh tế mang đậm bản sắc văn hóa Việt Nam.',
    attractions: ['Hồ Hoàn Kiếm & Đền Ngọc Sơn', 'Lăng Bác & Chùa Một Cột', 'Văn Miếu - Quốc Tử Giám', 'Khu phố cổ Hà Nội'],
    specialties: ['Phở Hà Nội', 'Bún chả', 'Cà phê trứng', 'Cốm Làng Vòng'],
    bestTime: 'Mùa thu (Tháng 9 - 11) se lạnh và ngập sắc lá vàng.'
  },
  'Quảng Ninh': {
    description: 'Vùng đất mỏ giàu tiềm năng du lịch, sở hữu Kỳ quan thiên nhiên thế giới Vịnh Hạ Long, Yên Tử linh thiêng cùng các khu phức hợp giải trí hiện đại hàng đầu Đông Nam Á.',
    attractions: ['Vịnh Hạ Long', 'Danh thắng Yên Tử', 'Đảo Cô Tô', 'Bán đảo Tuần Châu'],
    specialties: ['Chả mực giã tay', 'Sá sùng', 'Bánh gật gù', 'Nem chua Quảng Yên'],
    bestTime: 'Tháng 4 - tháng 10 trời nắng đẹp, lý tưởng để tham quan vịnh.'
  },
  'Đà Nẵng': {
    description: 'Thành phố đáng sống nhất Việt Nam, được thiên nhiên ưu ái ban tặng cả sông, núi, biển xanh cát trắng, cùng những công trình biểu tượng hiện đại như Cầu Rồng, Bà Nà Hills.',
    attractions: ['Bà Nà Hills & Cầu Vàng', 'Bán đảo Sơn Trà', 'Ngũ Hành Sơn', 'Bãi biển Mỹ Khê'],
    specialties: ['Mì Quảng', 'Bánh tráng cuốn thịt heo', 'Bê thui Cầu Mống', 'Chả bò Đà Nẵng'],
    bestTime: 'Tháng 2 - tháng 8 thời tiết khô ráo, nắng ấm cực đẹp.'
  },
  'Quảng Nam': {
    description: 'Vùng đất giao thoa văn hóa đặc sắc với hai Di sản văn hóa thế giới là Phố cổ Hội An mộc mạc yên bình bên sông Hoài và Thánh địa Mỹ Sơn thâm nghiêm cổ kính.',
    attractions: ['Phố cổ Hội An', 'Thánh địa Mỹ Sơn', 'Cù Lao Chàm', 'Rừng dừa Bảy Mẫu'],
    specialties: ['Cao lầu', 'Cơm gà Hội An', 'Bánh mì Phượng', 'Mì Quảng Kỳ Lý'],
    bestTime: 'Tháng 2 - tháng 4 khí hậu mát mẻ, ít mưa.'
  },
  'Yên Bái': {
    description: 'Cửa ngõ Tây Bắc thơ mộng, quyến rũ du khách bằng những dải ruộng bậc thang hùng vĩ nhuộm vàng óng mùa lúa chín ở Mù Cang Chải và hồ nước ngọt khổng lồ Thác Bà.',
    attractions: ['Ruộng bậc thang Mù Cang Chải', 'Đèo Khau Phạ', 'Hồ Thác Bà', 'Suối khoáng nóng Trạm Tấu'],
    specialties: ['Lạp xưởng gác bếp', 'Táo mèo', 'Thịt trâu gác bếp', 'Nếp tú lệ'],
    bestTime: 'Mùa nước đổ (Tháng 5-6) hoặc Mùa lúa chín (Tháng 9-10).'
  },
  'Kiên Giang': {
    description: 'Thiên đường du lịch biển đảo Tây Nam Bộ, nổi danh toàn cầu với Đảo Ngọc Phú Quốc hoang sơ kỳ vĩ, quần đảo Nam Du thơ mộng cùng vùng đất Hà Tiên thập cảnh vịnh.',
    attractions: ['Đảo ngọc Phú Quốc', 'Quần đảo Nam Du', 'Đảo Hải Tặc', 'Chùa Hang - Hòn Phụ Tử'],
    specialties: ['Gỏi cá trích', 'Nước mắm Phú Quốc', 'Bún quậy Hà Tiên', 'Nấm tràm'],
    bestTime: 'Tháng 11 - tháng 4 năm sau (Mùa khô đảo ngọc).'
  },
  'Lâm Đồng': {
    description: 'Cao nguyên Langbiang lộng gió, sở hữu Đà Lạt - thành phố sương mù mộng mơ đầy hoa thơm trái ngọt, thác nước hùng vĩ cùng khí hậu ôn đới dịu mát quanh năm.',
    attractions: ['Hồ Xuân Hương & Chợ Đà Lạt', 'Thác Datanla', 'Núi Langbiang', 'Đồi chè Cầu Đất'],
    specialties: ['Lẩu gà lá é', 'Bánh tráng nướng', 'Hồng treo gió', 'Kem bơ'],
    bestTime: 'Tháng 11 - tháng 3 năm sau (mùa hoa dã quỳ và mai anh đào).'
  },
  'TP. Hồ Chí Minh': {
    description: 'Đô thị năng động và sầm uất bậc nhất Việt Nam, nơi giao thoa giữa nét kiến trúc Pháp cổ kính lịch sử và nhịp sống hiện đại trẻ trung, sôi động cùng văn hóa ẩm thực đường phố đa dạng.',
    attractions: ['Nhà thờ Đức Bà & Bưu điện TP', 'Dinh Độc Lập', 'Chợ Bến Thành', 'Phố đi bộ Nguyễn Huệ'],
    specialties: ['Cơm tấm Sài Gòn', 'Hủ tiếu Nam Vang', 'Bánh mì Sài Gòn', 'Ốc đường phố'],
    bestTime: 'Tháng 12 - tháng 4 năm sau (Mùa khô thời tiết dễ chịu).'
  },
  'Hà Giang': {
    description: 'Nơi địa đầu Tổ quốc kỳ vĩ với cao nguyên đá Đồng Văn hùng vĩ, những cung đường đèo hiểm trở thử thách phượt thủ và thung lũng hoa tam giác mạch lãng mạn.',
    attractions: ['Cột cờ Lũng Cú', 'Đèo Mã Pí Lèng', 'Sông Nho Quế', 'Phố cổ Đồng Văn'],
    specialties: ['Cháo ấu tẩu', 'Thắng cố', 'Mật ong bạc hà', 'Bánh tam giác mạch'],
    bestTime: 'Tháng 9 - tháng 12 (mùa lúa chín và hoa tam giác mạch).'
  },
  'Bắc Ninh': {
    description: 'Cội nguồn văn hóa Kinh Bắc cổ kính, cái nôi của làn điệu Dân ca Quan họ ngọt ngào đã được UNESCO công nhận, nơi hội tụ hàng trăm di tích đền chùa, lễ hội truyền thống đặc sắc.',
    attractions: ['Chùa Phật Tích', 'Đền Đô (Đền Lý Bát Đế)', 'Chùa Dâu & Chùa Bút Tháp', 'Làng tranh Đông Hồ'],
    specialties: ['Bánh phu thê Đình Bảng', 'Rượu làng Vân', 'Nem Bùi', 'Bánh đa kế'],
    bestTime: 'Tháng Giêng - tháng Ba âm lịch (Mùa lễ hội truyền thống Kinh Bắc).'
  }
};

const getProvinceDetails = (provinceName) => {
  let nameKey = provinceName;
  if (provinceName === 'TP. Hồ Chí Minh' || provinceName === 'TP.HCM' || provinceName === 'Sài Gòn') {
    nameKey = 'TP. Hồ Chí Minh';
  } else if (provinceName === 'Thủ đô Hà Nội') {
    nameKey = 'Hà Nội';
  }

  if (PROVINCE_DETAILS[nameKey]) {
    return PROVINCE_DETAILS[nameKey];
  }

  return {
    description: `Khám phá vẻ đẹp du lịch hoang sơ, đậm đà bản sắc địa phương của tỉnh ${provinceName}. Nơi đây hứa hẹn sẽ mang đến những trải nghiệm danh lam thắng cảnh và ẩm thực tuyệt vời của vùng miền Việt Nam.`,
    attractions: [`Trung tâm du lịch ${provinceName}`, `Danh lam thắng cảnh địa phương`, `Khu di tích lịch sử văn hóa`],
    specialties: [`Đặc sản vùng miền ẩm thực`, `Món ngon địa phương bánh quà`],
    bestTime: 'Quanh năm, đẹp nhất vào mùa khô ráo hoặc các dịp lễ hội địa phương.'
  };
};

const getAttractionTourId = (attractionName) => {
  if (!attractionName) return null;
  const name = attractionName.toLowerCase();
  if (name.includes('hạ long')) return 1;
  if (name.includes('hội an')) return 2;
  if (name.includes('phú quốc')) return 3;
  if (name.includes('mù cang chải')) return 4;
  if (name.includes('hoàn kiếm')) return 5;
  return `attraction-${attractionName}`;
};

export function ProvinceGalleryScreen({ theme, isDarkMode, provinceName, onBack, onNavigateToTour }) {
  // Initialize state using mock database or fallback
  const initialPhotos = useMemo(() => {
    // Standardize province names for lookup
    let nameKey = provinceName;
    if (provinceName === 'TP. Hồ Chí Minh' || provinceName === 'TP.HCM' || provinceName === 'Sài Gòn') {
      nameKey = 'TP. Hồ Chí Minh';
    } else if (provinceName === 'Thủ đô Hà Nội') {
      nameKey = 'Hà Nội';
    }

    return PROVINCE_IMAGES[nameKey] || PROVINCE_IMAGES[provinceName] || [
      FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)]
    ];
  }, [provinceName]);

  const tourId = useMemo(() => {
    const name = provinceName || '';
    if (name.includes('Hà Nội')) return 5;
    if (name.includes('Quảng Ninh')) return 1;
    if (name.includes('Đà Nẵng') || name.includes('Quảng Nam')) return 2;
    if (name.includes('Kiên Giang') || name.includes('Phú Quốc')) return 3;
    if (name.includes('Yên Bái')) return 4;
    return `province-${name}`;
  }, [provinceName]);

  const [photos, setPhotos] = useState(initialPhotos);
  const [camNang, setCamNang] = useState(null);
  const [cnActiveTab, setCnActiveTab] = useState('info'); // 'info' | 'history' | 'packing'

  useEffect(() => {
    let active = true;
    getCamNangByLocation(provinceName)
      .then((data) => {
        if (active) setCamNang(data);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [provinceName]);

  useEffect(() => {
    let active = true;
    
    // Reset to local mock/fallback pictures first to ensure instant loading
    setPhotos(initialPhotos);
    
    async function loadRealGoogleImages() {
      try {
        const realImages = await fetchRealProvinceImages(provinceName, 8);
        if (active && realImages && realImages.length > 0) {
          setPhotos(realImages);
        }
      } catch (err) {
        console.log('Failed to fetch real images:', err);
      }
    }
    
    loadRealGoogleImages();
    
    return () => {
      active = false;
    };
  }, [provinceName, initialPhotos]);

  const details = useMemo(() => getProvinceDetails(provinceName), [provinceName]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* HEADER BAR */}
      <View style={[styles.headerBar, { borderBottomColor: theme.border }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: theme.searchBg }]} onPress={onBack}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Hình ảnh {provinceName}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO IMAGE */}
        <View style={styles.heroWrapper}>
          <Image source={getImageSource(photos[0]) || getSafeImageSource(photos[0])} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroOverlayText}>
            <Text style={styles.heroTitle}>{provinceName}</Text>
            <Text style={styles.heroSubtitle}>Bộ sưu tập ảnh phong cảnh Việt Nam ({photos.length} ảnh)</Text>
          </View>

          {/* 360° VR Tour & Directions floating glassmorphic buttons */}
          <View style={{ position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', gap: 8 }}>
            <Pressable
              style={styles.vrFloatingBtn}
              onPress={() => {
                if (onOpenMapDirections) {
                  onOpenMapDirections(provinceName);
                } else {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(provinceName + ' Việt Nam')}`;
                  Linking.openURL(url).catch(() => {});
                }
              }}
            >
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.9)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.vrFloatingBtnGradient}
              >
                <MapPin size={14} color="#fff" />
                <Text style={styles.vrFloatingBtnText}>Chỉ đường</Text>
              </LinearGradient>
            </Pressable>

            {tourId && onNavigateToTour && (
              <Pressable 
                style={styles.vrFloatingBtn}
                onPress={() => onNavigateToTour(tourId, 0)}
              >
                <LinearGradient
                  colors={['rgba(6, 182, 212, 0.85)', 'rgba(59, 130, 246, 0.85)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.vrFloatingBtnGradient}
                >
                  <Sparkles size={14} color="#fff" />
                  <Text style={styles.vrFloatingBtnText}>Tham quan 360° VR</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>

        {/* TRAVEL INFO CARD */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Sparkles size={18} color="#06b6d4" style={{ marginRight: 8 }} />
            <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>📖 Cẩm Nang Du Lịch {provinceName}</Text>
          </View>

          {/* 3 Tabs Segmented Control */}
          <View style={{ flexDirection: 'row', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: 12, padding: 3, marginBottom: 14, gap: 4 }}>
            <Pressable
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9, backgroundColor: cnActiveTab === 'info' ? '#3b82f6' : 'transparent' }}
              onPress={() => setCnActiveTab('info')}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: cnActiveTab === 'info' ? '#ffffff' : (isDarkMode ? '#94a3b8' : '#64748b') }}>
                ℹ️ Thông tin
              </Text>
            </Pressable>
            <Pressable
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9, backgroundColor: cnActiveTab === 'history' ? '#8b5cf6' : 'transparent' }}
              onPress={() => setCnActiveTab('history')}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: cnActiveTab === 'history' ? '#ffffff' : (isDarkMode ? '#94a3b8' : '#64748b') }}>
                🏛️ Lịch sử
              </Text>
            </Pressable>
            <Pressable
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9, backgroundColor: cnActiveTab === 'packing' ? '#10b981' : 'transparent' }}
              onPress={() => setCnActiveTab('packing')}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: cnActiveTab === 'packing' ? '#ffffff' : (isDarkMode ? '#94a3b8' : '#64748b') }}>
                🎒 Đồ mang theo
              </Text>
            </Pressable>
          </View>

          {/* Tab Content */}
          {cnActiveTab === 'info' && (
            <View style={{ gap: 10, marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1, backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
                  <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '700' }}>🕘 Giờ mở - đóng</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textPrimary, marginTop: 2 }}>
                    {camNang?.openingHours || '07:00'} - {camNang?.closingHours || '18:00'}
                  </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
                  <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '700' }}>🎫 Giá vé tham quan</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#10b981', marginTop: 2 }}>
                    {camNang?.ticketPrice || 'Miễn phí / Tự túc'}
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
                <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '700' }}>📐 Diện tích & Quy mô</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textPrimary, marginTop: 2 }}>
                  {camNang?.areaSize || 'Quy mô vùng du lịch'}
                </Text>
              </View>

              <Text style={[styles.infoDesc, { color: theme.textSecondary, marginTop: 4 }]}>
                {camNang?.description || details.description}
              </Text>
            </View>
          )}

          {cnActiveTab === 'history' && (
            <View style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', padding: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#8b5cf6', marginBottom: 14 }}>
              <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#8b5cf6', marginBottom: 6 }}>🏛️ Lịch Sử Hình Thành & Phát Triển:</Text>
              <Text style={{ fontSize: 12, lineHeight: 18, color: theme.textSecondary }}>
                {camNang?.history || `${provinceName} có bề dày lịch sử lâu đời gắn liền với tiến trình văn hóa và dựng nước, giữ nước của dân tộc Việt Nam.`}
              </Text>
            </View>
          )}

          {cnActiveTab === 'packing' && (
            <View style={{ gap: 6, marginBottom: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.textPrimary, marginBottom: 4 }}>🎒 Check-list đồ dùng NÊN mang theo:</Text>
              {Array.isArray(camNang?.itemsToBring) && camNang.itemsToBring.length > 0 ? (
                camNang.itemsToBring.map((item, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
                    <Text style={{ color: '#10b981', fontWeight: '900', fontSize: 11 }}>✔</Text>
                    <Text style={{ fontSize: 11.5, fontWeight: '600', color: theme.textPrimary }}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Danh sách đồ dùng đang được cập nhật.</Text>
              )}
            </View>
          )}

          {/* ATTRACTIONS SECTION */}
          <Text style={[styles.sectionSubtitle, { color: theme.textPrimary }]}>📍 Điểm tham quan nổi bật:</Text>
          <View style={styles.attractionsContainer}>
            {details.attractions.map((att, idx) => {
              const tourId = getAttractionTourId(att);
              return (
                <Pressable
                  key={idx}
                  style={({ pressed }) => [
                    styles.newAttractionCard,
                    { 
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: theme.border 
                    },
                    tourId && { 
                      borderColor: isDarkMode ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.2)',
                      backgroundColor: isDarkMode ? 'rgba(6, 182, 212, 0.06)' : 'rgba(6, 182, 212, 0.03)'
                    },
                    pressed && { opacity: 0.8 }
                  ]}
                  onPress={() => {
                    if (tourId) {
                      if (onNavigateToTour) onNavigateToTour(tourId, 0);
                    } else {
                      Alert.alert(
                        `Du lịch ảo tại ${att}`,
                        `Hành trình ảo 360° tại địa điểm "${att}" đang được cập nhật từ đóng góp cộng đồng. Bạn có muốn ghé thăm Vịnh Hạ Long ngay?`,
                        [
                          { text: 'Để sau', style: 'cancel' },
                          { text: 'Ghé thăm ngay', onPress: () => { if (onNavigateToTour) onNavigateToTour(1, 0); } }
                        ]
                      );
                    }
                  }}
                >
                  <View style={styles.attractionLeft}>
                    <MapPin size={15} color={tourId ? '#06b6d4' : theme.textMuted} style={{ marginRight: 8 }} />
                    <Text 
                      style={[
                        styles.attractionNameText, 
                        { color: theme.textPrimary },
                        tourId && { color: isDarkMode ? '#22d3ee' : '#0891b2', fontWeight: '700' }
                      ]}
                      numberOfLines={1}
                    >
                      {att}
                    </Text>
                  </View>
                  <View style={styles.attractionRight}>
                    {tourId && (
                      <View style={[styles.vrMiniBadge, { backgroundColor: '#06b6d4', shadowColor: '#06b6d4' }]}>
                        <Text style={styles.vrMiniBadgeText}>360° VR</Text>
                      </View>
                    )}
                    <ChevronRight size={14} color={tourId ? '#06b6d4' : theme.textMuted} style={{ marginLeft: 4 }} />
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* SPECIALTIES SECTION */}
          <Text style={[styles.sectionSubtitle, { color: theme.textPrimary, marginTop: 16 }]}>🍲 Đặc sản ẩm thực địa phương:</Text>
          <View style={styles.specialtiesGrid}>
            {details.specialties.map((spec, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.specialtyTag, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.05)',
                    borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)'
                  }
                ]}
              >
                <Text style={[styles.specialtyTagText, { color: isDarkMode ? '#fbbf24' : '#b45309' }]}>
                  ✨ {spec}
                </Text>
              </View>
            ))}
          </View>

          {/* BEST TIME BOX */}
          <View style={[styles.timeAlert, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.06)', marginTop: 16 }]}>
            <Text style={[styles.timeAlertText, { color: '#3b82f6' }]}>
              📅 <Text style={{ fontWeight: '800' }}>Thời điểm lý tưởng: </Text>{details.bestTime}
            </Text>
          </View>
        </View>

        {/* PHOTO GRID */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Ảnh phong cảnh</Text>
        
        <View style={styles.gridContainer}>
          {photos.map((photo, index) => (
            <View key={index} style={[styles.gridItem, { borderColor: theme.border }]}>
              <Image source={getImageSource(photo) || getSafeImageSource(photo)} style={styles.gridImage} resizeMode="cover" />
            </View>
          ))}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  addBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  addGradient: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroWrapper: {
    height: 240,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  vrFloatingBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 99,
  },
  vrFloatingBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  vrFloatingBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '30%',
  },
  heroOverlayText: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 32) / 2,
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },

  // Modal styling (matching VirtualTourScreen & MapScreen for consistency)
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1.2, height: '82%', paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalHeaderTitle: { fontSize: 16, fontWeight: '900' },
  closeModalBtn: { padding: 4 },
  inputLabel: { fontSize: 12, fontWeight: '800', marginBottom: 6 },
  modalTextInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, fontWeight: '600', marginBottom: 14 },
  pinterestInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  extractBtn: { backgroundColor: '#e11d48', height: 42, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  extractBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  guideBox: { flexDirection: 'row', gap: 6, borderWidth: 1, borderRadius: 10, padding: 8, marginBottom: 16 },
  guideText: { flex: 1, fontSize: 10, fontWeight: '500', color: '#64748b', lineHeight: 14 },
  imagePreviewContainer: { marginBottom: 16 },
  previewImage: { width: '100%', height: 160, borderRadius: 14, borderWidth: 1, borderColor: '#ccc' },
  removePreviewBtn: { marginTop: 6, alignSelf: 'flex-start' },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1 },
  modalCancelBtn: { flex: 1, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc' },
  modalCancelText: { fontSize: 14, fontWeight: '800' },
  modalSubmitBtn: { flex: 2, height: 46, borderRadius: 14, overflow: 'hidden' },
  modalSubmitGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalSubmitText: { color: '#fff', fontSize: 14, fontWeight: '900' },

  // Travel Info Card Styles
  infoCard: {
    margin: 16,
    borderRadius: 22,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  infoDesc: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 16,
    opacity: 0.85,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 10,
  },
  attractionsContainer: {
    gap: 8,
  },
  newAttractionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  attractionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attractionNameText: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  attractionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  specialtyTagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  timeAlert: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  timeAlertText: {
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 16,
  },
  vrMiniBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginLeft: 4,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  vrMiniBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});



