import Game from "./model/Game.js";

const activeTimers = new Map(); // 🔹 Track timers per room

function setupGameSocket(io) {
  io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    // 🔹 Join Room
    socket.on("joinRoom", async ({ roomCode, nickname }) => {
      try {
        const game = await Game.findOne({ roomCode });
        if (!game || game.status === "finished") {
          return socket.emit("errorMessage", "Room not found or finished");
        }

        // Assign playerId = socket.id
        const playerId = socket.id;

        // Add player if not already in
        if (!game.players.find((p) => p.id === playerId)) {
          game.players.push({ id: playerId, name: nickname });
          await game.save();
        }

        socket.join(roomCode);

        // Send back this player's id
        socket.emit("playerInfo", { playerId });

        // Update everyone’s room player list
        io.to(roomCode).emit("roomUpdate", { players: game.players });

        // 🚀 Sync voting phase if already active
        if (game.status === "voting") {
          socket.emit("gameStarted", {
            question: game.question,
            options: game.options,
            roundTime: Math.max(
              0,
              Math.floor((game.timerEnd - Date.now()) / 1000)
            ),
          });

          // ⏳ Schedule auto end once per room
          if (!activeTimers.has(roomCode)) {
            const msLeft = game.timerEnd - Date.now();
            if (msLeft > 0) {
              const timer = setTimeout(() => {
                endRound(io, roomCode);
                activeTimers.delete(roomCode);
              }, msLeft);
              activeTimers.set(roomCode, timer);
            }
          }
        }

        // 🚀 Sync prediction phase if already active
        if (game.status === "prediction") {
          socket.emit("predictionStarted", {
            question: game.question,
            options: game.options,
          });
        }
      } catch (err) {
        console.error("joinRoom error:", err);
        socket.emit("errorMessage", "Server error");
      }
    });

    // 🗳️ Submit Vote (Classic Mode)
    socket.on("submitVote", async ({ roomCode, option, nickname }) => {
      try {
        const playerId = socket.id;
        const game = await Game.findOne({ roomCode, status: "voting" });
        if (!game) return;

        if (game.votes.find((v) => v.playerId === playerId)) return;

        game.votes.push({ playerId, nickname, option });
        await game.save();

        console.log(`🗳️ ${nickname} (${playerId}) voted for ${option}`);
      } catch (err) {
        console.error("submitVote error:", err);
      }
    });

    // 🔮 Submit Prediction (Prediction Mode)
    socket.on("submitPrediction", async ({ roomCode, predictedOption, nickname, userId }) => {
      try {
        const playerId = socket.id;
        const game = await Game.findOne({ roomCode, status: "prediction" });
        if (!game) return;

        // prevent duplicate predictions
        if (game.predictions.find((p) => p.playerId === playerId)) return;

        game.predictions.push({ playerId, userId, nickname, predictedOption });
        await game.save();

        console.log(`🔮 ${nickname} predicted ${predictedOption}`);
      } catch (err) {
        console.error("submitPrediction error:", err);
      }
    });

    // 🔮 End Prediction (Host marks correct option)
    socket.on("endPrediction", async ({ roomCode, correctOption }) => {
      try {
        const game = await Game.findOne({ roomCode, status: "prediction" });
        if (!game) return;

        game.correctOption = correctOption;
        const winners = [];

        game.predictions.forEach((p) => {
          if (p.predictedOption === correctOption) {
            p.isCorrect = true;
            winners.push(p.nickname);

            // update points
            game.points.set(p.nickname, (game.points.get(p.nickname) || 0) + 1);
          } else {
            p.isCorrect = false;
          }
        });

        game.status = "finished";
        await game.save();

        io.to(roomCode).emit("predictionEnded", {
          correctOption,
          winners,
          scores: Object.fromEntries(game.points),
        });

        io.emit("gameStatusUpdate", { roomCode, status: "finished" });

        console.log(`🔮 Prediction ended | Correct: ${correctOption} | Winners: ${winners}`);
      } catch (err) {
        console.error("endPrediction error:", err);
      }
    });

    // ❌ Disconnect
    socket.on("disconnect", async () => {
      console.log("❌ Disconnected:", socket.id);
      try {
        const games = await Game.find({
          "players.id": socket.id,
          status: { $ne: "finished" },
        });
        for (const game of games) {
          game.players = game.players.filter((p) => p.id !== socket.id);
          await game.save();
          io.to(game.roomCode).emit("roomUpdate", { players: game.players });
        }
      } catch (err) {
        console.error("disconnect cleanup error:", err);
      }
    });
  });
}

// ✅ End round only when timer expires (Classic Mode)
async function endRound(io, roomCode) {
  try {
    const game = await Game.findOne({ roomCode, status: "voting" });
    if (!game) return;

    const counts = {};
    game.votes.forEach((v) => {
      counts[v.option] = (counts[v.option] || 0) + 1;
    });

    const winner =
      Object.keys(counts).length > 0
        ? Object.keys(counts).reduce((a, b) =>
            counts[a] > counts[b] ? a : b
          )
        : null;

    game.status = "finished";
    game.results = { optionVotes: counts, totalVotes: game.votes.length };
    game.winner = winner;
    await game.save();

    io.to(roomCode).emit("roundEnded", {
      question: game.question,
      votes: game.votes,
      results: game.results,
      winner,
    });

    io.emit("gameStatusUpdate", { roomCode, status: "finished" });

    console.log(`⏰ Round ended (room ${roomCode}) | Winner: ${winner}`);
  } catch (err) {
    console.error("endRound error:", err);
  }
}

export default setupGameSocket;
