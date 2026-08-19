import React, { useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
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
import * as ImagePicker from 'expo-image-picker';
import { loadAppData, saveAppData } from '../services/appDataService';
import { searchFriends } from '../services/userService';
import { addChatMembers, createChatGroup, getChatGroups, getChatMessages, getGroupNotifications, recallChatMessage, removeChatMember, renameChatGroup, sendChatMessage, updateChatGroupWorkspace, updateChatMessage } from '../services/chatService';
import { createPoll, getPollsForGroup, votePoll } from '../services/pollService';
import { isSystemChatEntry, looksLikeSystemAnnouncement, normalizeGroupPreviewText, normalizeSystemAnnouncementText } from '../utils/chatText';
import { getSafeAvatarSource, getSafeImageSource } from '../utils/image';
import { parseLocationShareMessage, stripLocationShareMetadata } from '../utils/sharedLocation';
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
  ImagePlus,
  Route,
  Coins,
  ArrowLeftRight,
  Search,
  MapPinned,
  LogOut,
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
  { key: 'polls', label: 'Bình chọn', Icon: Sparkles },
];

const CONTRIBUTION_PROOF_SAMPLES = [
  {
    id: 'sample-1',
    label: 'Mẫu 1',
    fileName: 'proof-mau-1.jpg',
    mimeType: 'image/jpeg',
    source: require('../../assets/proof-samples/proof-mau-1.jpg'),
  },
  {
    id: 'sample-2',
    label: 'Mẫu 2',
    fileName: 'proof-mau-2.jpg',
    mimeType: 'image/jpeg',
    source: require('../../assets/proof-samples/proof-mau-2.jpg'),
  },
  {
    id: 'sample-3',
    label: 'Mẫu 3',
    fileName: 'proof-mau-3.jpg',
    mimeType: 'image/jpeg',
    source: require('../../assets/proof-samples/proof-mau-3.jpg'),
  },
  {
    id: 'sample-4',
    label: 'Mẫu 4',
    fileName: 'proof-mau-4.jpg',
    mimeType: 'image/jpeg',
    source: require('../../assets/proof-samples/proof-mau-4.jpg'),
  },
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
    source: itinerary?.source || '',
    tripId: itinerary?.tripId || '',
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
    estimatedTotalCost: Number(itinerary?.estimatedTotalCost || 0),
    warnings: Array.isArray(itinerary?.warnings) ? itinerary.warnings : [],
    recommendations: Array.isArray(itinerary?.recommendations) ? itinerary.recommendations : [],
    aiItinerary: itinerary?.aiItinerary && typeof itinerary.aiItinerary === 'object' ? itinerary.aiItinerary : null,
    input: itinerary?.input && typeof itinerary.input === 'object' ? itinerary.input : null,
    savedAt: itinerary?.savedAt || null,
    packingList: Array.isArray(itinerary?.packingList) ? itinerary.packingList : [],
    forecast: Array.isArray(itinerary?.forecast) ? itinerary.forecast : [],
    days: Array.isArray(itinerary?.days) ? itinerary.days : [],
  };
};

