const DESTINATION_PROFILES = [
  { value: 'Hà Nội', aliases: ['Ha Noi', 'Hồ Gươm', 'Ho Guom', 'Hoàn Kiếm', 'Hoan Kiem', 'Tây Hồ', 'Tay Ho', 'Ba Đình', 'Ba Dinh'] },
  { value: 'Hải Phòng', aliases: ['Hai Phong', 'Hải Dương', 'Hai Duong', 'Thủy Nguyên', 'Thuy Nguyen', 'Cát Bà', 'Cat Ba', 'Đồ Sơn', 'Do Son'] },
  { value: 'Huế', aliases: ['Hue', 'Thừa Thiên Huế', 'Thua Thien Hue', 'Lăng Cô', 'Lang Co'] },
  { value: 'Đà Nẵng', aliases: ['Da Nang', 'Quảng Nam', 'Quang Nam', 'Hội An', 'Hoi An', 'Tam Kỳ', 'Tam Ky', 'Điện Bàn', 'Dien Ban', 'Mỹ Sơn', 'My Son', 'Cù Lao Chàm', 'Cu Lao Cham'] },
  { value: 'Cần Thơ', aliases: ['Can Tho', 'Sóc Trăng', 'Soc Trang', 'Hậu Giang', 'Hau Giang', 'Ninh Kiều', 'Ninh Kieu', 'Vị Thanh', 'Vi Thanh'] },
  { value: 'Thành phố Hồ Chí Minh', aliases: ['Ho Chi Minh City', 'Hồ Chí Minh', 'Ho Chi Minh', 'TP.HCM', 'TP HCM', 'Tp HCM', 'Tp. HCM', 'Sài Gòn', 'Sai Gon', 'Bình Dương', 'Binh Duong', 'Bà Rịa - Vũng Tàu', 'Ba Ria - Vung Tau', 'Vũng Tàu', 'Vung Tau', 'Thủ Dầu Một', 'Thu Dau Mot', 'Cần Giờ', 'Can Gio'] },
  { value: 'Lai Châu', aliases: ['Lai Chau'] },
  { value: 'Điện Biên', aliases: ['Dien Bien'] },
  { value: 'Sơn La', aliases: ['Son La', 'Mộc Châu', 'Moc Chau'] },
  { value: 'Lạng Sơn', aliases: ['Lang Son'] },
  { value: 'Cao Bằng', aliases: ['Cao Bang', 'Bản Giốc', 'Ban Gioc'] },
  { value: 'Tuyên Quang', aliases: ['Tuyen Quang', 'Hà Giang', 'Ha Giang', 'Đồng Văn', 'Dong Van', 'Mèo Vạc', 'Meo Vac'] },
  { value: 'Lào Cai', aliases: ['Lao Cai', 'Yên Bái', 'Yen Bai', 'Sa Pa', 'Sapa', 'Bắc Hà', 'Bac Ha', 'Mù Cang Chải', 'Mu Cang Chai'] },
  { value: 'Thái Nguyên', aliases: ['Thai Nguyen', 'Bắc Kạn', 'Bac Kan', 'Hồ Núi Cốc', 'Ho Nui Coc'] },
  { value: 'Phú Thọ', aliases: ['Phu Tho', 'Vĩnh Phúc', 'Vinh Phuc', 'Hòa Bình', 'Hoa Binh', 'Việt Trì', 'Viet Tri', 'Tam Đảo', 'Tam Dao', 'Mai Châu', 'Mai Chau'] },
  { value: 'Bắc Ninh', aliases: ['Bac Ninh', 'Bắc Giang', 'Bac Giang'] },
  { value: 'Hưng Yên', aliases: ['Hung Yen', 'Thái Bình', 'Thai Binh'] },
  { value: 'Ninh Bình', aliases: ['Ninh Binh', 'Hà Nam', 'Ha Nam', 'Nam Định', 'Nam Dinh', 'Tràng An', 'Trang An', 'Tam Cốc', 'Tam Coc', 'Bái Đính', 'Bai Dinh'] },
  { value: 'Quảng Ninh', aliases: ['Quang Ninh', 'Hạ Long', 'Ha Long', 'Bãi Cháy', 'Bai Chay', 'Tuần Châu', 'Tuan Chau', 'Cẩm Phả', 'Cam Pha', 'Uông Bí', 'Uong Bi', 'Vân Đồn', 'Van Don', 'Cô Tô', 'Co To', 'Móng Cái', 'Mong Cai', 'Yên Tử', 'Yen Tu'] },
  { value: 'Thanh Hóa', aliases: ['Thanh Hoa', 'Sầm Sơn', 'Sam Son', 'Pù Luông', 'Pu Luong', 'Hải Tiến', 'Hai Tien'] },
  { value: 'Nghệ An', aliases: ['Nghe An', 'Cửa Lò', 'Cua Lo'] },
  { value: 'Hà Tĩnh', aliases: ['Ha Tinh'] },
  { value: 'Quảng Trị', aliases: ['Quang Tri', 'Quảng Bình', 'Quang Binh', 'Đồng Hới', 'Dong Hoi', 'Phong Nha', 'Phong Nha Kẻ Bàng', 'Phong Nha Ke Bang', 'Kẻ Bàng', 'Ke Bang'] },
  { value: 'Quảng Ngãi', aliases: ['Quang Ngai', 'Kon Tum', 'Măng Đen', 'Mang Den', 'Lý Sơn', 'Ly Son'] },
  { value: 'Gia Lai', aliases: ['Gia Lai', 'Bình Định', 'Binh Dinh', 'Quy Nhơn', 'Quy Nhon', 'Eo Gió', 'Eo Gio', 'Kỳ Co', 'Ky Co'] },
  { value: 'Khánh Hòa', aliases: ['Khanh Hoa', 'Ninh Thuận', 'Ninh Thuan', 'Nha Trang', 'Cam Ranh', 'Phan Rang', 'Phan Rang Thap Cham', 'Vĩnh Hy', 'Vinh Hy'] },
  { value: 'Lâm Đồng', aliases: ['Lam Dong', 'Đắk Nông', 'Dak Nong', 'Bình Thuận', 'Binh Thuan', 'Đà Lạt', 'Da Lat', 'Phan Thiết', 'Phan Thiet', 'Mũi Né', 'Mui Ne', 'Gia Nghĩa', 'Gia Nghia', 'Bảo Lộc', 'Bao Loc'] },
  { value: 'Đắk Lắk', aliases: ['Dak Lak', 'Phú Yên', 'Phu Yen', 'Buôn Ma Thuột', 'Buon Ma Thuot', 'Tuy Hòa', 'Tuy Hoa', 'Gành Đá Đĩa', 'Ganh Da Dia'] },
  { value: 'Đồng Nai', aliases: ['Dong Nai', 'Bình Phước', 'Binh Phuoc', 'Biên Hòa', 'Bien Hoa', 'Đồng Xoài', 'Dong Xoai'] },
  { value: 'Tây Ninh', aliases: ['Tay Ninh', 'Long An', 'Tân An', 'Tan An', 'Núi Bà Đen', 'Nui Ba Den'] },
  { value: 'Vĩnh Long', aliases: ['Vinh Long', 'Bến Tre', 'Ben Tre', 'Trà Vinh', 'Tra Vinh'] },
  { value: 'Đồng Tháp', aliases: ['Dong Thap', 'Tiền Giang', 'Tien Giang', 'Mỹ Tho', 'My Tho', 'Cao Lãnh', 'Cao Lanh'] },
  { value: 'Cà Mau', aliases: ['Ca Mau', 'Bạc Liêu', 'Bac Lieu'] },
  { value: 'An Giang', aliases: ['An Giang', 'Kiên Giang', 'Kien Giang', 'Rạch Giá', 'Rach Gia', 'Phú Quốc', 'Phu Quoc', 'Hà Tiên', 'Ha Tien', 'Nam Du', 'Châu Đốc', 'Chau Doc'] },
];

function normalizeDestinationText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^(thanh pho|tp|tinh)\s+/g, '')
    .trim();
}

function getProfileTerms(profile) {
  const values = [profile?.value, ...(Array.isArray(profile?.aliases) ? profile.aliases : [])];
  return [...new Set(values.map(normalizeDestinationText).filter(Boolean))];
}

function matchesProfileTerm(normalized, term) {
  if (!normalized || !term) return false;
  if (normalized === term) return true;
  if (normalized.length >= 4 && normalized.includes(term)) return true;
  if (term.length >= 4 && term.includes(normalized)) return true;
  return false;
}

function getCanonicalVietnamDestination(value) {
  const normalized = normalizeDestinationText(value);
  if (!normalized) return '';

  const profile = DESTINATION_PROFILES.find((item) => (
    getProfileTerms(item).some((term) => matchesProfileTerm(normalized, term))
  ));

  return profile?.value || String(value).trim();
}

const VIETNAM_DESTINATION_OPTIONS = DESTINATION_PROFILES.map((item) => ({
  label: item.value,
  value: item.value,
}));

export {
  DESTINATION_PROFILES,
  VIETNAM_DESTINATION_OPTIONS,
  getCanonicalVietnamDestination,
  normalizeDestinationText,
};
