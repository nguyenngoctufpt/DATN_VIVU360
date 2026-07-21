const User = require("../models/User");

async function requireUser(req, res, next) {
  try {
    const firebaseUid = String(req.get("x-user-id") || "").trim();
    if (!firebaseUid) {
      return res.status(401).json({ success: false, message: "Thieu header x-user-id" });
    }

    const user = await User.findOne({ firebaseUid, status: "active" })
      .select("firebaseUid name avatar status")
      .lean();
    if (!user) {
      return res.status(401).json({ success: false, message: "Nguoi dung khong ton tai hoac da bi khoa" });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireUser;
