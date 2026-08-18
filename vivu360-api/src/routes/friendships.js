const express = require("express");
const mongoose = require("mongoose");
const Friendship = require("../models/Friendship");
const User = require("../models/User");
const requireUser = require("../middleware/requireUser");

const router = express.Router();
router.use(requireUser);
router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: "Khong tim thay quan he ket ban" });
  next();
});

router.get("/", async (req, res, next) => {
  try {
    const filter = { users: req.user.firebaseUid };
    if (req.query.status) filter.status = String(req.query.status);
    const friendships = await Friendship.find(filter).sort({ updatedAt: -1 }).lean();
    const ids = friendships.flatMap(item => item.users).filter(id => id !== req.user.firebaseUid);
    const profiles = await User.find({ firebaseUid: { $in: ids }, status: "active" })
      .select("firebaseUid name avatar bio level points").lean();
    const profileMap = new Map(profiles.map(profile => [profile.firebaseUid, profile]));
    res.json({ success: true, data: friendships.map(item => ({
      ...item,
      friend: profileMap.get(item.users.find(id => id !== req.user.firebaseUid)) || null,
      direction: item.requesterId === req.user.firebaseUid ? "outgoing" : "incoming",
    })) });
  } catch (error) { next(error); }
});

router.post("/requests", async (req, res, next) => {
  try {
    const requesterId = req.user.firebaseUid;
    const receiverId = String(req.body.userId || "").trim();
    if (!receiverId || receiverId === requesterId) {
      return res.status(400).json({ success: false, message: "Nguoi nhan loi moi khong hop le" });
    }
    if (!await User.exists({ firebaseUid: receiverId, status: "active" })) {
      return res.status(404).json({ success: false, message: "Khong tim thay nguoi dung" });
    }
    const users = [requesterId, receiverId].sort();
    let friendship = await Friendship.findOne({ pairKey: users.join("::") });
    if (friendship) {
      friendship.status = "accepted";
      friendship.acceptedAt = new Date();
      await friendship.save();
    } else {
      friendship = await Friendship.create({ users, requesterId, status: "accepted", acceptedAt: new Date() });
    }
    res.status(201).json({ success: true, data: friendship });
  } catch (error) { next(error); }
});

router.patch("/:id/accept", async (req, res, next) => {
  try {
    const friendship = await Friendship.findOne({
      _id: req.params.id,
      users: req.user.firebaseUid,
      requesterId: { $ne: req.user.firebaseUid },
      status: "pending",
    });
    if (!friendship) return res.status(404).json({ success: false, message: "Khong tim thay loi moi den" });
    friendship.status = "accepted";
    friendship.acceptedAt = new Date();
    await friendship.save();
    res.json({ success: true, data: friendship });
  } catch (error) { next(error); }
});

router.patch("/:id/reject", async (req, res, next) => {
  try {
    const friendship = await Friendship.findOneAndDelete({
      _id: req.params.id,
      users: req.user.firebaseUid,
      requesterId: { $ne: req.user.firebaseUid },
      status: "pending",
    });
    if (!friendship) return res.status(404).json({ success: false, message: "Khong tim thay loi moi den" });
    res.status(204).end();
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const friendship = await Friendship.findOneAndDelete({ _id: req.params.id, users: req.user.firebaseUid });
    if (!friendship) return res.status(404).json({ success: false, message: "Khong tim thay quan he ket ban" });
    res.status(204).end();
  } catch (error) { next(error); }
});

module.exports = router;
