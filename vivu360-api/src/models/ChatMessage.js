const mongoose = require("mongoose");
const { normalizeSystemAnnouncementText } = require("../utils/chatText");

const chatMessageSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatGroup", required: true, index: true },
    senderId: { type: String, required: true, trim: true, index: true },
    content: { type: String, default: "", trim: true, maxlength: 5000 },
    type: { type: String, enum: ["text", "image", "video", "file", "system"], default: "text" },
    mediaUrl: { type: String, default: "", trim: true },
    readBy: { type: [String], default: [] },
  },
  { timestamps: true }
);

chatMessageSchema.index({ groupId: 1, createdAt: -1 });

chatMessageSchema.pre("validate", function validatePayload() {
  if (this.type === "system") {
    this.content = normalizeSystemAnnouncementText(this.content);
  }
  if (!this.content && !this.mediaUrl) this.invalidate("content", "Tin nh\u1eafn ph\u1ea3i c\u00f3 n\u1ed9i dung ho\u1eb7c t\u1ec7p \u0111\u00ednh k\u00e8m");
  if (["image", "video", "file"].includes(this.type) && !this.mediaUrl) {
    this.invalidate("mediaUrl", "Tin nh\u1eafn \u0111a ph\u01b0\u01a1ng ti\u1ec7n c\u1ea7n mediaUrl");
  }
  this.readBy = [...new Set([this.senderId, ...(this.readBy || [])].filter(Boolean))];
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
