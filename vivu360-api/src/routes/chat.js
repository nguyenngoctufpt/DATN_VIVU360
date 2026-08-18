const express = require("express");
const mongoose = require("mongoose");
const ChatGroup = require("../models/ChatGroup");
const ChatMessage = require("../models/ChatMessage");
const ChatNotification = require("../models/ChatNotification");
const User = require("../models/User");
const DiaDiem = require("../models/DiaDiem");
const { normalizeSystemAnnouncementText } = require("../utils/chatText");

const router = express.Router();

function uniqueIds(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(String).map(v => v.trim()).filter(Boolean))];
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function activeUserIds(ids) {
  const users = await User.find({ firebaseUid: { $in: ids }, status: "active" }).select("firebaseUid").lean();
  return new Set(users.map((user) => user.firebaseUid));
}

async function loadMemberProfiles(ids) {
  return User.find({ firebaseUid: { $in: ids }, status: "active" })
    .select("firebaseUid name email phone avatar level points")
    .lean();
}

async function getGroup(groupId, res) {
  if (!mongoose.isValidObjectId(groupId)) {
    res.status(400).json({ success: false, message: "Mã nhóm không hợp lệ" });
    return null;
  }

  const group = await ChatGroup.findById(groupId);
  if (!group) {
    res.status(404).json({ success: false, message: "Không tìm thấy nhóm chat" });
    return null;
  }

  return group;
}

function requireMember(group, firebaseUid, res) {
  if (!firebaseUid) return true;
  const uidStr = String(firebaseUid).trim();
  if (!uidStr) return true;

  if (Array.isArray(group.members) && group.members.includes(uidStr)) return true;
  if (group.ownerId && String(group.ownerId) === uidStr) return true;

  // Tự động thêm người dùng vào danh sách thành viên nhóm
  group.members = Array.from(new Set([...(group.members || []), uidStr]));
  group.save().catch(() => {});
  return true;
}

function requireAdmin(group, firebaseUid, res) {
  if (!firebaseUid || !group.admins.includes(String(firebaseUid))) {
    res.status(403).json({ success: false, message: "Chỉ quản trị viên nhóm được thực hiện thao tác này" });
    return false;
  }
  return true;
}

function buildWorkspaceNotificationType({ hasItinerary, hasFundGoal, hasContribution, hasExpense, hasFund }) {
  if (hasItinerary && (hasFundGoal || hasContribution || hasExpense || hasFund)) return "workspace_update";
  if (hasItinerary) return "itinerary_update";
  if (hasFundGoal) return "fund_goal_update";
  if (hasContribution) return "fund_contribution";
  if (hasExpense) return "fund_expense";
  return "fund_update";
}

async function createGroupNotification(group, actorId, type, message, metadata = {}) {
  const notification = await ChatNotification.create({
    groupId: group._id,
    actorId,
    type,
    message,
    metadata: isPlainObject(metadata) ? metadata : {},
    readBy: [actorId],
  });

  group.lastMessageAt = notification.createdAt;
  await group.save();
  return notification;
}

function serializeMessage(message) {
  if (!message) return null;
  return {
    ...message,
    content: message.type === "system"
      ? normalizeSystemAnnouncementText(message.content, message.sender?.name)
      : message.content,
  };
}

function serializeNotification(notification) {
  if (!notification) return null;
  return {
    ...notification,
    message: normalizeSystemAnnouncementText(notification.message, notification.actor?.name),
  };
}

function pickLatestActivity(lastMessage, lastNotification) {
  const messageTime = lastMessage?.createdAt ? new Date(lastMessage.createdAt).getTime() : 0;
  const notificationTime = lastNotification?.createdAt ? new Date(lastNotification.createdAt).getTime() : 0;

  if (!messageTime && !notificationTime) return null;
  if (notificationTime >= messageTime) return lastNotification ? { kind: "notification", ...lastNotification } : null;
  return lastMessage ? { kind: "message", ...lastMessage } : null;
}

async function ensureUsersExist(ids) {
  const uniqueList = uniqueIds(ids);
  for (const uid of uniqueList) {
    if (!uid) continue;
    await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        $setOnInsert: {
          firebaseUid: uid,
          name: (uid === 'me' || uid === 'guest_user' || uid.startsWith('user_')) ? 'Nguyễn Ngọc Tú' : 'Thành viên Vivu360',
          email: `${uid}@vivu360.vn`,
          role: 'user',
          status: 'active',
          avatar: `https://i.pravatar.cc/150?u=${uid}`,
          level: 'Hội viên',
          points: 100
        }
      },
      { upsert: true }
    ).catch(() => {});
  }
}

