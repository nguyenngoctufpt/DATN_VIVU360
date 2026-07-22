const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const SocialNotification = require("../models/SocialNotification");
const requireUser = require("../middleware/requireUser");
const { getFriendIds, canViewUser } = require("../services/friendshipService");

const router = express.Router();
const editableFields = ["content", "images", "location", "category"];
router.use(requireUser);
router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: "Khong tim thay bai viet" });
  next();
});

function pick(source) {
  return editableFields.reduce((result, field) => {
    if (typeof source[field] !== "undefined") result[field] = source[field];
    return result;
  }, {});
}

async function attachAuthors(posts, viewerId) {
  const ids = [...new Set(posts.flatMap(post => [post.authorId, ...(post.comments || []).map(comment => comment.authorId)]))];
  const users = await User.find({ firebaseUid: { $in: ids } }).select("firebaseUid name avatar level").lean();
  const map = new Map(users.map(user => [user.firebaseUid, user]));
  return posts.map(post => ({
    ...post,
    author: map.get(post.authorId) || null,
    comments: (post.comments || []).map(comment => ({ ...comment, author: map.get(comment.authorId) || null })),
    likedByMe: post.likes.includes(viewerId),
    likesCount: post.likes.length,
    commentsCount: (post.comments || []).length,
  }));
}

router.get("/feed", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const authorIds = [req.user.firebaseUid, ...await getFriendIds(req.user.firebaseUid)];
    const filter = { authorId: { $in: authorIds } };
    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);
    res.json({ success: true, data: await attachAuthors(posts, req.user.firebaseUid), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

router.get("/user/:userId", async (req, res, next) => {
  try {
    const ownerId = String(req.params.userId);
    if (!await canViewUser(req.user.firebaseUid, ownerId)) {
      return res.status(403).json({ success: false, message: "Chi ban be moi xem duoc bai viet cua nhau" });
    }
    const posts = await Post.find({ authorId: ownerId }).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ success: true, data: await attachAuthors(posts, req.user.firebaseUid) });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post || !await canViewUser(req.user.firebaseUid, post.authorId)) {
      return res.status(404).json({ success: false, message: "Khong tim thay bai viet" });
    }
    res.json({ success: true, data: (await attachAuthors([post], req.user.firebaseUid))[0] });
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const post = await Post.create({ ...pick(req.body), authorId: req.user.firebaseUid });
    res.status(201).json({ success: true, data: post });
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, authorId: req.user.firebaseUid });
    if (!post) return res.status(404).json({ success: false, message: "Khong tim thay bai viet cua ban" });
    Object.assign(post, pick(req.body));
    await post.save();
    res.json({ success: true, data: post });
  } catch (error) { next(error); }
});

router.post("/:id/like", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !await canViewUser(req.user.firebaseUid, post.authorId)) {
      return res.status(404).json({ success: false, message: "Khong tim thay bai viet" });
    }
    const index = post.likes.indexOf(req.user.firebaseUid);
    if (index >= 0) post.likes.splice(index, 1); else post.likes.push(req.user.firebaseUid);
    await post.save();
    if (post.authorId !== req.user.firebaseUid) {
      const filter = { recipientId: post.authorId, actorId: req.user.firebaseUid, postId: post._id, type: "post_like" };
      if (index >= 0) await SocialNotification.deleteOne(filter);
      else await SocialNotification.findOneAndUpdate(filter, { $set: { read: false } }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
    }
    res.json({ success: true, data: { likedByMe: index < 0, likesCount: post.likes.length } });
  } catch (error) { next(error); }
});

router.post("/:id/comments", async (req, res, next) => {
  try {
    const text = String(req.body.text || "").trim();
    if (!text) return res.status(400).json({ success: false, message: "Noi dung binh luan la bat buoc" });
    const post = await Post.findById(req.params.id);
    if (!post || !await canViewUser(req.user.firebaseUid, post.authorId)) {
      return res.status(404).json({ success: false, message: "Khong tim thay bai viet" });
    }
    post.comments.push({ authorId: req.user.firebaseUid, text });
    post.commentsCount = post.comments.length;
    await post.save();
    const comment = post.comments[post.comments.length - 1];
    if (post.authorId !== req.user.firebaseUid) {
      await SocialNotification.create({
        recipientId: post.authorId,
        actorId: req.user.firebaseUid,
        postId: post._id,
        type: "post_comment",
        message: text,
      });
    }
    res.status(201).json({ success: true, data: { ...comment.toObject(), author: req.user } });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, authorId: req.user.firebaseUid });
    if (!post) return res.status(404).json({ success: false, message: "Khong tim thay bai viet cua ban" });
    await SocialNotification.deleteMany({ postId: post._id });
    res.status(204).end();
  } catch (error) { next(error); }
});

module.exports = router;
