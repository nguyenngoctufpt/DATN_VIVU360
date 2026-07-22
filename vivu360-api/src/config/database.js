const mongoose = require("mongoose");

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Thiếu MONGODB_URI trong file .env");

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  // Older deployments created users_1 as unique, which incorrectly limited
  // every account to a single friendship. Keep uniqueness on pairKey only.
  const friendships = mongoose.connection.collection("friendships");
  const indexes = await friendships.indexes().catch(() => []);
  const legacyUsersIndex = indexes.find(index => index.name === "users_1" && index.unique);
  if (legacyUsersIndex) {
    await friendships.dropIndex("users_1");
    await friendships.createIndex({ users: 1 }, { name: "users_1" });
  }

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

module.exports = { connectDatabase };