const normalizeGroup = (group, currentUser, ownerId) => {
  const currentMember = createMember({
    id: getCurrentUserMemberId(currentUser, ownerId),
    name: currentUser?.name || 'B\u1ea1n',
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
    name: group?.name || 'Nh\u00f3m du l\u1ecbch m\u1edbi',
    tag: group?.tag || 'Du l\u1ecbch',
    image: group?.image || GROUP_IMAGES[0],
    lastMessage: normalizeGroupPreviewText(group?.lastMessage) || 'H\u1ec7 th\u1ed1ng: Nh\u00f3m v\u1eeba \u0111\u01b0\u1ee3c t\u1ea1o.',
    messages: Array.isArray(group?.messages) ? group.messages.map((message) => normalizeLocalMessageEntry(message, membersList, currentUser, ownerId)) : [],
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

const findMemberProfile = (membersList, memberId) => (membersList || []).find((member) => String(member.id || member.firebaseUid) === String(memberId)) || null;

const buildGroupPreview = (group, currentUser, ownerId) => {
  const activity = group.lastActivity || group.lastNotification || group.lastMessage;
  if (!activity) return 'Nh\u00f3m ch\u01b0a c\u00f3 ho\u1ea1t \u0111\u1ed9ng';
  if (typeof activity === 'string') return normalizeGroupPreviewText(activity);

  const rawActivityText = activity.message || activity.content || activity.text || '';
  if (activity.kind === 'notification' || activity.message || activity.type === 'system' || looksLikeSystemAnnouncement(rawActivityText)) {
    return normalizeSystemAnnouncementText(
      rawActivityText || 'H\u1ec7 th\u1ed1ng v\u1eeba c\u1eadp nh\u1eadt',
      activity.actor?.name || activity.sender?.name
    );
  }

  const senderName = activity.senderId === ownerId
    ? currentUser?.name || 'B\u1ea1n'
    : group.memberProfiles?.find((member) => String(member.firebaseUid || member.id) === String(activity.senderId))?.name || 'Th\u00e0nh vi\u00ean';

  return `${senderName}: ${activity.content || ''}`.trim();
};

const getChatEntrySortValue = (entry) => {
  const value = entry?.createdAt || entry?.id || 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number(value) || 0 : parsed;
};

const mergeChatEntries = (...collections) => {
  const entryMap = new Map();

  collections.flat().filter(Boolean).forEach((entry) => {
    const isSystemEntry = isSystemChatEntry(entry);
    const normalizedSystemText = isSystemEntry
      ? normalizeSystemAnnouncementText(entry?.text || entry?.content || entry?.message || '', entry?.actorName || 'Th\u00e0nh vi\u00ean')
      : '';
    const sortBucket = Math.floor(getChatEntrySortValue(entry) / 1000);
    const fallbackKey = isSystemEntry
      ? `system-${entry?.senderId || entry?.user || 'system'}-${normalizedSystemText}-${sortBucket}`
      : `${entry?.type || 'entry'}-${entry?.senderId || entry?.user || 'system'}-${entry?.createdAt || entry?.text || Date.now()}`;
    const key = String(isSystemEntry ? fallbackKey : (entry?.id || fallbackKey));
    const previousEntry = entryMap.get(key) || {};
    entryMap.set(key, {
      ...previousEntry,
      ...entry,
      text: isSystemEntry ? normalizedSystemText : (entry?.text || ''),
    });
  });

  return Array.from(entryMap.values()).sort((left, right) => getChatEntrySortValue(left) - getChatEntrySortValue(right));
};

const normalizeLocalMessageEntry = (message, membersList, currentUser, ownerId) => {
  if (message?.type === 'poll' || message?.poll) {
    const creatorId = message?.senderId || message?.poll?.createdBy || message?.actorId || null;
    const groupMember = findMemberProfile(membersList, creatorId);
    const isMe = String(creatorId) === String(ownerId);
    const creatorName = isMe
      ? (currentUser?.name || groupMember?.name || message?.user || 'Tôi')
      : (groupMember?.name || message?.user || 'Thành viên');
    const creatorAvatar = isMe
      ? (currentUser?.avatar || groupMember?.avatar || message?.avatar || '')
      : (groupMember?.avatar || message?.avatar || '');
    const pollId = String(message?.pollId || message?.poll?._id || message?.id || '').replace(/^poll-/, '');
    const pollObj = message?.poll || {
      _id: pollId,
      title: message?.text?.replace(/^\[Bình chọn\]\s*/i, '') || 'Bình chọn',
      options: [],
      isActive: true,
      createdBy: creatorId,
      createdAt: message?.createdAt || Date.now(),
    };

    return {
      ...message,
      id: message?.id || message?._id || `poll-${pollId || Date.now()}`,
      pollId,
      type: 'poll',
      senderId: creatorId,
      user: creatorName,
      avatar: creatorAvatar,
      poll: pollObj,
      createdAt: message?.createdAt || pollObj.createdAt || Date.now(),
      text: message?.text || `[Bình chọn] ${pollObj.title || ''}`,
    };
  }

  const senderId = message?.senderId || message?.actorId || null;
  const groupMember = findMemberProfile(membersList, senderId);
  const senderProfile = String(senderId) === String(ownerId)
    ? { ...message?.sender, ...groupMember, name: currentUser?.name || groupMember?.name || message?.user || message?.sender?.name, avatar: currentUser?.avatar || groupMember?.avatar || message?.avatar || message?.sender?.avatar }
    : { ...message?.sender, ...groupMember, name: groupMember?.name || message?.user || message?.sender?.name, avatar: groupMember?.avatar || message?.avatar || message?.sender?.avatar };
  const rawText = String(message?.text || message?.content || message?.message || '').trim();
  const systemEntry = Boolean(
    message?.type === 'notification' ||
    message?.type === 'system' ||
    isSystemChatEntry(message) ||
    looksLikeSystemAnnouncement(rawText)
  );

  return {
    ...message,
    id: message?.id || message?._id || `${message?.type || 'entry'}-${senderId || senderProfile.name || 'system'}-${message?.createdAt || rawText || Date.now()}`,
    type: systemEntry ? (message?.type === 'notification' ? 'notification' : 'system') : (message?.type || 'text'),
    senderId,
    user: systemEntry ? 'Hệ thống' : senderProfile.name || message?.user || 'Thành viên Vivu360',
    actorName: senderProfile.name || 'Thành viên',
    avatar: systemEntry ? '' : senderProfile.avatar || message?.avatar || '',
    text: systemEntry
      ? normalizeSystemAnnouncementText(rawText, senderProfile.name || 'Thành viên')
      : rawText,
    createdAt: message?.createdAt || message?.id || Date.now(),
    isEdited: message.isEdited || false,
    editedAt: message.editedAt || null,
  };
};

const normalizeApiMessage = (message, currentUser, ownerId, membersList = []) => {
  const groupMember = findMemberProfile(membersList, message.senderId);
  const senderProfile = String(message.senderId) === String(ownerId)
    ? { ...message.sender, ...groupMember, name: currentUser?.name || groupMember?.name || message.sender?.name, avatar: currentUser?.avatar || groupMember?.avatar || message.sender?.avatar }
    : { ...message.sender, ...groupMember };
  const rawText = String(message.content || '').trim();
  const isSystemMessage = message.type === 'system' || looksLikeSystemAnnouncement(rawText);

  return {
    id: message._id || message.id,
    type: isSystemMessage ? 'system' : (message.type || 'text'),
    senderId: message.senderId,
    user: isSystemMessage ? 'H\u1ec7 th\u1ed1ng' : senderProfile.name || 'Th\u00e0nh vi\u00ean Vivu360',
    actorName: senderProfile.name || 'Th\u00e0nh vi\u00ean',
    avatar: isSystemMessage ? '' : senderProfile.avatar || '',
    text: isSystemMessage
      ? normalizeSystemAnnouncementText(rawText, senderProfile.name || 'Th\u00e0nh vi\u00ean')
      : rawText,
    createdAt: message.createdAt,
    isEdited: message.isEdited || false,
    editedAt: message.editedAt || null,
  };
};

const normalizeApiNotification = (notification, currentUser, ownerId, membersList = []) => {
  const groupMember = findMemberProfile(membersList, notification.actorId);
  const actorProfile = String(notification.actorId) === String(ownerId)
    ? { ...notification.actor, ...groupMember, name: currentUser?.name || groupMember?.name || notification.actor?.name }
    : { ...notification.actor, ...groupMember };

  return {
    id: notification._id || notification.id || `notification-${notification.createdAt}` ,
    type: 'notification',
    senderId: notification.actorId,
    user: 'H\u1ec7 th\u1ed1ng',
    actorName: actorProfile.name || 'Th\u00e0nh vi\u00ean',
    avatar: '',
    text: normalizeSystemAnnouncementText(notification.message || '', actorProfile.name || 'Th\u00e0nh vi\u00ean'),
    createdAt: notification.createdAt,
    notificationType: notification.type || 'group_update',
  };
};

const normalizePollEntry = (poll, membersList = [], currentUser, ownerId) => {
  const creatorId = poll?.createdBy || '';
  const groupMember = findMemberProfile(membersList, creatorId);
  const isMe = String(creatorId) === String(ownerId);
  const creatorName = isMe
    ? (currentUser?.name || groupMember?.name || 'Tôi')
    : (groupMember?.name || 'Thành viên');
  const creatorAvatar = isMe
    ? (currentUser?.avatar || groupMember?.avatar || '')
    : (groupMember?.avatar || '');
  const pollId = String(poll?._id || poll?.id || '').replace(/^poll-/, '');

  return {
    id: `poll-${pollId}`,
    pollId: pollId,
    type: 'poll',
    senderId: creatorId,
    user: creatorName,
    avatar: creatorAvatar,
    poll: { ...poll, _id: pollId },
    createdAt: poll?.createdAt || Date.now(),
    text: `[Bình chọn] ${poll?.title || ''}`,
  };
};

const normalizeApiGroup = (group, currentUser, ownerId) => normalizeGroup({
  id: group._id || group.id,
  name: group.name,
  image: group.avatar || GROUP_IMAGES[0],
  tag: 'Du l\u1ecbch',
  creatorId: group.ownerId,
  leaderId: group.ownerId,
  deputyIds: (group.admins || []).filter((id) => id !== group.ownerId),
  membersList: group.memberProfiles || [],
  lastMessage: buildGroupPreview(group, currentUser, ownerId),
  messages: [],
  itinerary: group.itinerary,
  fund: group.fund,
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

export function ChatScreen({ ownerId, isDarkMode, theme, currentUser, onNavigateToTab, prevScreen, initialGroupId }) {
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
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [fundGoalInput, setFundGoalInput] = useState('');
  const [selectedFundMemberId, setSelectedFundMemberId] = useState(getCurrentUserMemberId(currentUser, ownerId));
  const [fundContributionInput, setFundContributionInput] = useState('');
  const [fundContributionNote, setFundContributionNote] = useState('');
  const [fundContributionProof, setFundContributionProof] = useState('');
  const [fundContributionProofFile, setFundContributionProofFile] = useState(null);
  const [fundExpenseTitle, setFundExpenseTitle] = useState('');
  const [fundExpenseInput, setFundExpenseInput] = useState('');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [editMessageId, setEditMessageId] = useState(null);

  // Poll states
  const [pollModalVisible, setPollModalVisible] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [polls, setPolls] = useState([]);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);

  const messageStreamRef = useRef(null);
  const currentUserId = getCurrentUserMemberId(currentUser, ownerId);
  const currentUserMember = selectedGroup?.membersList.find((member) => member.id === currentUserId) || createMember({ id: currentUserId, name: currentUser?.name, avatar: currentUser?.avatar, email: currentUser?.email });
  const itinerary = selectedGroup?.itinerary || null;
  const sortedDestinations = getSortedDestinations(selectedGroup || {});
  const activeDestinationId = itinerary?.destinationId || sortedDestinations[0]?.id || TRAVEL_DESTINATIONS[0].id;
  const activeDestination = sortedDestinations.find((destination) => destination.id === activeDestinationId) || sortedDestinations[0] || TRAVEL_DESTINATIONS[0];
  const fundTotals = getFundTotals(selectedGroup?.fund);

  useEffect(() => {
    if (chatModalVisible) return;
    setFundContributionInput('');
    setFundContributionNote('');
    setFundContributionProof('');
    setFundContributionProofFile(null);
  }, [chatModalVisible]);

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
          return local
            ? normalizeGroup(
              {
                ...local,
                ...remote,
                itinerary: remote.itinerary ?? local.itinerary,
                fund: remote.fund ?? local.fund,
              },
              currentUser,
              ownerId
            )
            : remote;
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
    const loadMessages = () =>
      Promise.all([
        getChatMessages(selectedGroupId, ownerId).catch(() => []),
        getGroupNotifications(selectedGroupId, ownerId).catch(() => []),
        getPollsForGroup(selectedGroupId).catch(() => []),
      ])
        .then(([messages, notifications, fetchedPolls]) => {
          if (!active) return;
          if (Array.isArray(fetchedPolls)) {
            setPolls(fetchedPolls);
          }
          setGroups((prevGroups) =>
            prevGroups.map((group) => {
              if (String(group.id) !== String(selectedGroupId)) return group;

              const pollEntries = (fetchedPolls || []).map((poll) =>
                normalizePollEntry(poll, group.membersList, currentUser, ownerId)
              );

              // Filter out duplicate plain text [BÌNH CHỌN] messages if a poll exists
              const rawApiMessages = (messages || []).filter((msg) => {
                const content = String(msg.content || '').trim();
                if (content.startsWith('[BÌNH CHỌN]') || content.startsWith('[Bình chọn]')) {
                  const title = content.replace(/^\[(BÌNH CHỌN|Bình chọn)\]\s*/i, '').trim();
                  if ((fetchedPolls || []).some((p) => p.title.trim() === title)) {
                    return false;
                  }
                }
                return true;
              });

              const mergedEntries = mergeChatEntries(
                rawApiMessages.map((message) => normalizeApiMessage(message, currentUser, ownerId, group.membersList)),
                (notifications || []).map((notification) => normalizeApiNotification(notification, currentUser, ownerId, group.membersList)),
                pollEntries
              );
              const latestEntry = mergedEntries[mergedEntries.length - 1] || null;

              return normalizeGroup(
                {
                  ...group,
                  lastMessage: latestEntry
                    ? (isSystemChatEntry(latestEntry) ? latestEntry.text : `${latestEntry.user}: ${latestEntry.text}`)
                    : group.lastMessage,
                  messages: mergedEntries,
                },
                currentUser,
                ownerId
              );
            })
          );
        })
        .catch((error) => console.warn('Không thể tải dữ liệu chat nhóm:', error.message));
    loadMessages();
    const timer = setInterval(loadMessages, 3000);
    return () => { active = false; clearInterval(timer); };
  }, [chatModalVisible, selectedGroupId, ownerId, currentUser?.name, currentUser?.avatar, selectedMemberIds]);

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

    const fallbackDestination = getSortedDestinations(selectedGroup)[0] || TRAVEL_DESTINATIONS[0];
    const itinerary = selectedGroup.itinerary || normalizeItinerary({}, fallbackDestination.id);

    setRenameGroupName(selectedGroup.name);
    setFundGoalInput(selectedGroup.fund?.goal ? String(selectedGroup.fund.goal) : '');
    setSelectedFundMemberId(currentUserId);
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
  }, [memberSearchText, settingsVisible, ownerId, selectedGroupId, selectedMemberIds]);

  const updateGroupById = (groupId, updater) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (String(group.id) !== String(groupId)) return group;
        return normalizeGroup(updater(group), currentUser, ownerId);
      })
    );
  };

  const removeGroupById = (groupId) => {
    setGroups((prevGroups) => prevGroups.filter((group) => String(group.id) !== String(groupId)));
  };

  const applyWorkspaceUpdate = (groupId, nextGroupState, notification) => {
    updateGroupById(groupId, (group) => {
      const notificationEntry = notification
        ? normalizeApiNotification(notification, currentUser, ownerId, group.membersList)
        : null;
      const mergedEntries = mergeChatEntries(group.messages, notificationEntry ? [notificationEntry] : []);
      const latestEntry = mergedEntries[mergedEntries.length - 1] || null;

      return {
        ...group,
        itinerary: nextGroupState?.itinerary ?? group.itinerary,
        fund: nextGroupState?.fund ?? group.fund,
        lastMessage: latestEntry
          ? (isSystemChatEntry(latestEntry) ? latestEntry.text : `${latestEntry.user}: ${latestEntry.text}`)
          : group.lastMessage,
        messages: mergedEntries,
      };
    });
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

  useEffect(() => {
    if (!initialGroupId || isLoadingGroups) return;
    const group = groups.find(item => String(item.id) === String(initialGroupId));
    if (group) handleOpenChat(group);
  }, [initialGroupId, isLoadingGroups, groups.length]);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !selectedGroup) return;

    const trimmedMessage = chatInput.trim();
    setIsSendingMessage(true);
    try {
      const sent = await sendChatMessage(selectedGroup.id, ownerId, trimmedMessage);
      const newMessage = normalizeApiMessage({ ...sent, sender: { name: currentUser?.name, avatar: currentUser?.avatar } }, currentUser, ownerId, selectedGroup.membersList);
      updateGroupById(selectedGroup.id, (group) => ({
        ...group,
        lastMessage: `${newMessage.user}: ${trimmedMessage}`,
        messages: mergeChatEntries(group.messages, [newMessage]),
      }));
      setChatInput('');
    } catch (error) {
      Alert.alert('Gửi tin nhắn thất bại', error.response?.data?.message || 'Vui lòng thử lại.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Poll handlers
  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const handleRemovePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    } else {
      Alert.alert('Lỗi', 'Bình chọn phải có ít nhất 2 lựa chọn');
    }
  };

  const handleUpdatePollOption = (index, text) => {
    const updated = [...pollOptions];
    updated[index] = text;
    setPollOptions(updated);
  };

  const handleCreatePoll = async () => {
    const validOptions = pollOptions.filter(opt => opt.trim());
    
    if (!pollTitle.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề bình chọn');
      return;
    }

    if (validOptions.length < 2) {
      Alert.alert('Lỗi', 'Bình chọn phải có ít nhất 2 lựa chọn');
      return;
    }

    setIsCreatingPoll(true);
    try {
      const creatorId = currentUserId || ownerId;
      const newPoll = await createPoll(
        selectedGroup.id,
        pollTitle,
        validOptions,
        creatorId
      );

      // Reset form
      setPollTitle('');
      setPollOptions(['', '']);
      setPollModalVisible(false);

      if (newPoll) {
        // Update polls list
        setPolls((prev) => [newPoll, ...prev.filter((p) => String(p._id || p.id) !== String(newPoll._id || newPoll.id))]);

        // Add poll message entry directly to chat
        const pollEntry = normalizePollEntry(newPoll, selectedGroup.membersList, currentUser, ownerId);
        updateGroupById(selectedGroup.id, (group) => ({
          ...group,
          lastMessage: `[Bình chọn] ${newPoll.title}`,
          messages: mergeChatEntries(group.messages, [pollEntry]),
        }));
      }

      Alert.alert('Thành công', 'Bình chọn đã được tạo');
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || error.message || 'Không thể tạo bình chọn');
    } finally {
      setIsCreatingPoll(false);
    }
  };

  const handleVotePoll = async (pollId, optionId) => {
    try {
      const voterId = currentUserId || ownerId;
      const cleanPollId = String(pollId || '').replace(/^poll-/, '');
      const cleanOptionId = String(optionId || '');
      const updatedPoll = await votePoll(cleanPollId, cleanOptionId, voterId);
      if (!updatedPoll) return;

      setPolls((prev) => {
        const exists = prev.some((p) => String(p._id || p.id) === cleanPollId);
        if (exists) {
          return prev.map((p) => (String(p._id || p.id) === cleanPollId ? updatedPoll : p));
        }
        return [updatedPoll, ...prev];
      });

      updateGroupById(selectedGroup.id, (group) => ({
        ...group,
        messages: group.messages.map((msg) =>
          (msg.type === 'poll' || msg.poll) && (String(msg.pollId || msg.poll?._id || msg.poll?.id || msg.id).replace(/^poll-/, '') === cleanPollId)
            ? { ...msg, poll: updatedPoll }
            : msg
        ),
      }));
    } catch (error) {
      console.warn('Lỗi khi bình chọn:', error.response?.data?.message || error.message);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể bình chọn. Vui lòng thử lại.');
    }
  };

  const openPollModal = () => {
    setPollTitle('');
    setPollOptions(['', '']);
    setPollModalVisible(true);
  };

  const handleOpenUserProfile = (username) => {
    setTargetUsername(username);
    setProfileModalVisible(true);
  };

  const handleOpenSharedLocation = (sharedLocation) => {
    if (!sharedLocation?.placeName) return;

    setChatModalVisible(false);
    if (onNavigateToTab) {
      onNavigateToTab('map', {
        requestId: Date.now(),
        placeName: sharedLocation.placeName,
        address: sharedLocation.address,
        mapsLink: sharedLocation.mapsLink,
        openGuide: sharedLocation.openGuide !== false,
      });
      return;
    }

    if (sharedLocation.mapsLink) {
      Linking.openURL(sharedLocation.mapsLink).catch(() => {
        Alert.alert('Không thể mở liên kết', 'Vui lòng thử lại sau.');
      });
    }
  };

  const renderSharedLocationCard = (sharedLocation, isMe = false) => {
    const cardBackground = isMe
      ? 'rgba(255,255,255,0.16)'
      : (isDarkMode ? 'rgba(15, 23, 42, 0.72)' : '#f8fafc');
    const cardBorder = isMe ? 'rgba(255,255,255,0.18)' : (isDarkMode ? 'rgba(148, 163, 184, 0.18)' : '#dbeafe');
    const titleColor = isMe ? '#ffffff' : theme.textPrimary;
    const bodyColor = isMe ? 'rgba(255,255,255,0.88)' : theme.textSecondary;
    const ctaColor = isMe ? '#ffffff' : '#2563eb';

    return (
      <Pressable
        onPress={() => handleOpenSharedLocation(sharedLocation)}
        style={[styles.sharedLocationCard, { backgroundColor: cardBackground, borderColor: cardBorder }]}
      >
        <View style={styles.sharedLocationHeader}>
          <MapPinned size={15} color={isMe ? '#bfdbfe' : '#2563eb'} />
          <Text style={[styles.sharedLocationBadge, { color: isMe ? '#dbeafe' : '#2563eb' }]}>Địa điểm được chia sẻ</Text>
        </View>
        <Text style={[styles.sharedLocationTitle, { color: titleColor }]}>{sharedLocation.placeName}</Text>
        <Text style={[styles.sharedLocationMeta, { color: bodyColor }]}>{sharedLocation.address || 'Việt Nam'}</Text>
        {!!sharedLocation.description && (
          <Text style={[styles.sharedLocationDescription, { color: bodyColor }]} numberOfLines={3}>
            {sharedLocation.description}
          </Text>
        )}
        <Text style={[styles.sharedLocationCta, { color: ctaColor }]}>Mở bản đồ và cẩm nang</Text>
      </Pressable>
    );
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

  const handleSaveFundGoal = async () => {
    if (!selectedGroup) return;

    const goal = parseMoneyInput(fundGoalInput);

    try {
      const { group: updatedGroup, notification } = await updateChatGroupWorkspace(selectedGroup.id, ownerId, {
        fundGoal: goal,
        announcement: `${currentUserMember.name} \u0111\u00e3 c\u1eadp nh\u1eadt m\u1ee5c ti\u00eau qu\u1ef9 th\u00e0nh ${formatMoney(goal)}.`,
      });

      applyWorkspaceUpdate(selectedGroup.id, updatedGroup, notification);
      setFundGoalInput(String(goal));
      Alert.alert('\u0110\u00e3 l\u01b0u', 'M\u1ee5c ti\u00eau qu\u1ef9 chuy\u1ebfn \u0111i \u0111\u00e3 \u0111\u01b0\u1ee3c c\u1eadp nh\u1eadt.');
    } catch (error) {
      Alert.alert('Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt qu\u1ef9', error.response?.data?.message || 'Vui l\u00f2ng th\u1eed l\u1ea1i.');
    }
  };

  const handleAddContribution = async () => {
    if (!selectedGroup) return;

    const amount = parseMoneyInput(fundContributionInput);
    if (!amount) {
      Alert.alert('Thiếu số tiền', 'Vui lòng nhập số tiền đóng góp hợp lệ.');
      return;
    }
    if (!fundContributionProofFile) {
      Alert.alert('Thiếu ảnh minh chứng', 'Bạn cần chọn ảnh chuyển khoản hoặc biên nhận từ điện thoại trước khi lưu.');
      return;
    }

    const contributor = selectedGroup.membersList.find((member) => member.id === selectedFundMemberId) || currentUserMember;
    const contribution = {
      id: Date.now(),
      memberId: contributor.id,
      memberName: contributor.name,
      amount,
      note: fundContributionNote.trim() || '\u0110\u00f3ng g\u00f3p qu\u1ef9',
      createdAt: new Date().toISOString(),
    };

    try {
      const { group: updatedGroup, notification } = await updateChatGroupWorkspace(selectedGroup.id, ownerId, {
        contribution,
        announcement: `${contributor.name} g\u00f3p ${formatMoney(amount)} cho qu\u1ef9.`,
      }, { proofImageFile: fundContributionProofFile });

      applyWorkspaceUpdate(selectedGroup.id, updatedGroup, notification);
      setFundContributionInput('');
      setFundContributionNote('');
      setFundContributionProof('');
      setFundContributionProofFile(null);
    } catch (error) {
      Alert.alert('Kh\u00f4ng th\u1ec3 th\u00eam \u0111\u00f3ng g\u00f3p', error.response?.data?.message || 'Vui l\u00f2ng th\u1eed l\u1ea1i.');
    }
  };

  const setContributionProofFromUri = (uri, fileName, mimeType = 'image/jpeg') => {
    if (!uri) return;
    setFundContributionProof(uri);
    setFundContributionProofFile({
      uri,
      name: fileName,
      type: mimeType,
    });
  };

  const handlePickContributionProofFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép ứng dụng truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.65,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';
    const extension = (mimeType.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
    const proofFileName = asset.fileName || `proof-${Date.now()}.${extension}`;
    if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
      Alert.alert('Ảnh quá lớn', 'Vui lòng chọn ảnh bằng chứng nhỏ hơn 2 MB.');
      return;
    }
    setContributionProofFromUri(asset.uri, proofFileName, mimeType);
  };

  const handleCaptureContributionProof = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền camera', 'Vui lòng cho phép ứng dụng dùng camera để chụp ảnh bằng chứng.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.65,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';
    const extension = (mimeType.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
    const proofFileName = asset.fileName || `proof-camera-${Date.now()}.${extension}`;
    setContributionProofFromUri(asset.uri, proofFileName, mimeType);
  };

  const handlePickContributionProof = () => {
    Alert.alert(
      'Chọn ảnh bằng chứng',
      'Bạn có thể chọn từ thư viện, chụp ảnh mới, hoặc dùng ảnh mẫu trong app.',
      [
        { text: 'Thư viện ảnh', onPress: handlePickContributionProofFromLibrary },
        { text: 'Chụp ảnh', onPress: handleCaptureContributionProof },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handlePickContributionProofSample = async (sample) => {
    try {
      const asset = Asset.fromModule(sample.source);
      await asset.downloadAsync();
      const sampleUri = asset.localUri || asset.uri;
      setContributionProofFromUri(sampleUri, sample.fileName, sample.mimeType);
    } catch (error) {
      Alert.alert('Không thể mở ảnh mẫu', 'Vui lòng thử lại.');
    }
  };

  const handleAddExpense = async () => {
    if (!selectedGroup) return;

    const amount = parseMoneyInput(fundExpenseInput);
    const expenseTitle = fundExpenseTitle.trim();
    if (!amount || !expenseTitle) return;

    const expense = {
      id: Date.now(),
      title: expenseTitle,
      amount,
      createdAt: new Date().toISOString(),
    };

    try {
      const { group: updatedGroup, notification } = await updateChatGroupWorkspace(selectedGroup.id, ownerId, {
        expense,
        announcement: `${currentUserMember.name} v\u1eeba th\u00eam kho\u1ea3n chi ${expenseTitle} ${formatMoney(amount)}.`,
      });

      applyWorkspaceUpdate(selectedGroup.id, updatedGroup, notification);
      setFundExpenseTitle('');
      setFundExpenseInput('');
    } catch (error) {
      Alert.alert('Kh\u00f4ng th\u1ec3 th\u00eam kho\u1ea3n chi', error.response?.data?.message || 'Vui l\u00f2ng th\u1eed l\u1ea1i.');
    }
  };

  const openEditModal = (msg) => {
    setEditMessageId(msg.id);
    setEditMessageContent(msg.text);
    setEditModalVisible(true);
  };

  const handleEditMessage = async () => {
    if (!editMessageContent.trim() || !editMessageId || !selectedGroup) return;
    try {
      const updated = await updateChatMessage(
        selectedGroup.id,
        editMessageId,
        ownerId,
        editMessageContent.trim()
      );
      
      // Cập nhật trực tiếp state groups
      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id !== selectedGroup.id) return group;
          const updatedMessages = group.messages.map((msg) =>
            msg.id === editMessageId
              ? {
                  ...msg,
                  text: updated.content,
                  isEdited: true,
                  editedAt: updated.editedAt,
                }
              : msg
          );
          return { ...group, messages: updatedMessages };
        })
      );

      setEditModalVisible(false);
      setEditMessageContent('');
      setEditMessageId(null);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể sửa tin nhắn.');
    }
  };

  const confirmRecall = (msg) => {
    Alert.alert(
      'Thu hồi tin nhắn',
      'Bạn chắc chứ?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thu hồi',
          style: 'destructive',
          onPress: async () => {
            try {
              await recallChatMessage(selectedGroup.id, msg.id, ownerId);

              setGroups((prevGroups) =>
                prevGroups.map((group) => {
                  if (group.id !== selectedGroup.id) return group;
                  const updatedMessages = group.messages.map((m) =>
                    m.id === msg.id
                      ? {
                          ...m,
                          messages: group.messages.filter((m) => m.id !== msg.id),
                        }
                      : m
                  );
                  return { ...group, messages: updatedMessages };
                })
              );
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể thu hồi.');
            }
          },
        },
      ]
    );
  };

  const handleLongPress = (msg) => {
    if (String(msg.senderId) !== String(ownerId)) return; // không phải tin của mình
    Alert.alert(
      'Tùy chọn',
      'Chọn thao tác',
      [
        { text: 'Sửa', onPress: () => openEditModal(msg) },
        { text: 'Thu hồi', onPress: () => confirmRecall(msg) },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

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
              <Image source={getSafeImageSource(group.image)} style={styles.groupCoverImage} />
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
                  <Image source={getSafeImageSource(selectedGroup.image)} style={styles.chatHeaderAvatar} />
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

              <View style={[styles.workspaceTabBarWrapper, { borderBottomColor: theme.border, backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.8)' }]}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.workspaceTabBar}
                >
                  {WORKSPACE_TABS.map((tabItem) => {
                    const isActive = workspaceTab === tabItem.key;
                    const Icon = tabItem.Icon;

                    return (
                      <Pressable
                        key={tabItem.key}
                        style={[
                          styles.workspaceTabButton,
                          isActive ? styles.workspaceTabButtonActive : null,
                          {
                            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.16)' : (isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(241, 245, 249, 0.8)'),
                            borderColor: isActive ? '#3b82f6' : theme.border,
                          }
                        ]}
                        onPress={() => setWorkspaceTab(tabItem.key)}
                      >
                        <Icon size={15} color={isActive ? '#3b82f6' : theme.textSecondary} />
                        <Text style={[styles.workspaceTabText, { color: isActive ? '#3b82f6' : theme.textSecondary }]}>{tabItem.label}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
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
                      if (message.type === 'poll' || message.poll) {
                        const targetId = String(message.pollId || message.poll?._id || message.poll?.id || message.id || '').replace(/^poll-/, '');
                        const currentPoll = (Array.isArray(polls) ? polls.find((p) => String(p._id || p.id) === targetId) : null) || message.poll || {
                          _id: targetId,
                          title: message.text ? message.text.replace(/^\[Bình chọn\]\s*/i, '') : 'Bình chọn',
                          options: [],
                          isActive: true,
                          createdAt: message.createdAt,
                        };

                        const isMe = String(currentPoll.createdBy || message.senderId) === String(ownerId);
                        const messageTime = getFormattedMsgTime(currentPoll.createdAt || message.createdAt);
                        const totalVotes = (currentPoll.options || []).reduce((sum, o) => sum + (o.votes?.length || 0), 0);

                        return (
                          <View key={message.id} style={{ marginVertical: 8, width: '100%' }}>
                            <View
                              style={[
                                styles.pollCard,
                                {
                                  backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.95)',
                                  borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.25)',
                                  borderWidth: 1,
                                  borderRadius: 16,
                                  padding: 14,
                                  shadowColor: '#000',
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.08,
                                  shadowRadius: 8,
                                  elevation: 3,
                                }
                              ]}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(245, 158, 11, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={15} color="#f59e0b" />
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '700' }}>
                                      {isMe ? 'Bạn đã tạo bình chọn' : `${message.user || 'Thành viên'} đã tạo bình chọn`}
                                    </Text>
                                    <Text style={{ fontSize: 10, color: theme.textMuted }}>{messageTime}</Text>
                                  </View>
                                </View>
                                <View
                                  style={{
                                    backgroundColor: currentPoll.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    borderRadius: 8,
                                  }}
                                >
                                  <Text style={{ fontSize: 10, fontWeight: '800', color: currentPoll.isActive ? '#10b981' : theme.textMuted }}>
                                    {currentPoll.isActive ? 'Đang mở' : 'Đã đóng'}
                                  </Text>
                                </View>
                              </View>

                              <Text style={[styles.pollTitle, { color: isDarkMode ? '#fbbf24' : '#d97706', fontSize: 14.5, fontWeight: '900', marginBottom: 12 }]}>
                                📊 {currentPoll.title}
                              </Text>

                              {(currentPoll.options || []).map((option) => {
                                const optionVotes = option.votes?.length || 0;
                                const percentage = totalVotes > 0 ? ((optionVotes / totalVotes) * 100).toFixed(0) : 0;
                                const userVoted = (option.votes || []).includes(ownerId);

                                return (
                                  <Pressable
                                    key={option.id}
                                    style={[
                                      styles.pollOption,
                                      {
                                        backgroundColor: userVoted ? (isDarkMode ? 'rgba(59, 130, 246, 0.22)' : 'rgba(59, 130, 246, 0.12)') : theme.searchBg,
                                        borderColor: userVoted ? '#3b82f6' : theme.searchBorder,
                                        borderRadius: 12,
                                        marginBottom: 8,
                                        padding: 10,
                                        borderWidth: userVoted ? 1.5 : 1,
                                      }
                                    ]}
                                    onPress={() => currentPoll.isActive && handleVotePoll(currentPoll._id, option.id)}
                                    disabled={!currentPoll.isActive}
                                  >
                                    <View style={{ flex: 1 }}>
                                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <Text style={[styles.pollOptionText, { color: theme.textPrimary, fontWeight: userVoted ? '900' : '700', fontSize: 12.5 }]}>
                                          {option.text}
                                        </Text>
                                        {userVoted && <CheckCheck size={14} color="#3b82f6" />}
                                      </View>
                                      <View style={[styles.pollProgressBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', height: 6, borderRadius: 3 }]}>
                                        <View
                                          style={[
                                            styles.pollProgressFill,
                                            { width: `${percentage}%`, backgroundColor: userVoted ? '#3b82f6' : '#06b6d4', height: 6, borderRadius: 3 }
                                          ]}
                                        />
                                      </View>
                                      <Text style={[styles.pollStats, { color: theme.textSecondary, marginTop: 4, fontSize: 10.5 }]}>
                                        {optionVotes} bình chọn ({percentage}%)
                                      </Text>
                                    </View>
                                  </Pressable>
                                );
                              })}

                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: theme.border }}>
                                <Text style={{ fontSize: 11, color: theme.textMuted, fontWeight: '700' }}>
                                  Tổng số: {totalVotes} phiếu
                                </Text>
                                <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: '800' }}>
                                  {(currentPoll.options || []).some((o) => (o.votes || []).includes(ownerId)) ? '✓ Bạn đã bình chọn' : 'Chưa bình chọn'}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      }

                      if (isSystemChatEntry(message)) {
                        return (
                          <View key={message.id} style={[styles.systemBubble, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255,255,255,0.78)', borderColor: theme.border }]}>
                            <Text style={[styles.systemBubbleText, { color: theme.textSecondary }]}>{message.text}</Text>
                          </View>
                        );
                      }

                      const isMe = String(message.senderId) === String(ownerId);
                      const messageTime = getFormattedMsgTime(message.createdAt || message.id);
                      const sharedLocation = parseLocationShareMessage(message.text);
                      const displayMessageText = stripLocationShareMetadata(message.text);

                      return (
                        <View key={message.id} style={[styles.msgWrapper, isMe ? styles.msgWrapperMe : null]}>
                          {isMe ? (
                            <View style={{ alignItems: 'flex-end' }}>
                              <Pressable
                                onLongPress={() => handleLongPress(message)}
                              >
                                <LinearGradient colors={['#06b6d4', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.msgBubble, styles.msgBubbleMe]}>
                                  {sharedLocation ? renderSharedLocationCard(sharedLocation, true) : <Text style={styles.msgTextMe}>{displayMessageText}</Text>}
                                </LinearGradient>
                                <View style={styles.msgMetaMe}>
                                  <Text style={[styles.msgTimeTextMe, { color: theme.textMuted }]}>{messageTime}</Text>
                                  <CheckCheck size={11} color="#06b6d4" />
                                </View>
                              </Pressable>
                            </View>
                          ) : (
                            <View style={styles.otherMsgRow}>
                              <Pressable onPress={() => { setChatModalVisible(false); handleOpenUserProfile(message.user); }}>
                                <Image source={getSafeAvatarSource(message.avatar || getUserAvatarByName(message.user))} style={styles.otherMsgAvatar} />
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
                                  {sharedLocation ? renderSharedLocationCard(sharedLocation, false) : <Text style={[styles.msgTextContent, { color: theme.textPrimary }]}>{displayMessageText}</Text>}
                                </View>
                                <Text style={[styles.msgTimeTextOther, { color: theme.textMuted }]}>{messageTime}</Text>
                                {message.isEdited && <Text style={[styles.msgTimeTextOther, { fontSize: 9 }]}> (đã sửa)</Text>}
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
                        <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>AI hỗ trợ tạo lịch trình theo giờ</Text>
                        <Text style={[styles.workspaceSubtitle, { color: theme.textSecondary }]}>
                          Tạo preview lịch trình AI, thay riêng hoạt động, tối ưu thời gian rồi mới lưu vào chuyến đi của nhóm.
                        </Text>
                      </View>
                      <Sparkles size={18} color="#3b82f6" />
                    </View>

                    <Pressable
                      style={styles.primaryActionBtn}
                      onPress={() => onNavigateToTab && onNavigateToTab('aiTripPlanner', {
                        groupId: selectedGroup?.id,
                        groupName: selectedGroup?.name,
                        savedSnapshot: itinerary,
                        activeDestination,
                      })}
                    >
                      <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.primaryActionGradient}>
                        <Sparkles size={16} color="#fff" />
                        <Text style={styles.primaryActionText}>{itinerary?.aiItinerary ? 'Tạo lại lịch trình gợi ý' : 'Tạo lịch trình gợi ý'}</Text>
                      </LinearGradient>
                    </Pressable>

                    {itinerary?.aiItinerary ? (
                      <Pressable
                        style={[styles.secondaryActionBtn, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 12 }]}
                        onPress={() => onNavigateToTab && onNavigateToTab('aiItineraryPreview', {
                          groupId: selectedGroup?.id,
                          groupName: selectedGroup?.name,
                          itinerary: itinerary.aiItinerary,
                          input: itinerary.input,
                          candidatePlaces: [],
                          warnings: itinerary.warnings || [],
                        })}
                      >
                        <Route size={15} color="#3b82f6" />
                        <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>Xem lịch trình AI đã lưu</Text>
                      </Pressable>
                    ) : null}

                    {!!itinerary?.estimatedTotalCost && (
                      <Text style={[styles.helperAlertText, { color: theme.textMuted, marginTop: 12 }]}>
                        Bản AI đã lưu gần nhất: {Number(itinerary.estimatedTotalCost || 0).toLocaleString('vi-VN')}đ
                      </Text>
                    )}
                  </View>

                  <View style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                    <View style={styles.workspaceSectionHeader}>
                      <View>
                        <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Luồng lịch trình hiện tại</Text>
                        <Text style={[styles.workspaceSubtitle, { color: theme.textSecondary }]}>
                          Nhóm đang dùng luồng lịch trình gợi ý bằng AI. Bạn có thể nhập thông tin chuyến đi, xem bản nháp theo giờ, chỉnh sửa từng hoạt động rồi mới lưu vào chuyến đi chung.
                        </Text>
                      </View>
                      <Route size={18} color="#10b981" />
                    </View>

                    <View style={[styles.destinationPreviewCard, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255,255,255,0.7)', borderColor: theme.border }]}>
                      <Image source={getSafeImageSource(activeDestination.image)} style={styles.destinationPreviewImage} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.destinationPreviewTitle, { color: theme.textPrimary }]}>{activeDestination.name}</Text>
                        <Text style={[styles.destinationPreviewRegion, { color: theme.textSecondary }]}>{activeDestination.region}</Text>
                        <Text style={[styles.destinationPreviewIntro, { color: theme.textMuted }]}>
                          Điểm đến này đang được gợi ý mặc định cho nhóm. Bạn vẫn có thể đổi lại trực tiếp trong màn tạo lịch trình gợi ý.
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              ) : workspaceTab === 'polls' ? (
                <ScrollView style={styles.workspaceScroll} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                  <View style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                    <View style={styles.workspaceSectionHeader}>
                      <View>
                        <Text style={[styles.workspaceTitle, { color: theme.textPrimary }]}>Tạo Bình Chọn Mới</Text>
                        <Text style={[styles.workspaceSubtitle, { color: theme.textSecondary }]}>
                          Tạo bình chọn để nhóm cùng bàn bạc và quyết định
                        </Text>
                      </View>
                      <Sparkles size={18} color="#f59e0b" />
                    </View>

                    <Pressable
                      style={styles.primaryActionBtn}
                      onPress={openPollModal}
                    >
                      <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.primaryActionGradient}>
                        <Plus size={16} color="#fff" />
                        <Text style={styles.primaryActionText}>Tạo Bình Chọn</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>

                  <Text style={[styles.workspaceTitle, { color: theme.textPrimary, paddingHorizontal: 0, marginTop: 12, marginBottom: 12 }]}>Các Bình Chọn Hiện Tại</Text>

                  {(() => {
                    const allGroupPolls = Array.from(
                      new Map([
                        ...polls.map((p) => [String(p._id || p.id), p]),
                        ...(selectedGroup?.messages || [])
                          .filter((m) => (m.type === 'poll' || m.poll) && (m.poll || m.pollId))
                          .map((m) => [
                            String(m.poll?._id || m.poll?.id || m.pollId || m.id).replace(/^poll-/, ''),
                            m.poll || { _id: String(m.pollId || m.id).replace(/^poll-/, ''), title: m.text?.replace(/^\[Bình chọn\]\s*/i, '') || 'Bình chọn', options: [], isActive: true, createdAt: m.createdAt },
                          ]),
                      ]).values()
                    );

                    if (allGroupPolls.length === 0) {
                      return (
                        <View style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border, alignItems: 'center', paddingVertical: 40 }]}>
                          <Text style={[styles.workspaceSubtitle, { color: theme.textMuted }]}>Chưa có bình chọn nào</Text>
                          <Text style={[{ color: theme.textMuted, fontSize: 11, marginTop: 8 }]}>Tạo bình chọn đầu tiên để nhóm cùng quyết định</Text>
                        </View>
                      );
                    }

                    return allGroupPolls.map((poll) => (
                      <View key={poll._id || poll.id} style={[styles.workspaceCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}>
                        <View style={{ marginBottom: 16 }}>
                          <Text style={[styles.workspaceTitle, { color: theme.textPrimary, fontSize: 15.5, fontWeight: '900' }]}>📊 {poll.title}</Text>
                          {!poll.isActive && <Text style={[styles.workspaceSubtitle, { color: theme.textMuted, marginTop: 4 }]}>⭕ Bình chọn đã kết thúc</Text>}
                        </View>

                        {(poll.options || []).map((option) => {
                          const totalVotes = (poll.options || []).reduce((sum, o) => sum + (o.votes?.length || 0), 0);
                          const optionVotes = option.votes?.length || 0;
                          const percentage = totalVotes > 0 ? ((optionVotes / totalVotes) * 100).toFixed(0) : 0;
                          const userVoted = (option.votes || []).includes(ownerId);

                          return (
                            <Pressable
                              key={option.id}
                              style={[
                                styles.secondaryActionBtn,
                                {
                                  backgroundColor: userVoted ? 'rgba(59, 130, 246, 0.16)' : theme.searchBg,
                                  borderColor: userVoted ? 'rgba(59, 130, 246, 0.32)' : theme.searchBorder,
                                  marginTop: 10,
                                  paddingVertical: 14,
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                },
                              ]}
                              onPress={() => poll.isActive && handleVotePoll(poll._id || poll.id, option.id)}
                              disabled={!poll.isActive}
                            >
                              <Text style={[{ fontSize: 13.5, fontWeight: '800', color: theme.textPrimary, marginBottom: 8 }]}>
                                {option.text}
                              </Text>
                              <View style={[styles.progressTrack, { width: '100%', marginTop: 8, marginBottom: 6, backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                <View
                                  style={[
                                    styles.progressFill,
                                    { width: `${percentage}%`, backgroundColor: userVoted ? '#3b82f6' : '#06b6d4' }
                                  ]}
                                />
                              </View>
                              <Text style={[{ fontSize: 11.5, fontWeight: '800', color: theme.textSecondary }]}>
                                {optionVotes} bình chọn ({percentage}%)
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ));
                  })()}
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
                            <Image source={getSafeAvatarSource(member.avatar)} style={styles.memberChipAvatar} />
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

                    <View style={[styles.proofSection, { backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}>
                      <View style={styles.proofHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.miniFieldLabel, { color: theme.textSecondary }]}>Ảnh bằng chứng nhận tiền</Text>
                          <Text style={[styles.proofHint, { color: theme.textMuted }]}>Ảnh chuyển khoản, biên nhận hoặc ảnh mẫu để test</Text>
                        </View>
                        {!!fundContributionProof && (
                          <Pressable style={styles.removeProofBtn} onPress={() => {
                            setFundContributionProof('');
                            setFundContributionProofFile(null);
                          }}>
                            <Trash2 size={15} color="#ef4444" />
                          </Pressable>
                        )}
                      </View>
                      {fundContributionProof ? (
                        <Pressable onPress={handlePickContributionProof}>
                          <Image source={{ uri: fundContributionProof }} style={styles.proofPreview} />
                          <View style={styles.changeProofBadge}>
                            <ImagePlus size={13} color="#fff" />
                            <Text style={styles.changeProofText}>Đổi ảnh</Text>
                          </View>
                        </Pressable>
                      ) : (
                        <Pressable style={[styles.pickProofBtn, { borderColor: theme.searchBorder }]} onPress={handlePickContributionProof}>
                          <ImagePlus size={22} color="#3b82f6" />
                        <Text style={[styles.pickProofText, { color: theme.textPrimary }]}>Thêm hình ảnh bằng chứng</Text>
                      </Pressable>
                    )}
                  </View>

                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.sampleProofLabel, { color: theme.textSecondary }]}>Ảnh mẫu để test trên emulator</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sampleProofRow}>
                      {CONTRIBUTION_PROOF_SAMPLES.map((sample) => (
                        <Pressable
                          key={sample.id}
                          onPress={() => handlePickContributionProofSample(sample)}
                          style={[styles.sampleProofCard, { backgroundColor: theme.background, borderColor: theme.searchBorder }]}
                        >
                          <Image source={sample.source} style={styles.sampleProofImage} resizeMode="cover" />
                          <Text style={[styles.sampleProofText, { color: theme.textPrimary }]}>{sample.label}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                    <Pressable
                      style={[styles.primaryActionBtn, !fundContributionProof && { opacity: 0.55 }]}
                      onPress={handleAddContribution}
                      accessibilityState={{ disabled: !fundContributionProof }}
                    >
                      <LinearGradient colors={fundContributionProof ? ['#06b6d4', '#3b82f6'] : ['#94a3b8', '#64748b']} style={styles.primaryActionGradient}>
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
                              {!!item.proofImage && <Image source={{ uri: item.proofImage }} style={styles.financeProofImage} />}
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
                      <Image source={getSafeAvatarSource(member.avatar)} style={styles.memberSearchAvatar} />
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
                        <Image source={getSafeAvatarSource(member.avatar)} style={styles.memberSearchAvatar} />
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

      <Modal
        animationType="slide"
        transparent
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardGlass, borderColor: theme.border, height: 280 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Sửa tin nhắn</Text>
              <Pressable style={styles.closeModalBtn} onPress={() => setEditModalVisible(false)}>
                <X size={20} color={theme.textPrimary} />
              </Pressable>
            </View>
            <View style={{ flex: 1, padding: 16 }}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Nội dung mới</Text>
              <TextInput
                style={[styles.formInputGroup, { color: '#fff', backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 6, height: 80, textAlignVertical: 'top', paddingTop: 8 }]}
                multiline
                value={editMessageContent}
                onChangeText={setEditMessageContent}
                placeholder="Nhập nội dung mới..."
                placeholderTextColor={theme.textMuted}
              />
            </View>
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Pressable style={styles.modalSubmitBtn} onPress={handleEditMessage}>
                <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.modalSubmitGradient}>
                  <Send size={16} color="#fff" />
                  <Text style={styles.modalSubmitText}>Lưu thay đổi</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Poll Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={pollModalVisible}
        onRequestClose={() => setPollModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardGlass, borderColor: theme.border, maxHeight: '90%' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>Tạo Bình Chọn</Text>
              <Pressable style={styles.closeModalBtn} onPress={() => setPollModalVisible(false)}>
                <X size={20} color={theme.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={{ flex: 1, padding: 16 }}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Tiêu đề Bình Chọn</Text>
              <TextInput
                style={[styles.formInputGroup, { color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.searchBorder, marginTop: 6 }]}
                value={pollTitle}
                onChangeText={setPollTitle}
                placeholder="Nội dung bình chọn"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 16 }]}>Các Lựa Chọn</Text>
              {pollOptions.map((option, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <TextInput
                    style={[styles.formInputGroup, { flex: 1, color: theme.textPrimary, backgroundColor: theme.searchBg, borderColor: theme.searchBorder }]}
                    value={option}
                    onChangeText={(text) => handleUpdatePollOption(idx, text)}
                    placeholder={`Lựa chọn ${idx + 1}`}
                    placeholderTextColor={theme.textMuted}
                  />
                  {pollOptions.length > 2 && (
                    <Pressable
                      style={{ marginLeft: 8, padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 6 }}
                      onPress={() => handleRemovePollOption(idx)}
                    >
                      <X size={18} color="#ef4444" />
                    </Pressable>
                  )}
                </View>
              ))}

              <Pressable
                style={{ marginTop: 12, padding: 12, backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: 6, alignItems: 'center' }}
                onPress={handleAddPollOption}
              >
                <Text style={{ color: '#3b82f6', fontWeight: '600' }}>+ Thêm Lựa Chọn</Text>
              </Pressable>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Pressable
                style={[styles.modalCancelBtn, { marginRight: 8 }]}
                onPress={() => setPollModalVisible(false)}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.modalSubmitBtn} onPress={handleCreatePoll} disabled={isCreatingPoll}>
                <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.modalSubmitGradient}>
                  <Text style={styles.modalSubmitText}>{isCreatingPoll ? 'Đang tạo...' : 'Xong'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  workspaceTabBarWrapper: {
    borderBottomWidth: 1,
  },
  workspaceTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  workspaceTabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
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
  workspaceTabText: { fontSize: 12, fontWeight: '800' },
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
  sharedLocationCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 220,
    maxWidth: 280,
  },
  sharedLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sharedLocationBadge: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sharedLocationTitle: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  sharedLocationMeta: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 4,
  },
  sharedLocationDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    fontWeight: '500',
  },
  sharedLocationCta: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
  },
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
  proofSection: { borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 12 },
  proofHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  proofHint: { fontSize: 10, lineHeight: 14, fontWeight: '600', marginTop: 3 },
  removeProofBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.12)', alignItems: 'center', justifyContent: 'center' },
  pickProofBtn: { height: 88, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, marginTop: 10, alignItems: 'center', justifyContent: 'center', gap: 7 },
  pickProofText: { fontSize: 11.5, fontWeight: '800' },
  proofPreview: { width: '100%', height: 170, borderRadius: 12, marginTop: 10 },
  changeProofBadge: { position: 'absolute', right: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(15, 23, 42, 0.78)', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9 },
  changeProofText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  sampleProofLabel: { fontSize: 11, fontWeight: '800', marginBottom: 8 },
  sampleProofRow: { gap: 10, paddingBottom: 2 },
  sampleProofCard: {
    width: 92,
    borderWidth: 1,
    borderRadius: 14,
    padding: 8,
    gap: 6,
  },
  sampleProofImage: { width: '100%', height: 96, borderRadius: 10 },
  sampleProofText: { fontSize: 10.5, fontWeight: '800', textAlign: 'center' },
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
  financeProofImage: { width: 112, height: 72, borderRadius: 10, marginTop: 8 },
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
  // Poll styles
  pollCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  pollTitle: {
    fontSize: 15.5,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  pollCreator: {
    fontSize: 10,
    fontWeight: '600',
  },
  pollOption: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
  },
  pollOptionText: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  pollProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  pollProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pollStats: {
    fontSize: 11.5,
    fontWeight: '800',
  },
});