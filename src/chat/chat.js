// Vivu360 Chat Module - Pure Obsidian Messenger Dark Mode (Updated 2026-08-13T22:57:25)
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Dimensions,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loadAppData, saveAppData } from '../services/appDataService';
import { searchFriends } from '../services/userService';
import {
  addChatMembers,
  createChatGroup,
  getChatGroups,
  getChatMessages,
  removeChatMember,
  renameChatGroup,
  sendChatMessage,
  markMessagesAsRead,
  updateChatGroup,
  createGroupPoll,
  voteGroupPoll,
  closeGroupPoll,
  editChatMessage,
} from '../services/chatService';
import { fetchGoogleWeatherForecast } from '../services/googleWeatherService';
import {
  X,
  Plus,
  Users,
  Sparkles,
  Send,
  MessageCircle,
  Award,
  Smile,
  Info,
  Paperclip,
  Camera,
  CheckCheck,
  ChevronLeft,
  CalendarDays,
  Wallet,
  Settings2,
  Crown,
  ShieldCheck,
  UserPlus,
  Trash2,
  Route,
  CloudSun,
  Coins,
  ArrowLeftRight,
  Search,
  MapPinned,
  LogOut,
  RefreshCw,
  Minus,
  Clock,
  Calculator,
  Filter,
  FileText,
  ShoppingBag,
  Phone,
  Video,
} from 'lucide-react-native';

import { UserProfileModal } from '../social/userProfile';
import { DirectChatScreen } from './directChat';
import { GroupChatTab } from './groupChatTab';
import { GroupScheduleTab } from './groupScheduleTab';
import { GroupFundTab } from './groupFundTab';
import { ThuTienModal } from './thuTienModal';
import { ChiTienModal } from './chiTienModal';
import { AIPlanningModal } from './aiPlanningModal';
import { EditActivityModal } from './editActivityModal';
import { SplitBillModal } from './splitBillModal';
import { GroupSettingsModal } from './groupSettingsModal';
import { DirectChatSettingsModal } from './directChatSettingsModal';

const { height } = Dimensions.get('window');

const GROUP_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=300&q=80',
];

const QUICK_REPLIES = [
  'Chào mọi người! 👋',
  'Lịch trình này ổn đó, mình đi được.',
  'Ai chốt ngân sách giúp mình với nhé.',
  'Cho mình xin địa chỉ map luôn nha.',
  'Mình mang thêm áo mưa dự phòng.',
  'Để mình lên trưởng nhóm chi tiết ngày đầu.',
];

const WORKSPACE_TABS = [
  { key: 'chat', label: 'Chat', Icon: MessageCircle },
  { key: 'planner', label: 'Lịch trình', Icon: CalendarDays },
  { key: 'fund', label: 'Quỹ du lịch', Icon: Wallet },
];

const TRAVEL_DESTINATIONS = [
  {
    id: 'ha-long',
    name: 'Hạ Long',
    region: 'Quảng Ninh',
    climateKey: 'coastal',
    image: 'https://images.unsplash.com/photo-1524230507669-e297d477b24d?auto=format&fit=crop&w=600&q=80',
    keywords: ['hạ long', 'quảng ninh', 'vịnh', 'biển'],
    intro: 'Hợp với nhóm thích cảnh biển, du thuyền và lịch trình thư giãn nhiều ảnh đẹp.',
    highlights: ['Du thuyền Vịnh Hạ Long', 'Hang Sửng Sốt', 'Bảo tàng Quảng Ninh', 'Chợ đêm Bãi Cháy'],
    mapStops: ['Bến tàu Tuần Châu, Hạ Long', 'Bảo tàng Quảng Ninh, Hạ Long', 'Chợ đêm Hạ Long, Quảng Ninh'],
    coordinates: { latitude: 20.9101, longitude: 107.1839 },
    packingCore: ['CCCD', 'giày đi bộ', 'pin dự phòng', 'thuốc cá nhân'],
    packingSunny: ['kem chống nắng', 'kính râm', 'mũ rộng vành'],
    packingRainy: ['áo mưa mỏng', 'túi chống nước cho điện thoại'],
    activities: {
      sunny: ['Du thuyền qua các điểm ngắm vịnh', 'Chèo kayak hoặc chèo SUP nhẹ', 'Tắm biển và check-in Bãi Cháy'],
      cloudy: ['Dạo cầu Bãi Cháy và khu Hòn Gai', 'Thưởng thức cafe view vịnh', 'Khám phá phố biển và điểm chụp ảnh'],
      rainy: ['Tham quan Bảo tàng Quảng Ninh', 'Ăn hải sản trong khu nhà hàng kín', 'Nghỉ ngơi spa hoặc cafe ngắm mưa'],
      evening: ['Ăn tối hải sản', 'Dạo chợ đêm', 'Họp nhóm chốt lịch sáng hôm sau'],
    },
  },
  {
    id: 'sapa',
    name: 'Sa Pa',
    region: 'Lào Cai',
    climateKey: 'mountain',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=600&q=80',
    keywords: ['sa pa', 'sapa', 'lào cai', 'săn mây', 'fansipan'],
    intro: 'Phù hợp nhóm thích khí hậu mát, trekking nhẹ và ngắm mây, ruộng bậc thang.',
    highlights: ['Fansipan', 'Bản Cát Cát', 'Nhà thờ đá', 'Ô Quy Hồ'],
    mapStops: ['Sun World Fansipan Legend, Sa Pa', 'Bản Cát Cát, Sa Pa', 'Ô Quy Hồ, Sa Pa'],
    coordinates: { latitude: 22.3364, longitude: 103.8438 },
    packingCore: ['CCCD', 'giày bám tốt', 'thuốc cảm lạnh', 'pin dự phòng'],
    packingSunny: ['kem chống nắng', 'áo khoác mỏng', 'kính râm'],
    packingRainy: ['áo mưa', 'bao chống nước', 'tất khô dự phòng'],
    activities: {
      sunny: ['Đi cáp treo Fansipan buổi sáng', 'Dạo bản Cát Cát và chụp ảnh', 'Ngắm hoàng hôn ở Ô Quy Hồ'],
      cloudy: ['Dạo thị trấn Sa Pa', 'Cafe ngắm mây và mua đồ len', 'Check-in Nhà thờ đá'],
      rainy: ['Khám phá quán cafe ấm', 'Ăn đồ nướng và lẩu cá hồi', 'Nghỉ ngơi sớm để giữ sức cho hôm sau'],
      evening: ['Dạo chợ đêm', 'Ăn lẩu cá tầm', 'Sắp xếp balo và đồ ấm'],
    },
  },
  {
    id: 'hoi-an',
    name: 'Hội An',
    region: 'Quảng Nam',
    climateKey: 'heritage',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80',
    keywords: ['hội an', 'quảng nam', 'đèn lồng', 'phố cổ'],
    intro: 'Rất hợp cho nhóm thích đi chậm, chụp ảnh phố cổ và ăn uống nhẹ nhàng.',
    highlights: ['Phố cổ Hội An', 'Chùa Cầu', 'Rừng dừa Bảy Mẫu', 'Biển An Bàng'],
    mapStops: ['Chùa Cầu, Hội An', 'Rừng dừa Bảy Mẫu, Hội An', 'Biển An Bàng, Hội An'],
    coordinates: { latitude: 15.8801, longitude: 108.338 },
    packingCore: ['CCCD', 'giày êm chân', 'sạc dự phòng', 'ô gấp'],
    packingSunny: ['nón', 'kem chống nắng', 'bình nước cá nhân'],
    packingRainy: ['áo mưa gọn nhẹ', 'dép chống trơn'],
    activities: {
      sunny: ['Dạo phố cổ từ sớm để chụp ảnh', 'Đi thuyền hoặc trải nghiệm rừng dừa', 'Ra biển An Bàng nghỉ chiều'],
      cloudy: ['Khám phá tiệm cafe và nhà cổ', 'Mua đồ lưu niệm thủ công', 'Ăn đặc sản cao lầu và cơm gà'],
      rainy: ['Tham quan nhà cổ trong phố', 'Ngồi cafe ngắm mưa ở bờ sông', 'Ưu tiên lịch gần trung tâm'],
      evening: ['Thả đèn hoa đăng', 'Dạo phố đèn lồng', 'Ăn tối và nghe nhạc acoustic'],
    },
  },
  {
    id: 'da-nang',
    name: 'Đà Nẵng',
    region: 'Đà Nẵng',
    climateKey: 'coastal',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
    keywords: ['đà nẵng', 'cầu rồng', 'mỹ khê', 'bà nà'],
    intro: 'Nhóm thích city break có biển, cầu đẹp và đi lại thuận tiện sẽ hợp Đà Nẵng.',
    highlights: ['Biển Mỹ Khê', 'Cầu Rồng', 'Bà Nà Hills', 'Sơn Trà'],
    mapStops: ['Biển Mỹ Khê, Đà Nẵng', 'Cầu Rồng, Đà Nẵng', 'Bà Nà Hills, Đà Nẵng'],
    coordinates: { latitude: 16.0544, longitude: 108.2022 },
    packingCore: ['CCCD', 'giày thoải mái', 'kem chống nắng', 'pin dự phòng'],
    packingSunny: ['đồ bơi', 'kính râm', 'áo chống nắng'],
    packingRainy: ['ô gấp', 'áo mưa', 'túi chống ẩm'],
    activities: {
      sunny: ['Tắm biển Mỹ Khê buổi sáng', 'Tham quan Sơn Trà hoặc Bà Nà', 'Ngắm thành phố từ cầu Rồng hoặc cầu Tình Yêu'],
      cloudy: ['Cafe ven biển', 'Khám phá food tour nội thành', 'Check-in bảo tàng hoặc trung tâm thành phố'],
      rainy: ['Đi ăn đặc sản trong khu nội thành', 'Xem lịch điểm trong nhà và cafe chill', 'Lùi hoạt động biển sang sáng hôm sau'],
      evening: ['Ăn tối hải sản', 'Dạo cầu Rồng', 'Chốt ảnh và kế hoạch nhóm'],
    },
  },
  {
    id: 'phu-quoc',
    name: 'Phú Quốc',
    region: 'Kiên Giang',
    climateKey: 'island',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80',
    keywords: ['phú quốc', 'kiên giang', 'đảo', 'hòn thơm', 'bãi sao'],
    intro: 'Rất hợp cho nhóm đi nghỉ dưỡng, tắm biển, cano đảo và hoạt động buổi chiều tối.',
    highlights: ['Bãi Sao', 'Hòn Thơm', 'Sunset Town', 'Chợ đêm Dương Đông'],
    mapStops: ['Bãi Sao, Phú Quốc', 'Cáp treo Hòn Thơm, Phú Quốc', 'Chợ đêm Dương Đông, Phú Quốc'],
    coordinates: { latitude: 10.2899, longitude: 103.984 },
    packingCore: ['CCCD', 'đồ bơi', 'sạc dự phòng', 'thuốc say tàu xe'],
    packingSunny: ['kem chống nắng SPF cao', 'kính râm', 'mũ có dây giữ'],
    packingRainy: ['áo mưa mỏng', 'bao chống nước cho ví và điện thoại'],
    activities: {
      sunny: ['Tắm biển Bãi Sao buổi sáng', 'Đi cano hoặc cáp treo Hòn Thơm', 'Chụp hoàng hôn Sunset Town'],
      cloudy: ['Khám phá cafe và cảng An Thới', 'Đi chợ địa phương ăn hải sản', 'Đi dạo nhẹ ở Sunset Town'],
      rainy: ['Ưu tiên lịch gần khách sạn', 'Ăn uống và nghỉ dưỡng trong nhà', 'Dời hoạt động tàu ra ngày ít mưa hơn'],
      evening: ['Dạo chợ đêm Dương Đông', 'Ăn tối hải sản', 'Họp quỹ chuyến đi cho ngày tiếp theo'],
    },
  },
  {
    id: 'da-lat',
    name: 'Đà Lạt',
    region: 'Lâm Đồng',
    climateKey: 'highland',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
    keywords: ['đà lạt', 'lâm đồng', 'cao nguyên', 'săn mây', 'hồ xuân hương'],
    intro: 'Hợp nhóm thích không khí se lạnh, cafe đẹp, chợ đêm và lịch trình nhẹ.',
    highlights: ['Hồ Xuân Hương', 'Đồi chè Cầu Đất', 'Chợ đêm Đà Lạt', 'Thung lũng đèn'],
    mapStops: ['Hồ Xuân Hương, Đà Lạt', 'Đồi chè Cầu Đất, Đà Lạt', 'Chợ đêm Đà Lạt'],
    coordinates: { latitude: 11.9404, longitude: 108.4583 },
    packingCore: ['CCCD', 'áo khoác ấm', 'giày đi bộ', 'thuốc cá nhân'],
    packingSunny: ['kem chống nắng', 'mũ lưỡi trai', 'chai nước'],
    packingRainy: ['ô gấp', 'áo mưa mỏng', 'tất dự phòng'],
    activities: {
      sunny: ['Săn mây sớm ở đồi cao', 'Dạo Hồ Xuân Hương và cafe', 'Check-in vườn hoa hoặc đồi chè'],
      cloudy: ['Đi cafe trong trung tâm', 'Mua đặc sản và tham quan nhà ga', 'Dạo chợ Đà Lạt'],
      rainy: ['Ưu tiên lịch trong nhà', 'Cafe, bánh nóng và nghỉ ngơi', 'Sắp xếp thời gian di chuyển ngắn'],
      evening: ['Đi chợ đêm', 'Ăn lẩu gà lá é', 'Chốt đồ dùng mang theo cho sáng hôm sau'],
    },
  },
  {
    id: 'ha-noi',
    name: 'Hà Nội',
    region: 'Hà Nội',
    climateKey: 'capital',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    keywords: ['hà nội', 'thủ đô', 'hồ gươm', 'phố cổ'],
    intro: 'Thủ đô ngàn năm văn hiến với phố cổ, nét văn hóa ẩm thực đặc sắc và các di tích lịch sử.',
    highlights: ['Hồ Hoàn Kiếm', 'Lăng Bác', 'Phố Cổ Hà Nội', 'Văn Miếu'],
    mapStops: ['Hồ Hoàn Kiếm, Hà Nội', 'Lăng Chủ tịch Hồ Chí Minh', 'Văn Miếu Quốc Tử Giám'],
    coordinates: { latitude: 21.0285, longitude: 105.8542 },
    packingCore: ['CCCD', 'giày êm', 'sạc dự phòng', 'ô che'],
    packingSunny: ['nón', 'kem chống nắng'],
    packingRainy: ['áo mưa mỏng', 'ô gấp'],
    activities: {
      sunny: ['Dạo Hồ Gươm và phố cổ sáng sớm', 'Tham quan Văn Miếu', 'Thưởng thức cafe trứng Hàng Gai'],
      cloudy: ['Food tour phố cổ Hà Nội', 'Check-in Bảo tàng Lịch sử', 'Mua quà bún chả và cốm'],
      rainy: ['Ngồi cafe phố cổ ngắm mưa', 'Ăn phở nóng và dạo trung tâm'],
      evening: ['Dạo phố đi bộ', 'Ăn bún chả / phở', 'Trà đá vỉa hè phố cổ'],
    },
  },
  {
    id: 'ninh-binh',
    name: 'Ninh Bình',
    region: 'Ninh Bình',
    climateKey: 'heritage',
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=600&q=80',
    keywords: ['ninh bình', 'tràng an', 'tam cốc', 'bái đính', 'hang múa'],
    intro: 'Cố đô Hoa Lư với danh thắng Tràng An, núi non trùng điệp và sông nước hữu tình.',
    highlights: ['Tràng An', 'Hang Múa', 'Chùa Bái Đính', 'Tam Cốc - Bích Động'],
    mapStops: ['Danh thắng Tràng An', 'Hang Múa, Ninh Bình', 'Chùa Bái Đính'],
    coordinates: { latitude: 20.2506, longitude: 105.9744 },
    packingCore: ['CCCD', 'giày thể thao', 'nón lá/mũ', 'nước uống'],
    packingSunny: ['kem chống nắng', 'kính mát'],
    packingRainy: ['áo mưa gọn', 'túi chống nước'],
    activities: {
      sunny: ['Đi thuyền Tràng An / Tam Cốc', 'Leo đỉnh Hang Múa ngắm toàn cảnh', 'Bái Phật chùa Bái Đính'],
      cloudy: ['Tham quan Cố đô Hoa Lư', 'Dạo đầm Vân Long', 'Thưởng thức thịt dê nướng'],
      rainy: ['Nghỉ ngơi resort núi', 'Ăn cơm cháy thịt dê nóng hổi'],
      evening: ['Dạo phố cổ Hoa Lư đêm', 'Ăn tối đặc sản dê núi'],
    },
  },
  {
    id: 'hue',
    name: 'Huế',
    region: 'Thừa Thiên Huế',
    climateKey: 'heritage',
    image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=600&q=80',
    keywords: ['huế', 'cố đô', 'sông hương', 'đại nội', 'chùa thiên mụ'],
    intro: 'Mảnh đất Cố đô thơ mộng với Đại Nội cổ kính, lăng tẩm triều Nguyễn và nhã nhạc cung đình.',
    highlights: ['Đại Nội Huế', 'Chùa Thiên Mụ', 'Lăng Khải Định', 'Sông Hương'],
    mapStops: ['Đại Nội Huế', 'Chùa Thiên Mụ, Huế', 'Lăng Khải Định, Huế'],
    coordinates: { latitude: 16.4637, longitude: 107.5908 },
    packingCore: ['CCCD', 'giày đi bộ', 'ô du lịch', 'mũ nón'],
    packingSunny: ['kem chống nắng', 'áo khoác mỏng'],
    packingRainy: ['áo mưa', 'ô màu trầm'],
    activities: {
      sunny: ['Tham quan Đại Nội Huế', 'Ngắm cảnh chùa Thiên Mụ', 'Viếng Lăng Khải Định'],
      cloudy: ['Thưởng thức bún bò Huế và bánh nậm', 'Dạo chợ Đông Ba', 'Ngồi cafe ngắm sông Hương'],
      rainy: ['Nghe Ca Huế trên Sông Hương', 'Ăn chè hẻm Huế ấm cúng'],
      evening: ['Đi thuyền nghe ca Huế', 'Dạo cầu Tràng Tiền ngắm đèn nghệ thuật'],
    },
  },
  {
    id: 'ha-giang',
    name: 'Hà Giang',
    region: 'Hà Giang',
    climateKey: 'mountain',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=600&q=80',
    keywords: ['hà giang', 'mã pí lèng', 'đồng văn', 'lũng cú', 'sông nho quế'],
    intro: 'Vùng cao nguyên đá hùng vĩ với đèo Mã Pí Lèng, hẻm Tu Sản và sông Nho Quế xanh ngọc.',
    highlights: ['Mã Pí Lèng', 'Sông Nho Quế', 'Cột cờ Lũng Cú', 'Dinh họ Vương'],
    mapStops: ['Đèo Mã Pí Lèng, Hà Giang', 'Sông Nho Quế', 'Cột cờ Lũng Cú'],
    coordinates: { latitude: 22.8233, longitude: 104.9836 },
    packingCore: ['CCCD', 'giày leo núi', 'áo khoác ấm', 'găng tay xe máy'],
    packingSunny: ['kính râm', 'kem chống nắng'],
    packingRainy: ['áo mưa bộ', 'túi chống nước'],
    activities: {
      sunny: ['Chinh phục đèo Mã Pí Lèng', 'Đi thuyền trên sông Nho Quế', 'Check-in Cột cờ Lũng Cú'],
      cloudy: ['Tham quan Phố cổ Đồng Văn', 'Ghé Dinh Vua Mèo', 'Ngắm hoa tam giác mạch'],
      rainy: ['Thưởng thức thắng cố và rượu ngô', 'Sưởi ấm bên bếp lửa nhà sàn'],
      evening: ['Dạo phố cổ Đồng Văn', 'Ăn lẩu gà đen', 'Thưởng thức trà Shan Tuyết'],
    },
  },
  {
    id: 'ho-chi-minh',
    name: 'TP. Hồ Chí Minh',
    region: 'TP. Hồ Chí Minh',
    climateKey: 'metropolis',
    image: 'https://images.unsplash.com/photo-1509060464153-4466739f78ad?auto=format&fit=crop&w=600&q=80',
    keywords: ['hồ chí minh', 'sài gòn', 'bến thành', 'bưu điện trung tâm', 'dinh độc lập'],
    intro: 'Đô thị sầm uất bậc nhất với sự giao thoa văn hóa, ẩm thực phong phú và nhịp sống hiện đại.',
    highlights: ['Chợ Bến Thành', 'Dinh Độc Lập', 'Bưu điện Trung tâm', 'Phố đi bộ Nguyễn Huệ'],
    mapStops: ['Chợ Bến Thành, TP.HCM', 'Dinh Độc Lập', 'Phố đi bộ Nguyễn Huệ'],
    coordinates: { latitude: 10.8231, longitude: 106.6297 },
    packingCore: ['CCCD', 'giày nhẹ', 'sạc dự phòng', 'ô gấp'],
    packingSunny: ['kem chống nắng', 'kính râm'],
    packingRainy: ['áo mưa mỏng'],
    activities: {
      sunny: ['Dạo Dinh Độc Lập và Nhà thờ Đức Bà', 'Check-in Bưu điện trung tâm', 'Ngắm phố Nguyễn Huệ'],
      cloudy: ['Thưởng thức cơm tấm & hủ tiếu', 'Cafe chung cư 42 Nguyễn Huệ', 'Mua sắm tại Chợ Bến Thành'],
      rainy: ['Ngồi cafe ngắm phố Sài Gòn', 'Ăn lẩu và thưởng thức ẩm thực trong nhà'],
      evening: ['Đi xe buýt 2 tầng ngắm phố', 'Dạo Phố Bùi Viện / Nguyễn Huệ'],
    },
  },
];

