const mongoose = require("mongoose");

const socialNotificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, required: true, trim: true, index: true },
    actorId: { type: String, required: true, trim: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    type: { type: String, enum: ["post_like", "post_comment"], required: true },
    message: { type: String, default: "", trim: true, maxlength: 500 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

socialNotificationSchema.index({ recipientId: 1, createdAt: -1 });
socialNotificationSchema.index({ recipientId: 1, actorId: 1, postId: 1, type: 1 });

module.exports = mongoose.model("SocialNotification", socialNotificationSchema);
