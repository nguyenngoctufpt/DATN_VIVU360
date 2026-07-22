import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import {
  ArrowLeft,
  Info,
  Compass,
  Maximize2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  X,
  Image as ImageIcon,
  AlertCircle,
  MapPin
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { extractPinterestImage, getImageSource } from './pinterestExtractor';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const TOUR_DATA = {
  1: { // Vịnh Hạ Long
    title: 'Vịnh Hạ Long',
    region: 'Quảng Ninh',
    audioGuide: 'Hạ Long là một vịnh nhỏ thuộc phần bờ tây vịnh Bắc Bộ tại khu vực biển Đông Việt Nam, bao gồm vùng biển đảo của thành phố Hạ Long, thị xã Quảng Yên và một phần của huyện đảo Vân Đồn thuộc tỉnh Quảng Ninh.',
    spots: [
      {
        id: 'spot1',
        name: 'Nhìn từ Phi Cơ',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=80',
        hotspots: [
          { id: 'h1', title: 'Hòn Trống Mái', x: SCREEN_WIDTH * 0.45, y: SCREEN_HEIGHT * 0.42, desc: 'Biểu tượng của Vịnh Hạ Long, hình ảnh hai hòn đá tựa như cặp gà trống mái chọi nhau giữa sóng nước mênh mông.', targetSpotId: 'spot4' },
          { id: 'h2', title: 'Đảo Ti Tốp', x: SCREEN_WIDTH * 0.85, y: SCREEN_HEIGHT * 0.35, desc: 'Hòn đảo sở hữu bãi tắm cát trắng mịn hình vầng trăng lưỡi liềm ôm trọn chân đảo và chóp đỉnh ngắm toàn cảnh Vịnh.', targetSpotId: 'spot5' }
        ]
      },
      {
        id: 'spot2',
        name: 'Động Sửng Sốt',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1800&q=80',
        hotspots: [
          { id: 'h3', title: 'Thạch Nhũ Rồng', x: SCREEN_WIDTH * 0.35, y: SCREEN_HEIGHT * 0.32, desc: 'Khối thạch nhũ kiến tạo tự nhiên khổng lồ uốn lượn mang hình thế Thăng Long bảo vệ hang động linh thiêng.' },
          { id: 'h4', title: 'Cột Đá Vô Cực', x: SCREEN_WIDTH * 0.75, y: SCREEN_HEIGHT * 0.48, desc: 'Trụ đá vôi sừng sững hình thành sau hàng triệu năm nhỏ giọt nước trầm tích từ trần hang động xuống nền.' }
        ]
      },
      {
        id: 'spot3',
        name: 'Làng Chài Vung Viêng',
        image: 'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=1800&q=80',
        hotspots: [
          { id: 'h5', title: 'Bến Thuyền Mủng', x: SCREEN_WIDTH * 0.55, y: SCREEN_HEIGHT * 0.45, desc: 'Trải nghiệm ngồi thuyền mủng tre do ngư dân địa phương chèo lái tham quan cuộc sống làng chài nổi bình yên.' }
        ]
      },
      {
        id: 'spot4',
        name: 'Hòn Trống Mái',
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Ha_Long_bay_The_Kissing_Rocks.jpg',
        hotspots: [
          { id: 'h_back', title: 'Quay lại Phi Cơ', x: SCREEN_WIDTH * 0.15, y: SCREEN_HEIGHT * 0.45, desc: 'Quay trở lại góc nhìn toàn cảnh Vịnh Hạ Long từ phi cơ trên cao.', targetSpotId: 'spot1' }
        ]
      },
      {
        id: 'spot5',
        name: 'Đảo Ti Tốp',
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Ti_Top_Island_%283695252608%29.jpg',
        hotspots: [
          { id: 'h_back', title: 'Quay lại Phi Cơ', x: SCREEN_WIDTH * 0.15, y: SCREEN_HEIGHT * 0.45, desc: 'Quay trở lại góc nhìn toàn cảnh Vịnh Hạ Long từ phi cơ trên cao.', targetSpotId: 'spot1' }
        ]
      }
    ]
  },
  2: { // Phố Cổ Hội An
    title: 'Phố Cổ Hội An',
    region: 'Quảng Nam',
    audioGuide: 'Phố cổ Hội An là một đô thị cổ nằm ở hạ lưu sông Thu Bồn, thuộc vùng đồng bằng ven biển tỉnh Quảng Nam, cách thành phố Đà Nẵng khoảng 30 km về phía Nam.',
    spots: [
      {
        id: 'spot1',
        name: 'Phố Đèn Lồng',
        image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=1800&q=80',
        hotspots: [
          { id: 'h1', title: 'Chùa Cầu Cổ', x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.40, desc: 'Công trình kiến trúc độc đáo bắc qua con lạch nhỏ nối phố Trần Phú sang Nguyễn Thị Minh Khai, xây dựng bởi Nhật Bản từ thế kỷ 17.', targetSpotId: 'spot3' },
          { id: 'h2', title: 'Nhà Cổ Tấn Ký', x: SCREEN_WIDTH * 0.9, y: SCREEN_HEIGHT * 0.46, desc: 'Ngôi nhà cổ tiêu biểu được xây dựng hơn 200 năm với sự phối hợp phong cách Việt, Nhật, Trung và các chạm trổ cực kỳ tinh xảo.' }
        ]
      },
      {
        id: 'spot2',
        name: 'Sông Thu Bồn',
        image: 'https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=1800&q=80',
        hotspots: [
          { id: 'h3', title: 'Thả Đèn Hoa Đăng', x: SCREEN_WIDTH * 0.45, y: SCREEN_HEIGHT * 0.52, desc: 'Hoạt động văn hóa tâm linh lãng mạn, du khách tự tay thả chiếc hoa đăng nhỏ giấy màu sắc lung linh xuống dòng nước sông Thu Bồn về đêm.' }
        ]
      },
      {
        id: 'spot3',
        name: 'Chùa Cầu Cổ',
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Vietnam_Hoi_An_Ch%C3%B9a_C%E1%BA%A7u.jpg',
        hotspots: [
          { id: 'h_back', title: 'Quay lại Phố Đèn Lồng', x: SCREEN_WIDTH * 0.15, y: SCREEN_HEIGHT * 0.45, desc: 'Quay trở lại góc nhìn ngập tràn ánh đèn lồng tại phố cổ Hội An.', targetSpotId: 'spot1' }
        ]
      }
    ]
  },
  3: { // Đảo Phú Quốc
    title: 'Đảo Phú Quốc',
    region: 'Kiên Giang',
    audioGuide: 'Phú Quốc là một hòn đảo nằm trong vịnh Thái Lan, là hòn đảo lớn nhất Việt Nam. Phú Quốc cùng với các đảo khác tạo thành thành phố đảo Phú Quốc thuộc tỉnh Kiên Giang.',
    spots: [
      {
        id: 'spot1',
        name: 'Bãi Trường Sunset',
        image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=80',
        hotspots: [
          { id: 'h1', title: 'Cổng Mặt Trời', x: SCREEN_WIDTH * 0.38, y: SCREEN_HEIGHT * 0.38, desc: 'Tác phẩm điêu khắc nghệ thuật hình mặt người tách đôi đặt trên bờ cát đón hoàng hôn đỏ rực buông xuống đại dương.' },
          { id: 'h2', title: 'Beach Club Lounge', x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.42, desc: 'Địa điểm thư giãn cao cấp ngắm hoàng hôn tím huyền ảo đặc sản đảo ngọc Phú Quốc.' }
        ]
      },
      {
        id: 'spot2',
        name: 'Bãi Sao Pier',
        image: 'https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=1800&q=80',
        hotspots: [
          { id: 'h3', title: 'Cầu Cảng Bãi Sao', x: SCREEN_WIDTH * 0.6, y: SCREEN_HEIGHT * 0.45, desc: 'Cầu cảng gỗ thơ mộng vươn dài ra làn nước xanh ngọc bích trong vắt nhìn thấy cát trắng mịn dưới đáy biển.' }
        ]
      }
    ]
  },
  4: { // Mù Cang Chải
    title: 'Mù Cang Chải',
    region: 'Yên Bái',
    audioGuide: 'Mù Cang Chải là một huyện miền núi nằm dưới chân dãy Hoàng Liên Sơn hùng vĩ, thuộc tỉnh Yên Bái, nổi tiếng với ruộng bậc thang được xếp hạng di tích quốc gia.',
    spots: [
      {
        id: 'spot1',
        name: 'Đồi Mâm Xôi',
        image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1800&q=80',
        hotspots: [
          { id: 'h1', title: 'Ruộng Bậc Thang Mâm Xôi', x: SCREEN_WIDTH * 0.48, y: SCREEN_HEIGHT * 0.40, desc: 'Những vòng tròn ruộng lúa chín vàng óng cuộn dần lên chóp núi tròn đầy tựa mâm xôi cúng tế đất trời Tây Bắc ngày mùa.' }
        ]
      },
      {
        id: 'spot2',
        name: 'Thung Lũng lúa chín',
        image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=1800&q=80',
        hotspots: [
          { id: 'h2', title: 'Điểm Nhảy Dù Lượn', x: SCREEN_WIDTH * 0.35, y: SCREEN_HEIGHT * 0.28, desc: 'Góc nhìn từ đỉnh Khau Phạ, một trong tứ đại đỉnh đèo miền Bắc, nơi lý tưởng nhảy dù lượn thu trọn sắc vàng thung lũng lúa chín dưới chân.' }
        ]
      }
    ]
  },
  5: { // Hồ Hoàn Kiếm
    title: 'Hồ Hoàn Kiếm',
    region: 'Hà Nội',
    audioGuide: 'Hồ Hoàn Kiếm, còn gọi là Hồ Gươm, là một hồ nước ngọt tự nhiên nằm ở trung tâm thành phố Hà Nội. Hồ gắn liền với truyền thuyết vua Lê Lợi trả gươm báu cho Rùa thần.',
    spots: [
      {
        id: 'spot1',
        name: 'Đền Ngọc Sơn & Cầu Thê Húc',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80',
        hotspots: [
          { id: 'h1', title: 'Cầu Thê Húc', x: SCREEN_WIDTH * 0.45, y: SCREEN_HEIGHT * 0.42, desc: 'Cây cầu màu đỏ son nổi bật dẫn vào đền Ngọc Sơn, biểu tượng của sự ngưng tụ ánh sáng mặt trời dịu dàng.' },
          { id: 'h2', title: 'Đền Ngọc Sơn', x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.38, desc: 'Ngôi đền cổ kính nằm trên đảo Ngọc của hồ Hoàn Kiếm, thờ thần Văn Xương Đế Quân và Hưng Đạo Đại Vương Trần Quốc Tuấn.' }
        ]
      },
      {
        id: 'spot2',
        name: 'Tháp Rùa Hồ Gươm',
        image: 'https://images.unsplash.com/photo-1610016302534-6f67f1c968d8?auto=format&fit=crop&w=1800&q=80',
        hotspots: [
          { id: 'h3', title: 'Tháp Rùa', x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.45, desc: 'Ngọn tháp cổ kính rêu phong sừng sững giữa lòng hồ Hoàn Kiếm, kết hợp hài hòa giữa kiến trúc Gothic phương Tây và mái quy cuốn truyền thống Việt Nam.' }
        ]
      },
      {
        id: 'spot3',
        name: 'Toàn cảnh Hồ Gươm',
        image: 'https://longvietarch.wordpress.com/wp-content/uploads/2024/11/30.jpg?w=768',
        hotspots: [
          { id: 'h4', title: 'Không gian Hồ Gươm', x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.42, desc: 'Không gian đi bộ xanh mát quanh hồ Hoàn Kiếm, trung tâm sinh hoạt cộng đồng và văn hóa của thủ đô Hà Nội.' }
        ]
      }
    ]
  }
};

const getScenicPanorama = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('biển') || lower.includes('đảo') || lower.includes('vịnh') || lower.includes('bãi') || lower.includes('phú quốc') || lower.includes('côn đảo') || lower.includes('sông') || lower.includes('hồ')) {
    return 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=80'; // Beach
  }
  if (lower.includes('chùa') || lower.includes('đền') || lower.includes('miếu') || lower.includes('lăng') || lower.includes('tháp') || lower.includes('cổ') || lower.includes('tích') || lower.includes('di tích')) {
    return 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1800&q=80'; // Temple
  }
  if (lower.includes('núi') || lower.includes('đồi') || lower.includes('đèo') || lower.includes('ruộng') || lower.includes('sapa') || lower.includes('mù cang chải') || lower.includes('rừng') || lower.includes('thác')) {
    return 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1800&q=80'; // Mountain
  }
  return 'https://images.unsplash.com/photo-1509060464153-4466739f78ad?auto=format&fit=crop&w=1800&q=80'; // City
};

