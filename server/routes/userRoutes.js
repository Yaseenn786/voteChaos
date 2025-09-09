// server/routes/userRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../model/user.js";
import Game from "../model/Game.js";

const router = express.Router();

// Middleware to check token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "votechaos");
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Profile route
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("currentGames")
      .populate("pastGames");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add a game to currentGames
router.post("/:userId/currentGames", async (req, res) => {
  try {
    const { gameId } = req.body;
    await User.findByIdAndUpdate(req.params.userId, {
      $addToSet: { currentGames: gameId },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Error adding currentGame:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ Move game from current → past
router.post("/:userId/moveToPast", async (req, res) => {
  try {
    const { gameId } = req.body;
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { currentGames: gameId },
      $addToSet: { pastGames: gameId },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Error moving to pastGames:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
