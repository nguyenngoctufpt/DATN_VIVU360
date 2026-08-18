import {
  Plane,
  Building,
  Map as MapIcon,
  Car,
  Scan,
  Tag,
  Wifi,
  Train,
  FileText,
  Shield,
  Ticket,
  Sun,
  Flame,
  Sparkles,
  ShieldCheck,
  Headset,
  Award,
  Briefcase,
  Globe,
  Newspaper,
  MessageSquare,
  User,
} from 'lucide-react-native';

export const allCategories = [
  { key: 'map', label: 'Bản đồ 360°', Icon: MapIcon, colors: ['#dc2626', '#991b1b'] },
  { key: 'explore', label: 'Khám phá', Icon: Globe, colors: ['#f59e0b', '#d97706'] },
  { key: 'social', label: 'Bảng tin', Icon: Newspaper, colors: ['#f59e0b', '#b45309'] },
  { key: 'chat', label: 'Nhóm du lịch', Icon: MessageSquare, colors: ['#dc2626', '#991b1b'] },
  { key: 'camera', label: 'Quét AR', Icon: Scan, colors: ['#ef4444', '#b91c1c'] },
  { key: 'profile', label: 'Cá nhân', Icon: User, colors: ['#f59e0b', '#d97706'] },
];

export const banners = [
  {
    id: 1,
    badge: 'ƯU ĐÃI HÈ',
    BadgeIcon: Sun,
    title: 'Giảm đến',
    highlight: '30%',
    sub: 'Cho các tour trong nước siêu hot',
    image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=800&q=80',
    color: '#fef08a',
  },
  {
    id: 2,
    badge: 'HOT DEAL',
    BadgeIcon: Flame,
    title: 'Combo',
    highlight: 'Phú Quốc',
    sub: 'Bay khứ hồi + Resort 5 sao trọn gói',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80',
    color: '#fca5a5',
  },
  {
    id: 3,
    badge: 'TRẢI NGHIỆM',
    BadgeIcon: Sparkles,
    title: 'Săn mây',
    highlight: 'Sa Pa',
    sub: 'Khám phá Tây Bắc hùng vĩ mộng mơ',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
    color: '#6ee7b7',
  },
];

export const destinations = [
  {
    city: 'Hạ Long',
    region: 'Quảng Ninh',
    rating: '4.9',
    reviews: '12k',
    price: '2.500.000đ',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  },
  {
    city: 'Hội An',
    region: 'Quảng Nam',
    rating: '4.8',
    reviews: '34k',
    price: '1.200.000đ',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80',
  },
  {
    city: 'Phú Quốc',
    region: 'Kiên Giang',
    rating: '5.0',
    reviews: '8.5k',
    price: '4.800.000đ',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80',
  },
  {
    city: 'Sa Pa',
    region: 'Lào Cai',
    rating: '4.7',
    reviews: '21k',
    price: '1.950.000đ',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=600&q=80',
  },
];

export const perks = [
  { title: 'Thanh toán\nan toàn', sub: 'Mã hóa 256-bit bảo mật cao', Icon: ShieldCheck, color: '#10b981' },
  { title: 'Hỗ trợ 24/7', sub: 'Luôn sẵn sàng khi bạn cần', Icon: Headset, color: '#3b82f6' },
  { title: 'Giá tốt\nmỗi ngày', sub: 'Đảm bảo hoàn tiền chênh lệch', Icon: Award, color: '#f59e0b' },
  { title: 'Trải nghiệm\nđa dạng', sub: 'Hơn 10.000 hoạt động thú vị', Icon: Briefcase, color: '#d946ef' },
];

