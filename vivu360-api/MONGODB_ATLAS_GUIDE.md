# 🔗 Hướng Dẫn Kết Nối MongoDB Atlas

## 📋 Các Bước Để Lấy Connection String

### 1️⃣ Tạo Tài Khoản MongoDB Atlas
- Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Đăng ký hoặc đăng nhập tài khoản
- Tạo một Organization và Project

### 2️⃣ Tạo Cluster
- Chọn "Create Deployment"
- Chọn "M0 Free" (miễn phí) hoặc tier phù hợp
- Chọn cloud provider (AWS, GCP, Azure)
- Chọn region gần với server của bạn
- Đợi cluster được tạo (5-10 phút)

### 3️⃣ Tạo Database User
- Vào **Security** → **Database Access**
- Chọn **Add New Database User**
- Nhập Username và Password
- Chọn Built-in Role: **"atlasAdmin@admin"** hoặc **"readWriteAnyDatabase@admin"**
- Chọn **Add User**

### 4️⃣ Whitelist IP Address
- Vào **Security** → **Network Access**
- Chọn **Add IP Address**
- Tuỳ chọn:
  - **Cho phép một IP cụ thể**: Nhập IP của server
  - **Cho phép tất cả** (không nên dùng trên production): Nhập `0.0.0.0/0`
- Chọn **Confirm**

### 5️⃣ Lấy Connection String
- Vào **Database** → Cluster của bạn
- Chọn **Connect** → **Drivers**
- Chọn **Node.js** và version phù hợp
- Copy connection string
- Format: `mongodb+srv://<username>:<password>@<cluster>.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority`

### 6️⃣ Cấu Hình File `.env`
```
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/vivu360_db?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

## 🔑 Ví Dụ Connection String
```
mongodb+srv://admin:password123@cluster0.abc123.mongodb.net/vivu360_db?retryWrites=true&w=majority
                ↑      ↑            ↑                              ↑
            username password    cluster name                  database name
```

## ✅ Kiểm Tra Kết Nối
Sau khi cấu hình, chạy:
```bash
npm install
npm start
# hoặc với nodemon
npm run dev
```

Nếu thấy:
```
✅ Kết nối MongoDB Atlas thành công
📊 Pool size: 50
```
→ Kết nối thành công! 🎉

## 🐛 Troubleshooting

### Lỗi: "Authentication failed"
- Kiểm tra username, password đúng hay chưa
- Kiểm tra character đặc biệt trong password (nếu có, phải URL encode)

### Lỗi: "IP not whitelisted"
- Kiểm tra IP address được whitelist hay chưa
- Hoặc thêm IP vào Network Access

### Lỗi: "getaddrinfo ENOTFOUND"
- Kiểm tra cluster name đúng hay chưa
- Kiểm tra internet connection

## 📊 Cấu Hình Connection Pool
File [config/db.js](config/db.js) đã được tối ưu cho server truyền thống:

| Tham Số | Giá Trị | Ý Nghĩa |
|---------|--------|--------|
| maxPoolSize | 50 | Tối đa 50 kết nối đồng thời |
| minPoolSize | 10 | Pre-warm 10 kết nối sẵn sàng |
| maxIdleTimeMS | 300000 | Giữ kết nối 5 phút |
| socketTimeoutMS | 30000 | Timeout 30 giây cho operations |
| retryWrites | true | Retry write tự động |

## 🌐 API Health Check
Sau khi kết nối, bạn có thể kiểm tra health:
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "mongodb": "connected"
}
```

## 📝 Ghi Chú
- Luôn sử dụng `.env` file cho sensitive data
- Không commit `.env` vào git (thêm vào `.gitignore`)
- Sử dụng connection string khác cho dev, staging, production