router.post("/groups", async (req, res, next) => {
  try {
    const ownerId = String(req.body.ownerId || req.get("x-user-id") || req.query.userId || "guest_user").trim();
    const groupType = (req.body.type === "direct" || req.body.isDirect) ? "direct" : "group";
    const groupName = String(req.body.name || "Nhóm trò chuyện mới").trim();
    const memberIds = uniqueIds([ownerId, ...uniqueIds(req.body.memberIds)]);

    // Đảm bảo tất cả người dùng trong nhóm tồn tại trong MongoDB
    await ensureUsersExist(memberIds);

    if (groupType === "direct" && memberIds.length !== 2) {
      return res.status(400).json({ success: false, message: "Chat riêng phải có đúng 2 thành viên" });
    }

    if (groupType === "direct") {
      const directKey = [...memberIds].sort().join("::");
      const existingGroup = await ChatGroup.findOne({ type: "direct", directKey }).lean();
      if (existingGroup) {
        const memberProfiles = await loadMemberProfiles(existingGroup.members);
        return res.json({ success: true, data: { ...existingGroup, memberProfiles } });
      }
    }

    const group = await ChatGroup.create({
      name: groupName,
      avatar: req.body.avatar || "",
      ownerId,
      type: groupType,
      tag: req.body.tag || (groupType === "direct" ? "Cá nhân" : "Du lịch"),
      admins: [ownerId],
      members: memberIds,
      itinerary: groupType === "group" && isPlainObject(req.body.itinerary) ? req.body.itinerary : undefined,
      fund: groupType === "group" && isPlainObject(req.body.fund) ? req.body.fund : undefined,
    });

    const memberProfiles = await loadMemberProfiles(group.members);
    res.status(201).json({ success: true, data: { ...group.toObject(), memberProfiles } });
  } catch (error) {
    if (error?.code === 11000 && (req.body.type === "direct" || req.body.isDirect)) {
      try {
        const ownerId = String(req.body.ownerId || req.get("x-user-id") || req.query.userId || "guest_user").trim();
        const memberIds = uniqueIds([ownerId, ...uniqueIds(req.body.memberIds)]);
        const directKey = [...memberIds].sort().join("::");
        const existingGroup = await ChatGroup.findOne({ type: "direct", directKey }).lean();
        if (existingGroup) {
          const memberProfiles = await loadMemberProfiles(existingGroup.members);
          return res.json({ success: true, data: { ...existingGroup, memberProfiles } });
        }
      } catch (lookupError) {
        return next(lookupError);
      }
    }
    next(error);
  }
});

router.post("/direct", async (req, res, next) => {
  try {
    const ownerId = String(req.body.ownerId || "").trim();
    const friendId = String(req.body.friendId || "").trim();
    if (!ownerId || !friendId || ownerId === friendId) {
      return res.status(400).json({ success: false, message: "Hai thanh vien chat khong hop le" });
    }
    const validIds = await activeUserIds([ownerId, friendId]);
    if (validIds.size !== 2) return res.status(404).json({ success: false, message: "Khong tim thay thanh vien" });
    const candidates = await ChatGroup.find({ members: { $all: [ownerId, friendId] } });
    let group = candidates.find(item => item.members.length === 2 && item.members.includes(ownerId) && item.members.includes(friendId));
    if (!group) {
      const friend = await User.findOne({ firebaseUid: friendId }).select("name avatar").lean();
      group = await ChatGroup.create({ name: friend?.name || "Trò chuyện", avatar: friend?.avatar || "", ownerId, admins: [ownerId], members: [ownerId, friendId] });
    }
    res.json({ success: true, data: group });
  } catch (error) { next(error); }
});

router.get("/groups", async (req, res, next) => {
  try {
    const memberId = String(req.query.memberId || req.get("x-user-id") || "guest_user").trim();
    const userObj = await User.findOne({ $or: [{ firebaseUid: memberId }, { email: memberId }] }).lean();
    const searchUids = Array.from(new Set([memberId, userObj?.firebaseUid, userObj?.email, "me"].filter(Boolean)));

    // Xóa sạch các nhóm mẫu cũ khỏi MongoDB
    await ChatGroup.deleteMany({
      name: { $regex: /Bạn bè thêm|Phượt Sa Pa|Du Thuyền Hạ Long|Phố Cổ Hội An|Việt, Thái, Hiệp/i }
    });

    const groups = await ChatGroup.find({
      $or: [
        { type: "group" },
        { members: { $in: searchUids } },
        { ownerId: { $in: searchUids } },
        { admins: { $in: searchUids } }
      ]
    }).sort({ lastMessageAt: -1 }).lean();
    const memberIds = uniqueIds(groups.flatMap((group) => group.members));
    const profiles = await User.find({ firebaseUid: { $in: memberIds } })
      .select("firebaseUid name email phone avatar level points")
      .lean();
    const profileMap = new Map(profiles.map((profile) => [profile.firebaseUid, profile]));

    const [lastMessages, lastNotifications] = await Promise.all([
      Promise.all(groups.map((group) => ChatMessage.findOne({ groupId: group._id }).sort({ createdAt: -1 }).lean())),
      Promise.all(groups.map((group) => ChatNotification.findOne({ groupId: group._id }).sort({ createdAt: -1 }).lean())),
    ]);

    const notificationActorIds = uniqueIds(lastNotifications.filter(Boolean).map((item) => item.actorId));
    const notificationActors = await User.find({ firebaseUid: { $in: notificationActorIds } })
      .select("firebaseUid name avatar level points")
      .lean();
    const notificationActorMap = new Map(notificationActors.map((actor) => [actor.firebaseUid, actor]));

    const data = groups.map((group, index) => {
      const lastNotification = lastNotifications[index]
        ? serializeNotification({ ...lastNotifications[index], actor: notificationActorMap.get(lastNotifications[index].actorId) || null })
        : null;
      const lastMessage = serializeMessage(lastMessages[index]);
      const lastActivity = pickLatestActivity(lastMessage, lastNotification);

      return {
        ...group,
        memberProfiles: group.members.map((id) => {
          const profile = profileMap.get(id);
          if (profile) return profile;
          return {
            firebaseUid: id,
            name: (id === memberId || String(id).startsWith('user_')) ? 'Nguyễn Ngọc Tú' : 'Thành viên Vivu360',
            email: '',
            phone: '',
            avatar: `https://i.pravatar.cc/150?u=${id}`,
            level: 'Hội viên',
            points: 100,
          };
        }),
        lastMessage,
        lastNotification,
        lastActivity,
      };
    });

    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get("/groups/:groupId", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    if (!group || !requireMember(group, req.query.requesterId, res)) return;
    res.json({ success: true, data: group });
  } catch (error) { next(error); }
});

router.patch("/groups/:groupId", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;
    if (typeof req.body.name === "string" && req.body.name.trim() && req.body.name.trim() !== group.name) {
      if (!requireAdmin(group, requesterId, res)) return;
      group.name = req.body.name.trim();
    }
    if (typeof req.body.avatar === "string") group.avatar = req.body.avatar;
    if (typeof req.body.tag === "string") group.tag = req.body.tag;
    if (isPlainObject(req.body.itinerary)) {
      group.itinerary = req.body.itinerary;
      group.markModified("itinerary");
    }
    if (isPlainObject(req.body.fund)) {
      group.fund = req.body.fund;
      group.markModified("fund");
    }
    await group.save();
    res.json({ success: true, data: group });
  } catch (error) { next(error); }
});

