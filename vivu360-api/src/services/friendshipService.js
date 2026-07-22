const Friendship = require("../models/Friendship");

async function getFriendIds(firebaseUid) {
  const friendships = await Friendship.find({ status: "accepted", users: firebaseUid }).select("users").lean();
  return friendships.map(friendship => friendship.users.find(id => id !== firebaseUid)).filter(Boolean);
}

async function canViewUser(viewerId, ownerId) {
  if (viewerId === ownerId) return true;
  return Boolean(await Friendship.exists({ status: "accepted", pairKey: [viewerId, ownerId].sort().join("::") }));
}

module.exports = { getFriendIds, canViewUser };
