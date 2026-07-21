const mongoose = require("mongoose");

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const chatGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    avatar: { type: String, default: "", trim: true },
    ownerId: { type: String, required: true, trim: true },
    type: { type: String, enum: ["group", "direct"], default: "group" },
    tag: { type: String, default: "Du lịch", trim: true },
    directKey: { type: String, trim: true, default: undefined },
    admins: { type: [String], default: [] },
    members: { type: [String], required: true, validate: value => Array.isArray(value) && value.length > 0 },
    itinerary: { type: mongoose.Schema.Types.Mixed, default: {} },
    fund: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        goal: 0,
        contributions: [],
        expenses: [],
      }),
    },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

chatGroupSchema.index({ members: 1, lastMessageAt: -1 });
chatGroupSchema.index({ directKey: 1 }, { unique: true, sparse: true });

chatGroupSchema.pre("validate", function normalizeMembers() {
  this.members = [...new Set([this.ownerId, ...(this.members || [])].filter(Boolean))];
  this.admins = [...new Set([this.ownerId, ...(this.admins || [])].filter(Boolean))]
    .filter(id => this.members.includes(id));

  this.type = this.type === "direct" ? "direct" : "group";
  if (this.type === "direct") {
    if (this.members.length !== 2) {
      this.invalidate("members", "Chat riêng phải có đúng 2 thành viên");
    }
    this.directKey = [...this.members].sort().join("::");
  } else {
    this.directKey = undefined;
  }

  const rawItinerary = isPlainObject(this.itinerary) ? this.itinerary : {};
  const rawFund = isPlainObject(this.fund) ? this.fund : {};

  this.itinerary = rawItinerary;
  this.fund = {
    goal: Number(rawFund.goal) || 0,
    contributions: Array.isArray(rawFund.contributions) ? rawFund.contributions : [],
    expenses: Array.isArray(rawFund.expenses) ? rawFund.expenses : [],
  };
});

module.exports = mongoose.model("ChatGroup", chatGroupSchema);