router.patch("/groups/:groupId/workspace", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;

    const hasItinerary = Object.prototype.hasOwnProperty.call(req.body, "itinerary");
    const hasFund = Object.prototype.hasOwnProperty.call(req.body, "fund");
    const hasFundGoal = Object.prototype.hasOwnProperty.call(req.body, "fundGoal");
    const hasContribution = Object.prototype.hasOwnProperty.call(req.body, "contribution");
    const hasExpense = Object.prototype.hasOwnProperty.call(req.body, "expense");
    const hasFundChange = hasFund || hasFundGoal || hasContribution || hasExpense;

    if (!hasItinerary && !hasFundChange) {
      return res.status(400).json({ success: false, message: "Cần gửi itinerary hoặc thay đổi fund để cập nhật" });
    }

    if (hasItinerary && !isPlainObject(req.body.itinerary)) {
      return res.status(400).json({ success: false, message: "itinerary phải là object hợp lệ" });
    }

    if (hasFund && !isPlainObject(req.body.fund)) {
      return res.status(400).json({ success: false, message: "fund phải là object hợp lệ" });
    }

    if (hasContribution && !isPlainObject(req.body.contribution)) {
      return res.status(400).json({ success: false, message: "contribution phải là object hợp lệ" });
    }

    if (hasExpense && !isPlainObject(req.body.expense)) {
      return res.status(400).json({ success: false, message: "expense phải là object hợp lệ" });
    }

    if (hasItinerary) {
      group.itinerary = req.body.itinerary;
      group.markModified("itinerary");
    }

    if (hasFund) {
      group.fund = req.body.fund;
      group.markModified("fund");
    } else if (hasFundChange) {
      const currentFund = isPlainObject(group.fund)
        ? group.fund
        : { goal: 0, contributions: [], expenses: [] };
      const nextFund = {
        goal: Number(currentFund.goal) || 0,
        contributions: Array.isArray(currentFund.contributions) ? currentFund.contributions : [],
        expenses: Array.isArray(currentFund.expenses) ? currentFund.expenses : [],
      };

      if (hasFundGoal) nextFund.goal = Number(req.body.fundGoal) || 0;
      if (hasContribution) nextFund.contributions = [req.body.contribution, ...nextFund.contributions];
      if (hasExpense) nextFund.expenses = [req.body.expense, ...nextFund.expenses];

      group.fund = nextFund;
      group.markModified("fund");
    }

    await group.save();

    let notification = null;
    if (!req.body.skipAnnouncement) {
      const actor = await User.findOne({ firebaseUid: requesterId }).select("name").lean();
      const fallbackAnnouncement = hasItinerary && hasFundChange
        ? `${actor?.name || "Một thành viên"} đã cập nhật lịch trình và quỹ du lịch chung.`
        : hasItinerary
          ? `${actor?.name || "Một thành viên"} đã cập nhật lịch trình chung của nhóm.`
          : `${actor?.name || "Một thành viên"} đã cập nhật quỹ du lịch của nhóm.`;
      const content = String(req.body.announcement || "").trim() || fallbackAnnouncement;
      const notificationType = buildWorkspaceNotificationType({ hasItinerary, hasFundGoal, hasContribution, hasExpense, hasFund });
      const createdNotification = await createGroupNotification(group, requesterId, notificationType, content, {
        itineraryUpdated: hasItinerary,
        fundUpdated: hasFundChange,
      });
      notification = serializeNotification({
        ...createdNotification.toObject(),
        actor,
      });
    }

    res.json({ success: true, data: { group: group.toObject(), notification } });
  } catch (error) { next(error); }
});

