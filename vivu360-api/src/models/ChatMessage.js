const mongoose = require("mongoose");
const { normalizeSystemAnnouncementText } = require("../utils/chatText");

const chatMessageSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatGroup", required: true, index: true },
    senderId: { type: String, required: true, trim: true, index: true },
    content: { type: String, default: "", trim: true, maxlength: 5000 },
    type: { type: String, enum: ["text", "image", "video", "file", "system", "poll", "assistant", "task_reminder"], default: "text" },
    mediaUrl: { type: String, default: "", trim: true },
    poll: { type: mongoose.Schema.Types.Mixed, default: undefined },
    readBy: { type: [String], default: [] },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
  },
  { timestamps: true }
);

chatMessageSchema.index({ groupId: 1, createdAt: -1 });

chatMessageSchema.pre("validate", function validatePayload() {
  if (this.type === "system") {
    this.content = normalizeSystemAnnouncementText(this.content);
  }
  if (this.type === "poll" && !this.poll) {
    this.invalidate("poll", "Tin nhắn dạng bình chọn phải có dữ liệu poll");
  }
  if (!this.content && !this.mediaUrl && !this.poll) this.invalidate("content", "Tin nhắn phải có nội dung, tệp đính kèm hoặc dữ liệu bình chọn");
  if (["image", "video", "file"].includes(this.type) && !this.mediaUrl) {
    this.invalidate("mediaUrl", "Tin nhắn đa phương tiện cần mediaUrl");
  }
  this.readBy = [...new Set([this.senderId, ...(this.readBy || [])].filter(Boolean))];
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
