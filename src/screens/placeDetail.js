import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet, Platform, Share, Alert, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Star, MapPin, Compass, Share2, Calendar, Clock, Utensils, CloudSun, ChevronDown, ChevronUp } from 'lucide-react-native';
import ShareLocationModal from '../components/ShareLocationModal';

const placeMockDetails = {
  'ninh bình': {
    title: 'Tràng An & Bái Đính',
    province: 'Ninh Bình',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    rating: '4.9',
    reviews: '8.4k',
    duration: '2 ngày 1 đêm',
    price: '1.200.000đ/người',
    description: 'Ninh Bình nổi tiếng với Quần thể di sản thế giới Tràng An, nơi có những dãy núi đá vôi hàng triệu năm tuổi đan xen cùng hệ thống hang động ngập nước kỳ bí. Du khách có thể chèo thuyền dọc sông Sào Khê hoặc ghé thăm chùa Bái Đính - ngôi chùa có quy mô lớn nhất Đông Nam Á.',
    tips: ['Mua vé thuyền sớm buổi sáng để tránh đông', 'Mặc áo mưa khi đi hang động', 'Thuê xe đạp khám phá làng quê'],
    spots: [
      { name: 'Khu du lịch sinh thái Tràng An', type: 'Thắng cảnh 🛶', desc: 'Chèo thuyền ngắm hang động tự nhiên và đền đài cổ kính.' },
      { name: 'Chùa Bái Đính', type: 'Tâm linh 🛕', desc: 'Ngôi chùa lập nhiều kỷ lục Việt Nam và châu Á.' },
      { name: 'Hang Múa', type: 'Check-in ⛰️', desc: 'Đỉnh núi Ngọa Long với tầm nhìn bao quát toàn bộ Tam Cốc.' }
    ],
    foods: [
      { name: 'Cơm cháy Ninh Bình', emoji: '🍘', desc: 'Cơm cháy giòn rụm ăn kèm nước sốt dê nóng hổi béo ngậy.' },
      { name: 'Thịt dê núi', emoji: '🐐', desc: 'Dê núi thả tự nhiên thịt săn chắc, thơm ngọt chế biến đủ món.' }
    ],
    bestTime: 'Tháng 1 - Tháng 4 (Mùa xuân se lạnh, hội hè lễ chùa)',
    forecast: [
      { day: 'Hôm nay', temp: '28°C', text: 'Nắng nhẹ', emoji: '☀️' },
      { day: 'Ngày mai', temp: '29°C', text: 'Ít mây', emoji: '⛅' },
      { day: 'Ngày kia', temp: '25°C', text: 'Mưa giông', emoji: '🌧️' }
    ]
  },
  'hạ long': {
    title: 'Vịnh Hạ Long',
    province: 'Quảng Ninh',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    rating: '4.9',
    reviews: '12k',
    duration: '3 ngày 2 đêm',
    price: '3.500.000đ/người',
    description: 'Di sản Thiên nhiên Thế giới Vịnh Hạ Long sở hữu hàng ngàn đảo đá vôi kỳ vĩ mọc lên giữa mặt biển xanh ngọc. Trải nghiệm tốt nhất ở đây là nghỉ dưỡng trên du thuyền 5 sao, chèo thuyền kayak qua Hang Luồn và ngắm cảnh hoàng hôn rực rỡ.',
    tips: ['Đặt du thuyền trước 2 tuần vào mùa hè', 'Mang kem chống nắng SPF 50+', 'Chụp ảnh lúc bình minh rất đẹp'],
    spots: [
      { name: 'Đảo Ti Tốp', type: 'Bãi tắm 🏖️', desc: 'Bãi cát vầng trăng khuyết và đỉnh núi ngắm trọn cảnh vịnh.' },
      { name: 'Hang Sửng Sốt', type: 'Hang động 洞', desc: 'Hang động rộng lớn và lộng lẫy bậc nhất vịnh Hạ Long.' },
      { name: 'Làng chài Cửa Vạn', type: 'Văn hóa ⚓', desc: 'Khám phá cuộc sống sông nước bình dị của người dân chài.' }
    ],
    foods: [
      { name: 'Chả mực giã tay', emoji: '🦑', desc: 'Mực tươi rói giã tay thủ công, chiên vàng giòn sần sật béo ngậy.' },
      { name: 'Sá sùng khô', emoji: '🐛', desc: 'Đặc sản quý hiếm dùng làm nước dùng ngọt lịm đặc trưng đất Quảng.' }
    ],
    bestTime: 'Tháng 10 - Tháng 12 (Trời thu mát mẻ, nắng nhẹ lung linh)',
    forecast: [
      { day: 'Hôm nay', temp: '27°C', text: 'Có mây', emoji: '⛅' },
      { day: 'Ngày mai', temp: '24°C', text: 'Mưa rào', emoji: '🌧️' },
      { day: 'Ngày kia', temp: '26°C', text: 'Nắng nhẹ', emoji: '☀️' }
    ]
  },
  'phú quốc': {
    title: 'Đảo Ngọc Phú Quốc',
    province: 'Kiên Giang',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80',
    rating: '5.0',
    reviews: '34k',
    duration: '4 ngày 3 đêm',
    price: '4.200.000đ/người',
    description: 'Phú Quốc là hòn đảo lớn nhất Việt Nam, sở hữu những bãi biển cát trắng mịn màng như Bãi Sao, Bãi Khem cùng làn nước biển trong vắt. Phú Quốc cũng nổi tiếng với cáp treo hòn Thơm vượt biển dài nhất thế giới và các khu vui chơi giải trí VinWonders đẳng cấp.',
    tips: ['Thuê xe máy khám phá toàn đảo', 'Tránh đi mùa mưa tháng 6–9', 'Mua nước mắm Phú Quốc làm quà'],
    spots: [
      { name: 'Bãi Sao', type: 'Bãi biển 🌴', desc: 'Cát trắng tinh và những rặng dừa nghiêng soi bóng.' },
      { name: 'Cáp treo Hòn Thơm', type: 'Trải nghiệm 🚡', desc: 'Ngắm toàn cảnh quần đảo An Thới từ cabin cáp treo 3 dây.' },
      { name: 'Chợ đêm Phú Quốc', type: 'Ẩm thực 🦀', desc: 'Thưởng thức hải sản tươi rói và quà lưu niệm đặc sản.' }
    ],
    foods: [
      { name: 'Gỏi cá trích', emoji: '🐟', desc: 'Cá trích tươi sống trộn dừa nạo, rau thơm cuốn bánh tráng.' },
      { name: 'Bún quậy Kiến Xây', emoji: '🍜', desc: 'Bún tươi làm tại chỗ quậy cùng chả tôm, chả cá nóng hổi.' }
    ],
    bestTime: 'Tháng 11 - Tháng 4 (Mùa khô bãi biển êm ả, nắng vàng đẹp)',
    forecast: [
      { day: 'Hôm nay', temp: '31°C', text: 'Nắng ấm', emoji: '☀️' },
      { day: 'Ngày mai', temp: '32°C', text: 'Nắng gắt', emoji: '☀️' },
      { day: 'Ngày kia', temp: '31°C', text: 'Nhiều mây', emoji: '⛅' }
    ]
  },
  'sa pa': {
    title: 'Thị xã Sương Mù Sa Pa',
    province: 'Lào Cai',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
    rating: '4.8',
    reviews: '21k',
    duration: '3 ngày 2 đêm',
    price: '2.800.000đ/người',
    description: 'Nằm ở độ cao 1.600m thuộc dãy Hoàng Liên Sơn, Sa Pa quyến rũ du khách bởi những thửa ruộng bậc thang kỳ vĩ xếp tầng lớp như nấc thang lên trời, khí hậu mát mẻ quanh năm và nét văn hóa đa dạng đặc sắc của đồng bào các dân tộc thiểu số H\'Mông, Dao, Tày.',
    tips: ['Mang áo ấm dù đi mùa hè', 'Book phòng homestay H\'Mông trải nghiệm', 'Đăng ký leo Fansipan qua cáp treo'],
    spots: [
      { name: 'Đỉnh Fansipan', type: 'Chinh phục 🗻', desc: 'Nóc nhà Đông Dương ở độ cao 3.143m ngập tràn mây ngàn.' },
      { name: 'Bản Cát Cát', type: 'Văn hóa 🏡', desc: 'Ngôi làng cổ kính của người H\'Mông với nghề dệt vải thổ cẩm.' },
      { name: 'Thung lũng Mường Hoa', type: 'Thắng cảnh 🌾', desc: 'Nơi có bãi đá cổ và danh thắng ruộng bậc thang lộng lẫy.' }
    ],
    foods: [
      { name: 'Lẩu cá hồi Sa Pa', emoji: '🍲', desc: 'Cá hồi nước lạnh ngọt thịt ăn kèm các loại rau rừng xứ lạnh.' },
      { name: 'Thắng cố ngựa', emoji: '🥣', desc: 'Món ăn truyền thống độc đáo của người H\'Mông uống với rượu ngô.' }
    ],
    bestTime: 'Tháng 9 - Tháng 11 (Mùa lúa chín vàng óng khắp các sườn đồi)',
    forecast: [
      { day: 'Hôm nay', temp: '19°C', text: 'Sương mù', emoji: '🌫️' },
      { day: 'Ngày mai', temp: '17°C', text: 'Mưa lạnh', emoji: '🌧️' },
      { day: 'Ngày kia', temp: '20°C', text: 'Hửng nắng', emoji: '☀️' }
    ]
  },
  'hà nội': {
    title: 'Thủ đô Hà Nội',
    province: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    rating: '4.9',
    reviews: '42k',
    duration: '2 ngày 1 đêm',
    price: '900.000đ/người',
    description: 'Hà Nội - thủ đô ngàn năm văn hiến, nơi gìn giữ những giá trị lịch sử và tinh hoa văn hóa lâu đời của dân tộc Việt Nam. Du khách có thể tản bộ quanh Hồ Gươm cổ kính, khám phá 36 phố phường nhộn nhịp, hay ghé thăm Văn Miếu - trường đại học đầu tiên của đất nước.',
    tips: ['Đi bộ khám phá phố cổ vào buổi sáng', 'Thưởng thức cà phê trứng tại phố Đinh Tiên Hoàng', 'Tham quan bảo tàng Dân tộc học'],
    spots: [
      { name: 'Văn Miếu - Quốc Tử Giám', type: 'Di tích 🏛️', desc: 'Trường đại học đầu tiên của Việt Nam, nơi lưu giữ bia tiến sĩ cổ kính.' },
      { name: 'Lăng Chủ tịch Hồ Chí Minh', type: 'Lịch sử 🏛️', desc: 'Nơi an nghỉ vĩnh hằng của vị cha già kính yêu của dân tộc.' },
      { name: 'Hồ Hoàn Kiếm', type: 'Thắng cảnh 🌳', desc: 'Trái tim của thủ đô gắn liền với Tháp Rùa và Đền Ngọc Sơn linh thiêng.' }
    ],
    foods: [
      { name: 'Phở bò Hà Nội', emoji: '🍜', desc: 'Bánh phở mềm mượt chan nước dùng xương bò hầm thanh trong.' },
      { name: 'Bún chả Phố Cổ', emoji: '🥓', desc: 'Thịt nướng xém cạnh thơm nức ăn cùng nước mắm chua ngọt.' }
    ],
    bestTime: 'Tháng 9 - Tháng 11 (Mùa thu Hà Nội se lạnh, thơm mùi hoa sữa)',
    forecast: [
      { day: 'Hôm nay', temp: '29°C', text: 'Nắng ấm', emoji: '☀️' },
      { day: 'Ngày mai', temp: '30°C', text: 'Nắng đẹp', emoji: '☀️' },
      { day: 'Ngày kia', temp: '28°C', text: 'Ít mây', emoji: '⛅' }
    ]
  },
  'nghệ an': {
    title: 'Xứ Nghệ Địa Linh Nhân Kiệt',
    province: 'Nghệ An',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
    rating: '4.8',
    reviews: '9.2k',
    duration: '2 ngày 1 đêm',
    price: '1.100.000đ/người',
    description: 'Nghệ An là vùng đất học hào kiệt, quê hương của Chủ tịch Hồ Chí Minh vĩ đại. Nơi đây sở hữu các di tích văn hóa lịch sử ý nghĩa, các danh lam thắng cảnh tự nhiên tươi đẹp như bãi biển Cửa Lò thoải rộng đầy nắng gió, đồi chè Thanh Chương mộng mơ.',
    tips: ['Tắm biển Cửa Lò buổi sáng sớm', 'Mua kẹo Cu Đơ đặc sản về làm quà', 'Tham quan làng nghề truyền thống'],
    spots: [
      { name: 'Bãi biển Cửa Lò', type: 'Bãi tắm 🏖️', desc: 'Bãi cát vàng mịn màng nước trong xanh, nổi tiếng với hải sản tươi ngon.' },
      { name: 'Khu di tích lịch sử Kim Liên', type: 'Quê Bác 🏡', desc: 'Làng Sen quê nội và làng Chùa quê ngoại đơn sơ của Bác Hồ.' },
      { name: 'Đồi chè Thanh Chương', type: 'Check-in 🍃', desc: 'Những ốc đảo chè xanh ngát giữa hồ nước bao la thơ mộng.' }
    ],
    foods: [
      { name: 'Súp lươn Nghệ An', emoji: '🍲', desc: 'Thịt lươn xào cay nồng đượm ăn kèm bánh mỳ hoặc bánh mướt.' },
      { name: 'Nhút Thanh Chương', emoji: '🥗', desc: 'Món muối chua làm từ xơ mít non trộn gia vị, cực kỳ đưa cơm.' }
    ],
    bestTime: 'Tháng 5 - Tháng 8 (Mùa hè biển êm nắng ấm rất thích hợp du lịch)',
    forecast: [
      { day: 'Hôm nay', temp: '32°C', text: 'Nắng gắt', emoji: '☀️' },
      { day: 'Ngày mai', temp: '33°C', text: 'Nóng ẩm', emoji: '☀️' },
      { day: 'Ngày kia', temp: '31°C', text: 'Có mây', emoji: '⛅' }
    ]
  }
};