router.post("/groups/:groupId/members", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group) return;
    if (requesterId && !requireMember(group, requesterId, res)) return;

    const memberIds = uniqueIds(req.body.memberIds);
    const validIds = await activeUserIds(memberIds);
    const invalidIds = memberIds.filter((id) => !validIds.has(id));
    if (invalidIds.length) {
      return res.status(400).json({ success: false, message: "Có thành viên không tồn tại hoặc đã bị khóa", invalidIds });
    }
    group.members = uniqueIds([...group.members, ...memberIds]);
    await group.save();
    res.json({ success: true, data: group });
  } catch (error) { next(error); }
});

router.delete("/groups/:groupId/members/:memberId", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    if (!group) return;

    const requesterId = String(req.query.requesterId || "").trim();
    const memberId = String(req.params.memberId || "").trim();
    const isSelfLeave = requesterId === memberId;

    if (!memberId || !group.members.includes(memberId)) {
      return res.status(404).json({ success: false, message: "Kh\u00f4ng t\u00ecm th\u1ea5y th\u00e0nh vi\u00ean trong nh\u00f3m" });
    }

    if (!isSelfLeave && !requireAdmin(group, requesterId, res)) return;

    if (memberId === group.ownerId && !isSelfLeave) {
      return res.status(400).json({ success: false, message: "Kh\u00f4ng th\u1ec3 x\u00f3a ch\u1ee7 nh\u00f3m kh\u1ecfi nh\u00f3m" });
    }

    const remainingMembers = group.members.filter((id) => id !== memberId);

    if (group.type === "direct" || remainingMembers.length === 0) {
      await Promise.all([
        ChatMessage.deleteMany({ groupId: group._id }),
        ChatNotification.deleteMany({ groupId: group._id }),
        group.deleteOne(),
      ]);
      return res.json({ success: true, data: { deleted: true, groupId: String(req.params.groupId) } });
    }

    if (memberId === group.ownerId) {
      const nextOwnerId = group.admins.find((id) => id !== memberId && remainingMembers.includes(id)) || remainingMembers[0];
      group.ownerId = nextOwnerId;
      group.admins = uniqueIds([nextOwnerId, ...group.admins.filter((id) => id !== memberId && remainingMembers.includes(id))]);
    } else {
      group.admins = group.admins.filter((id) => id !== memberId && remainingMembers.includes(id));
    }

    group.members = remainingMembers;
    await group.save();
    res.json({ success: true, data: { deleted: false, group: group.toObject() } });
  } catch (error) { next(error); }
});

router.get("/groups/:groupId/messages", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.query.requesterId || req.get("x-user-id") || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
    const filter = { groupId: group._id };
    if (req.query.before) {
      const before = new Date(req.query.before);
      if (Number.isNaN(before.getTime())) return res.status(400).json({ success: false, message: "before không hợp lệ" });
      filter.createdAt = { $lt: before };
    }
    const messages = await ChatMessage.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    const senderIds = uniqueIds(messages.map((message) => message.senderId));
    const senders = await User.find({ firebaseUid: { $in: senderIds } })
      .select("firebaseUid name avatar level points")
      .lean();
    const senderMap = new Map(senders.map((sender) => [sender.firebaseUid, sender]));
    senderMap.set("VIVU_AI_BOT", {
      firebaseUid: "VIVU_AI_BOT",
      name: "Trợ Lý AI Vivu360 🤖",
      avatar: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
      level: "VIP Trợ Lý",
      points: 9999
    });

    res.json({
      success: true,
      data: messages.reverse().map((message) => serializeMessage({ ...message, sender: senderMap.get(message.senderId) || null })),
    });
  } catch (error) { next(error); }
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAWdPLpzDXnhE0sAcw5VXuqcG8fQ4g3j4k";

async function callGeminiAI(question, groupContext) {
  try {
    const apiKey = GEMINI_API_KEY;
    if (!apiKey) return null;

    const systemPrompt = `Bạn là Trợ Lý AI Du Lịch Vivu360 thông minh, vui vẻ và am hiểu du lịch Việt Nam.
Bạn đang trợ giúp cho nhóm chat du lịch tên: "${groupContext.name || 'Dự án du lịch'}".
Thông tin ngữ cảnh của nhóm hiện tại:
- Điểm đến: ${groupContext.itinerary?.destinationName || 'Chưa chọn'}
- Tổng ngày đi: ${groupContext.itinerary?.daysCount || 3} ngày
- Số dư quỹ nhóm: ${groupContext.fundBalance || '0 đ'} (Tổng thu: ${groupContext.fundTotalContributed || '0 đ'}, Tổng chi: ${groupContext.fundTotalSpent || '0 đ'})
- Danh sách thành viên chưa đóng quỹ: ${groupContext.unpaidMembersStr || 'Không có'}
- Lịch trình các ngày: ${JSON.stringify(groupContext.itinerary?.days || []).slice(0, 800)}

Nhiệm vụ của bạn: Trả lời câu hỏi người dùng một cách chính xác, thân thiện, ngắn gọn vừa phải, sử dụng biểu tượng cảm xúc sinh động và định dạng markdown đẹp mắt.
Câu hỏi của người dùng: "${question}"`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ]
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err) {
    return null;
  }
}

