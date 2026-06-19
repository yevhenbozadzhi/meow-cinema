import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./routes/auth/auth.js";
import profileRoutes from "./routes/profile/profile.js";
import roomRoutes from "./routes/room/room.js";
import favoritesRoutes from "./routes/profile/favorites.js";
import {
  handleChatMessage,
  handleGetChatMessages,
} from "./socket/chat/chat.js";
import aiChatRoutes from "./routes/ai-chat/ai.js";
const app = express();
const httpServer = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/favorites", favoritesRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    socket.to(roomId).emit("user-joined", socket.id);
  });
  socket.on("playback-pause", ({ roomId, time }) => {
    socket.to(roomId).emit("playback-pause", { time, from: socket.id });
  });
  socket.on("playback-play", ({ roomId, time }) => {
    socket.to(roomId).emit("playback-play", { time, from: socket.id });
  });
  socket.on("playback-seek", ({ roomId, time }) => {
    socket.to(roomId).emit("playback-seek", { time, from: socket.id });
  });
  socket.on("chat-message", ({ roomId, message, userId }) => {
    handleChatMessage(io, roomId, userId, message);
  });
  socket.on("chat-get-messages", ({ roomId, limit }) => {
    handleGetChatMessages(socket, roomId, limit);
  });
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit("user-left", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/ai-chat", aiChatRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server & Sockets running on http://localhost:${PORT}`);
});

export { io };
