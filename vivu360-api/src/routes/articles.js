const express = require("express");
const mongoose = require("mongoose");
const Article = require("../models/Article");

const router = express.Router();
const editableFields = [
  "title",
  "slug",
  "summary",
  "content",
  "coverImage",
  "tags",
  "authorId",
  "authorName",
  "status",
  "publishedAt",
];

function pick(source, fields) {
  return fields.reduce((result, field) => {
    if (typeof source[field] !== "undefined") result[field] = source[field];
    return result;
  }, {});
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findArticle(identifier) {
  const value = String(identifier || "").trim();
  if (!value) return null;

  if (mongoose.isValidObjectId(value)) {
    const byId = await Article.findById(value);
    if (byId) return byId;
  }

  return Article.findOne({ slug: value.toLowerCase() });
}

function handleWriteError(error, res, next) {
  if (error?.code === 11000 && error?.keyPattern?.slug) {
    return res.status(409).json({ success: false, message: "Slug already exists" });
  }

  return next(error);
}

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const filter = {};

    if (req.query.status) filter.status = String(req.query.status).trim();
    if (req.query.authorId) filter.authorId = String(req.query.authorId).trim();
    if (req.query.tag) filter.tags = String(req.query.tag).trim().toLowerCase();

    if (req.query.search) {
      const escaped = escapeRegex(req.query.search);
      filter.$or = ["title", "summary", "content", "authorName"].map(field => ({
        [field]: new RegExp(escaped, "i"),
      }));
    }

    const sort = req.query.sort === "oldest"
      ? { createdAt: 1 }
      : { publishedAt: -1, createdAt: -1 };

    const [data, total] = await Promise.all([
      Article.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:identifier", async (req, res, next) => {
  try {
    const article = await findArticle(req.params.identifier);
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const article = await Article.create(pick(req.body, editableFields));
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    handleWriteError(error, res, next);
  }
});

router.put("/:identifier", async (req, res, next) => {
  try {
    const article = await findArticle(req.params.identifier);
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });

    Object.assign(article, pick(req.body, editableFields));
    await article.save();

    res.json({ success: true, data: article });
  } catch (error) {
    handleWriteError(error, res, next);
  }
});

router.delete("/:identifier", async (req, res, next) => {
  try {
    const article = await findArticle(req.params.identifier);
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });

    await article.deleteOne();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