// --- 🤖 TRỢ LÝ NHÓM AI (GROUP AI ASSISTANT) ---
router.post("/groups/:groupId/assistant-ask", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;

    const rawQuestion = String(req.body.question || "").trim();
    const qLower = rawQuestion.toLowerCase();

    // Chuẩn bị dữ liệu ngữ cảnh cho Gemini
    const fund = group.fund || { goal: 0, contributions: [], expenses: [] };
    const totalContributed = (fund.contributions || []).reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const totalSpent = (fund.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const balance = totalContributed - totalSpent;
    const formatVND = (num) => `${num.toLocaleString("vi-VN")} đ`;

    const paidMemberIds = new Set((fund.contributions || []).map(c => String(c.memberId || c.userId || c.name)));
    const memberProfiles = await loadMemberProfiles(group.members);
    const unpaidMembers = memberProfiles.filter(m => !paidMemberIds.has(m.firebaseUid) && !paidMemberIds.has(m.name));
    const unpaidMembersStr = unpaidMembers.map(m => m.name).join(", ");

    const groupContext = {
      name: group.name,
      itinerary: group.itinerary,
      fundBalance: formatVND(balance),
      fundTotalContributed: formatVND(totalContributed),
      fundTotalSpent: formatVND(totalSpent),
      unpaidMembersStr: unpaidMembersStr || "Đã đóng đủ",
    };

    // Thử gọi Google Gemini AI trực tiếp trước
    let replyText = await callGeminiAI(rawQuestion, groupContext);

    // Nếu Gemini không phản hồi / lỗi mạng, dùng bộ phản hồi quy tắc làm fallback
    if (!replyText) {
      if (qLower.includes("ngày") || qLower.includes("lịch trình") || qLower.includes("hôm nay") || qLower.includes("đi đâu") || qLower.includes("đi gì")) {
        const matchDay = qLower.match(/ngày\s*(\d+)/) || qLower.match(/ngày\s*(nhất|hai|ba|bốn|năm)/);
        let dayIndex = 1;
        if (matchDay) {
          if (/\d+/.test(matchDay[1])) dayIndex = parseInt(matchDay[1], 10);
          else if (matchDay[1] === "hai") dayIndex = 2;
          else if (matchDay[1] === "ba") dayIndex = 3;
          else if (matchDay[1] === "bốn") dayIndex = 4;
          else if (matchDay[1] === "năm") dayIndex = 5;
        }

        const days = group.itinerary?.days || [];
        const dayData = days[dayIndex - 1] || days[0];

        if (dayData) {
          const slots = dayData.slots || [];
          const slotDesc = slots.map(s => `• ${s.period || s.time}: ${s.text || s.title}`).join("\n");
          replyText = `📅 **Lịch trình Ngày ${dayIndex} tại ${group.itinerary?.destinationName || group.name}:**\n${slotDesc || "Chưa có danh sách địa điểm chi tiết."}\n\n💡 *Gợi ý:* Nên chuẩn bị ${dayData.packing?.slice(0, 3).join(", ") || "giày đi bộ & nước uống"}.`;
        } else {
          replyText = `📅 Lịch trình nhóm hiện tại có ${days.length || 3} ngày tại **${group.itinerary?.destinationName || group.name}**. Hãy cập nhật trong tab Lịch Trình nhé!`;
        }
      } else if (qLower.includes("quỹ") || qLower.includes("tiền") || qLower.includes("số dư") || qLower.includes("bao nhiêu") || qLower.includes("ngân sách")) {
        replyText = `💰 **Báo cáo Ngân Sách Quỹ Nhóm:**\n• Tổng thu (đóng góp): **${formatVND(totalContributed)}**\n• Tổng chi: **${formatVND(totalSpent)}**\n• 💵 **Số dư quỹ còn lại:** **${formatVND(balance)}**\n• Mục tiêu ban đầu: ${formatVND(fund.goal || 0)}`;
      } else if (qLower.includes("chưa đóng") || qLower.includes("chưa nộp") || qLower.includes("quên đóng") || qLower.includes("ai chưa")) {
        if (unpaidMembers.length === 0) {
          replyText = `🎉 **Tuyệt vời!** Tất cả ${group.members.length} thành viên trong nhóm đều đã đóng tiền quỹ đầy đủ.`;
        } else {
          const unpaidNames = unpaidMembers.map(m => `• @${m.name}`).join("\n");
          replyText = `⚠️ **Danh sách thành viên chưa đóng quỹ (${unpaidMembers.length}/${group.members.length}):**\n${unpaidNames}\n\n💡 *Trưởng nhóm hoặc Phó nhóm có thể bấm "Nhắc việc" nhé!*`;
        }
      } else if (qLower.includes("đổi") || qLower.includes("ăn") || qLower.includes("quán") || qLower.includes("nhà hàng") || qLower.includes("gần") || qLower.includes("khách sạn")) {
        const destName = group.itinerary?.destinationName || "địa phương";
        const places = await DiaDiem.find({ viTri: { $regex: new RegExp(destName, "i") } }).limit(3).lean();
        
        let placeListStr = "";
        if (places.length > 0) {
          placeListStr = places.map((p, idx) => `${idx + 1}. **${p.ten}** (${p.danhGia}⭐) - ${p.moTa || "Địa điểm nổi tiếng"}`).join("\n");
        } else {
          placeListStr = `1. **Nhà hàng Hải Sản Bờ Biển** (4.8⭐) - Đặc sản tươi sống.\n2. **Quán Nướng & Lẩu Đêm** (4.6⭐) - Không gian rộng rãi cho nhóm.\n3. **Tiệm Cafe & View Ngắm Cảnh** (4.9⭐) - Gần trung tâm.`;
        }

        replyText = `🍽️ **Gợi ý địa điểm ăn uống & thay đổi chỗ ăn gần khách sạn (${destName}):**\n\n${placeListStr}\n\n💡 *Nhóm có thể tạo ngay bài **Bình Chọn Nhanh** để thống nhất!*`;
      } else {
        replyText = `🤖 **Trợ Lý Vivu360 trả lời:**\nHỗ trợ nhóm du lịch **${group.name}**!\nBạn có thể hỏi tôi:\n• *"Ngày 2 đi gì?"*\n• *"Quỹ còn bao nhiêu?"*\n• *"Ai chưa đóng tiền?"*\n• *"Gợi ý quán ăn gần khách sạn"*`;
      }
    }

    const message = await ChatMessage.create({
      groupId: group._id,
      senderId: "VIVU_AI_BOT",
      content: replyText,
      type: "assistant",
      readBy: [requesterId],
    });

    group.lastMessageAt = message.createdAt;
    await group.save();

    const sender = {
      firebaseUid: "VIVU_AI_BOT",
      name: "Trợ Lý AI Vivu360 🤖",
      avatar: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
      level: "VIP Trợ Lý",
      points: 9999
    };

    res.status(201).json({
      success: true,
      data: serializeMessage({ ...message.toObject(), sender })
    });
  } catch (error) { next(error); }
});

