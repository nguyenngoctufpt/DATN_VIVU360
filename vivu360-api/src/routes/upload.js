const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const requireUser = require("../middleware/requireUser");

const router = express.Router();
router.use(requireUser);

router.post("/", async (req, res, next) => {
  try {
    const { image, folder = "posts" } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({ success: false, message: "Dữ liệu hình ảnh (base64) không hợp lệ" });
    }

    let ext = "jpg";
    let base64Data = image;

    if (image.startsWith("data:")) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (matches) {
        ext = matches[1] === "jpeg" ? "jpg" : matches[1];
        base64Data = matches[2];
      } else {
        base64Data = image.split(",")[1] || image;
      }
    }

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length === 0) {
      return res.status(400).json({ success: false, message: "Không thể giải mã hình ảnh" });
    }

    const safeFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, "") || "posts";
    const uploadDir = path.join(__dirname, "../../uploads", safeFolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const randomName = `${safeFolder}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.${ext}`;
    const filePath = path.join(uploadDir, randomName);

    fs.writeFileSync(filePath, buffer);

    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.get("host") || "localhost:3000";
    const publicUrl = `${protocol}://${host}/uploads/${safeFolder}/${randomName}`;

    res.status(201).json({
      success: true,
      data: {
        url: publicUrl,
        filename: randomName,
        size: buffer.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
