const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, default: "", trim: true, maxlength: 20 },
    avatar: { type: String, default: "", trim: true },
    bio: { type: String, default: "", trim: true, maxlength: 500 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    points: { type: Number, min: 0, default: 0 },
    level: { type: String, default: "Cấp 1", trim: true },
    rank: { type: String, default: "Đồng", trim: true },
    checkedIn: { type: [mongoose.Schema.Types.Mixed], default: [] },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.index({ name: "text", email: "text", phone: "text" });

module.exports = mongoose.model("User", userSchema);