export const exploreItems = [
  {
    id: 1,
    title: 'Khách Sạn InterContinental Resort',
    type: 'hotel',
    location: 'Bãi Trường, Phú Quốc',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    rating: '4.9',
    price: '3.800.000đ / đêm',
    tag: '5 Sao Premium',
    description: 'Resort sát biển đẳng cấp 5 sao quốc tế với hồ bơi vô cực khổng lồ, spa sang trọng và ẩm thực tinh hoa đa dạng.'
  },
  {
    id: 2,
    title: 'Tour Ngắm Hoàng Hôn & Câu Mực Phú Quốc',
    type: 'tour',
    location: 'Cảng An Thới, Phú Quốc',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
    rating: '4.8',
    price: '850.000đ / người',
    tag: 'Bán Chạy Nhất',
    description: 'Trải nghiệm ngắm hoàng hôn lãng mạn trên biển đảo ngọc, ăn tối hải sản và câu mực đêm cùng ngư dân bản địa.'
  }
];

export const mockMapMarkers = [
  { id: 1, title: 'Vịnh Hạ Long', region: 'Quảng Ninh', top: '22%', left: '56%', rating: '4.9', price: 'Từ 2.500.000đ', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&q=80' },
  { id: 2, title: 'Phố Cổ Hội An', region: 'Quảng Nam', top: '55%', left: '68%', rating: '4.8', price: 'Từ 1.200.000đ', image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=300&q=80' },
  { id: 3, title: 'Đảo Phú Quốc', region: 'Kiên Giang', top: '85%', left: '13%', rating: '5.0', price: 'Từ 4.800.000đ', image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=300&q=80' },
  { id: 4, title: 'Mù Cang Chải', region: 'Yên Bái', top: '15%', left: '38%', rating: '4.7', price: 'Từ 1.500.000đ', image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=300&q=80' },
  { id: 5, title: 'Hồ Hoàn Kiếm', region: 'Hà Nội', top: '19%', left: '40%', rating: '4.9', price: 'Miễn phí', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80' }
];

export const getTheme = (isDarkMode) => ({
  background: isDarkMode ? '#090a0f' : '#f8fafc',
  card: isDarkMode ? '#11131c' : '#ffffff',
  cardGlass: isDarkMode ? 'rgba(17, 19, 28, 0.88)' : 'rgba(255, 255, 255, 0.92)',
  border: isDarkMode ? 'rgba(245, 158, 11, 0.18)' : 'rgba(15, 23, 42, 0.08)',
  textPrimary: isDarkMode ? '#ffffff' : '#0f172a',
  textSecondary: isDarkMode ? '#94a3b8' : '#334155',
  textMuted: isDarkMode ? '#64748b' : '#94a3b8',
  searchBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6',
  searchBorder: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#e5e7eb',
  navBg: isDarkMode ? 'rgba(9, 10, 15, 0.95)' : 'rgba(255, 255, 255, 0.95)',
  navBorder: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.06)',
  statusBg: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#fee2e2',
});

export function getRankDetails(points) {
  const pts = points || 0;
  if (pts <= 2000) {
    return {
      rankName: 'Hạng Đồng',
      title: 'Đồng',
      colors: ['#cd7f32', '#a0522d'],
      borderColor: '#cd7f32',
      minPoints: 0,
      maxPoints: 2000,
    };
  } else if (pts <= 5000) {
    return {
      rankName: 'Hạng Bạc',
      title: 'Bạc',
      colors: ['#c0c0c0', '#708090'],
      borderColor: '#c0c0c0',
      minPoints: 2001,
      maxPoints: 5000,
    };
  } else if (pts <= 10000) {
    return {
      rankName: 'Hạng Vàng',
      title: 'Vàng',
      colors: ['#ffd700', '#daa520'],
      borderColor: '#ffd700',
      minPoints: 5001,
      maxPoints: 10000,
    };
  } else if (pts <= 20000) {
    return {
      rankName: 'Hạng Bạch Kim',
      title: 'Bạch Kim',
      colors: ['#e5e4e2', '#06b6d4'],
      borderColor: '#06b6d4',
      minPoints: 10001,
      maxPoints: 20000,
    };
  } else {
    return {
      rankName: 'Hạng Kim Cương',
      title: 'Kim Cương',
      colors: ['#a855f7', '#3b82f6'],
      borderColor: '#a855f7',
      minPoints: 20001,
      maxPoints: 1000000,
    };
  }
}

