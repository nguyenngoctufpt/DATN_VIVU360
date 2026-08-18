const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    authorId: { type: String, required: true, trim: true, immutable: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    images: {
      type: [String],
      default: [],
      validate: { validator: value => value.length <= 10, message: "A post can contain at most 10 images" },
    },
    location: { type: String, default: "", trim: true, maxlength: 200 },
    category: { type: String, default: "", trim: true, maxlength: 100 },
    privacy: { type: String, enum: ["public", "friends", "private"], default: "public", index: true },
    likes: { type: [String], default: [] },
    commentsCount: { type: Number, default: 0, min: 0 },
    comments: [{
      authorId: { type: String, required: true, trim: true },
      text: { type: String, required: true, trim: true, maxlength: 1000 },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.pre("validate", function normalizePost() {
  this.images = [...new Set((this.images || []).map(String).map(value => value.trim()).filter(Boolean))];
  this.likes = [...new Set((this.likes || []).map(String).map(value => value.trim()).filter(Boolean))];
});

module.exports = mongoose.model("Post", postSchema);
