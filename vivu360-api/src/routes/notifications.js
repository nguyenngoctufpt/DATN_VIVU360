const express = require("express");
const mongoose = require("mongoose");
const ChatGroup = require("../models/ChatGroup");
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

async function getGroup(groupId, res) {
  if (!mongoose.isValidObjectId(groupId)) {
    res.status(400).json({ success: false, message: "M\u00e3 nh\u00f3m kh\u00f4ng h\u1ee3p l\u1ec7" });
    return null;
  }
  const group = await ChatGroup.findById(groupId);
  if (!group) {
    res.status(404).json({ success: false, message: "Kh\u00f4ng t\u00ecm th\u1ea5y nh\u00f3m chat" });
    return null;
  }
  return group;
}

function requireMember(group, firebaseUid, res) {
  if (!firebaseUid || !group.members.includes(String(firebaseUid))) {
    res.status(403).json({ success: false, message: "B\u1ea1n kh\u00f4ng ph\u1ea3i th\u00e0nh vi\u00ean c\u1ee7a nh\u00f3m" });
    return false;
  }
  return true;
}

async function mapNotifications(notifications) {
  const actorIds = uniqueIds(notifications.map((item) => item.actorId));
  const actors = await User.find({ firebaseUid: { $in: actorIds } })
    .select("firebaseUid name avatar level points")
    .lean();
  const actorMap = new Map(actors.map((actor) => [actor.firebaseUid, actor]));

  return notifications.map((notification) => {
    const actor = actorMap.get(notification.actorId) || null;
    return {
      ...notification,
      actor,
      message: normalizeSystemAnnouncementText(notification.message, actor?.name),
    };
  });
}

router.get("/groups/:groupId", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    if (!group || !requireMember(group, req.query.requesterId, res)) return;

    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const filter = { groupId: group._id };

    if (req.query.before) {
      const before = new Date(req.query.before);
      if (Number.isNaN(before.getTime())) {
        return res.status(400).json({ success: false, message: "before kh\u00f4ng h\u1ee3p l\u1ec7" });
      }
      filter.createdAt = { $lt: before };
    }

    const notifications = await ChatNotification.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    const data = await mapNotifications(notifications.reverse());
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.post("/groups/:groupId", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const actorId = String(req.body.actorId || req.body.requesterId || "").trim();
    if (!group || !requireMember(group, actorId, res)) return;

    const message = String(req.body.message || "").trim();
    if (!message) {
      return res.status(400).json({ success: false, message: "message l\u00e0 b\u1eaft bu\u1ed9c" });
    }

    const notification = await ChatNotification.create({
      groupId: group._id,
      actorId,
      type: String(req.body.type || "group_update").trim() || "group_update",
      message,
      metadata: isPlainObject(req.body.metadata) ? req.body.metadata : {},
      readBy: [actorId],
    });

    group.lastMessageAt = notification.createdAt;
    await group.save();

    const data = await mapNotifications([notification.toObject()]);
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) { next(error); }
});

router.patch("/groups/:groupId/read", async (req, res, next) => {
  try {
    const group = await getGroup(req.params.groupId, res);
    const readerId = String(req.body.readerId || "").trim();
    if (!group || !requireMember(group, readerId, res)) return;

    const result = await ChatNotification.updateMany(
      { groupId: group._id, readBy: { $ne: readerId } },
      { $addToSet: { readBy: readerId } }
    );

    res.json({ success: true, data: { updated: result.modifiedCount } });
  } catch (error) { next(error); }
});

module.exports = router;
