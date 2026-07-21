const mongoose = require("mongoose");

const appDataSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, trim: true },
    namespace: { type: String, required: true, trim: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false }
);

appDataSchema.index({ ownerId: 1, namespace: 1 }, { unique: true });

module.exports = mongoose.model("AppData", appDataSchema);
