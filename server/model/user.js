import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  games: [
    {
      roomId: String,
      createdAt: { type: Date, default: Date.now },
      players: [String],
      winner: String,
      status: String,
    },
  ],
});

// ✅ Export as default for ESM
export default mongoose.model("User", userSchema);