// --- 📊 BÌNH CHỌN NHANH (QUICK POLLS) ---
router.post("/groups/:groupId/polls", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const senderId = String(req.body.senderId || req.body.requesterId || "").trim();
    if (!group || !requireMember(group, senderId, res)) return;

    const question = String(req.body.question || "Bình chọn ý kiến nhóm").trim();
    const rawOptions = Array.isArray(req.body.options) ? req.body.options : [];
    if (rawOptions.length < 2) {
      return res.status(400).json({ success: false, message: "Bài bình chọn phải có ít nhất 2 lựa chọn" });
    }

    const pollData = {
      question,
      options: rawOptions.map((optText, index) => ({
        id: `opt_${Date.now()}_${index}`,
        text: String(optText).trim(),
        voters: [],
      })),
      closed: false,
      multipleChoice: Boolean(req.body.multipleChoice),
      createdBy: senderId,
    };

    const message = await ChatMessage.create({
      groupId: group._id,
      senderId,
      content: `📊 **BÌNH CHỌN:** ${question}`,
      type: "poll",
      poll: pollData,
      readBy: [senderId],
    });

    group.lastMessageAt = message.createdAt;
    await group.save();

    const senders = await loadMemberProfiles([senderId]);
    res.status(201).json({
      success: true,
      data: serializeMessage({ ...message.toObject(), sender: senders[0] || null }),
    });
  } catch (error) { next(error); }
});

router.post("/groups/:groupId/polls/:messageId/vote", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    const optionId = String(req.body.optionId || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;

    const message = await ChatMessage.findOne({ _id: req.params.messageId, groupId: group._id });
    if (!message || message.type !== "poll" || !message.poll) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài bình chọn" });
    }

    if (message.poll.closed) {
      return res.status(400).json({ success: false, message: "Bài bình chọn này đã bị khóa" });
    }

    const poll = { ...message.poll };
    const multiple = Boolean(poll.multipleChoice);

    poll.options = (poll.options || []).map((opt) => {
      const voters = new Set(opt.voters || []);
      if (opt.id === optionId) {
        if (voters.has(requesterId)) {
          voters.delete(requesterId);
        } else {
          voters.add(requesterId);
        }
      } else if (!multiple) {
        voters.delete(requesterId);
      }
      return { ...opt, voters: Array.from(voters) };
    });

    message.poll = poll;
    message.markModified("poll");
    await message.save();

    const senders = await loadMemberProfiles([message.senderId]);
    res.json({ success: true, data: serializeMessage({ ...message.toObject(), sender: senders[0] || null }) });
  } catch (error) { next(error); }
});

router.patch("/groups/:groupId/polls/:messageId/close", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;

    const message = await ChatMessage.findOne({ _id: req.params.messageId, groupId: group._id });
    if (!message || message.type !== "poll" || !message.poll) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài bình chọn" });
    }

    message.poll = { ...message.poll, closed: true };
    message.markModified("poll");
    await message.save();

    const senders = await loadMemberProfiles([message.senderId]);
    res.json({ success: true, data: serializeMessage({ ...message.toObject(), sender: senders[0] || null }) });
  } catch (error) { next(error); }
});

