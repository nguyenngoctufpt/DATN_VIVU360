const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  reporterId: { type: String, required: true },
  reason: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Report", ReportSchema);