const defaultVivuGroups = [];

const sanitizeGroups = (items) => (
  Array.isArray(items) ? items : []
);

const getUserAvatarByName = (name) => {
  const safeName = String(name || '');
  if (!safeName) return 'https://i.pravatar.cc/150?img=11';

  let hash = 0;
  for (let i = 0; i < safeName.length; i += 1) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const imgIndex = Math.abs(hash % 70) + 1;
  return `https://i.pravatar.cc/150?img=${imgIndex}`;
};

const getUserLevelByName = (name) => {
  const safeName = String(name || '');
  let hash = 0;
  for (let i = 0; i < safeName.length; i += 1) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return `Cấp ${Math.abs(hash % 12) + 3}`;
};

const getFormattedMsgTime = (msgId) => {
  if (!msgId || msgId < 10000000000) return '10:24';

  try {
    const date = new Date(msgId);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch (error) {
    return 'Vừa xong';
  }
};

const getUserRankColors = (name) => {
  const level = getUserLevelByName(name);
  const levelNum = parseInt(level.replace(/[^0-9]/g, ''), 10) || 1;

  if (levelNum >= 12) {
    return {
      colors: ['#eab308', '#ca8a04'],
      textColor: '#ffffff',
      iconColor: '#fef08a',
    };
  }

  if (levelNum >= 8) {
    return {
      colors: ['#94a3b8', '#475569'],
      textColor: '#ffffff',
      iconColor: '#cbd5e1',
    };
  }

  return {
    colors: ['#b45309', '#78350f'],
    textColor: '#ffffff',
    iconColor: '#fed7aa',
  };
};

const getTagColors = (tag, isDarkMode) => {
  const cleanTag = String(tag || '').trim().toLowerCase();

  if (cleanTag.includes('sa pa') || cleanTag.includes('sapa') || cleanTag.includes('phượt')) {
    return {
      bg: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      border: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.15)',
      text: '#ef4444',
    };
  }

  if (cleanTag.includes('ẩm thực') || cleanTag.includes('khách sạn') || cleanTag.includes('homestay')) {
    return {
      bg: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
      border: isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.15)',
      text: '#f59e0b',
    };
  }

  if (cleanTag.includes('đà nẵng') || cleanTag.includes('hội an') || cleanTag.includes('kết bạn') || cleanTag.includes('ghép xe')) {
    return {
      bg: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      border: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)',
      text: '#10b981',
    };
  }

  return {
    bg: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.06)',
    border: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)',
    text: '#3b82f6',
  };
};

const padNumber = (value) => String(value).padStart(2, '0');

const formatDateToIso = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
};

const parseIsoDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;

  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const getTodayIso = () => formatDateToIso(new Date());

const shiftIsoDate = (isoDate, days) => {
  const baseDate = parseIsoDate(isoDate) || new Date();
  baseDate.setDate(baseDate.getDate() + days);
  return formatDateToIso(baseDate);
};

const clampTripDays = (value) => {
  const days = Number.parseInt(value, 10);
  if (Number.isNaN(days)) return 0;
  return Math.max(1, Math.min(10, days));
};

const getInclusiveDayCount = (startDate, endDate) => {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) return 0;

  const diff = end.getTime() - start.getTime();
  if (diff < 0) return 0;

  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
};