// --- 📋 PHÂN CÔNG VAI TRÒ & CHECKLIST NHẮC VIỆC ---
router.patch("/groups/:groupId/roles", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group || !requireAdmin(group, requesterId, res)) return;

    const deputyIds = uniqueIds(req.body.deputyIds);
    group.deputyIds = deputyIds.filter(id => group.members.includes(id) && id !== group.ownerId);
    await group.save();

    res.json({ success: true, data: group });
  } catch (error) { next(error); }
});

router.post("/groups/:groupId/tasks", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;

    const title = String(req.body.title || "").trim();
    if (!title) return res.status(400).json({ success: false, message: "Tiêu đề công việc không được để trống" });

    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      assignedTo: String(req.body.assignedTo || "").trim(),
      roleTarget: String(req.body.roleTarget || "member").trim(),
      category: String(req.body.category || "Chung").trim(),
      completed: Boolean(req.body.completed),
      dueDate: req.body.dueDate || null,
      createdBy: requesterId,
      createdAt: new Date(),
    };

    group.tasks = [newTask, ...(group.tasks || [])];
    group.markModified("tasks");
    await group.save();

    res.status(201).json({ success: true, data: { tasks: group.tasks, createdTask: newTask } });
  } catch (error) { next(error); }
});

router.patch("/groups/:groupId/tasks/:taskId", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;

    const taskId = String(req.params.taskId).trim();
    let updatedTask = null;

    group.tasks = (group.tasks || []).map((task) => {
      if (String(task.id) === taskId) {
        updatedTask = {
          ...task,
          completed: typeof req.body.completed === "boolean" ? req.body.completed : task.completed,
          assignedTo: typeof req.body.assignedTo === "string" ? req.body.assignedTo.trim() : task.assignedTo,
          title: typeof req.body.title === "string" ? req.body.title.trim() : task.title,
        };
        return updatedTask;
      }
      return task;
    });

    group.markModified("tasks");
    await group.save();

    res.json({ success: true, data: { tasks: group.tasks, updatedTask } });
  } catch (error) { next(error); }
});

router.post("/groups/:groupId/tasks/:taskId/remind", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;

    const taskId = String(req.params.taskId).trim();
    const task = (group.tasks || []).find((t) => String(t.id) === taskId);
    if (!task) return res.status(404).json({ success: false, message: "Không tìm thấy công việc" });

    const assignedProfiles = task.assignedTo ? await loadMemberProfiles([task.assignedTo]) : [];
    const assignedName = assignedProfiles[0]?.name || (task.roleTarget === "leader" ? "Trưởng Nhóm" : task.roleTarget === "deputy" ? "Phó Nhóm" : "Thành viên");

    const content = `📌 **NHẮC VIỆC:** Task **"${task.title}"** (Phân công: @${assignedName})\nHãy kiểm tra và hoàn thành đúng hạn nhé!`;

    const message = await ChatMessage.create({
      groupId: group._id,
      senderId: requesterId,
      content,
      type: "task_reminder",
      readBy: [requesterId],
    });

    group.lastMessageAt = message.createdAt;
    await group.save();

    const senderProfiles = await loadMemberProfiles([requesterId]);
    res.status(201).json({
      success: true,
      data: serializeMessage({ ...message.toObject(), sender: senderProfiles[0] || null }),
    });
  } catch (error) { next(error); }
});

router.post("/groups/:groupId/messages", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const senderId = String(req.body.senderId || "").trim();
    if (!group || !requireMember(group, senderId, res)) return;
    const message = await ChatMessage.create({
      groupId: group._id,
      senderId,
      content: req.body.content || "",
      type: req.body.type || "text",
      mediaUrl: req.body.mediaUrl || "",
      readBy: [senderId],
    });
    group.lastMessageAt = message.createdAt;
    await group.save();
    res.status(201).json({ success: true, data: serializeMessage(message.toObject()) });
  } catch (error) { next(error); }
});

router.patch("/groups/:groupId/messages/:messageId", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;

    const message = await ChatMessage.findOne({ _id: req.params.messageId, groupId: group._id });
    if (!message) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tin nhắn" });
    }

    if (String(message.senderId) !== requesterId) {
      return res.status(403).json({ success: false, message: "Bạn chỉ có thể chỉnh sửa tin nhắn của chính mình" });
    }

    const newContent = String(req.body.content || "").trim();
    if (!newContent) {
      return res.status(400).json({ success: false, message: "Nội dung tin nhắn không được để trống" });
    }

    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    const senders = await loadMemberProfiles([message.senderId]);
    res.json({
      success: true,
      data: serializeMessage({ ...message.toObject(), sender: senders[0] || null }),
    });
  } catch (error) { next(error); }
});

router.patch("/groups/:groupId/messages/read", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const readerId = String(req.body.readerId || "").trim();
    if (!group || !requireMember(group, readerId, res)) return;
    const result = await ChatMessage.updateMany(
      { groupId: group._id, readBy: { $ne: readerId } },
      { $addToSet: { readBy: readerId } }
    );
    res.json({ success: true, data: { updated: result.modifiedCount } });
  } catch (error) { next(error); }
});

const typingStateMap = new Map();

