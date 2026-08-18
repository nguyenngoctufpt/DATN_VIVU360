const Friendship = require("../models/Friendship");

async function getFriendIds(firebaseUid) {
  const friendships = await Friendship.find({ users: firebaseUid }).select("users").lean();
  return friendships.map(friendship => friendship.users.find(id => id !== firebaseUid)).filter(Boolean);
}

async function canViewUser(viewerId, ownerId) {
  if (viewerId === ownerId) return true;
  return Boolean(await Friendship.exists({ users: { $all: [viewerId, ownerId] } }));
}

module.exports = { getFriendIds, canViewUser };
