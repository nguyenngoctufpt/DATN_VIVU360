const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema(
  {
    users: {
      type: [String],
      required: true,
      validate: {
        validator: value => Array.isArray(value) && value.length === 2 && value[0] !== value[1],
        message: "Friendship must contain two different users",
      },
    },
    requesterId: { type: String, required: true, trim: true },
    pairKey: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["pending", "accepted"], default: "pending", index: true },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

friendshipSchema.index({ users: 1 });
friendshipSchema.index({ status: 1, users: 1 });

friendshipSchema.pre("validate", function normalizeUsers() {
  this.users = [...new Set((this.users || []).map(String).map(value => value.trim()).filter(Boolean))].sort();
  this.requesterId = String(this.requesterId || "").trim();
  this.pairKey = this.users.join("::");
  if (this.users.length === 2 && !this.users.includes(this.requesterId)) {
    this.invalidate("requesterId", "Requester must be one of the friendship users");
  }
});

module.exports = mongoose.model("Friendship", friendshipSchema);
