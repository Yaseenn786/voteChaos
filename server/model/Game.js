// server/model/Game.js
import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  playerId: { type: String, required: true }, // socket.id (unique per connection)
  nickname: { type: String, required: true },
  option: { type: String, required: true },
});

const playerSchema = new mongoose.Schema({
  id: { type: String, required: true }, // socket.id
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // link to User if logged in
  name: { type: String, required: true },
});

// 🔮 Prediction Mode Schema
const predictionSchema = new mongoose.Schema({
  playerId: { type: String, required: true }, // socket.id
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // link to User if logged in
  nickname: { type: String, required: true },
  predictedOption: { type: String, required: true },
  isCorrect: { type: Boolean, default: null },
});

const gameSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ["classic", "prediction", "open"],
      default: "classic",
    },
    roomCode: { type: String, required: true, unique: true },
    host: { id: String, name: String },

    question: String,
    options: [String],

    timer: { type: Number, default: 30 },
    timerEnd: Date,

    status: {
      type: String,
      enum: ["waiting", "voting", "prediction", "finished"], // 🔮 added "prediction"
      default: "waiting",
    },

    players: [playerSchema],
    votes: [voteSchema],

    // 🔮 Prediction mode fields
    predictions: [predictionSchema],
    correctOption: { type: String, default: null },
    points: { type: Map, of: Number, default: {} },

    results: {
      optionVotes: { type: Object, default: {} },
      totalVotes: { type: Number, default: 0 },
    },

    winner: { type: String, default: null }, // ✅ store winner nickname
  },
  { timestamps: true }
);

export default mongoose.model("Game", gameSchema);
