import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.js";

const router = express.Router();

// 🔹 Middleware to verify JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "votechaos");
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// SIGNUP
router.post("/signup", async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "All fields required" });

  email = email.toLowerCase().trim(); // ✅ normalize

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, games: [] });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "votechaos");
    res.json({ user: { id: user._id, email: user.email }, token });
  } catch (err) {
    res.status(500).json({ message: "Error signing up" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  console.log("🟢 Login attempt:", email, password ? "password provided" : "no password");
  if (!email || !password) return res.status(400).json({ message: "All fields required" });

  email = email.toLowerCase().trim(); // ✅ normalize

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "votechaos");
    res.json({ user: { id: user._id, email: user.email }, token });
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
});


// 🔹 GET PROFILE (new)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("_id email nickname");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

export default router;
