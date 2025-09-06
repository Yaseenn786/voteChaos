import express from "express";
import Game from "../model/Game.js";
import { nanoid } from "nanoid";

const router = express.Router();

/**
 * ✅ Create Classic Vote Game (starts immediately)
 */
router.post("/classic", async (req, res) => {
  try {
    const { hostId, hostName, question, options, timer } = req.body;

    if (!hostId || !hostName || !question || !options || options.length < 2) {
      return res.status(400).json({ error: "Invalid game data" });
    }

    const roomCode = nanoid(6).toUpperCase();

    const game = new Game({
      mode: "classic",
      roomCode,
      host: { id: hostId, name: hostName },
      question,
      options,
      timer,
      status: "voting", // 🚀 game starts immediately
      timerEnd: new Date(Date.now() + timer * 1000),
      players: [{ id: hostId, name: hostName }],
      votes: [],
    });

    await game.save();

    res.status(201).json({ success: true, roomCode, game });
  } catch (err) {
    console.error("❌ Error creating classic game:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ Join Game by roomCode
 */
router.post("/join", async (req, res) => {
  try {
    const { playerId, playerName, roomCode } = req.body;

    const game = await Game.findOne({ roomCode, status: { $ne: "finished" } });
    if (!game) {
      return res.status(404).json({ error: "Game not found or already finished" });
    }

    // prevent duplicates
    if (!game.players.find((p) => p.id === playerId)) {
      game.players.push({ id: playerId, name: playerName });
      await game.save();
    }

    res.json({ success: true, game });
  } catch (err) {
    console.error("❌ Error joining game:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ Get all current (active/voting) games for a user
 */
router.get("/current/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const games = await Game.find({
      status: "voting",
      $or: [{ "players.id": userId }, { "host.id": userId }],
    }).sort({ createdAt: -1 });

    res.json({ success: true, games });
  } catch (err) {
    console.error("❌ Error fetching current games:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * ✅ Get all past (finished) games for a user
 */
router.get("/past/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const games = await Game.find({
      status: "finished",
      $or: [{ "players.id": userId }, { "host.id": userId }],
    }).sort({ createdAt: -1 });

    res.json({ success: true, games });
  } catch (err) {
    console.error("❌ Error fetching past games:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * ✅ Get single game by roomCode
 */
router.get("/:roomCode", async (req, res) => {
  try {
    const { roomCode } = req.params;

    const game = await Game.findOne({ roomCode });
    if (!game) {
      return res.status(404).json({ success: false, error: "Game not found" });
    }

    res.json({ success: true, game });
  } catch (err) {
    console.error("❌ Error fetching game:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
