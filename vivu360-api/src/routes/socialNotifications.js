const express = require("express");
const SocialNotification = require("../models/SocialNotification");
const User = require("../models/User");
const requireUser = require("../middleware/requireUser");

const router = express.Router();
router.use(requireUser);

router.get("/", async (req, res, next) => {
  try {
    const notifications = await SocialNotification.find({ recipientId: req.user.firebaseUid })
      .sort({ createdAt: -1 }).limit(100).lean();
    const actorIds = [...new Set(notifications.map(item => item.actorId))];
    const actors = await User.find({ firebaseUid: { $in: actorIds } })
      .select("firebaseUid name avatar").lean();
    const actorMap = new Map(actors.map(actor => [actor.firebaseUid, actor]));
    res.json({ success: true, data: notifications.map(item => ({ ...item, actor: actorMap.get(item.actorId) || null })) });
  } catch (error) { next(error); }
});

router.patch("/read", async (req, res, next) => {
  try {
    const result = await SocialNotification.updateMany(
      { recipientId: req.user.firebaseUid, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true, data: { updated: result.modifiedCount } });
  } catch (error) { next(error); }
});

module.exports = router;