const buildDateList = (startDate, endDate) => {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end || end < start) return [];

  const dates = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    dates.push(formatDateToIso(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};

const formatShortDate = (isoDate) => {
  const date = parseIsoDate(isoDate);
  if (!date) return isoDate || '--';
  return `${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}`;
};

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const buildMemberId = (value) => {
  const normalized = normalizeText(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return normalized || `member-${Date.now()}`;
};

const formatMoney = (amount) => {
  const safeAmount = Number(amount) || 0;

  try {
    return `${safeAmount.toLocaleString('vi-VN')} đ`;
  } catch (error) {
    return `${safeAmount} đ`;
  }
};

const parseMoneyInput = (value) => {
  const onlyNumbers = String(value || '').replace(/[^\d]/g, '');
  return onlyNumbers ? Number(onlyNumbers) : 0;
};

const getCurrentUserMemberId = (currentUser, ownerId) =>
  ownerId || currentUser?.email || currentUser?.name || 'current-user';

const createMember = (rawMember) => {
  const displayName = rawMember?.name || rawMember?.email || 'Thành viên';
  return {
    id: rawMember?.firebaseUid || rawMember?.id || rawMember?.email || buildMemberId(displayName),
    name: displayName,
    avatar: rawMember?.avatar || getUserAvatarByName(displayName),
    email: rawMember?.email || '',
    phone: rawMember?.phone || '',
    joinedAt: rawMember?.joinedAt || Date.now(),
  };
};

const dedupeMembers = (members) => {
  const memberMap = new Map();

  members.forEach((member) => {
    const normalizedMember = createMember(member);
    if (!memberMap.has(normalizedMember.id)) {
      memberMap.set(normalizedMember.id, normalizedMember);
    }
  });

  return Array.from(memberMap.values());
};

const scoreDestinationMatch = (group, destination) => {
  const haystack = normalizeText(`${group?.name || ''} ${group?.tag || ''}`);
  let score = 0;

  destination.keywords.forEach((keyword) => {
    if (haystack.includes(normalizeText(keyword))) {
      score += 4;
    }
  });

  if (haystack.includes(normalizeText(destination.name))) score += 8;
  if (haystack.includes(normalizeText(destination.region))) score += 6;

  return score;
};

const getSortedDestinations = (group) =>
  [...TRAVEL_DESTINATIONS].sort((left, right) => scoreDestinationMatch(group, right) - scoreDestinationMatch(group, left));

const getWeatherBucket = (weatherType) => {
  const normalizedType = String(weatherType || '').toUpperCase();

  if (normalizedType.includes('RAIN') || normalizedType.includes('SHOWER') || normalizedType.includes('THUNDER')) {
    return 'rainy';
  }

  if (normalizedType.includes('CLOUD')) {
    return 'cloudy';
  }

  return 'sunny';
};

const buildGoogleMapsDirectionsUrl = (destinationQuery) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`;

const buildGoogleWeatherUrl = (destination) =>
  `https://www.google.com/search?q=${encodeURIComponent(`thời tiết ${destination.name} ${destination.region}`)}`;

const getClimatePattern = (climateKey) => {
  switch (climateKey) {
    case 'mountain':
      return [
        { weatherType: 'PARTLY_CLOUDY', iconText: '⛅', description: 'Mây gián đoạn, trời mát', minTemp: 17, maxTemp: 24, humidity: 78, rainChance: 24, uvIndex: 5, windKph: 9 },
        { weatherType: 'SCATTERED_SHOWERS', iconText: '🌦️', description: 'Có mưa rải rác vào chiều', minTemp: 16, maxTemp: 22, humidity: 84, rainChance: 58, uvIndex: 4, windKph: 11 },
        { weatherType: 'MOSTLY_CLEAR', iconText: '🌤️', description: 'Trời quang khá đẹp', minTemp: 18, maxTemp: 25, humidity: 73, rainChance: 15, uvIndex: 6, windKph: 8 },
      ];
    case 'heritage':
      return [
        { weatherType: 'PARTLY_CLOUDY', iconText: '⛅', description: 'Nắng nhẹ, dễ đi bộ', minTemp: 26, maxTemp: 33, humidity: 70, rainChance: 18, uvIndex: 7, windKph: 12 },
        { weatherType: 'LIGHT_RAIN_SHOWERS', iconText: '🌦️', description: 'Mưa ngắn trong ngày', minTemp: 25, maxTemp: 31, humidity: 82, rainChance: 49, uvIndex: 5, windKph: 10 },
        { weatherType: 'CLOUDY', iconText: '☁️', description: 'Trời nhiều mây, mát hơn', minTemp: 25, maxTemp: 30, humidity: 75, rainChance: 26, uvIndex: 4, windKph: 9 },
      ];
    case 'island':
      return [
        { weatherType: 'CLEAR', iconText: '☀️', description: 'Nắng đẹp, biển êm', minTemp: 27, maxTemp: 33, humidity: 74, rainChance: 12, uvIndex: 8, windKph: 16 },
        { weatherType: 'PARTLY_CLOUDY', iconText: '🌤️', description: 'Nắng xen mây, khá dễ chịu', minTemp: 27, maxTemp: 32, humidity: 76, rainChance: 20, uvIndex: 7, windKph: 14 },
        { weatherType: 'RAIN_SHOWERS', iconText: '🌧️', description: 'Mưa rào cục bộ ven biển', minTemp: 26, maxTemp: 30, humidity: 85, rainChance: 62, uvIndex: 4, windKph: 18 },
      ];
    case 'highland':
      return [
        { weatherType: 'MOSTLY_CLOUDY', iconText: '🌥️', description: 'Mây dày, trời se lạnh', minTemp: 18, maxTemp: 25, humidity: 79, rainChance: 28, uvIndex: 5, windKph: 10 },
        { weatherType: 'LIGHT_RAIN_SHOWERS', iconText: '🌦️', description: 'Chiều có thể có mưa nhẹ', minTemp: 17, maxTemp: 23, humidity: 86, rainChance: 54, uvIndex: 4, windKph: 9 },
        { weatherType: 'MOSTLY_CLEAR', iconText: '🌤️', description: 'Sáng khô ráo, chiều dịu mát', minTemp: 18, maxTemp: 26, humidity: 72, rainChance: 16, uvIndex: 6, windKph: 8 },
      ];
    case 'coastal':
    default:
      return [
        { weatherType: 'CLEAR', iconText: '☀️', description: 'Nắng đẹp, thuận tiện di chuyển', minTemp: 27, maxTemp: 33, humidity: 69, rainChance: 14, uvIndex: 8, windKph: 15 },
        { weatherType: 'PARTLY_CLOUDY', iconText: '⛅', description: 'Nắng gián đoạn, khá thoáng', minTemp: 26, maxTemp: 31, humidity: 71, rainChance: 22, uvIndex: 6, windKph: 13 },
        { weatherType: 'SCATTERED_SHOWERS', iconText: '🌦️', description: 'Có mưa rải rác vào chiều', minTemp: 26, maxTemp: 30, humidity: 82, rainChance: 57, uvIndex: 4, windKph: 12 },
      ];
  }
};

const buildFallbackForecast = (destination, dateList) => {
  const pattern = getClimatePattern(destination.climateKey);

  return dateList.map((date, index) => ({
    date,
    ...pattern[index % pattern.length],
  }));
};

const buildPackingList = (destination, forecastItem) => {
  const packingList = [...destination.packingCore];
  const weatherBucket = getWeatherBucket(forecastItem?.weatherType);

  if (weatherBucket === 'rainy') {
    packingList.push(...destination.packingRainy);
  } else {
    packingList.push(...destination.packingSunny);
  }

  if ((forecastItem?.maxTemp || 0) >= 32) {
    packingList.push('nước điện giải', 'khăn thấm mồ hôi');
  }

  if ((forecastItem?.minTemp || 99) <= 19) {
    packingList.push('áo khoác giữ ấm');
  }

  return Array.from(new Set(packingList));
};

const buildItinerarySuggestion = ({ destination, startDate, endDate, forecast, source }) => {
  const dateList = buildDateList(startDate, endDate);
  const normalizedForecast = dateList.map((date, index) => forecast[index] || buildFallbackForecast(destination, [date])[0]);

  const days = dateList.map((date, index) => {
    const forecastItem = normalizedForecast[index];
    const weatherBucket = getWeatherBucket(forecastItem?.weatherType);
    const bucketActivities = destination.activities[weatherBucket] || destination.activities.sunny;
    const morning = bucketActivities[index % bucketActivities.length];
    const afternoon = bucketActivities[(index + 1) % bucketActivities.length];
    const evening = destination.activities.evening[index % destination.activities.evening.length];
    const mapStop = destination.mapStops[index % destination.mapStops.length];

    return {
      id: `${destination.id}-${date}-${index}`,
      date,
      label: `Ngày ${index + 1}`,
      weather: forecastItem,
      routeLabel: mapStop,
      mapUrl: buildGoogleMapsDirectionsUrl(mapStop),
      packing: buildPackingList(destination, forecastItem).slice(0, 8),
      note:
        weatherBucket === 'rainy'
          ? 'Dự báo có mưa, nên ưu tiên quãng đường ngắn và thêm đồ chống nước.'
          : weatherBucket === 'cloudy'
            ? 'Trời nhiều mây, thích hợp đi bộ tham quan và chụp ảnh cả ngày.'
            : 'Thời tiết đẹp, có thể ưu tiên hoạt động ngoài trời và điểm mở.',
      slots: [
        { time: '08:00', period: 'SÁNG', title: 'Hoạt động Sáng (08:00)', text: morning },
        { time: '12:00', period: 'TRƯA', title: 'Ăn trưa & Nghỉ ngơi (12:00)', text: `Thưởng thức ẩm thực đặc sản ${destination.name}` },
        { time: '14:30', period: 'CHIỀU', title: 'Hoạt động Chiều (14:30)', text: afternoon },
        { time: '19:00', period: 'TỐI', title: 'Hoạt động Tối (19:00)', text: evening },
      ],
    };
  });

  return {
    destinationId: destination.id,
    destinationName: destination.name,
    region: destination.region,
    destinationImage: destination.image,
    startDate,
    endDate,
    daysCount: dateList.length,
    forecastSource: source,
    generatedAt: Date.now(),
    weatherUrl: buildGoogleWeatherUrl(destination),
    destinationMapUrl: buildGoogleMapsDirectionsUrl(`${destination.name}, ${destination.region}`),
    highlights: destination.highlights,
    summary: destination.intro,
    packingList: Array.from(new Set(days.flatMap((day) => day.packing))).slice(0, 12),
    forecast: normalizedForecast,
    days,
  };
};

const normalizeFund = (fund) => ({
  goal: parseMoneyInput(fund?.goal),
  contributions: Array.isArray(fund?.contributions) ? fund.contributions : [],
  expenses: Array.isArray(fund?.expenses) ? fund.expenses : [],
});

const normalizeItinerary = (itinerary, fallbackDestinationId) => {
  const startDate = itinerary?.startDate || getTodayIso();
  const fallbackEndDate = shiftIsoDate(startDate, 2);
  const endDate = itinerary?.endDate || fallbackEndDate;
  const inferredDays = getInclusiveDayCount(startDate, endDate) || clampTripDays(itinerary?.daysCount || 3) || 3;

  return {
    destinationId: itinerary?.destinationId || fallbackDestinationId,
    destinationName: itinerary?.destinationName || '',
    region: itinerary?.region || '',
    destinationImage: itinerary?.destinationImage || '',
    startDate,
    endDate,
    daysCount: inferredDays,
    forecastSource: itinerary?.forecastSource || '',
    generatedAt: itinerary?.generatedAt || null,
    weatherUrl: itinerary?.weatherUrl || '',
    destinationMapUrl: itinerary?.destinationMapUrl || '',
    highlights: Array.isArray(itinerary?.highlights) ? itinerary.highlights : [],
    summary: itinerary?.summary || '',
    packingList: Array.isArray(itinerary?.packingList) ? itinerary.packingList : [],
    forecast: Array.isArray(itinerary?.forecast) ? itinerary.forecast : [],
    days: Array.isArray(itinerary?.days) ? itinerary.days : [],
  };
};

const normalizeGroup = (group, currentUser, ownerId) => {
  const currentMember = createMember({
    id: getCurrentUserMemberId(currentUser, ownerId),
    name: currentUser?.name || 'Bạn',
    avatar: currentUser?.avatar,
    email: currentUser?.email,
    phone: currentUser?.phone,
  });

  let membersList = Array.isArray(group?.membersList) && group.membersList.length
    ? group.membersList.map(createMember)
    : [currentMember];

  membersList = dedupeMembers([currentMember, ...membersList]);

  const creatorId = membersList.some((member) => member.id === group?.creatorId)
    ? group.creatorId
    : currentMember.id;

  const leaderId = membersList.some((member) => member.id === group?.leaderId)
    ? group.leaderId
    : creatorId;

  const deputyIds = Array.isArray(group?.deputyIds)
    ? Array.from(new Set(group.deputyIds.filter((id) => id !== leaderId && membersList.some((member) => member.id === id))))
    : [];

  const fallbackDestination = getSortedDestinations(group)[0] || TRAVEL_DESTINATIONS[0];

  return {
    id: group?.id || Date.now(),
    name: group?.name || 'Nhóm du lịch mới',
    tag: group?.tag || 'Du lịch',
    image: group?.image || GROUP_IMAGES[0],
    lastMessage: group?.lastMessage || 'Hệ thống: Nhóm vừa được tạo.',
    messages: Array.isArray(group?.messages) ? group.messages : [],
    membersList,
    members: membersList.length,
    creatorId,
    leaderId,
    deputyIds,
    itinerary: normalizeItinerary(group?.itinerary, fallbackDestination.id),
    fund: normalizeFund(group?.fund),
    isDirect: !!group?.isDirect,
  };
};

const buildDefaultGroups = (currentUser, ownerId) => sanitizeGroups(defaultVivuGroups).map((group) => normalizeGroup(group, currentUser, ownerId));

const normalizeApiMessage = (message, currentUser, ownerId, membersList = []) => {
  const groupMember = membersList.find(member => String(member.id) === String(message.senderId));
  const senderProfile = String(message.senderId) === String(ownerId)
    ? { ...message.sender, ...groupMember, name: currentUser?.name || groupMember?.name || message.sender?.name, avatar: currentUser?.avatar || groupMember?.avatar || message.sender?.avatar }
    : { ...message.sender, ...groupMember };

  return {
    id: message._id || message.id,
    senderId: message.senderId,
    user: senderProfile.name || 'Thành viên Vivu360',
    avatar: senderProfile.avatar || '',
    text: message.content || '',
    createdAt: message.createdAt,
    readBy: message.readBy || [],
  };
};

const normalizeApiGroup = (group, currentUser, ownerId) => {
  const membersRaw = group.memberProfiles && group.memberProfiles.length > 0
    ? group.memberProfiles
    : (group.members || []).map(id => typeof id === 'object' ? id : ({
        firebaseUid: id,
        id: id,
        name: id === ownerId ? (currentUser?.name || 'Bạn') : `Thành viên (${String(id).slice(0, 5)})`,
        avatar: getUserAvatarByName(id),
      }));

  const otherMember = membersRaw.find(m => (m.firebaseUid || m.id) !== ownerId);
  const groupName = group.isDirect && otherMember ? otherMember.name : group.name;
  const groupAvatar = group.isDirect && otherMember ? (otherMember.avatar || getUserAvatarByName(otherMember.name)) : (group.avatar || GROUP_IMAGES[0]);
  
  const initialMsgs = [];
  if (group.lastMessage && group.lastMessage.content) {
    initialMsgs.push(normalizeApiMessage(group.lastMessage, currentUser, ownerId, membersRaw));
  }

  return normalizeGroup({
    id: group._id || group.id,
    name: groupName,
    image: groupAvatar,
    tag: group.isDirect ? 'Cá nhân' : 'Du lịch',
    creatorId: group.ownerId,
    leaderId: group.ownerId,
    deputyIds: (group.admins || []).filter((id) => id !== group.ownerId),
    membersList: membersRaw,
    isDirect: group.isDirect || false,
    lastMessage: group.lastMessage ? (
      group.lastMessage.senderId === 'system' || String(group.lastMessage.content).startsWith('Hệ thống:')
        ? group.lastMessage.content
        : `${group.lastMessage.senderId === ownerId
            ? currentUser?.name || 'Bạn'
            : membersRaw.find(member => (member.firebaseUid || member.id) === group.lastMessage.senderId)?.name || 'Thành viên'}: ${group.lastMessage.content}`
    ) : 'Chưa có tin nhắn',
    messages: initialMsgs,
    itinerary: group.itinerary || {},
    fund: group.fund || {},
  }, currentUser, ownerId);
};

const getMemberRole = (group, memberId) => {
  if (!group || !memberId) return 'member';
  if (group.leaderId === memberId) return 'leader';
  if (group.deputyIds.includes(memberId)) return 'deputy';
  return 'member';
};

const getRoleLabel = (role) => {
  if (role === 'leader') return 'Trưởng nhóm';
  if (role === 'deputy') return 'Phó nhóm';
  return 'Thành viên';
};

const getFundTotals = (fund) => {
  const contributions = (fund?.contributions || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const expenses = (fund?.expenses || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const balance = contributions - expenses;
  const goal = Number(fund?.goal) || 0;

  return {
    goal,
    contributions,
    expenses,
    balance,
    remaining: Math.max(goal - balance, 0),
    progress: goal > 0 ? Math.min(balance / goal, 1) : 0,
  };
};

const openExternalUrl = async (url, fallbackMessage) => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Không thể mở liên kết', fallbackMessage);
      return;
    }

    await Linking.openURL(url);
  } catch (error) {
    Alert.alert('Không thể mở liên kết', fallbackMessage);
  }
};

const RolePill = ({ role, isDarkMode }) => {
  let colors = ['#3b82f6', '#1d4ed8'];
  if (role === 'leader') colors = ['#f59e0b', '#d97706'];
  if (role === 'deputy') colors = ['#10b981', '#047857'];

  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.rolePill}>
      {role === 'leader' ? (
        <Crown size={10} color="#fff" />
      ) : role === 'deputy' ? (
        <ShieldCheck size={10} color="#fff" />
      ) : (
        <Users size={10} color="#fff" />
      )}
      <Text style={[styles.rolePillText, isDarkMode ? null : { color: '#fff' }]}>{getRoleLabel(role)}</Text>
    </LinearGradient>
  );
};

