const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const AppData = require("../models/AppData");
const Post = require("../models/Post");
const Friendship = require("../models/Friendship");
const SocialNotification = require("../models/SocialNotification");

const router = express.Router();
const editableFields = ["name", "phone", "avatar", "bio", "points", "level", "rank", "checkedIn"];

function pick(source, fields) {
  return fields.reduce((result, field) => {
    if (typeof source[field] !== "undefined") result[field] = source[field];
    return result;
  }, {});
}

async function findUser(identifier) {
  if (mongoose.isValidObjectId(identifier)) {
    const byId = await User.findById(identifier);
    if (byId) return byId;
  }
  return User.findOne({ firebaseUid: identifier });
}

router.post("/sync", async (req, res, next) => {
  try {
    const { firebaseUid, email, name } = req.body;
    if (!firebaseUid || !email || !name) {
      return res.status(400).json({ message: "firebaseUid, email và name là bắt buộc" });
    }

    const profile = pick(req.body, editableFields);
    if (typeof profile.phone === "string" && !profile.phone.trim()) {
      delete profile.phone;
    }

    const existingUser = await User.findOne({ firebaseUid }).lean();
    if (!profile.phone && !existingUser?.phone) {
      const mainData = await AppData.findOne({ ownerId: firebaseUid, namespace: "main" }).lean();
      const savedPhone = mainData?.data?.userInfo?.phone;
      if (typeof savedPhone === "string" && savedPhone.trim()) profile.phone = savedPhone.trim();
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      {
        $set: { email, name, ...profile, lastLoginAt: new Date() },
        $setOnInsert: { role: "user", status: "active" },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["name", "email", "phone"].map(field => ({ [field]: new RegExp(escaped, "i") }));
    }

    const [data, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

// Search active Vivu360 members from the mobile app by saved email or phone.
router.get("/search/friends", async (req, res, next) => {
  try {
    const query = String(req.query.q || "").trim();
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter = { status: "active" };
    if (query) {
      filter.$or = [
        { name: new RegExp(escaped, "i") },
        { email: new RegExp(escaped, "i") },
        { phone: new RegExp(escaped.replace(/[\s().-]/g, ""), "i") },
      ];
    }
    if (req.query.exclude) filter.firebaseUid = { $ne: String(req.query.exclude) };

    const users = await User.find(filter)
      .select("firebaseUid name email phone avatar bio level points")
      .sort({ name: 1 })
      .limit(50)
      .lean();
    const viewerId = String(req.query.viewerId || req.query.exclude || "").trim();
    if (!viewerId) return res.json({ success: true, data: users });
    const relations = await Friendship.find({ users: viewerId }).lean();
    const relationMap = new Map(relations.map(relation => [
      relation.users.find(id => id !== viewerId),
      { _id: relation._id, users: relation.users, requesterId: relation.requesterId, status: relation.status, direction: relation.requesterId === viewerId ? "outgoing" : "incoming" },
    ]));
    res.json({ success: true, data: users.map(user => ({ ...user, friendship: relationMap.get(user.firebaseUid) || null })) });
  } catch (error) { next(error); }
});

router.get("/:identifier", async (req, res, next) => {
  try {
    const user = await findUser(req.params.identifier);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.put("/:identifier", async (req, res, next) => {
  try {
    const user = await findUser(req.params.identifier);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    Object.assign(user, pick(req.body, editableFields));
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.patch("/:identifier/access", async (req, res, next) => {
  try {
    const user = await findUser(req.params.identifier);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    if (req.body.role) user.role = req.body.role;
    if (req.body.status) user.status = req.body.status;
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.delete("/:identifier", async (req, res, next) => {
  try {
    const user = await findUser(req.params.identifier);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    await Promise.all([
      AppData.deleteMany({ ownerId: user.firebaseUid }),
      Post.deleteMany({ authorId: user.firebaseUid }),
      Post.updateMany({ likes: user.firebaseUid }, { $pull: { likes: user.firebaseUid } }),
      Friendship.deleteMany({ users: user.firebaseUid }),
      SocialNotification.deleteMany({ $or: [{ recipientId: user.firebaseUid }, { actorId: user.firebaseUid }] }),
    ]);
    await user.deleteOne();
    res.status(204).end();
  } catch (error) { next(error); }
});

module.exports = router;
