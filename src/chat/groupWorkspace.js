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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loadAppData, saveAppData } from '../services/appDataService';
import { searchFriends } from '../services/userService';
import { addChatMembers, createChatGroup, getChatGroups, getChatMessages, removeChatMember, renameChatGroup, sendChatMessage } from '../services/chatService';
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
} from 'lucide-react-native';

import { UserProfileModal } from '../social';

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
];

const initialGroups = [];

const SEEDED_GROUP_IDS = new Set([1, 2, 3]);

const sanitizeGroups = (items) => (
  Array.isArray(items)
    ? items.filter((group) => group && !SEEDED_GROUP_IDS.has(Number(group.id)))
    : []
);

const getUserAvatarByName = (name) => {
  if (!name) return 'https://i.pravatar.cc/150?img=11';

  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const imgIndex = Math.abs(hash % 70) + 1;
  return `https://i.pravatar.cc/150?img=${imgIndex}`;
};

const getUserLevelByName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
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
    id: rawMember?.id || rawMember?.firebaseUid || rawMember?.email || buildMemberId(displayName),
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
        { title: 'Buổi sáng', text: morning },
        { title: 'Buổi chiều', text: afternoon },
        { title: 'Buổi tối', text: evening },
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
  };
};

const buildDefaultGroups = (currentUser, ownerId) => sanitizeGroups(initialGroups).map((group) => normalizeGroup(group, currentUser, ownerId));

const normalizeApiMessage = (message, currentUser, ownerId) => ({
  id: message._id || message.id,
  senderId: message.senderId,
  user: message.sender?.name || (message.senderId === ownerId ? currentUser?.name : 'Thành viên Vivu360'),
  avatar: message.sender?.avatar || '',
  text: message.content || '',
  createdAt: message.createdAt,
});

const normalizeApiGroup = (group, currentUser, ownerId) => normalizeGroup({
  id: group._id || group.id,
  name: group.name,
  image: group.avatar || GROUP_IMAGES[0],
  tag: 'Du lịch',
  creatorId: group.ownerId,
  leaderId: group.ownerId,
  deputyIds: (group.admins || []).filter((id) => id !== group.ownerId),
  membersList: group.memberProfiles || [],
  lastMessage: group.lastMessage ? `${group.lastMessage.senderId === ownerId ? currentUser?.name || 'Bạn' : 'Thành viên'}: ${group.lastMessage.content}` : 'Nhóm chưa có tin nhắn',
  messages: [],
}, currentUser, ownerId);

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