router.post("/groups/:groupId/typing", async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId || "").trim();
    const userId = String(req.body.userId || "").trim();
    const userName = String(req.body.userName || "Thành viên").trim();
    const avatar = String(req.body.avatar || "").trim();
    const isTyping = Boolean(req.body.isTyping);

    if (isTyping && userId) {
      typingStateMap.set(groupId, {
        userId,
        userName,
        avatar,
        updatedAt: Date.now(),
      });
    } else if (typingStateMap.get(groupId)?.userId === userId) {
      typingStateMap.delete(groupId);
    }

    res.json({ success: true });
  } catch (error) { next(error); }
});

router.get("/groups/:groupId/typing", async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId || "").trim();
    const requesterId = String(req.query.requesterId || "").trim();

    const state = typingStateMap.get(groupId);
    if (state && Date.now() - state.updatedAt < 5000 && state.userId !== requesterId) {
      return res.json({ success: true, data: { isTyping: true, user: state } });
    }

    res.json({ success: true, data: { isTyping: false } });
  } catch (error) { next(error); }
});

router.delete("/groups/:groupId", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    if (!group) return;
    if (String(req.query.requesterId || "") !== group.ownerId) {
      return res.status(403).json({ success: false, message: "Chỉ chủ nhóm được xóa nhóm" });
    }
    await Promise.all([
      ChatMessage.deleteMany({ groupId: group._id }),
      ChatNotification.deleteMany({ groupId: group._id }),
      group.deleteOne(),
    ]);
    res.status(204).end();
  } catch (error) { next(error); }
});

// ─── POLL ENDPOINTS ───────────────────────────────────────────────────────────

router.post("/groups/:groupId/polls", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const senderId = String(req.body.senderId || "").trim();
    if (!group || !requireMember(group, senderId, res)) return;

    const question = String(req.body.question || "").trim();
    const rawOptions = Array.isArray(req.body.options) ? req.body.options : [];
    const multipleChoice = Boolean(req.body.multipleChoice);

    if (!question) {
      return res.status(400).json({ success: false, message: "Câu hỏi bình chọn không được để trống" });
    }

    const options = rawOptions
      .map((opt, idx) => {
        const text = typeof opt === "string" ? opt.trim() : (opt?.text || "").trim();
        return text ? { id: opt?.id || `opt_${Date.now()}_${idx}`, text, voters: [] } : null;
      })
      .filter(Boolean);

    if (options.length < 2) {
      return res.status(400).json({ success: false, message: "Cần ít nhất 2 phương án bình chọn" });
    }

    const pollData = {
      question,
      options,
      multipleChoice,
      closed: false,
      createdBy: senderId,
    };

    const message = await ChatMessage.create({
      groupId: group._id,
      senderId,
      content: `📊 Bình chọn: ${question}`,
      type: "poll",
      poll: pollData,
      readBy: [senderId],
    });

    group.lastMessageAt = message.createdAt;
    await group.save();

    const senderProfiles = await loadMemberProfiles([senderId]);
    res.status(201).json({
      success: true,
      data: serializeMessage({ ...message.toObject(), sender: senderProfiles[0] || null }),
    });
  } catch (error) { next(error); }
});

router.post("/groups/:groupId/polls/:messageId/vote", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;

    const message = await ChatMessage.findOne({ _id: req.params.messageId, groupId: group._id });
    if (!message || message.type !== "poll" || !message.poll) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài bình chọn" });
    }

    if (message.poll.closed) {
      return res.status(400).json({ success: false, message: "Cuộc bình chọn đã bị khóa" });
    }

    const optionId = String(req.body.optionId || "").trim();
    const poll = { ...message.poll };
    const isMultiple = poll.multipleChoice;

    poll.options = (poll.options || []).map((opt) => {
      const voters = Array.isArray(opt.voters) ? opt.voters.map(String) : [];
      if (String(opt.id) === optionId) {
        if (voters.includes(requesterId)) {
          return { ...opt, voters: voters.filter((v) => v !== requesterId) };
        } else {
          return { ...opt, voters: [...voters, requesterId] };
        }
      } else if (!isMultiple) {
        return { ...opt, voters: voters.filter((v) => v !== requesterId) };
      }
      return opt;
    });

    message.poll = poll;
    message.markModified("poll");
    await message.save();

    const senderProfiles = await loadMemberProfiles([message.senderId]);
    res.json({
      success: true,
      data: serializeMessage({ ...message.toObject(), sender: senderProfiles[0] || null }),
    });
  } catch (error) { next(error); }
});

router.patch("/groups/:groupId/polls/:messageId/close", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const requesterId = String(req.body.requesterId || "").trim();
    if (!group || !requireMember(group, requesterId, res)) return;

    const message = await ChatMessage.findOne({ _id: req.params.messageId, groupId: group._id });
    if (!message || message.type !== "poll" || !message.poll) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài bình chọn" });
    }

    message.poll = { ...message.poll, closed: true };
    message.markModified("poll");
    await message.save();

    const senderProfiles = await loadMemberProfiles([message.senderId]);
    res.json({
      success: true,
      data: serializeMessage({ ...message.toObject(), sender: senderProfiles[0] || null }),
    });
  } catch (error) { next(error); }
});

module.exports = router;


