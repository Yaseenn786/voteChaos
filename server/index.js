import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import gameRoutes from "./routes/gameRoutes.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import setupGameSocket from "./gameSocketio.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://votechaos.com"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use("/api/user", userRoutes);
app.use(express.json());

// ✅ API Routes
app.use("/api/games", gameRoutes);
app.use("/api", authRoutes);

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Socket.io game events
setupGameSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on ${PORT}`);
});
