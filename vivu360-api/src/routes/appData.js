const express = require("express");
const AppData = require("../models/AppData");

const router = express.Router();

router.get("/:ownerId/:namespace", async (req, res, next) => {
  try {
    const record = await AppData.findOne(req.params).lean();
    res.json({ success: true, data: record?.data ?? null });
  } catch (error) {
    next(error);
  }
});

router.put("/:ownerId/:namespace", async (req, res, next) => {
  try {
    if (typeof req.body?.data === "undefined") {
      return res.status(400).json({ success: false, message: "Trường data là bắt buộc" });
    }

    const record = await AppData.findOneAndUpdate(
      req.params,
      { $set: { data: req.body.data } },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    res.json({ success: true, data: record.data });
  } catch (error) {
    next(error);
  }
});

router.delete("/:ownerId/:namespace", async (req, res, next) => {
  try {
    await AppData.deleteOne(req.params);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