export function VirtualTourScreen({ theme, isDarkMode, tourId, startSpotIdx, onBack, onBookSuccess }) {
  const tour = useMemo(() => {
    if (TOUR_DATA[tourId]) return TOUR_DATA[tourId];
    
    if (typeof tourId === 'string') {
      const isAttraction = tourId.startsWith('attraction-');
      const title = isAttraction ? tourId.replace('attraction-', '') : tourId.replace('province-', '');
      const scenicImg = getScenicPanorama(title);
      
      return {
        title: title,
        region: isAttraction ? 'Điểm du lịch' : title,
        audioGuide: `Chào mừng bạn đến với trải nghiệm tham quan ảo 360° tại ${title}. Đây là danh lam thắng cảnh nổi tiếng của địa phương, lưu giữ nét đẹp văn hóa tự nhiên độc đáo.`,
        spots: [
          {
            id: 'spot1',
            name: 'Góc nhìn toàn cảnh 360°',
            image: scenicImg,
            hotspots: [
              { id: 'h1', title: `Khám phá ${title}`, x: SCREEN_WIDTH * 0.45, y: SCREEN_HEIGHT * 0.42, desc: `Trải nghiệm không gian ảo sống động tại ${title}, tìm hiểu các giá trị lịch sử, kiến trúc địa phương.` }
            ]
          }
        ]
      };
    }
    
    return TOUR_DATA[1];
  }, [tourId]);

  const hostIp = useMemo(() => {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    }
    let host = Constants.expoConfig?.hostUri;
    if (!host && Constants.manifest) {
      host = Constants.manifest.debuggerHost;
    }
    if (!host && Constants.manifest2?.extra?.expoGo) {
      host = Constants.manifest2.extra.expoGo.debuggerHost;
    }
    if (host) {
      const ip = host.split(':')[0];
      if (ip && ip !== '127.0.0.1' && ip !== 'localhost') return ip;
    }
    return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  }, []);

  const webVrUrl = useMemo(() => {
    const title = tour.title || 'Văn Miếu - Quốc Tử Giám';
    return `http://${hostIp}:3005?view=vr&tourId=${encodeURIComponent(title)}&isApp=1`;
  }, [hostIp, tour.title]);

  const [useWebVrEngine, setUseWebVrEngine] = useState(true);

  if (useWebVrEngine) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <WebView
          source={{ uri: webVrUrl }}
          style={{ flex: 1 }}
          cacheEnabled={false}
          incognito={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#09090b', alignItems: 'center', justifyContent: 'center' }]}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{ color: '#fff', marginTop: 12, fontSize: 12, fontWeight: '700' }}>Đang khởi tạo không gian 360° VR...</Text>
            </View>
          )}
          onError={() => setUseWebVrEngine(false)}
        />
        {/* Floating Back Button */}
        <Pressable
          onPress={onBack}
          style={{
            position: 'absolute',
            top: 40,
            left: 16,
            zIndex: 999,
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowRadius: 6,
            elevation: 5
          }}
        >
          <ArrowLeft size={20} color="#fff" />
        </Pressable>
      </View>
    );
  }

  const [activeSpotIdx, setActiveSpotIdx] = useState(startSpotIdx !== undefined ? startSpotIdx : 0);

  useEffect(() => {
    if (startSpotIdx !== undefined) {
      setActiveSpotIdx(startSpotIdx);
    }
  }, [startSpotIdx]);

  const spot = useMemo(() => tour.spots[activeSpotIdx] || tour.spots[0], [tour, activeSpotIdx]);

  // Trạng thái Form thêm điểm nhìn 360° mới
  const [addSpotModalVisible, setAddSpotModalVisible] = useState(false);
  const [newSpotName, setNewSpotName] = useState('');
  const [pinterestSpotUrl, setPinterestSpotUrl] = useState('');
  const [extractedSpotImg, setExtractedSpotImg] = useState('');
  const [isExtractingSpot, setIsExtractingSpot] = useState(false);

  const handleExtractSpotImage = async () => {
    if (!pinterestSpotUrl.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đường dẫn Pinterest!');
      return;
    }
    setIsExtractingSpot(true);
    try {
      const url = await extractPinterestImage(pinterestSpotUrl);
      if (url) {
        setExtractedSpotImg(url);
        Alert.alert('Thành công', 'Đã tải thành công ảnh từ Pinterest!');
      } else {
        Alert.alert(
          'Lưu ý từ hệ thống',
          'Không thể tự động tải ảnh do Pinterest chặn bảo mật.\n\nMẹo: Hãy click chuột phải vào ảnh Pinterest -> Chọn "Sao chép địa chỉ hình ảnh" và dán lại link trực tiếp vào đây.',
          [{ text: 'Tôi hiểu rồi', style: 'default' }]
        );
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải ảnh. Vui lòng thử lại!');
    } finally {
      setIsExtractingSpot(false);
    }
  };

  const handleSaveSpot = () => {
    if (!newSpotName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền tên góc nhìn!');
      return;
    }
    const finalImg = extractedSpotImg.trim() || 'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=1800&q=80';
    
    const newSpotObj = {
      id: `spot-${Date.now()}`,
      name: newSpotName,
      image: finalImg,
      hotspots: []
    };

    tour.spots.push(newSpotObj);
    setActiveSpotIdx(tour.spots.length - 1);
    setNewSpotName('');
    setPinterestSpotUrl('');
    setExtractedSpotImg('');
    setAddSpotModalVisible(false);
    Alert.alert('Thành công', `Đã thêm góc nhìn "${newSpotName}" vào tour ảo 360°!`);
  };

  // View state controls
  const [panX, setPanX] = useState(-100);
  const [vrMode, setVrMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState(null);

  const navigateToSpot = (spotId) => {
    const idx = tour.spots.findIndex(s => s.id === spotId);
    if (idx !== -1) {
      setActiveSpotIdx(idx);
      setActiveHotspot(null);
      setPanX(-100); // Reset pan orientation to default
    }
  };

  // Booking Form State
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [guestName, setGuestName] = useState('Nguyễn Minh');
  const [guestPhone, setGuestPhone] = useState('0987654321');
  const [travelDate, setTravelDate] = useState('2026-06-20');
  const [guestCount, setGuestCount] = useState(2);
  const [guestNote, setGuestNote] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [generatedTicketCode, setGeneratedTicketCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' | 'vietqr' | 'later'
  const [walletBalance, setWalletBalance] = useState(12500000);
  
  // Auto rotation effect
  useEffect(() => {
    let interval;
    if (autoRotate) {
      interval = setInterval(() => {
        setPanX(prev => {
          let next = prev - 0.75;
          // Loop around
          if (next < -SCREEN_WIDTH) {
            return 0;
          }
          return next;
        });
      }, 30);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRotate]);

  // Handle Drag / Look Around
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setAutoRotate(false); // Disable auto-rotate on touch interaction
      },
      onPanResponderMove: (evt, gestureState) => {
        setPanX(prev => {
          let next = prev + gestureState.dx * 0.4;
          // Restrict bounds (twice screen width zoom layout)
          const minBound = -SCREEN_WIDTH;
          const maxBound = 0;
          if (next > maxBound) return maxBound;
          if (next < minBound) return minBound;
          return next;
        });
      },
    })
  ).current;

  // Calculate compass rotation matching background angle
  const compassRotate = useMemo(() => {
    return `${((panX / -SCREEN_WIDTH) * 360).toFixed(1)}deg`;
  }, [panX]);

  const handleBooking = () => {
    setBookingModalVisible(true);
  };

  // Helper to build headers for image loaders (e.g. for WordPress or Pinterest hotlink bypass)
  const imageSource = useMemo(() => {
    return getImageSource(spot?.image);
  }, [spot]);

  // Render main viewpoint panorama viewport
  const renderPanorama = (widthScale = 2) => {
    return (
      <View style={styles.panoContainer} {...panResponder.panHandlers}>
        <Animated.Image
          source={imageSource || { uri: spot.image }}
          style={[
            styles.panoImage,
            {
              width: SCREEN_WIDTH * widthScale,
              transform: [{ translateX: panX }]
            }
          ]}
          resizeMode="cover"
        />

        {/* Dynamic Light Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
          style={styles.panoOverlay}
          pointerEvents="none"
        />

        {/* Hotspots Overlay */}
        {!vrMode && spot.hotspots.map((hot) => {
          // Calculate active positioning translation matching panoramic slide
          const currentX = hot.x + panX;
          // Hide hotspots if scrolled out of window frame bounds
          if (currentX < 0 || currentX > SCREEN_WIDTH - 30) return null;

          return (
            <Pressable
              key={hot.id}
              style={[styles.hotspotPill, { top: hot.y, left: currentX }]}
              onPress={() => {
                setActiveHotspot(hot);
                setAutoRotate(false);
              }}
            >
              <View style={styles.hotspotGlowOuter}>
                <View style={styles.hotspotInnerCircle}>
                  <Sparkles size={12} color="#fff" />
                </View>
              </View>
              <View style={styles.hotspotTextTag}>
                <Text style={styles.hotspotText}>{hot.title}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* 360 CANVAS PREVIEW CONTAINER */}
      {vrMode ? (
        <View style={styles.vrSplitWrapper}>
          {/* Left Eye Viewport */}
          <View style={styles.vrEyeFrame}>
            {renderPanorama(1.6)}
            <View style={styles.vrFishEyeOverlay} pointerEvents="none" />
            <Text style={styles.vrEyeLabel}>L</Text>
          </View>
          <View style={styles.vrDivider} />
          {/* Right Eye Viewport */}
          <View style={styles.vrEyeFrame}>
            {renderPanorama(1.6)}
            <View style={styles.vrFishEyeOverlay} pointerEvents="none" />
            <Text style={styles.vrEyeLabel}>R</Text>
          </View>
        </View>
      ) : (
        renderPanorama(2)
      )}

      {/* HEADER OVERLAYS */}
      <View style={styles.headerBar}>
        <Pressable style={styles.iconCircleBtn} onPress={onBack}>
          <ArrowLeft size={18} color="#fff" />
        </Pressable>

        <View style={styles.tourTitleHeader}>
          <Text style={styles.headerTourTitle} numberOfLines={1}>{tour.title}</Text>
          <Text style={styles.headerTourSub} numberOfLines={1}>{spot.name}</Text>
        </View>

        <View style={styles.headerRightActions}>
          <Pressable 
            style={[styles.iconCircleBtn, autoRotate ? styles.iconCircleBtnActive : null]} 
            onPress={() => setAutoRotate(!autoRotate)}
          >
            <RotateCcw size={16} color="#fff" style={autoRotate ? styles.spinningIcon : null} />
          </Pressable>

          <Pressable 
            style={[styles.iconCircleBtn, vrMode ? styles.iconCircleBtnActive : null]} 
            onPress={() => {
              setVrMode(!vrMode);
              setActiveHotspot(null);
              setAutoRotate(false);
            }}
          >
            <Maximize2 size={16} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* ACTIVE DETAIL HOTSPOT CARD POPUP */}
      {!vrMode && activeHotspot && (
        <View style={styles.popupCardOuter}>
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.92)', 'rgba(30, 41, 59, 0.96)']}
            style={styles.popupCardInner}
          >
            <View style={styles.popupHeader}>
              <View style={styles.popupTitleRow}>
                <Info size={14} color="#3b82f6" />
                <Text style={styles.popupTitleText}>{activeHotspot.title}</Text>
              </View>
              <Pressable style={styles.popupCloseBtn} onPress={() => setActiveHotspot(null)}>
                <Text style={styles.popupCloseText}>✕</Text>
              </Pressable>
            </View>
            <Text style={styles.popupDescText}>{activeHotspot.desc}</Text>
            
            {activeHotspot.targetSpotId ? (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Pressable
                  style={[styles.popupAudioLinkBtn, { flex: 1, marginTop: 0, backgroundColor: '#10b981' }]}
                  onPress={() => {
                    navigateToSpot(activeHotspot.targetSpotId);
                  }}
                >
                  <MapPin size={12} color="#fff" />
                  <Text style={styles.popupAudioLinkText}>Tham quan ngay</Text>
                </Pressable>
              </View>
            ) : null}
          </LinearGradient>
        </View>
      )}

      {/* BOTTOM VIEWPOINTS SELECTOR BAR */}
      {!vrMode && (
        <View style={styles.bottomSelectorBar}>
          <Text style={styles.selectSpotTitle}>ĐIỂM GÓC NHÌN 360°</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.spotsScrollRow}
          >
            {tour.spots.map((s, idx) => (
              <Pressable
                key={s.id}
                style={[
                  styles.spotThumbnailPill,
                  activeSpotIdx === idx ? styles.spotThumbnailPillActive : null
                ]}
                onPress={() => {
                  setActiveSpotIdx(idx);
                  setActiveHotspot(null);
                  setPanX(-100);
                }}
              >
                <Text
                  style={[
                    styles.spotThumbText,
                    activeSpotIdx === idx ? styles.spotThumbTextActive : null
                  ]}
                >
                  {s.name}
                </Text>
              </Pressable>
            ))}
            
            {/* Nút thêm góc nhìn mới */}
            <Pressable
              style={[styles.spotThumbnailPill, styles.spotAddPill]}
              onPress={() => setAddSpotModalVisible(true)}
            >
              <Text style={styles.spotAddText}>+ Thêm Góc Nhìn</Text>
            </Pressable>
          </ScrollView>

          {/* Quick Booking card directly nested in full virtual screen */}
          <View style={styles.quickBookingSection}>
            <View>
              <Text style={styles.tourBookingRegion}>{tour.region}</Text>
              <Text style={styles.tourBookingPrice}>Trọn gói: 2.500.000đ</Text>
            </View>
            <Pressable style={styles.bookNowBtn} onPress={handleBooking}>
              <Text style={styles.bookNowBtnText}>Đặt Tour Thực Tế</Text>
              <ChevronRight size={14} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}

      {/* VR Mode overlay center helper indicator */}
      {vrMode && (
        <Pressable 
          style={styles.exitVrBtnFloat} 
          onPress={() => {
            setVrMode(false);
            setAutoRotate(true);
          }}
        >
          <Text style={styles.exitVrText}>THOÁT VR MODE</Text>
        </Pressable>
      )}

      {/* MODAL: THÊM ĐIỂM GÓC NHÌN MỚI TỪ PINTEREST */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addSpotModalVisible}
        onRequestClose={() => setAddSpotModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={18} color="#10b981" />
                <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Thêm Góc Nhìn 360° Mới</Text>
              </View>
              <Pressable style={styles.closeModalBtn} onPress={() => setAddSpotModalVisible(false)}>
                <X size={20} color={theme.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }}>
              {/* Tên góc nhìn */}
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Tên góc nhìn / Điểm đứng ngắm</Text>
              <TextInput
                placeholder="Ví dụ: Nhìn từ đỉnh tháp, Cảnh hoàng hôn ven đầm..."
                placeholderTextColor={theme.textMuted}
                value={newSpotName}
                onChangeText={setNewSpotName}
                style={[styles.modalTextInput, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.border }]}
              />

              {/* Đường dẫn ảnh Pinterest */}
              <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 12 }]}>Đường dẫn ảnh từ Pinterest</Text>
              <View style={styles.pinterestInputRow}>
                <TextInput
                  placeholder="Dán link Pin Pinterest hoặc link ảnh..."
                  placeholderTextColor={theme.textMuted}
                  value={pinterestSpotUrl}
                  onChangeText={(val) => {
                    setPinterestSpotUrl(val);
                    if (val.includes('pinimg.com')) {
                      setExtractedSpotImg(val);
                    }
                  }}
                  style={[styles.modalTextInput, { flex: 1, marginBottom: 0, color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.border }]}
                />
                <Pressable
                  style={styles.extractBtn}
                  onPress={handleExtractSpotImage}
                  disabled={isExtractingSpot}
                >
                  {isExtractingSpot ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.extractBtnText}>Tải ảnh</Text>
                  )}
                </Pressable>
              </View>

              {/* Hướng dẫn */}
              <View style={[styles.guideBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderColor: theme.border }]}>
                <AlertCircle size={14} color="#3b82f6" style={{ marginTop: 2 }} />
                <Text style={styles.guideText}>
                  Để có trải nghiệm tốt nhất, bạn nên chọn những bức ảnh góc rộng (panorama) hoặc ảnh toàn cảnh 360 độ. Mẹo: Sao chép link ảnh trực tiếp từ Pinterest để xem trước tức thì!
                </Text>
              </View>

              {/* Xem trước ảnh */}
              {extractedSpotImg ? (
                <View style={styles.imagePreviewContainer}>
                  <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Xem trước ảnh:</Text>
                  <Image source={getImageSource(extractedSpotImg) || { uri: extractedSpotImg }} style={styles.previewImage} resizeMode="cover" />
                  <Pressable style={styles.removePreviewBtn} onPress={() => setExtractedSpotImg('')}>
                    <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: '700' }}>Xóa ảnh preview</Text>
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>

            {/* Footer */}
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setAddSpotModalVisible(false)}>
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.modalSubmitBtn} onPress={handleSaveSpot}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.modalSubmitGradient}
                >
                  <Text style={styles.modalSubmitText}>Lưu Góc Nhìn</Text>
                </LinearGradient>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>

      {/* MODAL: ĐẶT TOUR THỰC TẾ CHUYÊN NGHIỆP */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={bookingModalVisible}
        onRequestClose={() => {
          setBookingModalVisible(false);
          setBookingSuccess(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.bookingModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MapPin size={18} color="#3b82f6" />
                <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Đặt Tour Thực Tế {tour.title}</Text>
              </View>
              <Pressable style={styles.closeModalBtn} onPress={() => {
                setBookingModalVisible(false);
                setBookingSuccess(false);
              }}>
                <X size={20} color={theme.textPrimary} />
              </Pressable>
            </View>

            {bookingSuccess ? (
              // Màn hình đặt thành công
              <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 40 }}>
                <View style={[styles.successBadgeCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Sparkles size={40} color="#10b981" />
                </View>
                <Text style={[styles.successTitleText, { color: theme.textPrimary }]}>Đặt Tour Thành Công!</Text>
                <Text style={[styles.successSubText, { color: theme.textSecondary }]}>Yêu cầu đặt chỗ của bạn đã được tiếp nhận.</Text>

                <View style={[styles.successReceiptCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderColor: theme.border }]}>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Mã đơn đặt:</Text>
                    <Text style={[styles.receiptValue, { color: '#10b981', fontWeight: '900' }]}>{generatedTicketCode}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Điểm đến:</Text>
                    <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>{tour.title} ({tour.region})</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Ngày đi:</Text>
                    <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>{travelDate}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Khách hàng:</Text>
                    <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>{guestName}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Số điện thoại:</Text>
                    <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>{guestPhone}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Số lượng:</Text>
                    <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>{guestCount} người</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Tổng chi phí:</Text>
                    <Text style={[styles.receiptValue, { color: '#3b82f6', fontWeight: '900' }]}>{(guestCount * 2500000).toLocaleString('vi-VN')}đ</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Thanh toán:</Text>
                    <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>
                      {paymentMethod === 'wallet' ? 'Ví Vivu360 (Đã thanh toán)' : 
                       paymentMethod === 'vietqr' ? 'VietQR (Chờ chuyển khoản)' : 'Thanh toán sau (COD)'}
                    </Text>
                  </View>
                </View>

                {paymentMethod === 'vietqr' && (
                  <View style={{ alignItems: 'center', marginTop: 16, padding: 12, borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 16, backgroundColor: isDarkMode ? 'rgba(59,130,246,0.05)' : '#eff6ff', width: '100%' }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#3b82f6', marginBottom: 8 }}>MÃ VẬT LÝ QUÉT VIETQR CHUYỂN KHOẢN</Text>
                    <View style={{ padding: 6, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc' }}>
                      <Image
                        source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`2500000*${guestCount}`)}` }}
                        style={{ width: 120, height: 120 }}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={{ fontSize: 9.5, fontWeight: '600', color: theme.textSecondary, marginTop: 8, textAlign: 'center' }}>
                      Chuyển khoản đúng số tiền: <Text style={{ fontWeight: '900', color: '#ef4444' }}>{(guestCount * 2500000).toLocaleString('vi-VN')}đ</Text>{"\n"}
                      Nội dung chuyển khoản: <Text style={{ fontWeight: '900', color: '#10b981' }}>{generatedTicketCode}</Text>
                    </Text>
                  </View>
                )}

                {paymentMethod === 'wallet' && (
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 12, alignSelf: 'flex-start' }}>
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#10b981' }}>✓ Đã trừ {(guestCount * 2500000).toLocaleString('vi-VN')}đ từ ví Vivu360. Số dư còn lại: {(walletBalance).toLocaleString('vi-VN')}đ</Text>
                  </View>
                )}

                <View style={[styles.guideBox, { backgroundColor: isDarkMode ? 'rgba(59,130,246,0.05)' : '#eff6ff', borderColor: '#bfdbfe', marginTop: 16 }]}>
                  <AlertCircle size={14} color="#3b82f6" style={{ marginTop: 2 }} />
                  <Text style={styles.guideText}>
                    Nhân viên Vivu360 sẽ gọi điện xác nhận lộ trình và tư vấn dịch vụ đưa đón miễn phí cho bạn qua số điện thoại {guestPhone} trong vòng 15 phút!
                  </Text>
                </View>

                <Pressable
                  style={[styles.modalSubmitBtn, { width: '100%', marginTop: 24, height: 46 }]}
                  onPress={() => {
                    setBookingModalVisible(false);
                    setBookingSuccess(false);
                  }}
                >
                  <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.modalSubmitGradient}>
                    <Text style={styles.modalSubmitText}>Đóng</Text>
                  </LinearGradient>
                </Pressable>
              </ScrollView>
            ) : (
              // Form điền thông tin đặt tour
              <ScrollView style={{ flex: 1, padding: 16 }}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Họ và tên người đại diện</Text>
                <TextInput
                  value={guestName}
                  onChangeText={setGuestName}
                  style={[styles.modalTextInput, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.border }]}
                  placeholder="Nhập tên của bạn..."
                  placeholderTextColor={theme.textMuted}
                />

                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Số điện thoại liên hệ</Text>
                <TextInput
                  value={guestPhone}
                  onChangeText={setGuestPhone}
                  keyboardType="phone-pad"
                  style={[styles.modalTextInput, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.border }]}
                  placeholder="Nhập số điện thoại..."
                  placeholderTextColor={theme.textMuted}
                />

                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Ngày khởi hành mong muốn</Text>
                <TextInput
                  value={travelDate}
                  onChangeText={setTravelDate}
                  style={[styles.modalTextInput, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.border }]}
                  placeholder="YYYY-MM-DD (Ví dụ: 2026-06-20)"
                  placeholderTextColor={theme.textMuted}
                />

                {/* Bộ đếm số lượng người đi */}
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Số lượng thành viên</Text>
                <View style={styles.counterRow}>
                  <Pressable 
                    onPress={() => setGuestCount(prev => Math.max(1, prev - 1))}
                    style={[styles.counterBtn, { backgroundColor: theme.searchBg, borderColor: theme.border }]}
                  >
                    <Text style={[styles.counterBtnText, { color: theme.textPrimary }]}>-</Text>
                  </Pressable>
                  <Text style={[styles.counterValueText, { color: theme.textPrimary }]}>{guestCount}</Text>
                  <Pressable 
                    onPress={() => setGuestCount(prev => prev + 1)}
                    style={[styles.counterBtn, { backgroundColor: theme.searchBg, borderColor: theme.border }]}
                  >
                    <Text style={[styles.counterBtnText, { color: theme.textPrimary }]}>+</Text>
                  </Pressable>
                  <Text style={[styles.counterUnitText, { color: theme.textMuted }]}>thành viên tham gia</Text>
                </View>

                <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 16 }]}>Ghi chú thêm (nếu có)</Text>
                <TextInput
                  value={guestNote}
                  onChangeText={setGuestNote}
                  multiline={true}
                  numberOfLines={3}
                  style={[styles.modalTextInput, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.border, height: 72, textAlignVertical: 'top' }]}
                  placeholder="Yêu cầu đưa đón, ăn uống đặc biệt..."
                  placeholderTextColor={theme.textMuted}
                />

                {/* Lựa chọn phương thức thanh toán */}
                <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 16 }]}>Phương thức thanh toán</Text>
                
                {/* Option 1: Ví Vivu360 */}
                <Pressable
                  onPress={() => setPaymentMethod('wallet')}
                  style={[
                    styles.paymentMethodCard,
                    { borderColor: paymentMethod === 'wallet' ? '#3b82f6' : theme.border, backgroundColor: theme.searchBg }
                  ]}
                >
                  <View style={styles.paymentMethodRadioRow}>
                    <View style={[styles.radioCircle, paymentMethod === 'wallet' && styles.radioCircleActive]}>
                      {paymentMethod === 'wallet' && <View style={styles.radioDot} />}
                    </View>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={[styles.paymentMethodTitle, { color: theme.textPrimary }]}>Ví điện tử Vivu360</Text>
                      <Text style={[styles.paymentMethodSub, { color: theme.textSecondary }]}>Số dư khả dụng: {walletBalance.toLocaleString('vi-VN')}đ</Text>
                      {guestCount * 2500000 > walletBalance && (
                        <Text style={{ color: '#ef4444', fontSize: 10, fontWeight: '700', marginTop: 2 }}>Số dư ví không đủ để thanh toán!</Text>
                      )}
                    </View>
                  </View>
                </Pressable>

                {/* Option 2: VietQR */}
                <Pressable
                  onPress={() => setPaymentMethod('vietqr')}
                  style={[
                    styles.paymentMethodCard,
                    { borderColor: paymentMethod === 'vietqr' ? '#3b82f6' : theme.border, backgroundColor: theme.searchBg, marginTop: 10 }
                  ]}
                >
                  <View style={styles.paymentMethodRadioRow}>
                    <View style={[styles.radioCircle, paymentMethod === 'vietqr' && styles.radioCircleActive]}>
                      {paymentMethod === 'vietqr' && <View style={styles.radioDot} />}
                    </View>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={[styles.paymentMethodTitle, { color: theme.textPrimary }]}>Cổng VietQR (Chuyển khoản nhanh)</Text>
                      <Text style={[styles.paymentMethodSub, { color: theme.textSecondary }]}>Tự động tạo mã QR quét thanh toán tức thì</Text>
                    </View>
                  </View>
                </Pressable>

                {/* Option 3: COD / Thanh toán sau */}
                <Pressable
                  onPress={() => setPaymentMethod('later')}
                  style={[
                    styles.paymentMethodCard,
                    { borderColor: paymentMethod === 'later' ? '#3b82f6' : theme.border, backgroundColor: theme.searchBg, marginTop: 10 }
                  ]}
                >
                  <View style={styles.paymentMethodRadioRow}>
                    <View style={[styles.radioCircle, paymentMethod === 'later' && styles.radioCircleActive]}>
                      {paymentMethod === 'later' && <View style={styles.radioDot} />}
                    </View>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={[styles.paymentMethodTitle, { color: theme.textPrimary }]}>Thanh toán khi khởi hành (Trả sau)</Text>
                      <Text style={[styles.paymentMethodSub, { color: theme.textSecondary }]}>Nhân viên sẽ gọi điện xác nhận và thanh toán trực tiếp</Text>
                    </View>
                  </View>
                </Pressable>

                {/* Tóm tắt chi phí đơn đặt */}
                <View style={[styles.priceSummaryBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderColor: theme.border }]}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Đơn giá tour:</Text>
                    <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>2.500.000đ / khách</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Số khách:</Text>
                    <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{guestCount} người</Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabelBold, { color: theme.textPrimary }]}>Tổng thanh toán:</Text>
                    <Text style={[styles.summaryValueBold, { color: '#3b82f6' }]}>{(guestCount * 2500000).toLocaleString('vi-VN')}đ</Text>
                  </View>
                </View>

                <View style={{ height: 24 }} />
              </ScrollView>
            )}

            {!bookingSuccess && (
              <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setBookingModalVisible(false)}>
                  <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Hủy bỏ</Text>
                </Pressable>
                <Pressable 
                  style={styles.modalSubmitBtn} 
                  onPress={() => {
                    if (!guestName.trim() || !guestPhone.trim()) {
                      Alert.alert('Thiếu thông tin', 'Vui lòng điền họ tên và số điện thoại liên hệ!');
                      return;
                    }
                    const totalAmount = guestCount * 2500000;
                    if (paymentMethod === 'wallet' && totalAmount > walletBalance) {
                      Alert.alert('Số dư không đủ', 'Số dư ví Vivu360 của bạn không đủ để thực hiện thanh toán. Vui lòng nạp thêm tiền hoặc đổi phương thức thanh toán!');
                      return;
                    }
                    if (paymentMethod === 'wallet') {
                      setWalletBalance(prev => prev - totalAmount);
                    }
                    const ticketCode = `VV360-HL${Math.floor(1000 + Math.random() * 9000)}`;
                    setGeneratedTicketCode(ticketCode);
                    if (onBookSuccess) {
                      onBookSuccess({
                        code: ticketCode,
                        title: tour.title,
                        region: tour.region,
                        date: travelDate,
                        guests: guestCount,
                        price: `${totalAmount.toLocaleString('vi-VN')}đ`,
                        status: paymentMethod === 'wallet' ? 'Đã thanh toán (Ví)' : paymentMethod === 'vietqr' ? 'Chờ thanh toán (QR)' : 'Chờ xác nhận'
                      });
                    }
                    setBookingSuccess(true);
                  }}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#1d4ed8']}
                    style={styles.modalSubmitGradient}
                  >
                    <Text style={styles.modalSubmitText}>Xác nhận đặt tour</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  panoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  panoImage: {
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0
  },
  panoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  // Hotspot Styles
  hotspotPill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  hotspotGlowOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
  },
  hotspotInnerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotspotTextTag: {
    marginLeft: 6,
    marginRight: 4
  },
  hotspotText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800'
  },

  // Header Overlays
  headerBar: {
    position: 'absolute',
    top: 45,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircleBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa'
  },
  tourTitleHeader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    height: 40,
  },
  headerTourTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900'
  },
  headerTourSub: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },

  // Sensor Indicator Panel
  compassOverlayPanel: {
    position: 'absolute',
    top: 105,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 99
  },
  sensorText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    fontFamily: 'monospace'
  },



  // Pop up Card Info details
  popupCardOuter: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 210,
    zIndex: 101,
  },
  popupCardInner: {
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  popupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  popupTitleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900'
  },
  popupCloseBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCloseText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800'
  },
  popupDescText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16
  },
  popupAudioLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 6,
    marginTop: 12
  },
  popupAudioLinkText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800'
  },

  // Viewpoint bottom tray
  bottomSelectorBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(10, 10, 12, 0.85)',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 12,
    zIndex: 98,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  selectSpotTitle: {
    color: '#60a5fa',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8
  },
  spotsScrollRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12
  },
  spotThumbnailPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spotThumbnailPillActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa'
  },
  spotAddPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    borderStyle: 'dashed'
  },
  spotAddText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '900'
  },
  spotThumbText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800'
  },
  spotThumbTextActive: {
    color: '#fff'
  },

  // Modal styling (matching MapScreen for consistency)
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

  // Quick booking row inside bottom bar
  quickBookingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 10,
  },
  tourBookingRegion: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600'
  },
  tourBookingPrice: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2
  },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  bookNowBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900'
  },

  // VR Mode Split-Screen layout styles
  vrSplitWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000'
  },
  vrEyeFrame: {
    flex: 1,
    height: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  vrDivider: {
    width: 2,
    height: '100%',
    backgroundColor: '#3b82f6',
    opacity: 0.8
  },
  vrFishEyeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 20,
    borderRadius: 250,
    borderColor: '#000',
    opacity: 0.95
  },
  vrEyeLabel: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace'
  },
  exitVrBtnFloat: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  exitVrText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900'
  },
  spinningIcon: {
    // Rotating effect animation placeholder
  },
  bookingModalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.2,
    height: '82%',
    paddingBottom: 24,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 18,
    fontWeight: '800',
  },
  counterValueText: {
    fontSize: 16,
    fontWeight: '900',
    minWidth: 24,
    textAlign: 'center',
  },
  counterUnitText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  successBadgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  successTitleText: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  successSubText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  successReceiptCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  receiptValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  paymentMethodCard: {
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  paymentMethodRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#3b82f6',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  paymentMethodTitle: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  paymentMethodSub: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  priceSummaryBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 4,
  },
  summaryLabelBold: {
    fontSize: 12.5,
    fontWeight: '900',
  },
  summaryValueBold: {
    fontSize: 14,
    fontWeight: '900',
  },

  // Tech Overlays Styles
  gyroReticleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 140,
    height: 140,
    marginTop: -70,
    marginLeft: -70,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90,
  },
  gyroReticleRingOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    borderStyle: 'dashed',
  },
  gyroReticleRingInner: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.2,
    borderColor: 'rgba(6, 182, 212, 0.6)',
  },
  gyroReticleHLine: {
    position: 'absolute',
    width: 140,
    height: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.4)',
  },
  gyroReticleVLine: {
    position: 'absolute',
    width: 1,
    height: 140,
    backgroundColor: 'rgba(6, 182, 212, 0.4)',
  },
  gyroReticleLockText: {
    position: 'absolute',
    bottom: 12,
    fontSize: 6,
    color: '#06b6d4',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  gyroTelemetryBox: {
    position: 'absolute',
    top: 105,
    left: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 8,
    width: 120,
    zIndex: 99,
  },
  telemetryHUDHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ledGreenDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
  },
  telemetryHUDTitle: {
    fontSize: 6.2,
    color: '#10b981',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: '900',
  },
  telemetryHUDText: {
    fontSize: 7.2,
    color: '#3b82f6',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: '800',
    marginTop: 2,
  },
  radarWidgetContainer: {
    position: 'absolute',
    bottom: 215,
    left: 16,
    zIndex: 99,
  },
  radarWidgetHeader: {
    marginBottom: 4,
  },
  radarWidgetTitle: {
    fontSize: 6.2,
    fontWeight: '900',
    color: '#06b6d4',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 0.5,
  },
  radarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(9, 9, 11, 0.82)',
    borderWidth: 1.2,
    borderColor: '#06b6d4',
    position: 'relative',
    overflow: 'hidden',
  },
  radarSweepLine: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 1,
    height: 27,
    backgroundColor: 'rgba(6, 182, 212, 0.7)',
    transformOrigin: 'bottom center',
  },
  radarBlipDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  radarCenterDot: {
    position: 'absolute',
    top: 25,
    left: 25,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#06b6d4',
  },
  equalizerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 18,
  },
  equalizerBar: {
    width: 2.2,
    borderRadius: 1,
  },
  targetTelemetryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.8,
    borderTopColor: 'rgba(255,255,255,0.08)',
    marginTop: 8,
    paddingTop: 8,
  },
  targetTelemetryText: {
    fontSize: 7.2,
    color: '#06b6d4',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: '800',
  },
});
