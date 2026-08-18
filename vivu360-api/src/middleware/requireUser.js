const User = require("../models/User");

async function requireUser(req, res, next) {
  try {
    const firebaseUid = String(req.get("x-user-id") || req.query.memberId || req.query.userId || "guest_user").trim();

    let user = await User.findOne({ firebaseUid }).lean();
    if (!user) {
      user = await User.findOneAndUpdate(
        { firebaseUid },
        {
          $setOnInsert: {
            firebaseUid,
            name: 'Thành viên Vivu360',
            email: `${firebaseUid}@vivu360.vn`,
            role: 'user',
            status: 'active'
          }
        },
        { upsert: true, new: true }
      ).lean();
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireUser;