const MetricCard = ({ title, value, subtitle, icon, theme, isDarkMode }) => (
  <View style={[styles.metricCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
    <View style={[styles.metricIconWrap, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)' }]}>
      {icon}
    </View>
    <Text style={[styles.metricTitle, { color: theme.textSecondary }]}>{title}</Text>
    <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{value}</Text>
    {!!subtitle && <Text style={[styles.metricSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
  </View>
);

export function ChatScreen({ ownerId, isDarkMode, theme, currentUser, onNavigateToTab, prevScreen, targetDirectChatGroupId, setTargetDirectChatGroupId, onNavigateToMapWithPlace, selectedPlaceName }) {
  const [groups, setGroups] = useState(() => buildDefaultGroups(currentUser, ownerId));
  const [groupsOwnerId, setGroupsOwnerId] = useState(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState('chat');
  const [listFilter, setListFilter] = useState('all');

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTag, setNewGroupTag] = useState('');
  const [groupSearchText, setGroupSearchText] = useState('');
  const [thuTienModalVisible, setThuTienModalVisible] = useState(false);
  const [chiTienModalVisible, setChiTienModalVisible] = useState(false);
  const [aiPlannerModalVisible, setAiPlannerModalVisible] = useState(false);
  const [splitBillModalVisible, setSplitBillModalVisible] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const selectedGroup = groups.find((group) => String(group.id || group._id) === String(selectedGroupId)) || null;
  const selectedMemberIds = (selectedGroup?.membersList || [])
    .map((member) => String(member.id))
    .sort()
    .join('|');

  const [chatInput, setChatInput] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const [renameGroupName, setRenameGroupName] = useState('');
  const [memberSearchText, setMemberSearchText] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [memberSearchError, setMemberSearchError] = useState('');
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleRefresh = async () => {
    if (!ownerId) return;
    setIsRefreshing(true);
    try {
      const apiGroups = await getChatGroups(ownerId);
      if (Array.isArray(apiGroups) && apiGroups.length > 0) {
        setGroups((prevGroups) => {
          return apiGroups.map((apiGroup) => {
            const normalized = normalizeApiGroup(apiGroup, currentUser, ownerId);
            const prevGroup = prevGroups.find((g) => String(g.id) === String(normalized.id));
            const prevDays = prevGroup?.itinerary?.days;
            const apiDays = normalized.itinerary?.days;
            // Nếu API backend trả về chưa có danh sách ngày nhưng local đang có lịch trình AI -> Giữ lại lịch trình AI
            if ((!apiDays || apiDays.length === 0) && prevDays && prevDays.length > 0) {
              normalized.itinerary = prevGroup.itinerary;
            }
            return normalized;
          });
        });
      }
    } catch (_) {}
    setIsRefreshing(false);
  };

  useEffect(() => {
    let isMounted = true;
    const targetUserId = ownerId || currentUser?.firebaseUid || currentUser?.id || 'guest_user';
    loadAppData(targetUserId, 'saved_chat_groups').then((saved) => {
      if (isMounted && Array.isArray(saved) && saved.length > 0) {
        setGroups((prevGroups) => {
          return prevGroups.map((group) => {
            const savedGroup = saved.find((sg) => String(sg.id) === String(group.id));
            if (savedGroup && savedGroup.itinerary) {
              return {
                ...group,
                itinerary: savedGroup.itinerary,
              };
            }
            return group;
          });
        });
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [ownerId]);

  useEffect(() => {
    if (targetDirectChatGroupId && groups.length > 0) {
      const found = groups.find(g => String(g.id) === String(targetDirectChatGroupId));
      if (found) {
        setSelectedGroupId(targetDirectChatGroupId);
        setWorkspaceTab('chat');
        setChatModalVisible(true);
        if (setTargetDirectChatGroupId) setTargetDirectChatGroupId(null);
      }
    }
  }, [targetDirectChatGroupId, groups]);

  const [readLastMessages, setReadLastMessages] = useState({});
  const [planDaysInput, setPlanDaysInput] = useState('3');
  const [planStartDate, setPlanStartDate] = useState(getTodayIso());
  const [planEndDate, setPlanEndDate] = useState(shiftIsoDate(getTodayIso(), 2));
  const [selectedDestinationId, setSelectedDestinationId] = useState(TRAVEL_DESTINATIONS[0].id);
  const [selectedStyleId, setSelectedStyleId] = useState('photo');
  const [selectedBudgetId, setSelectedBudgetId] = useState('standard');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planStatusMessage, setPlanStatusMessage] = useState('');
  
  const [editActivityModalVisible, setEditActivityModalVisible] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);
  const [editingActivityText, setEditingActivityText] = useState('');
  const [editingActivityTitle, setEditingActivityTitle] = useState('');

  const [fundGoalInput, setFundGoalInput] = useState('');
  const [selectedFundMemberId, setSelectedFundMemberId] = useState(getCurrentUserMemberId(currentUser, ownerId));
  const [fundContributionInput, setFundContributionInput] = useState('');
  const [fundContributionNote, setFundContributionNote] = useState('');
  const [fundStkInput, setFundStkInput] = useState('');
  const [fundBillImage, setFundBillImage] = useState(null);
  const [fundExpenseTitle, setFundExpenseTitle] = useState('');
  const [fundExpenseInput, setFundExpenseInput] = useState('');

  const messageStreamRef = useRef(null);
  const currentUserId = getCurrentUserMemberId(currentUser, ownerId);
  const currentUserMember = selectedGroup?.membersList.find((member) => member.id === currentUserId) || createMember({ id: currentUserId, name: currentUser?.name, avatar: currentUser?.avatar, email: currentUser?.email });
  const sortedDestinations = getSortedDestinations(selectedGroup || {});
  const activeDestination = sortedDestinations.find((destination) => destination.id === selectedDestinationId) || sortedDestinations[0] || TRAVEL_DESTINATIONS[0];
  const fundTotals = getFundTotals(selectedGroup?.fund);

  const targetUserId = ownerId || currentUser?.firebaseUid || currentUser?.id || 'guest_user';

  useEffect(() => {
    let active = true;

    const loadGroups = (showLoading = false) => {
      if (showLoading) setIsLoadingGroups(true);
      getChatGroups(targetUserId)
        .then((apiGroups) => {
          if (!active) return;

          setGroups(prevGroups => {
            if (!Array.isArray(apiGroups) || apiGroups.length === 0) {
              return prevGroups;
            }
            return apiGroups.map(apiGroup => {
              const remote = normalizeApiGroup(apiGroup, currentUser, targetUserId);
              const existing = prevGroups.find(g =>
                String(g.id || g._id) === String(remote.id || remote._id) ||
                (g.name && remote.name && g.name.trim().toLowerCase() === remote.name.trim().toLowerCase())
              );
              if (existing) {
                // Hợp nhất sạch sẽ danh sách tin nhắn cũ và mới, xóa trùng lập theo ID
                const existingMsgs = existing.messages || [];
                const remoteMsgs = remote.messages || [];
                const msgMap = new Map();
                existingMsgs.forEach(m => { if (m.id || m._id) msgMap.set(String(m.id || m._id), m); });
                remoteMsgs.forEach(m => { if (m.id || m._id) msgMap.set(String(m.id || m._id), m); });
                const mergedMessages = Array.from(msgMap.values());

                return normalizeGroup({
                  ...existing,
                  ...remote,
                  messages: mergedMessages.length > 0 ? mergedMessages : (existing.messages || []),
                  membersList: remote.membersList,
                  deputyIds: remote.deputyIds,
                  leaderId: remote.leaderId,
                  name: remote.name,
                  image: remote.image,
                  itinerary: (remote.itinerary && Array.isArray(remote.itinerary.days) && remote.itinerary.days.length > 0)
                    ? remote.itinerary
                    : (existing.itinerary && Array.isArray(existing.itinerary.days) && existing.itinerary.days.length > 0)
                      ? existing.itinerary
                      : remote.itinerary,
                  fund: (remote.fund && (Number(remote.fund.goal) > 0 || (Array.isArray(remote.fund.contributions) && remote.fund.contributions.length > 0) || (Array.isArray(remote.fund.expenses) && remote.fund.expenses.length > 0)))
                    ? remote.fund
                    : (existing.fund || remote.fund),
                }, currentUser, targetUserId);
              }
              return remote;
            });
          });
        })
        .catch((error) => {
          // Suppress repetitive warning logs when server is offline
          if (error?.message !== 'Network Error') {
            console.warn('Không thể tải nhóm chat:', error.message);
          }
        })
        .finally(() => {
          if (active) {
            setGroupsOwnerId(targetUserId);
            if (showLoading) setIsLoadingGroups(false);
          }
        });
    };

    loadGroups(true);
    const intervalId = setInterval(() => {
      loadGroups(false);
    }, 4000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [targetUserId, currentUser?.name, currentUser?.avatar, currentUser?.email]);

  useEffect(() => {
    if (!chatModalVisible || !selectedGroupId) return undefined;
    let active = true;
    const loadMessages = () => {
      getChatMessages(selectedGroupId, targetUserId)
        .then(messages => {
          if (!active) return;
          setGroups(prevGroups => prevGroups.map(group => {
            if (String(group.id || group._id) !== String(selectedGroupId)) return group;

            const apiMsgs = messages.map(message => normalizeApiMessage(message, currentUser, targetUserId, group.membersList));
            const existingMsgs = group.messages || [];
            
            // Hợp nhất tin nhắn local và API server, bảo vệ 100% tin nhắn vừa gửi không bao giờ bị trôi
            const msgMap = new Map();
            existingMsgs.forEach(m => { if (m.id || m._id) msgMap.set(String(m.id || m._id), m); });
            apiMsgs.forEach(m => { if (m.id || m._id) msgMap.set(String(m.id || m._id), m); });
            const mergedMessages = Array.from(msgMap.values());

            return normalizeGroup({
              ...group,
              messages: mergedMessages.length > 0 ? mergedMessages : existingMsgs,
            }, currentUser, targetUserId);
          }));
        })
        .catch(error => {
          if (error?.message !== 'Network Error') {
            console.warn('Không thể tải tin nhắn:', error.message);
          }
        });

      markMessagesAsRead(selectedGroupId, targetUserId).catch(() => {});
    };
    loadMessages();
    const timer = setInterval(loadMessages, 3000);
    return () => { active = false; clearInterval(timer); };
  }, [chatModalVisible, selectedGroupId, targetUserId]);

  const markGroupAsRead = (groupId, lastMsg) => {
    if (!groupId) return;
    setReadLastMessages((prev) => {
      const targetRead = lastMsg || true;
      if (prev[groupId] === targetRead) return prev;
      return { ...prev, [groupId]: targetRead };
    });
  };

  useEffect(() => {
    if (chatModalVisible && selectedGroup) {
      markGroupAsRead(selectedGroup.id, selectedGroup.lastMessage);
    }
  }, [chatModalVisible, selectedGroup?.id, selectedGroup?.lastMessage]);

  useEffect(() => {
    if (Array.isArray(groups) && groups.length > 0) {
      setReadLastMessages((prev) => {
        let hasChanges = false;
        const next = { ...prev };
        groups.forEach((g) => {
          if (next[g.id] === undefined) {
            next[g.id] = g.lastMessage || true;
            hasChanges = true;
          }
        });
        return hasChanges ? next : prev;
      });
    }
  }, [groups]);

  useEffect(() => {
    if (!ownerId || groupsOwnerId !== ownerId) return undefined;

    const timer = setTimeout(() => {
      saveAppData(ownerId, 'chat', { groups }).catch((error) => {
        console.warn('Không thể lưu nhóm chat:', error.message);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [ownerId, groupsOwnerId, groups]);

  useEffect(() => {
    if (!chatModalVisible || workspaceTab !== 'chat' || !messageStreamRef.current) return;

    const timer = setTimeout(() => {
      messageStreamRef.current?.scrollToEnd({ animated: true });
    }, 120);

    return () => clearTimeout(timer);
  }, [chatModalVisible, workspaceTab, selectedGroup?.messages?.length]);

  useEffect(() => {
    if (selectedGroupId && !selectedGroup) {
      setChatModalVisible(false);
      setSettingsVisible(false);
      setSelectedGroupId(null);
    }
  }, [selectedGroupId, selectedGroup]);

  useEffect(() => {
    if (!selectedGroup) return;

    const itinerary = selectedGroup.itinerary || normalizeItinerary({}, activeDestination.id);
    const inferredDays = getInclusiveDayCount(itinerary.startDate, itinerary.endDate) || itinerary.daysCount || 3;

    setRenameGroupName(selectedGroup.name);
    setPlanDaysInput(String(inferredDays));
    setPlanStartDate(itinerary.startDate || getTodayIso());
    setPlanEndDate(itinerary.endDate || shiftIsoDate(getTodayIso(), 2));
    setSelectedDestinationId(itinerary.destinationId || (getSortedDestinations(selectedGroup)[0] || TRAVEL_DESTINATIONS[0]).id);
    setFundGoalInput(selectedGroup.fund?.goal ? String(selectedGroup.fund.goal) : '');
    setSelectedFundMemberId(currentUserId);
    setPlanStatusMessage('');
    setMemberSearchText('');
    setMemberSearchResults([]);
    setMemberSearchError('');
  }, [selectedGroupId]);

  // Tự động kết nối 2 chiều giữa địa điểm chọn trên Bản đồ với AI Smart Planner
  useEffect(() => {
    if (selectedPlaceName) {
      const query = String(selectedPlaceName).toLowerCase().trim();
      const matched = TRAVEL_DESTINATIONS.find(d => 
        query.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(query) ||
        query.includes((d.region || '').toLowerCase())
      );
      if (matched) {
        setSelectedDestinationId(matched.id);
      }
    }
  }, [selectedPlaceName]);

  useEffect(() => {
    if (!settingsVisible) return undefined;

    const query = memberSearchText.trim();
    let active = true;
    setIsSearchingMembers(true);
    setMemberSearchError('');

    const timer = setTimeout(() => {
      searchFriends(query, ownerId)
        .then((users) => {
          if (!active) return;
          const existingIds = new Set((selectedGroup?.membersList || []).map((member) => member.id));
          const nextResults = (Array.isArray(users) ? users : [])
            .map(createMember)
            .filter((member) => !existingIds.has(member.id));
          setMemberSearchResults(nextResults);
        })
        .catch((error) => {
          if (!active) return;
          setMemberSearchResults([]);
          setMemberSearchError(
            error.response
              ? 'Máy chủ không phản hồi tìm kiếm thành viên. Bạn vẫn có thể thêm nhanh theo tên.'
              : 'Không thể kết nối Vivu360_API để tìm thành viên. Bạn vẫn có thể thêm nhanh theo tên.'
          );
        })
        .finally(() => {
          if (active) setIsSearchingMembers(false);
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [memberSearchText, settingsVisible, ownerId, selectedGroupId, selectedMemberIds]);

  const updateGroupById = async (groupId, updater) => {
    let updatedGroup = null;
    let prevGroup = null;
    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group;
        prevGroup = group;
        updatedGroup = normalizeGroup(updater(group), currentUser, ownerId);
        return updatedGroup;
      })
    );

    if (updatedGroup && ownerId) {
      try {
        const payload = {
          tag: updatedGroup.tag,
          itinerary: updatedGroup.itinerary,
          fund: updatedGroup.fund,
        };
        if (prevGroup && updatedGroup.name !== prevGroup.name) {
          payload.name = updatedGroup.name;
        }
        await updateChatGroup(groupId, ownerId, payload);
      } catch (error) {
        console.warn('Không thể đồng bộ thông tin nhóm lên MongoDB:', error.message);
      }
    }
  };

  const removeGroupById = (groupId) => {
    setGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));
  };

  const handleSubmitGroup = async () => {
    if (!newGroupName.trim()) return;

    const creatorId = currentUserId;
    const creatorMember = createMember({
      id: creatorId,
      name: currentUser?.name || 'Bạn',
      avatar: currentUser?.avatar,
      email: currentUser?.email,
      phone: currentUser?.phone,
    });

    const matchedDestination = getSortedDestinations({ name: newGroupName, tag: newGroupTag })[0] || TRAVEL_DESTINATIONS[0];
    const startDate = getTodayIso();
    const endDate = shiftIsoDate(startDate, 2);

    try {
      const avatar = GROUP_IMAGES[Math.floor(Math.random() * GROUP_IMAGES.length)];
      const created = await createChatGroup({ name: newGroupName.trim(), avatar, ownerId });
      const newGroup = normalizeGroup({
        ...normalizeApiGroup({ ...created, memberProfiles: [creatorMember] }, currentUser, ownerId),
        tag: newGroupTag.trim() || 'Du lịch',
        itinerary: { startDate, endDate, daysCount: 3, destinationId: matchedDestination.id },
      }, currentUser, ownerId);
      setGroups((prevGroups) => [newGroup, ...prevGroups]);
      setNewGroupName('');
      setNewGroupTag('');
      setGroupModalVisible(false);
    } catch (error) {
      Alert.alert('Không thể tạo nhóm', error.response?.data?.message || 'Vui lòng thử lại.');
    }
  };

  const handleOpenChat = (group) => {
    setSelectedGroupId(group.id);
    markGroupAsRead(group.id, group.lastMessage);
    setWorkspaceTab('chat');
    setChatModalVisible(true);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !selectedGroup) return;

    const trimmedMessage = chatInput.trim();
    const localMsgId = Date.now();
    const localTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const localMessage = {
      id: localMsgId,
      senderId: ownerId || currentUser?.uid || currentUser?.id || 'local-user',
      senderName: currentUser?.name || 'Bạn',
      senderAvatar: currentUser?.avatar || getUserAvatarByName(currentUser?.name),
      user: currentUser?.name || 'Bạn',
      text: trimmedMessage,
      time: localTime,
      createdAt: localMsgId,
    };

    // Thêm tin nhắn ngay lập tức vào màn hình Chat (Optimistic UI)
    updateGroupById(selectedGroup.id, (group) => ({
      ...group,
      lastMessage: `Bạn: ${trimmedMessage}`,
      messages: [...(group.messages || []), localMessage],
    }));

    setChatInput('');

    // Đồng bộ về Server API ở background
    try {
      if (ownerId && selectedGroup.id) {
        await sendChatMessage(selectedGroup.id, ownerId, trimmedMessage);
      }
    } catch (error) {
      console.log('Syncing message to API backend failed, stored locally:', error?.message);
    }
  };

  const handleCreatePoll = async ({ question, options, multipleChoice }) => {
    if (!selectedGroup) return;
    const gId = selectedGroup._id || selectedGroup.id;
    try {
      const pollMsg = await createGroupPoll(gId, ownerId, question, options, multipleChoice);
      if (pollMsg) {
        updateGroupById(selectedGroup.id, (group) => ({
          ...group,
          lastMessage: `📊 Bình chọn: ${question}`,
          messages: [...(group.messages || []), pollMsg],
        }));
      }
    } catch (err) {
      console.warn("Lỗi tạo bình chọn:", err.message);
      Alert.alert("Lỗi tạo bình chọn", err.response?.data?.message || err.message);
    }
  };

  const handleVotePoll = async (messageId, optionId) => {
    if (!selectedGroup) return;
    const gId = selectedGroup._id || selectedGroup.id;
    try {
      const updatedMsg = await voteGroupPoll(gId, messageId, optionId, ownerId);
      if (updatedMsg) {
        updateGroupById(selectedGroup.id, (group) => ({
          ...group,
          messages: (group.messages || []).map(m => String(m.id || m._id) === String(messageId) ? updatedMsg : m),
        }));
      }
    } catch (err) {
      console.warn("Lỗi bình chọn:", err.message);
    }
  };

  const handleClosePoll = async (messageId) => {
    if (!selectedGroup) return;
    const gId = selectedGroup._id || selectedGroup.id;
    try {
      const updatedMsg = await closeGroupPoll(gId, messageId, ownerId);
      if (updatedMsg) {
        updateGroupById(selectedGroup.id, (group) => ({
          ...group,
          messages: (group.messages || []).map(m => String(m.id || m._id) === String(messageId) ? updatedMsg : m),
        }));
      }
    } catch (err) {
      console.warn("Lỗi khóa bình chọn:", err.message);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    if (!selectedGroup) return;
    const gId = selectedGroup._id || selectedGroup.id;
    try {
      const updatedMsg = await editChatMessage(gId, messageId, ownerId, newContent);
      if (updatedMsg) {
        updateGroupById(selectedGroup.id, (group) => ({
          ...group,
          messages: (group.messages || []).map(m => String(m.id || m._id) === String(messageId) ? updatedMsg : m),
        }));
      }
    } catch (err) {
      console.warn("Lỗi chỉnh sửa tin nhắn:", err.message);
    }
  };

  const handleOpenUserProfile = (username) => {
    setTargetUsername(username);
    setProfileModalVisible(true);
  };

  const handleRenameGroup = async () => {
    if (!selectedGroup || !renameGroupName.trim()) return;
    try {
      await renameChatGroup(selectedGroup.id, ownerId, renameGroupName.trim());
      updateGroupById(selectedGroup.id, (group) => ({ ...group, name: renameGroupName.trim() }));
      Alert.alert('Đã cập nhật', 'Tên nhóm đã được thay đổi.');
    } catch (error) {
      Alert.alert('Không thể đổi tên', error.response?.data?.message || 'Bạn không có quyền thực hiện thao tác này.');
    }
  };

  const handleAddMember = async (rawMember) => {
    if (!selectedGroup) return;

    const member = createMember(rawMember);
    const memberExists = selectedGroup.membersList.some((item) => item.id === member.id);

    if (memberExists) {
      Alert.alert('Đã tồn tại', 'Thành viên này đã có trong nhóm.');
      return;
    }

    try {
      await addChatMembers(selectedGroup.id, ownerId, [member.id]);
      updateGroupById(selectedGroup.id, (group) => ({ ...group, membersList: [...group.membersList, member], lastMessage: `Hệ thống: ${member.name} vừa được thêm vào nhóm` }));
      setMemberSearchText('');
      setMemberSearchResults([]);
      Alert.alert('Thành công', `Đã thêm ${member.name} vào nhóm.`);
    } catch (error) {
      Alert.alert('Không thể thêm thành viên', error.response?.data?.message || 'Vui lòng thử lại.');
    }
  };

  const handleQuickAddMember = () => {
    Alert.alert('Chọn người dùng Vivu360', 'Hãy nhập email hoặc số điện thoại rồi chọn đúng tài khoản trong danh sách tìm kiếm.');
  };

  const handleTransferLeader = (memberId) => {
    if (!selectedGroup) return;

    updateGroupById(selectedGroup.id, (group) => ({
      ...group,
      leaderId: memberId,
      deputyIds: group.deputyIds.filter((id) => id !== memberId),
    }));
  };

  const handleToggleDeputy = (memberId) => {
    if (!selectedGroup) return;

    updateGroupById(selectedGroup.id, (group) => {
      const isDeputy = group.deputyIds.includes(memberId);

      return {
        ...group,
        deputyIds: isDeputy
          ? group.deputyIds.filter((id) => id !== memberId)
          : [...group.deputyIds, memberId].filter((id) => id !== group.leaderId),
      };
    });
  };

  const handleRemoveMember = (member) => {
    if (!selectedGroup) return;

    Alert.alert(
      'Xóa thành viên',
      `Bạn có chắc muốn xóa ${member.name} khỏi nhóm không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeChatMember(selectedGroup.id, ownerId, member.id);
            } catch (error) {
              Alert.alert('Không thể xóa thành viên', error.response?.data?.message || 'Bạn không có quyền thực hiện thao tác này.');
              return;
            }
            updateGroupById(selectedGroup.id, (group) => {
              const remainingMembers = group.membersList.filter((item) => item.id !== member.id);
              const nextLeaderId = member.id === group.leaderId
                ? (group.deputyIds.find((id) => id !== member.id && remainingMembers.some((item) => item.id === id)) || remainingMembers[0]?.id || group.leaderId)
                : group.leaderId;

              return {
                ...group,
                membersList: remainingMembers.length ? remainingMembers : group.membersList,
                leaderId: nextLeaderId,
                deputyIds: group.deputyIds.filter((id) => id !== member.id && id !== nextLeaderId),
                lastMessage: `Hệ thống: ${member.name} đã rời khỏi nhóm`,
                messages: [
                  ...group.messages,
                  {
                    id: Date.now(),
                    user: 'Hệ thống',
                    text: `${member.name} đã được xóa khỏi nhóm.`,
                  },
                ],
              };
            });
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    if (!selectedGroup) return;

    Alert.alert(
      'Rời nhóm',
      'Bạn muốn rời nhóm này chứ?',
      [
        { text: 'Ở lại', style: 'cancel' },
        {
          text: 'Rời nhóm',
          style: 'destructive',
          onPress: () => {
            const remainingMembers = selectedGroup.membersList.filter((member) => member.id !== currentUserId);

            if (!remainingMembers.length) {
              removeGroupById(selectedGroup.id);
              setChatModalVisible(false);
              setSettingsVisible(false);
              return;
            }

            updateGroupById(selectedGroup.id, (group) => {
              const nextLeaderId = group.leaderId === currentUserId
                ? group.deputyIds.find((id) => id !== currentUserId && remainingMembers.some((member) => member.id === id)) || remainingMembers[0]?.id
                : group.leaderId;

              return {
                ...group,
                membersList: remainingMembers,
                leaderId: nextLeaderId,
                deputyIds: group.deputyIds.filter((id) => id !== currentUserId && id !== nextLeaderId),
                lastMessage: `Hệ thống: ${currentUserMember.name} đã rời nhóm`,
                messages: [
                  ...group.messages,
                  {
                    id: Date.now(),
                    user: 'Hệ thống',
                    text: `${currentUserMember.name} đã rời nhóm.`,
                  },
                ],
              };
            });

            setSettingsVisible(false);
            setChatModalVisible(false);
          },
        },
      ]
    );
  };

  const handleSaveFundGoal = () => {
    if (!selectedGroup) return;

    const goal = parseMoneyInput(fundGoalInput);
    updateGroupById(selectedGroup.id, (group) => ({
      ...group,
      fund: {
        ...group.fund,
        goal,
      },
    }));

    Alert.alert('Đã lưu', 'Mục tiêu quỹ chuyến đi đã được cập nhật.');
  };

  const handleAddContribution = () => {
    if (!selectedGroup) return;

    const amount = parseMoneyInput(fundContributionInput);
    if (!amount) return;

    const contributor = selectedGroup.membersList.find((member) => member.id === selectedFundMemberId) || currentUserMember;
    const contribution = {
      id: Date.now(),
      memberId: contributor.id,
      memberName: contributor.name,
      amount,
      note: fundContributionNote.trim() || 'Đóng góp quỹ',
      stk: fundStkInput.trim() || null,
      billImage: fundBillImage || null,
      createdAt: Date.now(),
    };

    updateGroupById(selectedGroup.id, (group) => ({
      ...group,
      fund: {
        ...group.fund,
        contributions: [contribution, ...(group.fund?.contributions || [])],
      },
    }));

    setFundContributionInput('');
    setFundContributionNote('');
    setFundStkInput('');
    setFundBillImage(null);
  };

  const handleAddExpense = () => {
    if (!selectedGroup) return;

    const amount = parseMoneyInput(fundExpenseInput);
    if (!amount || !fundExpenseTitle.trim()) return;

    const expense = {
      id: Date.now(),
      title: fundExpenseTitle.trim(),
      amount,
      createdAt: Date.now(),
    };

    updateGroupById(selectedGroup.id, (group) => ({
      ...group,
      fund: {
        ...(group.fund || {}),
        expenses: [expense, ...(group.fund?.expenses || [])],
      },
    }));

    setFundExpenseTitle('');
    setFundExpenseInput('');
  };

  const handleClearAllDays = () => {
    if (!selectedGroup) return;
    updateGroupById(selectedGroup.id, (group) => ({
      ...group,
      itinerary: {
        ...(group.itinerary || {}),
        days: [],
      },
    }));
    Alert.alert('Đã xóa', 'Đã xóa toàn bộ lịch trình chuyến đi thành công.');
  };

  const handleDeleteDay = (dayIndex) => {
    if (!selectedGroup) return;
    updateGroupById(selectedGroup.id, (group) => {
      const currentDays = group.itinerary?.days || [];
      const updatedDays = currentDays.filter((_, idx) => idx !== dayIndex);
      return {
        ...group,
        itinerary: {
          ...(group.itinerary || {}),
          days: updatedDays,
        },
      };
    });
  };

  const handleDeleteActivity = (dayIndex, slotIndex) => {
    if (!selectedGroup) return;
    updateGroupById(selectedGroup.id, (group) => {
      const currentDays = [...(group.itinerary?.days || [])];
      if (!currentDays[dayIndex]) return group;

      const targetDay = { ...currentDays[dayIndex] };
      const currentSlots = [...(targetDay.slots || targetDay.activities || [])];
      currentSlots.splice(slotIndex, 1);

      targetDay.slots = currentSlots;
      targetDay.activities = currentSlots;
      currentDays[dayIndex] = targetDay;

      return {
        ...group,
        itinerary: {
          ...group.itinerary,
          days: currentDays,
        },
      };
    });
  };

  const handleOpenEditActivity = (dayIndex, slotIndex, currentTitle, currentDesc) => {
    setEditingDayIndex(dayIndex);
    setEditingSlotIndex(slotIndex);
    setEditingActivityTitle(currentTitle || '');
    setEditingActivityText(currentDesc || '');
    setEditActivityModalVisible(true);
  };

  const handleSaveActivity = () => {
    if (!selectedGroup || editingDayIndex === null || editingSlotIndex === null) return;
    updateGroupById(selectedGroup.id, (group) => {
      const currentDays = [...(group.itinerary?.days || [])];
      if (!currentDays[editingDayIndex]) return group;

      const targetDay = { ...currentDays[editingDayIndex] };
      const currentSlots = [...(targetDay.slots || targetDay.activities || [])];

      currentSlots[editingSlotIndex] = {
        ...(typeof currentSlots[editingSlotIndex] === 'object' ? currentSlots[editingSlotIndex] : {}),
        title: editingActivityTitle,
        description: editingActivityText,
        text: editingActivityText,
      };

      targetDay.slots = currentSlots;
      targetDay.activities = currentSlots;
      currentDays[editingDayIndex] = targetDay;

      return {
        ...group,
        itinerary: {
          ...group.itinerary,
          days: currentDays,
        },
      };
    });
    setEditActivityModalVisible(false);
  };

  const handleSplitBill = (totalAmount, billTitle, memberIds, splitDetails) => {
    if (!selectedGroup) return;

    const expense = {
      id: Date.now(),
      title: `[Split Bill] ${billTitle}`,
      amount: totalAmount,
      createdAt: Date.now(),
      splitDetails,
    };

    updateGroupById(selectedGroup.id, (group) => ({
      ...group,
      fund: {
        ...(group.fund || {}),
        expenses: [expense, ...(group.fund?.expenses || [])],
      },
    }));

    Alert.alert('Thành công', `Đã chia hóa đơn "${billTitle}" tổng cộng ${totalAmount.toLocaleString('vi-VN')} đ cho ${memberIds.length} thành viên.`);
    setSplitBillModalVisible(false);
  };

  const handleGenerateItinerary = async () => {
    if (!selectedGroup || !activeDestination) return;

    const parsedDays = clampTripDays(planDaysInput);
    const startDate = parseIsoDate(planStartDate) ? planStartDate : getTodayIso();
    const endDateCandidate = parseIsoDate(planEndDate) ? planEndDate : shiftIsoDate(startDate, Math.max(parsedDays, 1) - 1);
    let daysCount = parsedDays || getInclusiveDayCount(startDate, endDateCandidate);
    let endDate = endDateCandidate;

    if (!daysCount) daysCount = 3;

    const inclusiveCount = getInclusiveDayCount(startDate, endDate);
    if (!inclusiveCount || inclusiveCount !== daysCount) {
      endDate = shiftIsoDate(startDate, daysCount - 1);
    } else {
      daysCount = inclusiveCount;
    }

    if (getInclusiveDayCount(startDate, endDate) <= 0) {
      Alert.alert('Ngày chưa hợp lệ', 'Ngày kết thúc cần cùng ngày hoặc sau ngày bắt đầu.');
      return;
    }

    setIsGeneratingPlan(true);
    setPlanStatusMessage('');

    try {
      let forecastSource = 'Google Weather API';
      let forecast = [];

      try {
        forecast = await fetchGoogleWeatherForecast({
          latitude: activeDestination.coordinates.latitude,
          longitude: activeDestination.coordinates.longitude,
          days: daysCount,
          languageCode: 'vi',
        });
      } catch (error) {
        forecastSource = 'Dự phòng nội bộ';
        forecast = buildFallbackForecast(activeDestination, buildDateList(startDate, endDate));
        setPlanStatusMessage(
          error.message === 'MISSING_GOOGLE_WEATHER_API_KEY'
            ? 'Chưa có EXPO_PUBLIC_GOOGLE_WEATHER_API_KEY nên lịch trình đang dùng dự báo dự phòng. Nút Google bên dưới vẫn mở thời tiết thực tế.'
            : 'Không lấy được Google Weather API ở lần này, mình đã tạo lịch trình bằng dự báo dự phòng để bạn tiếp tục thao tác.'
        );
      }

      const itinerary = buildItinerarySuggestion({
        destination: activeDestination,
        startDate,
        endDate,
        forecast,
        source: forecastSource,
      });

      updateGroupById(selectedGroup.id, (group) => ({
        ...group,
        itinerary,
      }));

      setPlanDaysInput(String(itinerary.daysCount));
      setPlanStartDate(itinerary.startDate);
      setPlanEndDate(itinerary.endDate);
      setWorkspaceTab('planner');
    } finally {
      setIsGeneratingPlan(false);
    }
  };



  const itinerary = selectedGroup?.itinerary || null;
  const currentRole = selectedGroup ? getMemberRole(selectedGroup, currentUserId) : 'member';
  const filteredGroups = groups.filter((g) => {
    if (!g) return false;
    const name = String(g.name || '');
    const matchesSearch = name.toLowerCase().includes(groupSearchText.toLowerCase()) ||
                          String(g.lastMessage || '').toLowerCase().includes(groupSearchText.toLowerCase());
    if (!matchesSearch) return false;
    if (listFilter === 'unread') {
      const isUnread = name.length % 3 === 0;
      return isUnread;
    }
    if (listFilter === 'groups') {
      return !g.isDirect;
    }
    return true;
  });

  return (
    <View style={[styles.tabContainer, { backgroundColor: isDarkMode ? '#12101d' : '#fcf4ef' }]}>
      {/* Messenger style Header */}
      <View style={[styles.msgHeader, { borderBottomColor: 'transparent', backgroundColor: isDarkMode ? '#12101d' : '#fcf4ef' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 4 }}>
          <Pressable 
            style={[styles.msgBackBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]} 
            onPress={() => onNavigateToTab && onNavigateToTab(prevScreen || 'social')}
          >
            <ChevronLeft size={20} color={theme.textPrimary} />
          </Pressable>
          <Text style={[styles.msgHeaderTitleCenter, { color: theme.textPrimary, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 }]}>Tin Nhắn</Text>
          <Pressable 
            style={[styles.msgCircleBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]} 
            onPress={() => setGroupModalVisible(true)}
          >
            <Plus size={18} color={theme.textPrimary} />
          </Pressable>
        </View>

        {/* Pill-shaped Search Bar */}
        <View style={[styles.msgSearchBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#ede8e3', borderColor: 'transparent', height: 42, borderRadius: 21, marginTop: 12 }]}>
          <Search size={16} color={theme.textMuted} />
          <TextInput
            placeholder="Tìm kiếm tin nhắn, bạn bè..."
            placeholderTextColor={theme.textMuted}
            value={groupSearchText}
            onChangeText={setGroupSearchText}
            style={[styles.msgSearchInput, { color: theme.textPrimary, fontSize: 13, fontWeight: '500' }]}
          />
          {groupSearchText.length > 0 && (
            <Pressable onPress={() => setGroupSearchText('')} style={{ padding: 4 }}>
              <X size={14} color={theme.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Tab Filters (All, Unread, Groups) */}
        <View style={styles.msgTabFiltersRow}>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'unread', label: 'Chưa đọc' },
            { key: 'groups', label: 'Nhóm du lịch' }
          ].map(tab => {
            const isActive = listFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setListFilter(tab.key)}
                style={{ borderRadius: 16, overflow: 'hidden' }}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#f43f5e', '#e11d48']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingHorizontal: 18, paddingVertical: 7, borderRadius: 16 }}
                  >
                    <Text style={{ color: '#ffffff', fontSize: 12.5, fontWeight: '800' }}>
                      {tab.label}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={{
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                    borderRadius: 16,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'
                  }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 12.5, fontWeight: '700' }}>
                      {tab.label}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#f43f5e']}
            tintColor="#f43f5e"
          />
        }
      >


        {/* Messenger Flat Chat List */}
        <View style={styles.msgChatListContainer}>
          {isLoadingGroups ? (
            <ActivityIndicator color="#f43f5e" style={{ marginTop: 40 }} />
          ) : filteredGroups.length > 0 ? filteredGroups.map((group) => {
            const safeGroupName = String(group.name || '');
            const lastMsgText = typeof group.lastMessage === 'string' ? group.lastMessage : (group.lastMessage?.text || 'Chưa có tin nhắn nào.');
            const isLastMsgFromMe = lastMsgText.startsWith('Bạn:');
            const isLastMsgSystem = lastMsgText.startsWith('Hệ thống:');
            const readMsg = readLastMessages[group.id];

            const isUnread = !isLastMsgFromMe && !isLastMsgSystem && readMsg !== undefined && readMsg !== lastMsgText && readMsg !== true;
            const unreadCount = isUnread ? 1 : 0;

            return (
              <Pressable
                key={group.id}
                style={[
                  styles.msgChatRow, 
                  { 
                    backgroundColor: isDarkMode ? '#1c1a29' : '#ffffff',
                    marginHorizontal: 16,
                    marginVertical: 4,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    shadowColor: isDarkMode ? '#000' : '#d6c4b8',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 2,
                  }
                ]}
                onPress={() => handleOpenChat(group)}
              >
                {/* Avatar */}
                <View style={styles.msgAvatarWrapper}>
                  {group.isDirect ? (
                    <LinearGradient
                      colors={['#f43f5e', '#fb923c']}
                      style={styles.msgAvatarFrame}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={[styles.msgAvatarInner, { backgroundColor: isDarkMode ? '#1c1a29' : '#ffffff' }]}>
                        <Image source={{ uri: group.image || getUserAvatarByName(safeGroupName) }} style={styles.msgAvatarImg} />
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.msgAvatarFrame, { padding: 0 }]}>
                      <Image
                        source={{ uri: group.image || getUserAvatarByName(safeGroupName) }}
                        style={styles.msgAvatarImgRound}
                      />
                    </View>
                  )}
                  {group.isDirect && <View style={styles.msgOnlineActiveDot} />}
                </View>

                {/* Chat Info */}
                <View style={styles.msgChatInfo}>
                  <Text numberOfLines={1} style={[
                    styles.msgChatName, 
                    { 
                      color: theme.textPrimary,
                      fontWeight: unreadCount > 0 ? '900' : '750' 
                    }
                  ]}>
                    {group.name}
                  </Text>

                  <Text numberOfLines={1} style={[
                    styles.msgLastMsgText, 
                    { 
                      color: unreadCount > 0 ? theme.textPrimary : theme.textSecondary,
                      fontWeight: unreadCount > 0 ? '700' : '500',
                      marginTop: 3
                    }
                  ]}>
                    {lastMsgText}
                  </Text>
                </View>

                {/* Right Side: Time + Unread Badge / Checkmarks */}
                <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 10.5, color: theme.textMuted, fontWeight: '600' }}>
                    {group.lastMessageTime || '10:42 PM'}
                  </Text>
                  {unreadCount > 0 ? (
                    <View style={{ backgroundColor: '#f43f5e', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{unreadCount > 1 ? unreadCount : 2}</Text>
                    </View>
                  ) : (
                    <CheckCheck size={14} color="#f43f5e" />
                  )}
                </View>
              </Pressable>
            );
          }) : (
            <View style={{ alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 }}>
              <Text style={{ color: theme.textPrimary, fontWeight: '800', textAlign: "center" }}>
                {groupSearchText ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có phòng chat nào'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={groupModalVisible} onRequestClose={() => setGroupModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardGlass, borderColor: theme.border, height: 360 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Tạo nhóm trò chuyện</Text>
              <Pressable style={styles.closeModalBtn} onPress={() => setGroupModalVisible(false)}>
                <X size={20} color={theme.textPrimary} />
              </Pressable>
            </View>

            <View style={{ flex: 1, padding: 16 }}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Tên nhóm trò chuyện</Text>
              <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 6 }]}>
                <MessageCircle size={18} color="#3b82f6" />
                <TextInput
                  placeholder="Ví dụ: Săn mây Y Tý cuối tuần"
                  placeholderTextColor={theme.textMuted}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  style={[styles.formTextInput, { color: theme.textPrimary }]}
                />
              </View>

              <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 16 }]}>Mục tiêu / Chủ đề</Text>
              <View style={[styles.formInputGroup, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 6 }]}>
                <Sparkles size={18} color="#f59e0b" />
                <TextInput
                  placeholder="Ví dụ: Sa Pa / Phượt / Đi chung xe"
                  placeholderTextColor={theme.textMuted}
                  value={newGroupTag}
                  onChangeText={setNewGroupTag}
                  style={[styles.formTextInput, { color: theme.textPrimary }]}
                />
              </View>
            </View>

            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Pressable style={styles.modalSubmitBtn} onPress={handleSubmitGroup}>
                <LinearGradient colors={['#f43f5e', '#e11d48']} style={styles.modalSubmitGradient}>
                  <Plus size={16} color="#fff" />
                  <Text style={styles.modalSubmitText}>Khởi tạo nhóm</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {selectedGroup && selectedGroup.isDirect ? (
        <DirectChatScreen
          groupId={selectedGroup.id}
          chatName={selectedGroup.name}
          chatAvatar={selectedGroup.image}
          ownerId={ownerId}
          currentUser={currentUser}
          isDarkMode={isDarkMode}
          theme={theme}
          visible={chatModalVisible}
          onClose={() => { setChatModalVisible(false); setSelectedGroupId(null); }}
          onNavigateToMapWithPlace={(place) => {
            setChatModalVisible(false);
            if (onNavigateToMapWithPlace) onNavigateToMapWithPlace(place);
          }}
        />
      ) : selectedGroup ? (
        <Modal animationType="slide" transparent={false} visible={chatModalVisible} onRequestClose={() => setChatModalVisible(false)} statusBarTranslucent>
          <View style={[styles.chatRoomContainer, { backgroundColor: '#000000' }]}>
            <LinearGradient colors={['#000000', '#0a0a0f', '#121218']} style={{ flex: 1 }} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}>
              <View style={styles.chatHeader}>
                <Pressable style={styles.backChatBtn} onPress={() => { setChatModalVisible(false); setSelectedGroupId(null); }}>
                  <ChevronLeft size={22} color="#fff" strokeWidth={2.5} />
                </Pressable>
                
                <View style={styles.chatHeaderAvatarWrapper}>
                  {selectedGroup.image ? (
                    <Image source={{ uri: selectedGroup.image || getUserAvatarByName(selectedGroup.name) }} style={styles.chatHeaderAvatar} />
                  ) : (
                    <LinearGradient colors={['#7c3aed', '#a855f7']} style={styles.chatHeaderAvatarInitials}>
                      <Text style={styles.chatHeaderAvatarInitialsText}>
                        {selectedGroup.name ? selectedGroup.name.substring(0, 2).toUpperCase() : 'GP'}
                      </Text>
                    </LinearGradient>
                  )}
                  <View style={styles.statusActiveDot} />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text numberOfLines={1} style={styles.chatHeaderName}>
                    {selectedGroup.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.chatHeaderSubText}>
                    {(() => {
                      if (!selectedGroup.membersList) return 'Đang cập nhật...';
                      const names = selectedGroup.membersList.slice(0, 3).map(m => m.name.split(' ').pop());
                      const extraCount = selectedGroup.membersList.length - names.length;
                      return names.join(', ') + (extraCount > 0 ? ` +${extraCount}` : '');
                    })()}
                  </Text>
                </View>

                <View style={styles.headerRightActions}>
                  <Pressable style={styles.chatInfoBtn} onPress={() => Alert.alert('Gọi thoại', 'Tính năng sắp ra mắt')}>
                    <Phone size={19} color="#0084ff" strokeWidth={2.2} />
                  </Pressable>

                  <Pressable style={styles.chatInfoBtn} onPress={() => Alert.alert('Gọi video', 'Tính năng sắp ra mắt')}>
                    <Video size={19} color="#0084ff" strokeWidth={2.2} />
                  </Pressable>

                  <Pressable style={styles.chatInfoBtn} onPress={() => setSettingsVisible(true)}>
                    <Settings2 size={19} color="#0084ff" strokeWidth={2.2} />
                  </Pressable>
                </View>
              </View>

              {selectedGroup && !(
                selectedGroup.isDirect ||
                selectedGroup.type === 'direct' ||
                selectedGroup.isPrivate ||
                (Array.isArray(selectedGroup.membersList) && selectedGroup.membersList.length <= 2)
              ) && (
                <View style={styles.workspaceTabBar}>
                  {WORKSPACE_TABS.map((tabItem) => {
                    const isActive = workspaceTab === tabItem.key;
                    const Icon = tabItem.Icon;

                    return (
                      <Pressable
                        key={tabItem.key}
                        style={[styles.workspaceTabButton, isActive ? styles.workspaceTabButtonActive : null]}
                        onPress={() => setWorkspaceTab(tabItem.key)}
                      >
                        <Icon size={15} color={isActive ? '#0084ff' : '#b0b3b8'} />
                        <Text style={[styles.workspaceTabText, { color: isActive ? '#0084ff' : '#b0b3b8', fontWeight: isActive ? '800' : '600' }]}>
                          {tabItem.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {workspaceTab === 'chat' ? (
                <GroupChatTab
                  selectedGroup={selectedGroup}
                  chatMessages={(selectedGroup?.messages || []).map(m => ({
                    id: m.id || m._id,
                    text: m.text || m.content,
                    content: m.content || m.text,
                    type: m.type,
                    poll: m.poll,
                    isEdited: m.isEdited,
                    editedAt: m.editedAt,
                    sender: m.user || m.senderName,
                    senderName: m.user || m.senderName,
                    senderAvatar: m.avatar || m.senderAvatar,
                    senderId: m.senderId,
                    time: getFormattedMsgTime(m.createdAt || m.id)
                  }))}
                  messageText={chatInput}
                  setMessageText={setChatInput}
                  onSendMessage={handleSendChatMessage}
                  onCreatePoll={handleCreatePoll}
                  onVotePoll={handleVotePoll}
                  onClosePoll={handleClosePoll}
                  onEditMessage={handleEditMessage}
                  currentUser={currentUser}
                  ownerId={ownerId}
                  theme={theme}
                  isDarkMode={isDarkMode}
                  onNavigateToMapWithPlace={(place) => {
                    setChatModalVisible(false);
                    if (onNavigateToMapWithPlace) onNavigateToMapWithPlace(place);
                  }}
                />
              ) : workspaceTab === 'planner' ? (
                <GroupScheduleTab
                  selectedGroup={selectedGroup}
                  theme={theme}
                  isDarkMode={isDarkMode}
                  onOpenAIPlanner={() => {
                    // Auto pre-select điểm đến phù hợp nhất với nhóm
                    const bestMatch = getSortedDestinations(selectedGroup || {})[0];
                    const currentItineraryDest = selectedGroup?.itinerary?.destinationId;
                    const autoDestId = currentItineraryDest || (bestMatch ? bestMatch.id : TRAVEL_DESTINATIONS[0].id);
                    setSelectedDestinationId(autoDestId);
                    setAiPlannerModalVisible(true);
                  }}
                  onEditActivity={handleOpenEditActivity}
                  onDeleteActivity={handleDeleteActivity}
                  onDeleteDay={handleDeleteDay}
                  onClearAllDays={handleClearAllDays}
                  onNavigateToMapWithPlace={(place) => {
                    setChatModalVisible(false);
                    if (onNavigateToMapWithPlace) onNavigateToMapWithPlace(place);
                  }}
                />
              ) : (
                <GroupFundTab
                  selectedGroup={selectedGroup}
                  theme={theme}
                  isDarkMode={isDarkMode}
                  onOpenThuTien={() => setThuTienModalVisible(true)}
                  onOpenChiTien={() => setChiTienModalVisible(true)}
                  onOpenSplitBill={() => setSplitBillModalVisible(true)}
                  ownerId={ownerId}
                  currentUser={currentUser}
                />
              )}
            </LinearGradient>
          </View>
        </Modal>
      ) : null}

      {selectedGroup && (
        (selectedGroup.isDirect ||
        selectedGroup.type === 'direct' ||
        selectedGroup.isPrivate ||
        (Array.isArray(selectedGroup.membersList) && selectedGroup.membersList.length <= 2)) ? (
          <DirectChatSettingsModal
            visible={settingsVisible}
            onClose={() => setSettingsVisible(false)}
            group={selectedGroup}
            currentUser={currentUser}
            ownerId={ownerId}
            isDarkMode={isDarkMode}
            theme={theme}
            onDeleteHistory={(groupId) => {
              updateGroupById(groupId, (g) => ({ ...g, messages: [] }));
            }}
          />
        ) : (
          <GroupSettingsModal
            visible={settingsVisible}
            onClose={() => setSettingsVisible(false)}
            group={selectedGroup}
            currentUser={currentUser}
            ownerId={ownerId}
            isDarkMode={isDarkMode}
            theme={theme}
            onRenameGroup={(groupId, newName) => {
              updateGroupById(groupId, (g) => ({ ...g, name: newName }));
            }}
            onAddMember={async (groupId, memberQuery) => {
              const users = await searchFriends(memberQuery, ownerId);
              if (users && users.length > 0) {
                const userToAdd = users[0];
                updateGroupById(groupId, (g) => ({
                  ...g,
                  membersList: dedupeMembers([...(g.membersList || []), createMember(userToAdd)]),
                }));
                Alert.alert('Thành công', `Đã thêm ${userToAdd.name} vào nhóm!`);
              } else {
                Alert.alert('Thông báo', 'Không tìm thấy người dùng phù hợp.');
              }
            }}
            onRemoveMember={(groupId, memberIdToRemove) => {
              updateGroupById(groupId, (g) => ({
                ...g,
                membersList: (g.membersList || []).filter((m) => String(m.firebaseUid || m.id) !== String(memberIdToRemove)),
                deputyIds: (g.deputyIds || []).filter((id) => String(id) !== String(memberIdToRemove)),
              }));
              Alert.alert('Thành công', 'Đã xóa thành viên khỏi nhóm.');
            }}
            onToggleDeputy={(groupId, memberIdToToggle) => {
              updateGroupById(groupId, (g) => {
                const currentDeputies = g.deputyIds || [];
                const isDep = currentDeputies.includes(memberIdToToggle);
                const nextDeputies = isDep
                  ? currentDeputies.filter((id) => String(id) !== String(memberIdToToggle))
                  : [...currentDeputies, memberIdToToggle];
                return { ...g, deputyIds: nextDeputies };
              });
            }}
            onLeaveGroup={(groupId) => {
              setGroups((prev) => prev.filter((g) => g.id !== groupId));
              setChatModalVisible(false);
              setSelectedGroupId(null);
              Alert.alert('Rời nhóm', 'Bạn đã rời khỏi nhóm chat.');
            }}
            onDisbandGroup={(groupId) => {
              setGroups((prev) => prev.filter((g) => g.id !== groupId));
              setChatModalVisible(false);
              setSelectedGroupId(null);
              Alert.alert('Giải tán nhóm', 'Đã giải tán nhóm chat vĩnh viễn.');
            }}
          />
        )
      )}

      {/* Modal Thu Tiền */}
      <ThuTienModal
        visible={thuTienModalVisible}
        onClose={() => setThuTienModalVisible(false)}
        theme={theme}
        selectedGroup={selectedGroup}
        selectedFundMemberId={selectedFundMemberId}
        setSelectedFundMemberId={setSelectedFundMemberId}
        fundContributionInput={fundContributionInput}
        setFundContributionInput={setFundContributionInput}
        fundContributionNote={fundContributionNote}
        setFundContributionNote={setFundContributionNote}
        fundStkInput={fundStkInput}
        setFundStkInput={setFundStkInput}
        billImage={fundBillImage}
        setBillImage={setFundBillImage}
        onSubmit={() => { handleAddContribution(); setThuTienModalVisible(false); }}
      />

      {/* Modal Chi Tiền */}
      <ChiTienModal
        visible={chiTienModalVisible}
        onClose={() => setChiTienModalVisible(false)}
        theme={theme}
        fundExpenseTitle={fundExpenseTitle}
        setFundExpenseTitle={setFundExpenseTitle}
        fundExpenseInput={fundExpenseInput}
        setFundExpenseInput={setFundExpenseInput}
        onSubmit={() => { handleAddExpense(); setChiTienModalVisible(false); }}
      />

      {/* Modal Lên Lịch Trình AI */}
      <AIPlanningModal
        visible={aiPlannerModalVisible}
        onClose={() => setAiPlannerModalVisible(false)}
        theme={theme}
        planDaysInput={planDaysInput}
        setPlanDaysInput={setPlanDaysInput}
        planStartDate={planStartDate}
        setPlanStartDate={setPlanStartDate}
        planEndDate={planEndDate}
        setPlanEndDate={setPlanEndDate}
        selectedDestinationId={selectedDestinationId}
        setSelectedDestinationId={setSelectedDestinationId}
        selectedStyleId={selectedStyleId}
        setSelectedStyleId={setSelectedStyleId}
        selectedBudgetId={selectedBudgetId}
        setSelectedBudgetId={setSelectedBudgetId}
        isGeneratingPlan={isGeneratingPlan}
        TRAVEL_DESTINATIONS={getSortedDestinations(selectedGroup || {})}
        onNavigateToMapWithPlace={(place) => {
          setAiPlannerModalVisible(false);
          setChatModalVisible(false);
          if (onNavigateToMapWithPlace) onNavigateToMapWithPlace(place);
        }}
        onSubmit={async () => {
          await handleGenerateItinerary();
          setAiPlannerModalVisible(false);
        }}
      />

      {/* Modal Chỉnh Sửa Hoạt Động Lịch Trình */}
      <EditActivityModal
        visible={editActivityModalVisible}
        onClose={() => setEditActivityModalVisible(false)}
        theme={theme}
        editingActivityTitle={editingActivityTitle}
        setEditingActivityTitle={setEditingActivityTitle}
        editingActivityText={editingActivityText}
        setEditingActivityText={setEditingActivityText}
        onSave={handleSaveActivity}
      />

      {/* Modal Chia Bill (Split Bill) */}
      <SplitBillModal
        visible={splitBillModalVisible}
        onClose={() => setSplitBillModalVisible(false)}
        theme={theme}
        selectedGroup={selectedGroup}
        onSubmit={handleSplitBill}
      />

      <UserProfileModal
        username={targetUsername}
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        isDarkMode={isDarkMode}
        theme={theme}
        currentUser={currentUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: { flex: 1, width: '100%' },
  socialHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 44,
  },
  socialTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  socialSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 4, lineHeight: 16 },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupsSection: { paddingHorizontal: 16, marginTop: 20 },
  createGroupBtnCard: {
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 16,
  },
  createGroupBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createGroupBtnText: { color: '#fff', fontSize: 13.5, fontWeight: '800' },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1.5,
  },
  groupCoverImage: { width: 68, height: 68, borderRadius: 14 },
  directAvatarFrame: {
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directAvatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  directAvatarImage: {
    width: '100%',
    height: '100%',
  },
  directStatusActiveDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  groupAvatarFrame: {
    width: 58,
    height: 58,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  groupAvatarImage: {
    width: '100%',
    height: '100%',
  },
  lastMsgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  lastMsgTime: {
    fontSize: 9.5,
    color: '#94a3b8',
    fontWeight: '600',
    marginLeft: 8,
  },
  groupCardInfo: { flex: 1 },
  groupTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  groupCardName: { fontSize: 14.5, fontWeight: '800', flex: 1, letterSpacing: -0.2 },
  groupMembersCount: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  groupMembersText: { fontSize: 9.5, fontWeight: '800' },
  groupCardLastMsg: { fontSize: 11.5, fontWeight: '500', marginTop: 6, opacity: 0.8 },
  groupTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  groupTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  groupTagBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    height: height * 0.7,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: 24,
  },
  settingsModalCard: {
    width: '100%',
    height: height * 0.88,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalHeader: {
    height: 58,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  modalHeaderTitle: { fontSize: 16, fontWeight: '900' },
  closeModalBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  inputLabel: { fontSize: 12, fontWeight: '800' },
  formInputGroup: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formTextInput: { flex: 1, fontSize: 13, fontWeight: '600', marginLeft: 10 },
  modalFooter: { borderTopWidth: 1, padding: 16 },
  modalSubmitBtn: { height: 46, borderRadius: 12, overflow: 'hidden' },
  modalSubmitGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalSubmitText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  chatRoomContainer: { flex: 1, backgroundColor: '#000000' },
  chatHeader: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight || 0) + 12,
    paddingBottom: 14,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  backChatBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  chatHeaderAvatarWrapper: { position: 'relative', marginLeft: 10 },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  statusActiveDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#1a0533',
  },
  chatHeaderName: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: -0.2, maxWidth: 180 },
  chatHeaderSubText: { fontSize: 10.5, color: 'rgba(196,181,253,0.65)', fontWeight: '600', marginTop: 2 },
  chatInfoBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 6,
  },
  chatHeaderAvatarInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderAvatarInitialsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workspaceTabBar: {
    flexDirection: 'row',
    height: 46,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  workspaceTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: '100%',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  workspaceTabButtonActive: {
    borderBottomColor: '#0084ff',
    backgroundColor: 'rgba(0, 132, 255, 0.08)',
  },
  workspaceTabText: { fontSize: 11.5, fontWeight: '800' },
  messageStream: { flex: 1, padding: 16 },
  systemJoinMsg: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.8,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  systemJoinText: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 16 },
  systemBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  systemBubbleText: { fontSize: 11, lineHeight: 16, fontWeight: '600' },
  msgWrapper: { marginBottom: 14, maxWidth: '82%' },
  msgWrapperMe: { alignSelf: 'flex-end' },
  msgBubbleMe: {
    borderRadius: 18,
    borderBottomRightRadius: 3,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
    borderColor: 'transparent',
  },
  msgTextMe: { color: '#fff', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  msgMetaMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginRight: 4,
    alignSelf: 'flex-end',
  },
  msgTimeTextMe: { fontSize: 9.5, fontWeight: '600' },
  otherMsgRow: {
    flexDirection: 'row',
    gap: 10,
  },
  otherMsgAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  otherMsgCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  otherMsgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  msgUserNameText: { fontSize: 11, fontWeight: '800', letterSpacing: -0.1 },
  msgUserRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  msgUserRankText: {
    fontSize: 8,
    fontWeight: '800',
  },
  msgBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0.8,
  },
  msgBubbleOther: {
    borderBottomLeftRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  msgTextContent: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  msgTimeTextOther: { fontSize: 9.5, fontWeight: '600', marginTop: 4, marginLeft: 4 },
  quickSuggestionsWrapper: {
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  suggestionsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 0.8,
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chatInputWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
  },
  chatInputInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatInputAttachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatInputField: {
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 40,
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  chatEmojiBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  chatSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  chatSendGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  workspaceScroll: { flex: 1 },
  workspaceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  workspaceSectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  workspaceTitle: { fontSize: 14, fontWeight: '900', letterSpacing: -0.2 },
  workspaceSubtitle: { fontSize: 11.5, lineHeight: 17, marginTop: 4, fontWeight: '600' },
  formTripleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  miniField: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  singleField: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  miniFieldLabel: { fontSize: 10.5, fontWeight: '700' },
  miniFieldInput: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    paddingVertical: 0,
  },
  destinationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  destinationChipText: { fontSize: 11.5, fontWeight: '800' },
  destinationPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  destinationPreviewImage: { width: 64, height: 64, borderRadius: 14 },
  destinationPreviewTitle: { fontSize: 13.5, fontWeight: '900' },
  destinationPreviewRegion: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  destinationPreviewIntro: { fontSize: 10.5, lineHeight: 16, marginTop: 4, fontWeight: '600' },
  primaryActionBtn: {
    height: 46,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 16,
  },
  primaryActionGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  helperAlertText: { fontSize: 11, lineHeight: 17, marginTop: 10, fontWeight: '700' },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  metricIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTitle: { fontSize: 10.5, fontWeight: '700', marginTop: 12 },
  metricValue: { fontSize: 13, fontWeight: '900', marginTop: 6 },
  metricSubtitle: { fontSize: 10, lineHeight: 14, marginTop: 4, fontWeight: '600' },
  highlightsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  highlightChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  highlightChipText: { fontSize: 10.5, fontWeight: '700' },
  inlineActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  secondaryActionBtn: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryActionText: { fontSize: 11.5, fontWeight: '800' },
  dayCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dayTitle: { fontSize: 14, fontWeight: '900' },
  daySubTitle: { fontSize: 10.5, fontWeight: '700', marginTop: 4 },
  weatherBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  weatherBadgeText: { color: '#3b82f6', fontSize: 10.5, fontWeight: '800' },
  dayWeatherText: { fontSize: 11.5, lineHeight: 17, marginTop: 10, fontWeight: '700' },
  dayNoteText: { fontSize: 11, lineHeight: 16, marginTop: 6, fontWeight: '600' },
  daySlotRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  daySlotTitle: { fontSize: 11, fontWeight: '800', marginBottom: 5 },
  daySlotText: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
  dayRouteText: { fontSize: 11, lineHeight: 17, marginTop: 12, fontWeight: '700' },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  memberChipAvatar: { width: 24, height: 24, borderRadius: 12 },
  memberChipText: { fontSize: 10.5, fontWeight: '800' },
  financeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  financeIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  financeTitle: { fontSize: 12.5, fontWeight: '800' },
  financeSubtitle: { fontSize: 10.5, fontWeight: '600', marginTop: 3 },
  financeAmountPositive: { color: '#10b981', fontSize: 12.5, fontWeight: '900' },
  financeAmountNegative: { color: '#ef4444', fontSize: 12.5, fontWeight: '900' },
  searchFieldWrap: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  memberSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  memberSearchAvatar: { width: 44, height: 44, borderRadius: 22 },
  memberSearchName: { fontSize: 12.5, fontWeight: '800' },
  memberSearchMeta: { fontSize: 10.5, fontWeight: '600', marginTop: 4 },
  memberManagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  memberActionColumn: { gap: 8, alignItems: 'flex-end' },
  smallRoleBtn: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallRoleBtnText: { fontSize: 10, fontWeight: '800' },
  rolePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  rolePillText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  leaveGroupBtn: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  leaveGroupText: { color: '#ef4444', fontSize: 12.5, fontWeight: '900' },
  newSummaryRow: {
    flexDirection: 'column',
    gap: 12,
  },
  summaryCardPrimary: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryLabelPrimary: {
    fontSize: 12.5,
    color: '#e0e7ff',
    fontWeight: '600',
  },
  summaryValuePrimary: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  summaryFooterPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  summaryFooterTextPrimary: {
    fontSize: 10,
    color: '#c7d2fe',
    fontWeight: '700',
  },
  newSummarySubRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCardSub: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  summaryLabelSub: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  summaryValueSub: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  fundMemberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    padding: 1.5,
  },
  paidBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  pendingBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  fundMemberName: {
    fontSize: 11,
    fontWeight: '750',
    textAlign: 'center',
    width: '100%',
  },
  unpaidText: {
    fontSize: 8.5,
    color: '#ef4444',
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtnOutline: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12.5,
    fontWeight: '850',
  },
  actionBtnFilled: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBtnTextFilled: {
    fontSize: 12.5,
    fontWeight: '850',
    color: '#fff',
  },
  newTransactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  transactionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
  },
  transactionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  transactionMeta: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  transactionTimeText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  transactionAmountPositive: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#10b981',
    marginLeft: 10,
  },
  transactionAmountNegative: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#ef4444',
    marginLeft: 10,
  },
  msgHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 44,
    paddingBottom: 12,
  },
  msgBackBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgHeaderTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  msgHeaderTitleCenter: {
    fontSize: 18,
    fontWeight: '850',
    letterSpacing: -0.2,
    flex: 1,
    textAlign: 'center',
  },
  msgTabFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  msgFilterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  destinationChipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  destinationChipImage: {
    width: 24,
    height: 24,
    borderRadius: 8,
  },
  destinationChipText: {
    fontSize: 12,
  },
  msgFilterTabText: {
    fontSize: 12.5,
  },
  msgCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 19,
    marginTop: 10,
  },
  msgSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  activeUsersSection: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  activeUserCreateBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeUserAvatarFrame: {
    position: 'relative',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  activeUserAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  activeUserOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  activeUserName: {
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  msgChatListContainer: {
    marginTop: 6,
  },
  msgChatRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  msgAvatarWrapper: {
    position: 'relative',
  },
  msgAvatarFrame: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgAvatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    overflow: 'hidden',
  },
  msgAvatarImg: {
    width: '100%',
    height: '100%',
  },
  msgAvatarImgRound: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgOnlineActiveDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  msgChatInfo: {
    flex: 1,
    marginLeft: 14,
    minWidth: 0,
  },
  msgChatName: {
    fontSize: 14.5,
    letterSpacing: -0.2,
  },
  msgLastMsgText: {
    fontSize: 12.5,
  },
  msgTimeDot: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  msgRightStatus: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgUnreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f43f5e',
  },
  msgSeenAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});
