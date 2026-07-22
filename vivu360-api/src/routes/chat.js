const express = require("express");
const mongoose = require("mongoose");
const ChatGroup = require("../models/ChatGroup");
const ChatMessage = require("../models/ChatMessage");
const ChatNotification = require("../models/ChatNotification");
const User = require("../models/User");
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
  if (!firebaseUid || !group.members.includes(String(firebaseUid))) {
    res.status(403).json({ success: false, message: "Bạn không phải thành viên của nhóm" });
    return false;
  }
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

router.post("/groups", async (req, res, next) => {
  try {
    const ownerId = String(req.body.ownerId || "").trim();
    const groupType = req.body.type === "direct" ? "direct" : "group";
    const memberIds = uniqueIds([ownerId, ...uniqueIds(req.body.memberIds)]);
    const groupName = String(req.body.name || "").trim();
    if (!ownerId || !groupName) {
      return res.status(400).json({ success: false, message: "name và ownerId là bắt buộc" });
    }
    if (groupType === "direct" && memberIds.length !== 2) {
      return res.status(400).json({ success: false, message: "Chat riêng phải có đúng 2 thành viên" });
    }

    const validIds = await activeUserIds(memberIds);
    if (!validIds.has(ownerId)) {
      return res.status(400).json({ success: false, message: "Người tạo nhóm không tồn tại hoặc đã bị khóa" });
    }

    const invalidIds = memberIds.filter((id) => !validIds.has(id));
    if (invalidIds.length) {
      return res.status(400).json({ success: false, message: "Có thành viên không tồn tại hoặc đã bị khóa", invalidIds });
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
    if (error?.code === 11000 && req.body.type === "direct") {
      try {
        const ownerId = String(req.body.ownerId || "").trim();
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
    const memberId = String(req.query.memberId || "").trim();
    if (!memberId) {
      return res.status(400).json({ success: false, message: "memberId là bắt buộc" });
    }

    const groups = await ChatGroup.find({ members: memberId }).sort({ lastMessageAt: -1 }).lean();
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
            name: id === memberId ? 'Bạn' : `Thành viên (${String(id).slice(0, 5)})`,
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
    if (typeof req.body.name === "string" && req.body.name.trim()) {
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
    if (!group || !requireAdmin(group, req.body.requesterId, res)) return;
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
    if (!group || !requireMember(group, req.query.requesterId, res)) return;
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
    res.json({
      success: true,
      data: messages.reverse().map((message) => serializeMessage({ ...message, sender: senderMap.get(message.senderId) || null })),
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
      return res.status(403).json({ success: false, message: "Ch\u1ec9 ch\u1ee7 nh\u00f3m \u0111\u01b0\u1ee3c x\u00f3a nh\u00f3m" });
    }
    await Promise.all([
      ChatMessage.deleteMany({ groupId: group._id }),
      ChatNotification.deleteMany({ groupId: group._id }),
      group.deleteOne(),
    ]);
    res.status(204).end();
  } catch (error) { next(error); }
});

module.exports = router;


