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
  { key: 'map', label: 'Bản đồ 360°', Icon: MapIcon, colors: ['#3b82f6', '#1d4ed8'] },
  { key: 'explore', label: 'Khám phá', Icon: Globe, colors: ['#10b981', '#047857'] },
  { key: 'social', label: 'Bảng tin', Icon: Newspaper, colors: ['#f59e0b', '#b45309'] },
  { key: 'chat', label: 'Nhóm du lịch', Icon: MessageSquare, colors: ['#8b5cf6', '#6d28d9'] },
  { key: 'camera', label: 'Quét AR', Icon: Scan, colors: ['#ef4444', '#b91c1c'] },
  { key: 'ticketList', label: 'Vé của tôi', Icon: Ticket, colors: ['#d946ef', '#a21caf'] },
  { key: 'profile', label: 'Cá nhân', Icon: User, colors: ['#0ea5e9', '#0369a1'] },
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
  },
  {
    id: 3,
    title: 'Vé Vui Chơi VinWonders & Safari Phú Quốc',
    type: 'ticket',
    location: 'Gành Dầu, Phú Quốc',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    rating: '4.7',
    price: '1.350.000đ / vé',
    tag: 'Thích Hợp Gia Đình',
    description: 'Tận hưởng trọn vẹn ngày vui chơi tại công viên chủ đề lớn nhất Việt Nam và khám phá vườn thú bán hoang dã kỳ thú.'
  },
  {
    id: 4,
    title: 'Thuê Xe Tự Lái Hyundai Accent Số Tự Động',
    type: 'car',
    location: 'Sân bay Phú Quốc',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    rating: '4.6',
    price: '700.000đ / ngày',
    tag: 'Tiết Kiệm',
    description: 'Giao nhận xe miễn phí tại sân bay Phú Quốc hoặc khách sạn trung tâm. Xe đời mới, sạch sẽ, máy lạnh mát rượi.'
  },
  {
    id: 5,
    title: 'SIM Du Lịch 4G Không Giới Hạn Dung Lượng',
    type: 'sim',
    location: 'Toàn quốc',
    image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=600&q=80',
    rating: '4.9',
    price: '120.000đ / chiếc',
    tag: 'Tiện Ích',
    description: 'SIM 4G kết nối internet tốc độ cao không giới hạn dung lượng, sóng cực khỏe ở mọi miền đất nước.'
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
  background: isDarkMode ? '#09090b' : '#f1f5f9', // slate-100
  card: isDarkMode ? '#18181b' : '#ffffff',
  cardGlass: isDarkMode ? 'rgba(24, 24, 27, 0.85)' : 'rgba(255, 255, 255, 0.85)',
  border: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
  textPrimary: isDarkMode ? '#ffffff' : '#0f172a', // slate-900
  textSecondary: isDarkMode ? '#94a3b8' : '#334155', // slate-700
  textMuted: isDarkMode ? '#71717a' : '#64748b', // slate-500
  searchBg: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f3f4f6', // gray-100
  searchBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e5e7eb', // gray-200
  navBg: isDarkMode ? 'rgba(15, 15, 20, 0.94)' : 'rgba(255, 255, 255, 0.95)',
  navBorder: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)',
  statusBg: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0', // slate-200
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

