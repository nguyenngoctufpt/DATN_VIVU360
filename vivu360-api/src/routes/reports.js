const express = require("express");
const router = express.Router();
const Report = require("../models/Report");

router.post("/", async (req, res, next) => {
  try {
    const { postId, reason, description, reporterId } = req.body;
    if (!postId || !reason) {
      return res.status(400).json({ success: false, message: "Thi?u postId ho?c lý do báo cáo" });
    }
    const report = await Report.create({
      postId,
      reporterId: reporterId || "anonymous",
      reason,
      description: description || "",
    });
    res.status(201).json({ success: true, data: report, message: "G?i báo cáo thành công" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
