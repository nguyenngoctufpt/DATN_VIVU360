require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const { connectDatabase } = require("./config/database");

const appDataRouter = require("./routes/appData");
const diaDiemRouter = require("./routes/diaDiem");
const usersRouter = require("./routes/users");
const chatRouter = require("./routes/chat");
const postsRouter = require("./routes/posts");
const friendshipsRouter = require("./routes/friendships");
const notificationsRouter = require("./routes/notifications");
const articlesRouter = require("./routes/articles");
const socialNotificationsRouter = require("./routes/socialNotifications");
const reportsRouter = require("./routes/reports");
const uploadRouter = require("./routes/upload");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => res.json({ name: "Vivu360 API", version: "2.0.0" }));
app.get("/health", (req, res) => res.json({
  mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
}));

app.use("/api/upload", uploadRouter);
app.use("/api/app-data", appDataRouter);
app.use("/api/diadiem", diaDiemRouter);
app.use("/api/users", usersRouter);
app.use("/api/chat", chatRouter);
app.use("/api/posts", postsRouter);
app.use("/api/friendships", friendshipsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/social-notifications", socialNotificationsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/reports", reportsRouter);

app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint không tồn tại" }));
app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(error.name === "ValidationError" ? 400 : 500).json({
    message: error.name === "ValidationError" ? error.message : "Lỗi máy chủ",
  });
});

async function start() {
  await connectDatabase();
  const server = app.listen(port, () => {
    console.log(`🚀 Vivu360 API listening on http://localhost:${port}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`⚠️ Vivu360 API đã hoạt động sẵn tại http://localhost:${port}`);
    } else {
      console.error(err);
    }
  });
}

start();
