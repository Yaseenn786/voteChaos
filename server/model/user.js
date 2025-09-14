// server/model/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true },

  
  currentGames: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
  pastGames: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
});

export default mongoose.model("User", userSchema);