export function ChatScreen({ ownerId, isDarkMode, theme, currentUser, onNavigateToTab, prevScreen }) {
  const [groups, setGroups] = useState(() => buildDefaultGroups(currentUser, ownerId));
  const [groupsOwnerId, setGroupsOwnerId] = useState(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState('chat');

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTag, setNewGroupTag] = useState('');

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) || null;

  const [chatInput, setChatInput] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const [renameGroupName, setRenameGroupName] = useState('');
  const [memberSearchText, setMemberSearchText] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [memberSearchError, setMemberSearchError] = useState('');
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [planDaysInput, setPlanDaysInput] = useState('3');
  const [planStartDate, setPlanStartDate] = useState(getTodayIso());
  const [planEndDate, setPlanEndDate] = useState(shiftIsoDate(getTodayIso(), 2));
  const [selectedDestinationId, setSelectedDestinationId] = useState(TRAVEL_DESTINATIONS[0].id);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planStatusMessage, setPlanStatusMessage] = useState('');

  const [fundGoalInput, setFundGoalInput] = useState('');
  const [selectedFundMemberId, setSelectedFundMemberId] = useState(getCurrentUserMemberId(currentUser, ownerId));
  const [fundContributionInput, setFundContributionInput] = useState('');
  const [fundContributionNote, setFundContributionNote] = useState('');
  const [fundExpenseTitle, setFundExpenseTitle] = useState('');
  const [fundExpenseInput, setFundExpenseInput] = useState('');

  const messageStreamRef = useRef(null);
  const currentUserId = getCurrentUserMemberId(currentUser, ownerId);
  const currentUserMember = selectedGroup?.membersList.find((member) => member.id === currentUserId) || createMember({ id: currentUserId, name: currentUser?.name, avatar: currentUser?.avatar, email: currentUser?.email });
  const sortedDestinations = getSortedDestinations(selectedGroup || {});
  const activeDestination = sortedDestinations.find((destination) => destination.id === selectedDestinationId) || sortedDestinations[0] || TRAVEL_DESTINATIONS[0];
  const fundTotals = getFundTotals(selectedGroup?.fund);

  useEffect(() => {
    if (!ownerId) return undefined;

    let active = true;

    setIsLoadingGroups(true);
    Promise.all([getChatGroups(ownerId), loadAppData(ownerId, 'chat').catch(() => null)])
      .then(([apiGroups, saved]) => {
        if (!active) return;

        const savedMap = new Map(sanitizeGroups(saved?.groups).map(group => [String(group.id), group]));
        setGroups((apiGroups || []).map(apiGroup => {
          const remote = normalizeApiGroup(apiGroup, currentUser, ownerId);
          const local = savedMap.get(String(remote.id));
          return local ? normalizeGroup({ ...local, ...remote, itinerary: local.itinerary, fund: local.fund }, currentUser, ownerId) : remote;
        }));
      })
      .catch((error) => {
        console.warn('Không thể tải nhóm chat:', error.message);
        if (active) Alert.alert('Không thể tải chat', 'Hãy kiểm tra Vivu360_API đang chạy và thử lại.');
      })
      .finally(() => {
        if (active) {
          setGroupsOwnerId(ownerId);
          setIsLoadingGroups(false);
        }
      });

    return () => {
      active = false;
    };
  }, [ownerId, currentUser?.name, currentUser?.avatar, currentUser?.email]);

  useEffect(() => {
    if (!chatModalVisible || !selectedGroupId || !ownerId) return undefined;
    let active = true;
    const loadMessages = () => getChatMessages(selectedGroupId, ownerId)
      .then(messages => {
        if (!active) return;
        setGroups(prevGroups => prevGroups.map(group => group.id !== selectedGroupId ? group : normalizeGroup({
          ...group,
          messages: messages.map(message => normalizeApiMessage(message, currentUser, ownerId)),
        }, currentUser, ownerId)));
      })
      .catch(error => console.warn('Không thể tải tin nhắn:', error.message));
    loadMessages();
    const timer = setInterval(loadMessages, 3000);
    return () => { active = false; clearInterval(timer); };
  }, [chatModalVisible, selectedGroupId, ownerId]);

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
  }, [memberSearchText, settingsVisible, ownerId, selectedGroup?.membersList]);

  const updateGroupById = (groupId, updater) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group;
        return normalizeGroup(updater(group), currentUser, ownerId);
      })
    );
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
    setWorkspaceTab('chat');
    setChatModalVisible(true);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !selectedGroup) return;

    const trimmedMessage = chatInput.trim();
    setIsSendingMessage(true);
    try {
      const sent = await sendChatMessage(selectedGroup.id, ownerId, trimmedMessage);
      const newMessage = normalizeApiMessage({ ...sent, sender: { name: currentUser?.name, avatar: currentUser?.avatar } }, currentUser, ownerId);
      updateGroupById(selectedGroup.id, (group) => ({ ...group, lastMessage: `${newMessage.user}: ${trimmedMessage}`, messages: [...group.messages, newMessage] }));
      setChatInput('');
    } catch (error) {
      Alert.alert('Gửi tin nhắn thất bại', error.response?.data?.message || 'Vui lòng thử lại.');
    } finally {
      setIsSendingMessage(false);
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
      createdAt: Date.now(),
    };

    updateGroupById(selectedGroup.id, (group) => ({
      ...group,
      fund: {
        ...group.fund,
        contributions: [contribution, ...group.fund.contributions],
      },
    }));

    setFundContributionInput('');
    setFundContributionNote('');
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
        ...group.fund,
        expenses: [expense, ...group.fund.expenses],
      },
    }));

    setFundExpenseTitle('');
    setFundExpenseInput('');
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

  return (
    <View style={styles.tabContainer}>
      <View style={styles.socialHeader}>
        <View style={styles.headerTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable style={[styles.backBtn, { backgroundColor: theme.searchBg }]} onPress={() => onNavigateToTab && onNavigateToTab(prevScreen || 'social')}>
              <ChevronLeft size={20} color={theme.textPrimary} />
            </Pressable>
            <Text style={[styles.socialTitle, { color: theme.textPrimary }]}>Nhóm trò chuyện</Text>
          </View>
        </View>
        <Text style={[styles.socialSubtitle, { color: theme.textSecondary, marginLeft: 44 }]}>
          Kết nối, lập lịch trình và quản lý quỹ cho chuyến đi ngay trong nhóm
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.groupsSection}>
          <Pressable style={[styles.createGroupBtnCard, { borderColor: theme.border }]} onPress={() => setGroupModalVisible(true)}>
            <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.createGroupBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Plus size={20} color="#fff" />
              <Text style={styles.createGroupBtnText}>Tạo nhóm trò chuyện mới</Text>
            </LinearGradient>
          </Pressable>

          {isLoadingGroups ? (
            <ActivityIndicator color="#3b82f6" style={{ marginTop: 32 }} />
          ) : groups.length > 0 ? groups.map((group) => (
            <Pressable
              key={group.id}
              style={[styles.groupCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}
              onPress={() => handleOpenChat(group)}
            >
              <Image source={{ uri: group.image }} style={styles.groupCoverImage} />
              <View style={styles.groupCardInfo}>
                <View style={styles.groupTitleRow}>
                  <Text numberOfLines={1} style={[styles.groupCardName, { color: theme.textPrimary }]}>{group.name}</Text>
                  <View style={[styles.groupMembersCount, { backgroundColor: theme.statusBg, borderColor: theme.border, borderWidth: 0.5 }]}>
                    <Users size={11} color="#3b82f6" />
                    <Text style={[styles.groupMembersText, { color: "#3b82f6" }]}>{group.members} TV</Text>
                  </View>
                </View>
                <View style={styles.groupTagsContainer}>
                  {String(group.tag || '')
                    .split(' / ')
                    .filter(Boolean)
                    .map((tagItem, index) => {
                      const tagColors = getTagColors(tagItem, isDarkMode);
                      return (
                        <View key={`${group.id}-${index}`} style={[styles.groupTagBadge, { backgroundColor: tagColors.bg, borderColor: tagColors.border }]}>
                          <Text style={[styles.groupTagBadgeText, { color: tagColors.text }]}>{tagItem}</Text>
                        </View>
                      );
                    })}
                </View>
                <Text numberOfLines={1} style={[styles.groupCardLastMsg, { color: theme.textSecondary }]}>{group.lastMessage}</Text>
              </View>
            </Pressable>
          )) : (
            <View style={[styles.groupCard, { backgroundColor: theme.cardGlass, borderColor: theme.border, alignItems: "center", paddingVertical: 28, paddingHorizontal: 18 }]}>
              <Text style={[styles.groupCardName, { color: theme.textPrimary, textAlign: "center" }]}>Chưa có nhóm chat nào</Text>
              <Text style={[styles.groupCardLastMsg, { color: theme.textSecondary, textAlign: "center", marginTop: 8 }]}>
                Tạo nhóm đầu tiên để bắt đầu trò chuyện, lập lịch trình và quản lý quỹ cùng nhau.
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
                <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.modalSubmitGradient}>
                  <Plus size={16} color="#fff" />
                  <Text style={styles.modalSubmitText}>Khởi tạo nhóm</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {selectedGroup && (
        <Modal animationType="fade" transparent={false} visible={chatModalVisible} onRequestClose={() => setChatModalVisible(false)}>
          <View style={[styles.chatRoomContainer, { backgroundColor: theme.background }]}>
            <LinearGradient colors={isDarkMode ? ['#0f172a', '#020617'] : ['#f8fafc', '#e2e8f0']} style={{ flex: 1 }}>
              <View style={[styles.chatHeader, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.92)', borderBottomColor: theme.border }]}>
                <Pressable style={[styles.backChatBtn, { backgroundColor: theme.searchBg }]} onPress={() => setChatModalVisible(false)}>
                  <X size={18} color={theme.textPrimary} />
                </Pressable>
                <View style={styles.chatHeaderAvatarWrapper}>
                  <Image source={{ uri: selectedGroup.image }} style={styles.chatHeaderAvatar} />
                  <View style={styles.statusActiveDot} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text numberOfLines={1} style={[styles.chatHeaderName, { color: theme.textPrimary }]}>
                    {selectedGroup.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <Text style={styles.chatHeaderMembers}>{selectedGroup.members} thành viên</Text>
                    <RolePill role={currentRole} isDarkMode={isDarkMode} />
                  </View>
                </View>
                <Pressable
                  style={[styles.chatInfoBtn, { backgroundColor: theme.searchBg }]}
                  onPress={() =>
                    Alert.alert(
                      'Thông tin nhóm',
                      `${selectedGroup.name}\nChủ đề: ${selectedGroup.tag}\nTrưởng nhóm: ${
                        selectedGroup.membersList.find((member) => member.id === selectedGroup.leaderId)?.name || 'Đang cập nhật'
                      }\nThành viên: ${selectedGroup.members}`
                    )
                  }
                >
                  <Info size={16} color={theme.textSecondary} />
                </Pressable>
                <Pressable style={[styles.chatInfoBtn, { backgroundColor: theme.searchBg }]} onPress={() => setSettingsVisible(true)}>
                  <Settings2 size={16} color={theme.textSecondary} />
                </Pressable>
              </View>

              <View style={[styles.workspaceTabBar, { borderBottomColor: theme.border, backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.8)' }]}>
                {WORKSPACE_TABS.map((tabItem) => {
                  const isActive = workspaceTab === tabItem.key;
                  const Icon = tabItem.Icon;

                  return (
                    <Pressable
                      key={tabItem.key}
                      style={[styles.workspaceTabButton, isActive ? styles.workspaceTabButtonActive : null, { backgroundColor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent', borderColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent' }]}
                      onPress={() => setWorkspaceTab(tabItem.key)}
                    >
                      <Icon size={15} color={isActive ? '#3b82f6' : theme.textSecondary} />
                      <Text style={[styles.workspaceTabText, { color: isActive ? '#3b82f6' : theme.textSecondary }]}>{tabItem.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {workspaceTab === 'chat' ? (
                <>
                  <ScrollView ref={messageStreamRef} style={styles.messageStream} contentContainerStyle={{ paddingBottom: 24 }}>
                    <View style={[styles.systemJoinMsg, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.05)', borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)' }]}>
                      <Text style={[styles.systemJoinText, { color: theme.textSecondary }]}>
                        Đây là phòng chat nhóm. Bên cạnh trò chuyện, bạn có thể chuyển sang tab lịch trình và quỹ du lịch để chốt kế hoạch cho cả nhóm.
                      </Text>
                    </View>

                    {selectedGroup.messages.map((message) => {
                      if (message.user === 'Hệ thống') {
                        return (
                          <View key={message.id} style={[styles.systemBubble, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255,255,255,0.78)', borderColor: theme.border }]}>
                            <Text style={[styles.systemBubbleText, { color: theme.textSecondary }]}>{message.text}</Text>
                          </View>
                        );
                      }

                      const isMe = message.user === currentUser?.name;
                      const messageTime = getFormattedMsgTime(message.createdAt || message.id);

                      return (
                        <View key={message.id} style={[styles.msgWrapper, isMe ? styles.msgWrapperMe : null]}>
                          {isMe ? (
                            <View style={{ alignItems: 'flex-end' }}>
                              <LinearGradient colors={['#06b6d4', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.msgBubble, styles.msgBubbleMe]}>
                                <Text style={styles.msgTextMe}>{message.text}</Text>
                              </LinearGradient>
                              <View style={styles.msgMetaMe}>
                                <Text style={[styles.msgTimeTextMe, { color: theme.textMuted }]}>{messageTime}</Text>
                                <CheckCheck size={11} color="#06b6d4" />
                              </View>
                            </View>
                          ) : (
                            <View style={styles.otherMsgRow}>
                              <Pressable onPress={() => { setChatModalVisible(false); handleOpenUserProfile(message.user); }}>
                                <Image source={{ uri: message.avatar || getUserAvatarByName(message.user) }} style={styles.otherMsgAvatar} />
                              </Pressable>

                              <View style={styles.otherMsgCol}>
                                <View style={styles.otherMsgHeader}>
                                  <Pressable onPress={() => { setChatModalVisible(false); handleOpenUserProfile(message.user); }}>
                                    <Text style={[styles.msgUserNameText, { color: theme.textPrimary }]}>{message.user}</Text>
                                  </Pressable>
                                  {(() => {
                                    const rank = getUserRankColors(message.user);
                                    return (
                                      <LinearGradient colors={rank.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.msgUserRankBadge}>
                                        <Award size={8} color={rank.iconColor} />
                                        <Text style={[styles.msgUserRankText, { color: rank.textColor }]}>{getUserLevelByName(message.user)}</Text>
                                      </LinearGradient>
                                    );
                                  })()}
                                </View>

                                <View
                                  style={[
                                    styles.msgBubble,
                                    styles.msgBubbleOther,
                                    {
                                      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
                                      borderColor: theme.border,
                                      borderLeftWidth: 3.5,
                                      borderLeftColor: getUserRankColors(message.user).colors[0],
                                    },
                                  ]}
                                >
                                  <Text style={[styles.msgTextContent, { color: theme.textPrimary }]}>{message.text}</Text>
                                </View>
                                <Text style={[styles.msgTimeTextOther, { color: theme.textMuted }]}>{messageTime}</Text>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>

                  <View style={[styles.quickSuggestionsWrapper, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)', borderTopColor: theme.border }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScrollContent}>
                      {QUICK_REPLIES.map((reply) => (
                        <Pressable
                          key={reply}
                          style={[styles.suggestionChip, { backgroundColor: theme.searchBg, borderColor: theme.border }]}
                          onPress={() => setChatInput(reply)}
                        >
                          <Text style={[styles.suggestionChipText, { color: theme.textSecondary }]}>{reply}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={[styles.chatInputWrapper, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', borderTopColor: theme.border }]}>
                    <View style={styles.chatInputInnerRow}>
                      <Pressable
                        style={[styles.chatInputAttachBtn, { backgroundColor: theme.searchBg }]}
                        onPress={() => Alert.alert('Đính kèm tệp', 'Tính năng đính kèm tệp đang được chuẩn bị cho nhóm chat.')}
                      >
                        <Paperclip size={16} color={theme.textSecondary} />
                      </Pressable>
                      <Pressable
                        style={[styles.chatInputAttachBtn, { backgroundColor: theme.searchBg, marginRight: 4 }]}
                        onPress={() => Alert.alert('Chụp ảnh', 'Tính năng chia sẻ ảnh trực tiếp đang được hoàn thiện.')}
                      >
                        <Camera size={16} color={theme.textSecondary} />
                      </Pressable>

                      <View style={{ flex: 1, position: 'relative' }}>
                        <TextInput
                          placeholder="Nhập tin nhắn trò chuyện..."
                          placeholderTextColor={theme.textMuted}
                          value={chatInput}
                          onChangeText={setChatInput}
                          style={[styles.chatInputField, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}
                        />
                        <Pressable style={styles.emojiFieldBtn}>
                          <Smile size={16} color={theme.textMuted} />
                        </Pressable>
                      </View>

                      <Pressable style={[styles.sendMsgBtn, isSendingMessage && { opacity: 0.55 }]} onPress={handleSendChatMessage} disabled={isSendingMessage}>
                        <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.sendMsgGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                          <Send size={14} color="#fff" />
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </View>
                </>
              ) : workspaceTab === 'planner' ? (
                <ScrollView style={styles.workspaceScroll} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                  <View style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                    <View style={styles.workspaceSectionHeader}>
                      <View>
                        <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Khởi tạo lịch trình theo ngày</Text>
                        <Text style={[styles.workspaceSubtitle, { color: theme.textSecondary }]}>
                          Chọn số ngày, ngày đi và ngày về. Hệ thống sẽ gợi ý theo forecast thực tế nếu có Google Weather API.
                        </Text>
                      </View>
                      <CloudSun size={18} color="#3b82f6" />
                    </View>

                    <View style={styles.formTripleRow}>
                      <View style={[styles.miniField, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
                        <Text style={[styles.miniFieldLabel, { color: theme.textSecondary }]}>Số ngày</Text>
                        <TextInput
                          value={planDaysInput}
                          onChangeText={setPlanDaysInput}
                          keyboardType="numeric"
                          maxLength={2}
                          style={[styles.miniFieldInput, { color: theme.textPrimary }]}
                          placeholder="3"
                          placeholderTextColor={theme.textMuted}
                        />
                      </View>
                      <View style={[styles.miniField, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
                        <Text style={[styles.miniFieldLabel, { color: theme.textSecondary }]}>Ngày bắt đầu</Text>
                        <TextInput
                          value={planStartDate}
                          onChangeText={setPlanStartDate}
                          style={[styles.miniFieldInput, { color: theme.textPrimary }]}
                          placeholder="2026-07-18"
                          placeholderTextColor={theme.textMuted}
                        />
                      </View>
                    </View>

                    <View style={[styles.singleField, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
                      <Text style={[styles.miniFieldLabel, { color: theme.textSecondary }]}>Ngày kết thúc</Text>
                      <TextInput
                        value={planEndDate}
                        onChangeText={setPlanEndDate}
                        style={[styles.miniFieldInput, { color: theme.textPrimary }]}
                        placeholder="2026-07-20"
                        placeholderTextColor={theme.textMuted}
                      />
                    </View>

                    <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 14 }]}>Điểm đến gợi ý cho nhóm</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10 }}>
                      {sortedDestinations.map((destination) => {
                        const isSelected = selectedDestinationId === destination.id;
                        return (
                          <Pressable
                            key={destination.id}
                            style={[
                              styles.destinationChip,
                              {
                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.16)' : theme.searchBg,
                                borderColor: isSelected ? 'rgba(59, 130, 246, 0.32)' : theme.searchBorder,
                              },
                            ]}
                            onPress={() => setSelectedDestinationId(destination.id)}
                          >
                            <MapPinned size={14} color={isSelected ? '#3b82f6' : theme.textSecondary} />
                            <Text style={[styles.destinationChipText, { color: isSelected ? '#3b82f6' : theme.textSecondary }]}>{destination.name}</Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    <View style={[styles.destinationPreviewCard, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255,255,255,0.7)', borderColor: theme.border }]}>
                      <Image source={{ uri: activeDestination.image }} style={styles.destinationPreviewImage} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.destinationPreviewTitle, { color: theme.textPrimary }]}>{activeDestination.name}</Text>
                        <Text style={[styles.destinationPreviewRegion, { color: theme.textSecondary }]}>{activeDestination.region}</Text>
                        <Text style={[styles.destinationPreviewIntro, { color: theme.textMuted }]}>{activeDestination.intro}</Text>
                      </View>
                    </View>

                    <Pressable style={styles.primaryActionBtn} onPress={handleGenerateItinerary} disabled={isGeneratingPlan}>
                      <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.primaryActionGradient}>
                        {isGeneratingPlan ? <ActivityIndicator color="#fff" /> : <RefreshCw size={16} color="#fff" />}
                        <Text style={styles.primaryActionText}>{isGeneratingPlan ? 'Đang tạo lịch trình...' : 'Tạo lịch trình gợi ý'}</Text>
                      </LinearGradient>
                    </Pressable>

                    {!!planStatusMessage && <Text style={[styles.helperAlertText, { color: '#f59e0b' }]}>{planStatusMessage}</Text>}
                  </View>

                  {itinerary?.days?.length ? (
                    <>
                      <View style={styles.metricsRow}>
                        <MetricCard title="Nguồn forecast" value={itinerary.forecastSource || 'Đang cập nhật'} subtitle={`${formatShortDate(itinerary.startDate)} - ${formatShortDate(itinerary.endDate)}`} icon={<CloudSun size={16} color="#3b82f6" />} theme={theme} isDarkMode={isDarkMode} />
                        <MetricCard title="Điểm đến" value={itinerary.destinationName || activeDestination.name} subtitle={itinerary.region || activeDestination.region} icon={<MapPinned size={16} color="#3b82f6" />} theme={theme} isDarkMode={isDarkMode} />
                      </View>

                      <View style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                        <View style={styles.workspaceSectionHeader}>
                          <View>
                            <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Tóm tắt lịch trình</Text>
                            <Text style={[styles.workspaceSubtitle, { color: theme.textSecondary }]}>{itinerary.summary}</Text>
                          </View>
                          <Route size={18} color="#10b981" />
                        </View>

                        <View style={styles.highlightsWrap}>
                          {itinerary.highlights.map((item) => (
                            <View key={item} style={[styles.highlightChip, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
                              <Text style={[styles.highlightChipText, { color: theme.textSecondary }]}>{item}</Text>
                            </View>
                          ))}
                        </View>

                        <View style={styles.inlineActionRow}>
                          <Pressable
                            style={[styles.secondaryActionBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}
                            onPress={() => openExternalUrl(itinerary.destinationMapUrl, 'Không mở được Google Maps cho điểm đến này.')}
                          >
                            <Route size={15} color="#3b82f6" />
                            <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>Mở chỉ đường</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.secondaryActionBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}
                            onPress={() => openExternalUrl(itinerary.weatherUrl, 'Không mở được Google Weather cho điểm đến này.')}
                          >
                            <CloudSun size={15} color="#f59e0b" />
                            <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>Xem thời tiết Google</Text>
                          </Pressable>
                        </View>
                      </View>

                      <View style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                        <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Đồ dùng cần thiết mang theo</Text>
                        <View style={styles.highlightsWrap}>
                          {itinerary.packingList.map((item) => (
                            <View key={item} style={[styles.highlightChip, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
                              <Text style={[styles.highlightChipText, { color: theme.textSecondary }]}>{item}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {itinerary.days.map((dayPlan) => (
                        <View key={dayPlan.id} style={[styles.dayCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                          <View style={styles.dayHeaderRow}>
                            <View>
                              <Text style={[styles.dayTitle, { color: theme.textPrimary }]}>{dayPlan.label}</Text>
                              <Text style={[styles.daySubTitle, { color: theme.textSecondary }]}>Ngày {formatShortDate(dayPlan.date)}</Text>
                            </View>
                            <View style={[styles.weatherBadge, { backgroundColor: isDarkMode ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.08)' }]}>
                              <Text style={styles.weatherBadgeText}>
                                {dayPlan.weather.iconText} {dayPlan.weather.minTemp}° - {dayPlan.weather.maxTemp}°
                              </Text>
                            </View>
                          </View>

                          <Text style={[styles.dayWeatherText, { color: theme.textSecondary }]}>
                            {dayPlan.weather.description} · Mưa {dayPlan.weather.rainChance ?? 0}% · Gió {dayPlan.weather.windKph ?? 0} km/h
                          </Text>
                          <Text style={[styles.dayNoteText, { color: theme.textMuted }]}>{dayPlan.note}</Text>

                          {dayPlan.slots.map((slot) => (
                            <View key={`${dayPlan.id}-${slot.title}`} style={[styles.daySlotRow, { borderColor: theme.border }]}>
                              <Text style={[styles.daySlotTitle, { color: theme.textPrimary }]}>{slot.title}</Text>
                              <Text style={[styles.daySlotText, { color: theme.textSecondary }]}>{slot.text}</Text>
                            </View>
                          ))}

                          <Text style={[styles.dayRouteText, { color: theme.textSecondary }]}>Điểm đến gợi ý: {dayPlan.routeLabel}</Text>

                          <Pressable
                            style={[styles.secondaryActionBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 12 }]}
                            onPress={() => openExternalUrl(dayPlan.mapUrl, 'Không mở được chỉ đường cho chặng này.')}
                          >
                            <Route size={15} color="#3b82f6" />
                            <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>Chỉ đường bằng map</Text>
                          </Pressable>
                        </View>
                      ))}
                    </>
                  ) : null}
                </ScrollView>
              ) : (
                <ScrollView style={styles.workspaceScroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                  <View style={styles.metricsRow}>
                    <MetricCard title="Mục tiêu quỹ" value={formatMoney(fundTotals.goal)} subtitle="Ngân sách chung" icon={<Wallet size={16} color="#3b82f6" />} theme={theme} isDarkMode={isDarkMode} />
                    <MetricCard title="Số dư hiện tại" value={formatMoney(fundTotals.balance)} subtitle={`Còn thiếu ${formatMoney(fundTotals.remaining)}`} icon={<Coins size={16} color="#10b981" />} theme={theme} isDarkMode={isDarkMode} />
                  </View>

                  <View style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                    <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Tiến độ quỹ chuyến đi</Text>
                    <View style={[styles.progressTrack, { backgroundColor: theme.searchBg }]}>
                      <LinearGradient colors={['#06b6d4', '#3b82f6']} style={[styles.progressFill, { width: `${Math.max(fundTotals.progress * 100, fundTotals.balance > 0 ? 8 : 0)}%` }]} />
                    </View>
                    <Text style={[styles.workspaceSubtitle, { color: theme.textSecondary }]}>
                      Tổng đóng góp {formatMoney(fundTotals.contributions)} · Chi ra {formatMoney(fundTotals.expenses)}
                    </Text>
                  </View>

                  <View style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                    <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Thiết lập mục tiêu quỹ</Text>
                    <View style={[styles.singleField, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 12 }]}>
                      <Text style={[styles.miniFieldLabel, { color: theme.textSecondary }]}>Mục tiêu (đ)</Text>
                      <TextInput
                        value={fundGoalInput}
                        onChangeText={setFundGoalInput}
                        keyboardType="numeric"
                        style={[styles.miniFieldInput, { color: theme.textPrimary }]}
                        placeholder="15000000"
                        placeholderTextColor={theme.textMuted}
                      />
                    </View>
                    <Pressable style={[styles.secondaryActionBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 12 }]} onPress={handleSaveFundGoal}>
                      <Wallet size={15} color="#3b82f6" />
                      <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>Lưu mục tiêu quỹ</Text>
                    </Pressable>
                  </View>

                  <View style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                    <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Đóng góp quỹ</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }}>
                      {selectedGroup.membersList.map((member) => {
                        const isSelected = selectedFundMemberId === member.id;
                        return (
                          <Pressable
                            key={member.id}
                            style={[
                              styles.memberChip,
                              {
                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.16)' : theme.searchBg,
                                borderColor: isSelected ? 'rgba(59, 130, 246, 0.32)' : theme.searchBorder,
                              },
                            ]}
                            onPress={() => setSelectedFundMemberId(member.id)}
                          >
                            <Image source={{ uri: member.avatar }} style={styles.memberChipAvatar} />
                            <Text style={[styles.memberChipText, { color: isSelected ? '#3b82f6' : theme.textSecondary }]}>{member.name}</Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    <View style={[styles.singleField, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 12 }]}>
                      <Text style={[styles.miniFieldLabel, { color: theme.textSecondary }]}>Số tiền đóng góp</Text>
                      <TextInput
                        value={fundContributionInput}
                        onChangeText={setFundContributionInput}
                        keyboardType="numeric"
                        style={[styles.miniFieldInput, { color: theme.textPrimary }]}
                        placeholder="500000"
                        placeholderTextColor={theme.textMuted}
                      />
                    </View>

                    <View style={[styles.singleField, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 12 }]}>
                      <Text style={[styles.miniFieldLabel, { color: theme.textSecondary }]}>Ghi chú</Text>
                      <TextInput
                        value={fundContributionNote}
                        onChangeText={setFundContributionNote}
                        style={[styles.miniFieldInput, { color: theme.textPrimary }]}
                        placeholder="Ví dụ: Chuyển khoản đợt 1"
                        placeholderTextColor={theme.textMuted}
                      />
                    </View>

                    <Pressable style={styles.primaryActionBtn} onPress={handleAddContribution}>
                      <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.primaryActionGradient}>
                        <ArrowLeftRight size={16} color="#fff" />
                        <Text style={styles.primaryActionText}>Ghi nhận đóng góp</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>

                  <View style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                    <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Chi tiêu từ quỹ</Text>
                    <View style={[styles.singleField, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 12 }]}>
                      <Text style={[styles.miniFieldLabel, { color: theme.textSecondary }]}>Tên khoản chi</Text>
                      <TextInput
                        value={fundExpenseTitle}
                        onChangeText={setFundExpenseTitle}
                        style={[styles.miniFieldInput, { color: theme.textPrimary }]}
                        placeholder="Ví dụ: Cọc homestay"
                        placeholderTextColor={theme.textMuted}
                      />
                    </View>

                    <View style={[styles.singleField, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 12 }]}>
                      <Text style={[styles.miniFieldLabel, { color: theme.textSecondary }]}>Số tiền chi</Text>
                      <TextInput
                        value={fundExpenseInput}
                        onChangeText={setFundExpenseInput}
                        keyboardType="numeric"
                        style={[styles.miniFieldInput, { color: theme.textPrimary }]}
                        placeholder="1200000"
                        placeholderTextColor={theme.textMuted}
                      />
                    </View>

                    <Pressable style={[styles.secondaryActionBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 12 }]} onPress={handleAddExpense}>
                      <Coins size={15} color="#ef4444" />
                      <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>Thêm khoản chi</Text>
                    </Pressable>
                  </View>

                  <View style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                    <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Lịch sử quỹ</Text>
                    {selectedGroup.fund.contributions.length === 0 && selectedGroup.fund.expenses.length === 0 ? (
                      <Text style={[styles.workspaceSubtitle, { color: theme.textSecondary, marginTop: 10 }]}>Chưa có giao dịch nào trong quỹ chuyến đi.</Text>
                    ) : (
                      <>
                        {selectedGroup.fund.contributions.map((item) => (
                          <View key={`contribution-${item.id}`} style={[styles.financeRow, { borderBottomColor: theme.border }]}>
                            <View style={styles.financeIconBadge}>
                              <ArrowLeftRight size={14} color="#10b981" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.financeTitle, { color: theme.textPrimary }]}>{item.memberName}</Text>
                              <Text style={[styles.financeSubtitle, { color: theme.textSecondary }]}>{item.note}</Text>
                            </View>
                            <Text style={[styles.financeAmountPositive]}>{formatMoney(item.amount)}</Text>
                          </View>
                        ))}

                        {selectedGroup.fund.expenses.map((item) => (
                          <View key={`expense-${item.id}`} style={[styles.financeRow, { borderBottomColor: theme.border }]}>
                            <View style={[styles.financeIconBadge, { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.08)' }]}>
                              <Coins size={14} color="#ef4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.financeTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                              <Text style={[styles.financeSubtitle, { color: theme.textSecondary }]}>Khoản chi chung của nhóm</Text>
                            </View>
                            <Text style={styles.financeAmountNegative}>- {formatMoney(item.amount)}</Text>
                          </View>
                        ))}
                      </>
                    )}
                  </View>
                </ScrollView>
              )}
            </LinearGradient>
          </View>
        </Modal>
      )}

      {selectedGroup && (
        <Modal animationType="slide" transparent visible={settingsVisible} onRequestClose={() => setSettingsVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.settingsModalCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Cài đặt nhóm</Text>
                <Pressable style={styles.closeModalBtn} onPress={() => setSettingsVisible(false)}>
                  <X size={20} color={theme.textPrimary} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
                <View style={[styles.workspaceCard, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
                  <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Đổi tên nhóm</Text>
                  <View style={[styles.singleField, { backgroundColor: theme.cardGlass, borderColor: theme.border, marginTop: 12 }]}>
                    <Text style={[styles.miniFieldLabel, { color: theme.textSecondary }]}>Tên mới</Text>
                    <TextInput
                      value={renameGroupName}
                      onChangeText={setRenameGroupName}
                      style={[styles.miniFieldInput, { color: theme.textPrimary }]}
                      placeholder="Nhập tên nhóm"
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>
                  <Pressable style={[styles.secondaryActionBtn, { backgroundColor: theme.cardGlass, borderColor: theme.border, marginTop: 12 }]} onPress={handleRenameGroup}>
                    <MessageCircle size={15} color="#3b82f6" />
                    <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>Lưu tên nhóm</Text>
                  </Pressable>
                </View>

                <View style={[styles.workspaceCard, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
                  <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Thêm thành viên</Text>
                  <View style={[styles.searchFieldWrap, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                    <Search size={16} color={theme.textMuted} />
                    <TextInput
                      value={memberSearchText}
                      onChangeText={setMemberSearchText}
                      style={[styles.formTextInput, { color: theme.textPrimary, marginLeft: 8 }]}
                      placeholder="Nhập tên, email hoặc số điện thoại"
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>

                  {isSearchingMembers ? (
                    <ActivityIndicator color="#3b82f6" style={{ marginTop: 16 }} />
                  ) : memberSearchError ? (
                    <Text style={[styles.helperAlertText, { color: '#f59e0b' }]}>{memberSearchError}</Text>
                  ) : null}

                  {memberSearchResults.map((member) => (
                    <Pressable
                      key={member.id}
                      style={[styles.memberSearchRow, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}
                      onPress={() => handleAddMember(member)}
                    >
                      <Image source={{ uri: member.avatar }} style={styles.memberSearchAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.memberSearchName, { color: theme.textPrimary }]}>{member.name}</Text>
                        <Text style={[styles.memberSearchMeta, { color: theme.textSecondary }]} numberOfLines={1}>
                          {member.email || member.phone || 'Người dùng Vivu360'}
                        </Text>
                      </View>
                      <UserPlus size={16} color="#3b82f6" />
                    </Pressable>
                  ))}
                </View>

                <View style={[styles.workspaceCard, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
                  <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Quản lý thành viên và vai trò</Text>
                  {selectedGroup.membersList.map((member) => {
                    const memberRole = getMemberRole(selectedGroup, member.id);
                    const isCurrentUser = member.id === currentUserId;
                    const isLeader = selectedGroup.leaderId === member.id;

                    return (
                      <View key={member.id} style={[styles.memberManagerRow, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                        <Image source={{ uri: member.avatar }} style={styles.memberSearchAvatar} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.memberSearchName, { color: theme.textPrimary }]}>
                            {member.name}
                            {isCurrentUser ? ' (Bạn)' : ''}
                          </Text>
                          <View style={{ marginTop: 6 }}>
                            <RolePill role={memberRole} isDarkMode={isDarkMode} />
                          </View>
                        </View>
                        <View style={styles.memberActionColumn}>
                          {!isLeader && (
                            <Pressable style={[styles.smallRoleBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]} onPress={() => handleTransferLeader(member.id)}>
                              <Crown size={13} color="#f59e0b" />
                              <Text style={[styles.smallRoleBtnText, { color: theme.textPrimary }]}>Làm trưởng</Text>
                            </Pressable>
                          )}
                          {!isLeader && (
                            <Pressable style={[styles.smallRoleBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]} onPress={() => handleToggleDeputy(member.id)}>
                              <ShieldCheck size={13} color="#10b981" />
                              <Text style={[styles.smallRoleBtnText, { color: theme.textPrimary }]}>
                                {selectedGroup.deputyIds.includes(member.id) ? 'Bỏ phó' : 'Làm phó'}
                              </Text>
                            </Pressable>
                          )}
                          {!isCurrentUser && (
                            <Pressable style={[styles.smallRoleBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]} onPress={() => handleRemoveMember(member)}>
                              <Trash2 size={13} color="#ef4444" />
                              <Text style={[styles.smallRoleBtnText, { color: theme.textPrimary }]}>Xóa</Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>

                <Pressable style={[styles.leaveGroupBtn, { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.22)' }]} onPress={handleLeaveGroup}>
                  <LogOut size={16} color="#ef4444" />
                  <Text style={styles.leaveGroupText}>Rời nhóm</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

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
  chatRoomContainer: { flex: 1 },
  chatHeader: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  backChatBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  chatHeaderAvatarWrapper: { position: 'relative', marginLeft: 10 },
  chatHeaderAvatar: { width: 38, height: 38, borderRadius: 12 },
  statusActiveDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  chatHeaderName: { fontSize: 14.5, fontWeight: '900', letterSpacing: -0.2 },
  chatHeaderMembers: { fontSize: 10, color: '#94a3b8', fontWeight: '700' },
  chatInfoBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginLeft: 6,
  },
  workspaceTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  workspaceTabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  workspaceTabButtonActive: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 2,
  },
  workspaceTabText: { fontSize: 11, fontWeight: '800' },
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
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
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
  emojiFieldBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  sendMsgBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendMsgGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
});
