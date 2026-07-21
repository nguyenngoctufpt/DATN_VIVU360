const mongoose = require("mongoose");

const diaDiemSchema = new mongoose.Schema(
  {
    ten: { type: String, required: true, trim: true },
    viTri: { type: String, required: true, trim: true },
    danhGia: { type: Number, min: 0, max: 5, default: 0 },
    moTa: { type: String, default: "", trim: true },
    hinhAnh: { type: String, default: "", trim: true },
    doDung: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiaDiem", diaDiemSchema);
