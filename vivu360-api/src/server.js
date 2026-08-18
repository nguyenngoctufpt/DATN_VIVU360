require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
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

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => res.json({ name: "Vivu360 API", version: "2.0.0" }));
app.get("/health", (req, res) => res.json({
  status: "ok",
  mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
}));

app.use("/api/app-data", appDataRouter);
app.use("/api/diadiem", diaDiemRouter);
app.use("/api/users", usersRouter);
app.use("/api/chat", chatRouter);
app.use("/api/posts", postsRouter);
app.use("/api/friendships", friendshipsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/social-notifications", socialNotificationsRouter);
app.use("/api/articles", articlesRouter);

app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint kh\u00f4ng t\u1ed3n t\u1ea1i" }));
app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(error.name === "ValidationError" ? 400 : 500).json({
    success: false,
    message: error.name === "ValidationError" ? error.message : "L\u1ed7i m\u00e1y ch\u1ee7",
  });
});

async function start() {
  const server = app.listen(port, () => {
    console.log(`🚀 Vivu360 API listening on http://localhost:${port}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`⚡ Vivu360 API đã hoạt động sẵn tại http://localhost:${port}`);
    } else {
      console.error(err);
    }
  });

  await connectDatabase();
}

start();
