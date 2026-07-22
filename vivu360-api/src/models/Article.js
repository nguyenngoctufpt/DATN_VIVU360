const mongoose = require("mongoose");

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeTags(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(slugify).filter(Boolean))];
}

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
    summary: { type: String, default: "", trim: true, maxlength: 500 },
    content: { type: String, required: true, trim: true, maxlength: 50000 },
    coverImage: { type: String, default: "", trim: true },
    tags: { type: [String], default: [] },
    authorId: { type: String, default: "", trim: true, index: true },
    authorName: { type: String, default: "", trim: true, maxlength: 100 },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

articleSchema.index({ status: 1, publishedAt: -1, createdAt: -1 });
articleSchema.index({ tags: 1, createdAt: -1 });

articleSchema.pre("validate", function normalizeArticle() {
  this.slug = slugify(this.slug || this.title);
  if (!this.slug) this.invalidate("slug", "Slug is required");

  this.tags = normalizeTags(this.tags);

  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model("Article", articleSchema);