export function PlaceDetailScreen({
  placeName,
  theme,
  isDarkMode,
  onBack,
  onNavigateToTour,
  onSelectSpot,
  ownerId,
  currentUser,
  onNavigateToTab,
}) {
  const [expandedSpotIndex, setExpandedSpotIndex] = useState(null);
  const [showAllTips, setShowAllTips] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const getMatchedKey = (name) => {
    const lower = String(name || '').toLowerCase();
    if (lower.includes('ninh bình') || lower.includes('tràng an') || lower.includes('bái đính') || lower.includes('hang múa') || lower.includes('tam cốc') || lower.includes('hoa lư') || lower.includes('châu sơn') || lower.includes('ninh xuân')) return 'ninh bình';
    if (lower.includes('quảng ninh') || lower.includes('hạ long') || lower.includes('ti tốp') || lower.includes('sửng sốt') || lower.includes('tuần châu') || lower.includes('bãi cháy') || lower.includes('cù kỳ') || lower.includes('sam')) return 'hạ long';
    if (lower.includes('kiên giang') || lower.includes('phú quốc') || lower.includes('an thới') || lower.includes('gành dầu') || lower.includes('bãi sao') || lower.includes('hòn thơm')) return 'phú quốc';
    if (lower.includes('lào cai') || lower.includes('sa pa') || lower.includes('sapa') || lower.includes('fansipan') || lower.includes('cát cát') || lower.includes('mường hoa') || lower.includes('ô quy hồ')) return 'sa pa';
    if (lower.includes('hà nội') || lower.includes('văn miếu') || lower.includes('hồ gươm') || lower.includes('lăng bác') || lower.includes('hoàn kiếm') || lower.includes('ngọc sơn') || lower.includes('đường lâm') || lower.includes('tây hồ') || lower.includes('ba đình') || lower.includes('vĩnh phúc') || lower.includes('tam đảo')) return 'hà nội';
    if (lower.includes('nghệ an') || lower.includes('cửa lò') || lower.includes('kim liên') || lower.includes('làng sen') || lower.includes('thanh chương') || lower.includes('cửa hội') || lower.includes('vinh')) return 'nghệ an';
    return 'hà nội';
  };

  const matchedKey = getMatchedKey(placeName);
  const detail = placeMockDetails[matchedKey] || placeMockDetails['hà nội'];
  const displayTitle = placeName || detail.title;

  let finalSpots = detail.spots.filter(spot => {
    if (!placeName) return true;
    const lower = placeName.toLowerCase();
    const isSubSpot = detail.spots.some(s => s.name.toLowerCase().includes(lower) || lower.includes(s.name.toLowerCase()));
    if (isSubSpot) return spot.name.toLowerCase().includes(lower) || lower.includes(spot.name.toLowerCase());
    return true;
  });

  if (!finalSpots || finalSpots.length === 0) {
    finalSpots = detail.spots;
  }

  useEffect(() => {
    const backAction = () => { if (onBack) { onBack(); return true; } return false; };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBack]);

  const handleShare = () => {
    setShareModalVisible(true);
  };

  const cardBg = isDarkMode ? 'rgba(15,23,42,0.95)' : '#ffffff';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* ── HERO IMAGE ── */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: detail.image }} style={styles.coverImage} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent', theme.background]}
            style={StyleSheet.absoluteFill}
            locations={[0, 0.35, 1]}
          />
          {/* Overlay Info */}
          <View style={styles.titleOverlay}>
            <Text style={styles.tagText}>CẨM NANG ĐỊA DANH</Text>
            <Text style={styles.mainTitle}>{displayTitle}</Text>
            <View style={styles.metaRow}>
              <MapPin size={12} color="#10b981" />
              <Text style={styles.metaText}>{detail.province}</Text>
              <Text style={styles.metaSeparator}>·</Text>
              <Clock size={11} color="#94a3b8" />
              <Text style={styles.metaText}>{detail.duration}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>

          {/* ── STATS ROW ── */}
          <View style={[styles.statsRow, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.statItem}>
              <Star size={14} color="#facc15" fill="#facc15" />
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{detail.rating}</Text>
              <Text style={styles.statLabel}>{detail.reviews} đánh giá</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
            <View style={styles.statItem}>
              <Calendar size={14} color="#10b981" />
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{detail.duration}</Text>
              <Text style={styles.statLabel}>Lịch trình</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>💰</Text>
              <Text style={[styles.statValue, { color: theme.textPrimary, fontSize: 10 }]}>{detail.price}</Text>
              <Text style={styles.statLabel}>Ước tính</Text>
            </View>
          </View>

          {/* ── WEATHER FORECAST ── */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor, marginTop: 14 }]}>
            <View style={styles.sectionHeader}>
              <CloudSun size={15} color="#f59e0b" />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Dự báo thời tiết 3 ngày</Text>
            </View>
            <View style={styles.forecastRow}>
              {detail.forecast.map((day, idx) => (
                <View key={idx} style={[styles.forecastItem, { backgroundColor: isDarkMode ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.15)' }]}>
                  <Text style={styles.forecastDay}>{day.day}</Text>
                  <Text style={styles.forecastEmoji}>{day.emoji}</Text>
                  <Text style={[styles.forecastTemp, { color: theme.textPrimary }]}>{day.temp}</Text>
                  <Text style={styles.forecastText}>{day.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── INTRODUCTION ── */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor, marginTop: 14 }]}>
            <View style={styles.sectionHeader}>
              <Text style={{ fontSize: 15 }}>📖</Text>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Giới thiệu hành trình</Text>
            </View>
            <Text style={[styles.description, { color: theme.textSecondary }]}>{detail.description}</Text>
            <View style={styles.bestTimeBox}>
              <Text style={styles.bestTimeTitle}>💡 Thời điểm ghé thăm đẹp nhất:</Text>
              <Text style={styles.bestTimeVal}>{detail.bestTime}</Text>
            </View>
          </View>

          {/* ── TRAVEL TIPS ── */}
          {detail.tips && (
            <View style={[styles.card, { backgroundColor: cardBg, borderColor, marginTop: 14 }]}>
              <Pressable style={styles.sectionHeader} onPress={() => setShowAllTips(!showAllTips)}>
                <Text style={{ fontSize: 15 }}>💡</Text>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary, flex: 1 }]}>Mẹo du lịch hữu ích</Text>
                {showAllTips
                  ? <ChevronUp size={16} color={theme.textSecondary} />
                  : <ChevronDown size={16} color={theme.textSecondary} />
                }
              </Pressable>
              {(showAllTips ? detail.tips : detail.tips.slice(0, 2)).map((tip, idx) => (
                <View key={idx} style={styles.tipRow}>
                  <View style={styles.tipDot} />
                  <Text style={[styles.tipText, { color: theme.textSecondary }]}>{tip}</Text>
                </View>
              ))}
              {!showAllTips && detail.tips.length > 2 && (
                <Pressable onPress={() => setShowAllTips(true)}>
                  <Text style={styles.showMoreText}>Xem thêm {detail.tips.length - 2} mẹo khác...</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* ── LOCAL FOOD ── */}
          {detail.foods && detail.foods.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <View style={[styles.sectionHeader, { paddingHorizontal: 4, marginBottom: 10 }]}>
                <Utensils size={15} color="#f97316" />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Ẩm thực đặc sản phải thử</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}>
                {detail.foods.map((food, idx) => (
                  <View key={idx} style={[styles.foodCard, { backgroundColor: cardBg, borderColor }]}>
                    <Text style={styles.foodEmoji}>{food.emoji}</Text>
                    <Text style={[styles.foodName, { color: theme.textPrimary }]} numberOfLines={1}>{food.name}</Text>
                    <Text style={[styles.foodDesc, { color: theme.textSecondary }]} numberOfLines={3}>{food.desc}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── MUST-SEE SPOTS ── */}
          <View style={{ marginTop: 14 }}>
            <View style={[styles.sectionHeader, { paddingHorizontal: 4, marginBottom: 10 }]}>
              <Text style={{ fontSize: 15 }}>📍</Text>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Điểm du lịch không thể bỏ lỡ</Text>
            </View>
            <View style={{ gap: 10 }}>
              {finalSpots.map((spot, idx) => {
                const isExpanded = expandedSpotIndex === idx;
                return (
                  <Pressable
                    key={idx}
                    style={[styles.spotCard, {
                      backgroundColor: isExpanded ? (isDarkMode ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.04)') : cardBg,
                      borderColor: isExpanded ? '#10b981' : borderColor
                    }]}
                    onPress={() => setExpandedSpotIndex(isExpanded ? null : idx)}
                  >
                    <View style={styles.spotHeader}>
                      <View style={[styles.spotIconBox, { backgroundColor: isDarkMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)' }]}>
                        <Text style={{ fontSize: 14 }}>{spot.type.split(' ').pop()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.spotName, { color: theme.textPrimary }]}>{spot.name}</Text>
                        <Text style={styles.spotType}>{spot.type.split(' ').slice(0, -1).join(' ')}</Text>
                      </View>
                      {isExpanded
                        ? <ChevronUp size={15} color="#10b981" />
                        : <ChevronDown size={15} color={theme.textSecondary} />
                      }
                    </View>
                    <Text style={[styles.spotDesc, { color: theme.textSecondary }]}>{spot.desc}</Text>

                    {isExpanded && (
                      <View style={styles.spotActionRow}>
                        <Pressable
                          style={[styles.spotActionBtn, { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }]}
                          onPress={() => onSelectSpot && onSelectSpot(spot.name)}
                        >
                          <MapPin size={12} color="#10b981" />
                          <Text style={[styles.spotActionText, { color: '#10b981' }]}>Xem bản đồ</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.spotActionBtn, { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' }]}
                          onPress={() => onNavigateToTour && onNavigateToTour()}
                        >
                          <Compass size={12} color="#6366f1" />
                          <Text style={[styles.spotActionText, { color: '#6366f1' }]}>VR 360°</Text>
                        </Pressable>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── CTA BUTTON ── */}
          <Pressable
            style={({ pressed }) => [styles.vrButton, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
            onPress={() => onNavigateToTour && onNavigateToTour()}
          >
            <LinearGradient colors={['#10b981', '#059669']} style={styles.vrGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Compass size={18} color="#ffffff" />
              <Text style={styles.vrText}>Khám phá 360° VR Địa Danh này</Text>
            </LinearGradient>
          </Pressable>

        </View>
      </ScrollView>

      {/* ── FLOATING HEADER ── */}
      <View style={styles.floatingHeader}>
        <Pressable style={styles.circleBtn} onPress={onBack}>
          <ChevronLeft size={20} color="#ffffff" />
        </Pressable>
      </View>

      <ShareLocationModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        locationData={{
          name: displayTitle,
          location: detail.province,
          description: detail.description,
          image: detail.image,
        }}
        ownerId={ownerId}
        currentUser={currentUser}
        onShareSuccess={() => {
          if (onNavigateToTab) onNavigateToTab('chat');
        }}
        theme={theme}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { height: 280, width: '100%' },
  coverImage: { width: '100%', height: '100%' },
  titleOverlay: { position: 'absolute', bottom: 22, left: 20, right: 20 },
  tagText: { fontSize: 9, fontWeight: '900', color: '#34d399', letterSpacing: 1.5 },
  mainTitle: { fontSize: 22, fontWeight: '900', color: '#ffffff', marginTop: 4, lineHeight: 28 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4, flexWrap: 'wrap' },
  metaText: { fontSize: 11, fontWeight: '700', color: '#cbd5e1' },
  metaSeparator: { color: '#64748b', marginHorizontal: 2 },

  body: { paddingHorizontal: 16, marginTop: -10, paddingBottom: 10 },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    borderRadius: 20, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 13, fontWeight: '900', marginTop: 2 },
  statLabel: { fontSize: 9.5, color: '#64748b', fontWeight: '600' },
  statDivider: { width: 1, height: 36 },
  statEmoji: { fontSize: 14 },

  card: {
    borderRadius: 20, borderWidth: 1, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 6,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 0.1 },

  description: { fontSize: 12.5, lineHeight: 19, fontWeight: '500' },
  bestTimeBox: {
    marginTop: 12, backgroundColor: 'rgba(59,130,246,0.06)',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.15)', borderRadius: 12, padding: 10,
  },
  bestTimeTitle: { fontSize: 10.5, fontWeight: '900', color: '#3b82f6' },
  bestTimeVal: { fontSize: 11, color: '#64748b', fontWeight: '700', marginTop: 3 },

  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 7 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginTop: 5 },
  tipText: { fontSize: 12, flex: 1, lineHeight: 18, fontWeight: '500' },
  showMoreText: { fontSize: 11, color: '#10b981', fontWeight: '800', marginTop: 8 },

  forecastRow: { flexDirection: 'row', gap: 8 },
  forecastItem: {
    flex: 1, alignItems: 'center', borderRadius: 14, borderWidth: 1,
    paddingVertical: 10, paddingHorizontal: 4, gap: 3,
  },
  forecastDay: { fontSize: 9, fontWeight: '800', color: '#64748b' },
  forecastEmoji: { fontSize: 20 },
  forecastTemp: { fontSize: 13, fontWeight: '900' },
  forecastText: { fontSize: 9, color: '#64748b', fontWeight: '600', textAlign: 'center' },

  foodCard: {
    width: 140, borderRadius: 16, borderWidth: 1, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  foodEmoji: { fontSize: 28, marginBottom: 6 },
  foodName: { fontSize: 11.5, fontWeight: '800', marginBottom: 4 },
  foodDesc: { fontSize: 10.5, lineHeight: 15, fontWeight: '500' },

  spotCard: {
    borderRadius: 16, borderWidth: 1, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4,
  },
  spotHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  spotIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  spotName: { fontSize: 12.5, fontWeight: '800' },
  spotType: { fontSize: 10, color: '#10b981', fontWeight: '700', marginTop: 1 },
  spotDesc: { fontSize: 11.5, lineHeight: 17, fontWeight: '500', paddingLeft: 46 },
  spotActionRow: {
    flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 10,
    borderTopWidth: 0.5, borderTopColor: 'rgba(16,185,129,0.2)',
  },
  spotActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderRadius: 10, paddingVertical: 8,
  },
  spotActionText: { fontSize: 10.5, fontWeight: '800' },

  vrButton: {
    marginTop: 20, borderRadius: 18, overflow: 'hidden',
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  vrGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  vrText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },

  floatingHeader: {
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 25,
    left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  circleBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(15,23,42,0.65)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
});
