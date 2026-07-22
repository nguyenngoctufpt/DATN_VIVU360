const mongoose = require("mongoose");
const { normalizeSystemAnnouncementText } = require("../utils/chatText");

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const chatNotificationSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatGroup", required: true, index: true },
    actorId: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      enum: [
        "group_update",
        "workspace_update",
        "itinerary_update",
        "fund_update",
        "fund_goal_update",
        "fund_contribution",
        "fund_expense",
      ],
      default: "group_update",
    },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    readBy: { type: [String], default: [] },
  },
  { timestamps: true }
);

chatNotificationSchema.index({ groupId: 1, createdAt: -1 });

chatNotificationSchema.pre("validate", function normalizeNotification() {
  this.message = normalizeSystemAnnouncementText(this.message);
  this.metadata = isPlainObject(this.metadata) ? this.metadata : {};
  this.readBy = [...new Set([this.actorId, ...(this.readBy || [])].filter(Boolean))];
});

module.exports = mongoose.model("ChatNotification", chatNotificationSchema);
