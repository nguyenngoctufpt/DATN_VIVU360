const test = require("node:test");
const assert = require("node:assert/strict");
const AppData = require("../src/models/AppData");
const DiaDiem = require("../src/models/DiaDiem");
const User = require("../src/models/User");
const ChatGroup = require("../src/models/ChatGroup");
const ChatMessage = require("../src/models/ChatMessage");
const Post = require("../src/models/Post");
const Friendship = require("../src/models/Friendship");
const ChatNotification = require("../src/models/ChatNotification");

test("AppData requires owner, namespace and data", async () => {
  await assert.rejects(new AppData({}).validate(), (error) => {
    assert.ok(error.errors.ownerId);
    assert.ok(error.errors.namespace);
    assert.ok(error.errors.data);
    return true;
  });
});

test("DiaDiem accepts a valid place", async () => {
  const place = new DiaDiem({ ten: "V\u1ecbnh H\u1ea1 Long", viTri: "Qu\u1ea3ng Ninh", danhGia: 4.9 });
  await place.validate();
});

test("DiaDiem rejects ratings above five", async () => {
  await assert.rejects(
    new DiaDiem({ ten: "Test", viTri: "Test", danhGia: 6 }).validate(),
    (error) => Boolean(error.errors.danhGia)
  );
});

test("User requires Firebase identity and profile fields", async () => {
  await assert.rejects(new User({}).validate(), (error) => {
    assert.ok(error.errors.firebaseUid);
    assert.ok(error.errors.email);
    assert.ok(error.errors.name);
    return true;
  });
});

test("User accepts a valid Firebase profile", async () => {
  const user = new User({
    firebaseUid: "firebase-user-1",
    email: "user@vivu360.vn",
    name: "Nguy\u1ec5n Minh",
  });
  await user.validate();
  assert.equal(user.role, "user");
  assert.equal(user.status, "active");
});

test("ChatGroup always includes its owner as member and admin", async () => {
  const group = new ChatGroup({ name: "Nh\u00f3m \u0111i Sa Pa", ownerId: "owner-1", members: ["member-1"] });
  await group.validate();
  assert.deepEqual(group.members.sort(), ["member-1", "owner-1"]);
  assert.deepEqual(group.admins, ["owner-1"]);
});

test("ChatGroup stores shared itinerary and fund defaults", async () => {
  const group = new ChatGroup({
    name: "Nh\u00f3m \u0111i H\u1ed9i An",
    ownerId: "owner-1",
    members: ["owner-1"],
    itinerary: { destinationId: "hoi-an", startDate: "2026-07-20", endDate: "2026-07-22" },
    fund: { goal: "15000000", contributions: [{ id: 1, amount: 500000 }], expenses: [{ id: 2, amount: 200000 }] },
  });
  await group.validate();
  assert.equal(group.itinerary.destinationId, "hoi-an");
  assert.equal(group.fund.goal, 15000000);
  assert.equal(group.fund.contributions.length, 1);
  assert.equal(group.fund.expenses.length, 1);
});

test("ChatGroup normalizes direct chats with a stable pair key", async () => {
  const group = new ChatGroup({
    name: "Chat rieng",
    ownerId: "user-1",
    type: "direct",
    members: ["user-2", "user-1"],
  });
  await group.validate();
  assert.equal(group.type, "direct");
  assert.deepEqual([...group.members].sort(), ["user-1", "user-2"]);
  assert.equal(group.directKey, "user-1::user-2");
});

test("ChatMessage requires text or an attachment", async () => {
  await assert.rejects(
    new ChatMessage({ groupId: "507f1f77bcf86cd799439011", senderId: "user-1" }).validate(),
    (error) => Boolean(error.errors.content)
  );
});

test("ChatMessage marks its sender as having read the message", async () => {
  const message = new ChatMessage({
    groupId: "507f1f77bcf86cd799439011",
    senderId: "user-1",
    content: "Xin ch\u00e0o c\u1ea3 nh\u00f3m",
  });
  await message.validate();
  assert.deepEqual(message.readBy, ["user-1"]);
});

test("ChatNotification normalizes workspace notification text", async () => {
  const notification = new ChatNotification({
    groupId: "507f1f77bcf86cd799439011",
    actorId: "user-1",
    type: "fund_goal_update",
    message: "Lan ?? c?p nh?t m?c ti?u qu? th\u00e0nh 15.000.000 \u0111.",
    metadata: { goal: 15000000 },
  });
  await notification.validate();
  assert.equal(notification.type, "fund_goal_update");
  assert.equal(notification.message, "Lan \u0111\u00e3 c\u1eadp nh\u1eadt m\u1ee5c ti\u00eau qu\u1ef9 th\u00e0nh 15.000.000 \u0111.");
  assert.equal(notification.metadata.goal, 15000000);
  assert.deepEqual(notification.readBy, ["user-1"]);
});

test("ChatMessage normalizes legacy system text", async () => {
  const message = new ChatMessage({
    groupId: "507f1f77bcf86cd799439011",
    senderId: "user-1",
    type: "system",
    content: "Lan ?? c?p nh?t l?ch tr?nh H\u00e1\u00ba\u00a1 Long t? 19/07 ??n 23/07.",
  });
  await message.validate();
  assert.equal(message.content, "Lan \u0111\u00e3 c\u1eadp nh\u1eadt l\u1ecbch tr\u00ecnh H\u1ea1 Long t\u1eeb 19/07 \u0111\u1ebfn 23/07.");
});

test("Post requires its own author and content", async () => {
  await assert.rejects(new Post({}).validate(), error => {
    assert.ok(error.errors.authorId);
    assert.ok(error.errors.content);
    return true;
  });
});

test("Post normalizes duplicate images and likes", async () => {
  const post = new Post({ authorId: "user-1", content: "Chuyen di Da Lat", images: [" a.jpg ", "a.jpg"], likes: ["user-2", "user-2"] });
  await post.validate();
  assert.deepEqual(post.images, ["a.jpg"]);
  assert.deepEqual(post.likes, ["user-2"]);
});

test("Friendship stores a canonical pair of different users", async () => {
  const friendship = new Friendship({ users: ["user-2", "user-1"], requesterId: "user-1" });
  await friendship.validate();
  assert.deepEqual(friendship.users, ["user-1", "user-2"]);
  assert.equal(friendship.pairKey, "user-1::user-2");
  assert.equal(friendship.status, "pending");
});

test("Friendship rejects self friendship", async () => {
  await assert.rejects(
    new Friendship({ users: ["user-1", "user-1"], requesterId: "user-1" }).validate(),
    error => Boolean(error.errors.users)
  );
});
