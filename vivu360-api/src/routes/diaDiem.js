const express = require("express");
const DiaDiem = require("../models/DiaDiem");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await DiaDiem.find().sort({ createdAt: -1 }).lean());
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    res.status(201).json(await DiaDiem.create(req.body));
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const record = await DiaDiem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!record) return res.status(404).json({ message: "Không tìm thấy địa điểm" });
    res.json(record);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const record = await DiaDiem.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Không tìm thấy địa điểm" });
    res.status(204).end();
  } catch (error) { next(error); }
});

module.exports = router;
