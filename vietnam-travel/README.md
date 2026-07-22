# 🗺️ VIETNAM TRAVEL MAP & VR 360° MODULE (VIVU360)

Hệ thống bản đồ du lịch 63 tỉnh thành Việt Nam & Trải nghiệm thực tế ảo VR 360° tương tác cao dành cho Web & React Native App.

---

## 🌟 Tính Năng Nổi Bật

1. **Bản Đồ Du Lịch 63 Tỉnh Thành (Leaflet 1.9.4 + Alpine.js)**:
   - Hiển thị toàn bộ các điểm du lịch nổi tiếng trên khắp Việt Nam với giao diện Dark Glassmorphism hiện đại.
   - Tìm kiếm điểm du lịch nhanh theo từ khóa, lọc theo vùng miền, tỉnh thành.
   - Ghim vị trí điểm đến, hiển thị Popup thông tin chi tiết, danh lam thắng cảnh phụ.
   - Lưu địa điểm yêu thích (`❤️`) và chia sẻ trực tiếp vào nhóm trò chuyện.

2. **Trải Nghiệm Thực Tế Ảo VR 360° (Pannellum WebGL Engine)**:
   - Trình chiếu ảnh toàn cảnh 360° độ nét cao của các địa danh nổi tiếng (Văn Miếu, Hạ Long, Hội An, Phú Quốc, Đà Lạt...).
   - Tự động xoay không gian 360° (**Auto Rotate**).
   - Chế độ **Kính VR 3D (Stereoscopic Split Screen)** dành cho kính VR chuyên dụng.

3. **Tích Hợp Đồng Bộ Với React Native App (Expo WebView)**:
   - Tích hợp 2 chiều qua `window.ReactNativeWebView.postMessage` và `onMessage`.
   - Mở màn hình cẩm nang chi tiết (`PlaceDetailScreen`), chia sẻ vị trí và khởi chạy VR 360° trực tiếp từ App di động.

---

## 🛠️ Cấu Trúc Thư Mục Phần Map

```text
vietnam-travel/
├── public/                  # Code Giao diện Map Web & VR 360 (Vite + Alpine.js + Leaflet)
│   ├── index.html           # File giao diện chính tích hợp Leaflet Map & Pannellum VR 360
│   ├── package.json         # Cấu hình dependencies cho Web Map
│   └── vite.config.js       # Cấu hình Vite Server (Chạy ở cổng 3005)
├── api/                     # Server API SQLite quản lý kế hoạch du lịch & địa điểm
│   ├── server.js            # Server Express (Chạy ở cổng 7321)
│   └── package.json         # Cấu hình dependencies cho Travel API
└── README.md                # Hướng dẫn chạy và tích hợp
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Khởi Chạy Web Map Server (Cổng 3005)

```bash
# Di chuyển vào thư mục web map
cd vietnam-travel/public

# Cài đặt dependencies
npm install

# Khởi chạy Vite Dev Server ở cổng 3005
npm run dev
```
👉 **Đường dẫn truy cập trên Trình duyệt**: `http://localhost:3005`

---

### 2. Khởi Chạy Travel Backend API (Cổng 7321)

```bash
# Di chuyển vào thư mục API
cd vietnam-travel/api

# Cài đặt dependencies
npm install

# Khởi chạy Express API server ở cổng 7321
npm run dev
```
👉 **API Server**: `http://localhost:7321`

---

### 3. Tích Hợp Vào React Native App

Trong React Native App (`DATN_VIVU360`), phần Map được tích hợp qua component `VietnamTravelWebScreen` (`src/map/vietnamTravelWeb.js`) và `VirtualTourScreen` (`src/map/virtualTour.js`):

```javascript
// Load Map từ Vite Server 3005 vào WebView
<WebView
  source={{ uri: 'http://<HOST_IP>:3005?view=map&isApp=1' }}
  originWhitelist={['*']}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  mixedContentMode="always"
/>
```

---

## 📝 Tác Giả & Bản Quyền
- **Dự án**: DATN Vivu360 - Ứng dụng Du lịch Việt Nam 360°
- **Repository**: [github.com/nguyenngoctufpt/Vivu360](https://github.com/nguyenngoctufpt/Vivu360.git)
