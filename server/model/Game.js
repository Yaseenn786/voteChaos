import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  playerId: { type: String, required: true },
  nickname: { type: String, required: true },
  option: { type: String, required: true },
});

const playerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
});

const gameSchema = new mongoose.Schema(
  {
    mode: { type: String, enum: ["classic", "prediction", "open"], default: "classic" },
    roomCode: { type: String, required: true, unique: true },
    host: { id: String, name: String },
    question: String,
    options: [String],
    timer: { type: Number, default: 30 },
    timerEnd: Date,
    status: { type: String, enum: ["waiting", "voting", "finished"], default: "waiting" },
    players: [playerSchema],
    votes: [voteSchema],
    results: {
      optionVotes: { type: Object, default: {} },
      totalVotes: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Game", gameSchema);
