# Vivu360 - Ứng dụng du lịch ảo 3D & Bản đồ số Việt Nam 360°

Vivu360 là ứng dụng di động React Native (sử dụng Expo) kết hợp hệ thống Backend MongoDB Express và Bản đồ Web Vite. Ứng dụng cho phép người dùng trải nghiệm tham quan ảo các địa danh du lịch nổi tiếng 63 tỉnh thành Việt Nam với công nghệ Virtual Tour 360°, hệ thống nhắn tin & thông báo thời gian thực, bảng tin mạng xã hội chia sẻ hành trình du lịch.

---

## 📋 Yêu cầu hệ thống (Prerequisites)
Trước khi bắt đầu cài đặt, hãy đảm bảo máy tính của bạn đã cài sẵn:
- **Node.js**: Phiên bản Node LTS (v18.x hoặc v20.x).
- **Git**: Để clone dự án từ GitHub.
- **Expo Go** (trên điện thoại) hoặc **Android Studio / Genymotion** (nếu chạy máy ảo).

---

## 🚀 Hướng dẫn cài đặt & Chạy ứng dụng từ A - Z (Đỡ bị lỗi)

### 1️⃣ Bước 1: Clone dự án từ GitHub
Mở Terminal (hoặc CMD / PowerShell / Git Bash) tại thư mục máy tính của bạn:
```bash
git clone https://github.com/nguyenngoctufpt/Vivu360.git
cd Vivu360
git checkout main
```

---

### 2️⃣ Bước 2: Cài đặt các gói phụ thuộc (Dependencies)
Để đảm bảo ứng dụng di động và các server backend chạy chuẩn xác không thiếu gói, chạy lệnh cài đặt cho từng thư mục:

```bash
# 1. Cài đặt thư mục gốc (App Mobile React Native / Expo)
npm install --legacy-peer-deps

# 2. Cài đặt Backend MongoDB API
cd vivu360-api
npm install
cd ..

# 3. Cài đặt Bản đồ Web (Vite Public Map)
cd vietnam-travel/public
npm install
cd ../..

# 4. Cài đặt Travel API
cd vietnam-travel/api
npm install
cd ../..
```

---

### 3️⃣ Bước 3: Cấu hình biến môi trường (`.env`)
Tạo tệp `.env` trong thư mục `vivu360-api/.env` (nếu chưa có) để kết nối Cơ sở dữ liệu MongoDB:
```env
PORT=5001
MONGODB_URI=mongodb+srv://ngoctuboy2k4:Tu24102004@cluster0.oev5q.mongodb.net/Vivu360?retryWrites=true&w=majority
```

---

### 4️⃣ Bước 4: Khởi chạy dự án (Run Application)

#### ⚡ Cách 1: Chạy tất cả tự động bằng 1 câu lệnh (Khuyên dùng)
Tại thư mục gốc `Vivu360`, chạy lệnh:
```bash
npm start
```
Lệnh này sẽ tự động chạy đồng thời:
- **Backend MongoDB API**: `http://localhost:5001`
- **Bản đồ Web 360°**: `http://localhost:3005`
- **Travel API**: `http://localhost:5002`
- **Expo Mobile App**: Cửa sổ Metro Bundler chứa mã QR.

#### 🛠️ Cách 2: Chạy riêng bằng 2 Terminal
- **Terminal 1 (Backend APIs & Web Map)**:
  ```bash
  npm run dev
  ```
- **Terminal 2 (App Mobile Expo)**:
  ```bash
  npm run start:expo
  ```

---

### 5️⃣ Bước 5: Trải nghiệm trên Điện thoại / Máy ảo

#### 📲 Trên Điện thoại thật:
1. Kết nối điện thoại và máy tính vào **cùng một mạng Wi-Fi**.
2. Mở ứng dụng **Expo Go** trên điện thoại, chọn **Scan QR Code** và quét mã QR trên màn hình Terminal.

#### 🖥️ Trên Máy ảo Android (Emulator):
1. Mở sẵn Android Studio / Genymotion.
2. Nhấn phím **`a`** trên giao diện Terminal Expo để khởi chạy tự động.

---

## 📁 Cấu trúc thư mục dự án
```text
Vivu360/
├── src/
│   ├── auth/            # Đăng nhập, đăng ký, Firebase & Thông báo đẩy
│   ├── chat/            # Nhắn tin nhóm/1-1 & Thông báo thời gian thực
│   ├── map/             # Bản đồ 63 tỉnh thành Việt Nam & Virtual Tour 360°
│   ├── screens/         # Màn hình chính (Home, Explore, PlaceDetail, Profile)
│   ├── settings/        # Cài đặt cá nhân & chỉnh sửa hồ sơ
│   ├── services/        # Kết nối API Backend (chatService, api)
│   ├── social/          # Mạng xã hội du lịch & trang cá nhân
│   └── App.js           # Điểm vào chính của ứng dụng di động
├── vivu360-api/         # Backend Node.js Express & MongoDB Database
├── vietnam-travel/      # Module Bản đồ tương tác Web 3D (Vite)
├── package.json         # Cấu hình phụ thuộc chính của dự án
└── README.md            # Hướng dẫn chi tiết dự án
```
