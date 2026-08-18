const mongoose = require("mongoose");
let mongoMemoryServer = null;

// Giữ Node Event Loop luôn chạy ngầm để nodemon không bao giờ bị nổ/crash
setInterval(() => {}, 60000);

async function seedDatabaseIfEmpty() {
  try {
    const Post = require("../models/Post");
    const User = require("../models/User");
    const ChatGroup = require("../models/ChatGroup");
    const ChatMessage = require("../models/ChatMessage");

    // 1. Tạo User mặc định
    const defaultUsers = [
      { firebaseUid: "admin_vivu360", name: "Ban truyền thông Vivu360", avatar: "https://i.pravatar.cc/150?img=68", level: "Cấp 12", points: 15000 },
      { firebaseUid: "phuot_viet", name: "Tạp chí Phượt Việt", avatar: "https://i.pravatar.cc/150?img=33", level: "Cấp 9", points: 9500 },
      { firebaseUid: "am_thuc_viet", name: "Góc Ẩm Thực Việt", avatar: "https://i.pravatar.cc/150?img=47", level: "Cấp 7", points: 6200 },
    ];

    for (const u of defaultUsers) {
      await User.findOneAndUpdate(
        { firebaseUid: u.firebaseUid },
        { $setOnInsert: u },
        { upsert: true }
      ).catch(() => {});
    }

    // 2. Tạo Bảng Tin (Posts) nếu trống
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      console.log("🌱 Đang khởi tạo bài viết mẫu cho Bảng tin MongoDB...");
      await Post.create([
        {
          authorId: "admin_vivu360",
          title: "Vịnh Hạ Long - Trải nghiệm ngắm bình minh 360°",
          content: "Hoàng hôn trên Vịnh Hạ Long hôm nay đẹp mê hồn các bạn ơi! Không khí trong lành, mặt nước phẳng như gương. Mọi người đã trải nghiệm tour VR 360 ở đây chưa?",
          category: "Khám phá",
          location: "Vịnh Hạ Long, Quảng Ninh",
          images: ["https://images.unsplash.com/photo-1524230507669-e297d477b24d?auto=format&fit=crop&w=800&q=80"],
          likes: ["admin_vivu360", "phuot_viet"],
          comments: [
            { authorId: "phuot_viet", text: "Đẹp xuất sắc luôn bạn ơi! Tuần sau nhóm mình cũng ra đây." }
          ],
          privacy: "public",
        },
        {
          authorId: "phuot_viet",
          title: "Săn mây Sa Pa mùa thu đẹp như bồng lai",
          content: "Sáng nay nhiệt độ Sa Pa xuống 16 độ C, mây cuồn cuộn trên đỉnh Fansipan đẹp mê đắm. Lên kế hoạch phượt Sa Pa tuần này ngay thôi cả nhà!",
          category: "Cẩm nang",
          location: "Sa Pa, Lào Cai",
          images: ["https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80"],
          likes: ["admin_vivu360"],
          comments: [
            { authorId: "am_thuc_viet", text: "Cảnh đẹp quá! Nhớ ghé quán thắng cố ở trung tâm thị trấn thử nhé." }
          ],
          privacy: "public",
        },
        {
          authorId: "am_thuc_viet",
          title: "Ẩm thực Phố Cổ Hội An - Cao Lầu & Cơm Gà",
          content: "Đến Hội An nhất định phải thử Cao Lầu và Cơm gà trứ danh. Nước dùng đậm đà, không gian rực rỡ đèn lồng lung linh về đêm.",
          category: "Ẩm thực",
          location: "Hội An, Quảng Nam",
          images: ["https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80"],
          likes: ["admin_vivu360", "phuot_viet"],
          comments: [],
          privacy: "public",
        },
        {
          authorId: "admin_vivu360",
          title: "Biển Phú Quốc trong xanh ngọc bích",
          content: "Bãi Sao Phú Quốc nước biển trong nhìn thấy đáy luôn mọi người ơi! Rất thích hợp cho chuyến nghỉ dưỡng cùng gia đình và bạn bè mùa này.",
          category: "Sự kiện",
          location: "Phú Quốc, Kiên Giang",
          images: ["https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80"],
          likes: ["am_thuc_viet"],
          comments: [],
          privacy: "public",
        }
      ]);
      console.log("✅ Đã khởi tạo bài viết Bảng tin thành công!");
    }

    // 3. Tạo Nhóm Chat (ChatGroups & Messages) nếu trống
    const groupCount = await ChatGroup.countDocuments();
    if (groupCount === 0) {
      console.log("🌱 Đang khởi tạo nhóm chat mẫu cho MongoDB...");
      const group1 = await ChatGroup.create({
        name: "Cộng Đồng Du Lịch Vivu360 🇻🇳",
        avatar: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&q=80",
        ownerId: "admin_vivu360",
        type: "group",
        tag: "Du lịch",
        admins: ["admin_vivu360"],
        members: ["admin_vivu360", "phuot_viet", "am_thuc_viet", "guest_user", "me"],
      });

      await ChatMessage.create([
        {
          groupId: group1._id,
          senderId: "admin_vivu360",
          content: "Chào mừng tất cả các lữ khách đến với nhóm Cộng Đồng Vivu360!",
          type: "text",
          readBy: ["admin_vivu360"],
        },
        {
          groupId: group1._id,
          senderId: "phuot_viet",
          content: "Chào cả nhà! Cuối tuần này có ai đi Sa Pa săn mây cùng mình không?",
          type: "text",
          readBy: ["admin_vivu360", "phuot_viet"],
        }
      ]);

      const group2 = await ChatGroup.create({
        name: "Hội Phượt & Khám Phá Tây Bắc ⛰️",
        avatar: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=300&q=80",
        ownerId: "phuot_viet",
        type: "group",
        tag: "Phượt",
        admins: ["phuot_viet"],
        members: ["admin_vivu360", "phuot_viet", "guest_user", "me"],
      });

      await ChatMessage.create([
        {
          groupId: group2._id,
          senderId: "phuot_viet",
          content: "Dự báo thời tiết Sa Pa tuần này đêm xuống 15 độ, mọi người chuẩn bị đồ ấm nhé!",
          type: "text",
          readBy: ["phuot_viet"],
        }
      ]);

      console.log("✅ Đã khởi tạo Nhóm chat & Tin nhắn thành công!");
    }
  } catch (err) {
    console.error("Lỗi seed dữ liệu MongoDB:", err.message);
  }
}

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  let isConnected = false;

  try {
    console.log("🔄 Đang thử kết nối MongoDB Atlas...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    console.log(`✅ Kết nối MongoDB Atlas thành công: ${mongoose.connection.name}`);
    isConnected = true;
  } catch (atlasError) {
    console.warn(`⚠️ Wi-Fi trường học/Mạng hiện tại chặn kết nối Atlas.`);
  }

  if (!isConnected) {
    try {
      console.log("🚀 Đang khởi tạo MongoDB Local In-Memory...");
      const { MongoMemoryServer } = require("mongodb-memory-server");
      if (!mongoMemoryServer) {
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: { dbName: "vivu360_db" }
        });
      }
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`⚡ KẾT NỐI MONGODB LOCAL BỘ NHỚ TẠM THÀNH CÔNG! App sẵn sàng chạy trên mạng trường!`);
      isConnected = true;
    } catch (memErr) {
      console.warn(`⚠️ Đang tải gói MongoDB Local: ${memErr.message}`);
      console.log(`💡 Backend Express vẫn hoạt động liên tục tại http://localhost:3000`);
    }
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const friendships = mongoose.connection.collection("friendships");
      const indexes = await friendships.indexes().catch(() => []);
      const legacyUsersIndex = indexes.find(index => index.name === "users_1" && index.unique);
      if (legacyUsersIndex) {
        await friendships.dropIndex("users_1");
        await friendships.createIndex({ users: 1 }, { name: "users_1" });
      }
    } catch (err) {
      // Ignore index setup on new instances
    }

    // Tự động khởi tạo bài viết và tin nhắn mẫu nếu CSDL trống
    await seedDatabaseIfEmpty();
  }
}

module.exports = { connectDatabase };
