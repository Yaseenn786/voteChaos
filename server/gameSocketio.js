import Game from "./model/Game.js";

const activeTimers = new Map(); 

function setupGameSocket(io) {
  io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    
    socket.on("startClassic", async ({ roomCode, question, options, roundTime }) => {
      try {
        const game = await Game.findOne({ roomCode });
        if (!game) return;

        game.status = "voting";
        game.question = question;
        game.options = options;
        game.timerEnd = new Date(Date.now() + roundTime * 1000);
        await game.save();

        io.to(roomCode).emit("gameStarted", {
          question,
          options,
          roundTime,
        });

        if (!activeTimers.has(roomCode)) {
          const timer = setTimeout(() => {
            endRound(io, roomCode);
            activeTimers.delete(roomCode);
          }, roundTime * 1000);
          activeTimers.set(roomCode, timer);
        }

        console.log(`🗳️ Classic game started in ${roomCode}`);
      } catch (err) {
        console.error("startClassic error:", err);
      }
    });

    
    socket.on("startPrediction", async ({ roomCode }) => {
      try {
        const game = await Game.findOne({ roomCode, mode: "prediction" });
        if (!game) return;

        io.to(roomCode).emit("predictionStarted", {
          roomCode,
          question: game.question,
          options: game.options,
          hostId: game.host.id,
          hostName: game.host.name,
        });

        console.log(`🔮 Prediction synced in ${roomCode}`);
      } catch (err) {
        console.error("startPrediction error:", err);
      }
    });

    
    socket.on("joinRoom", async ({ roomCode, nickname }) => {
      try {
        const game = await Game.findOne({ roomCode });
        if (!game || game.status === "finished") {
          return socket.emit("errorMessage", "Room not found or finished");
        }

        const playerId = socket.id;

        if (!game.players.find((p) => p.id === playerId)) {
          game.players.push({ id: playerId, name: nickname });
          await game.save();
        }

        socket.join(roomCode);

        socket.emit("playerInfo", { playerId });
        io.to(roomCode).emit("roomUpdate", { players: game.players });

        
        if (game.status === "voting") {
          const msLeft = game.timerEnd - Date.now();
          socket.emit("gameStarted", {
            question: game.question,
            options: game.options,
            roundTime: Math.max(0, Math.floor(msLeft / 1000)),
          });

          if (!activeTimers.has(roomCode) && msLeft > 0) {
            const timer = setTimeout(() => {
              endRound(io, roomCode);
              activeTimers.delete(roomCode);
            }, msLeft);
            activeTimers.set(roomCode, timer);
          }
        }

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

    
    socket.on("submitPrediction", async ({ roomCode, predictedOption, nickname, userId }) => {
      try {
        const playerId = socket.id;
        const game = await Game.findOne({ roomCode, status: "prediction" });
        if (!game) return;

        if (game.predictions.find((p) => p.playerId === playerId)) return;

        game.predictions.push({ playerId, userId, nickname, predictedOption });
        await game.save();

        console.log(`🔮 ${nickname} predicted ${predictedOption}`);
      } catch (err) {
        console.error("submitPrediction error:", err);
      }
    });

    
    socket.on("endPrediction", async ({ roomCode, correctOption }) => {
      try {
        const game = await Game.findOne({ roomCode, status: "prediction" });
        if (!game) return;

        game.correctOption = correctOption;

        if (!game.points) game.points = new Map(); 
        const winners = [];

        game.predictions.forEach((p) => {
          if (p.predictedOption === correctOption) {
            p.isCorrect = true;

            const winnerName =
              (p.nickname && p.nickname.trim() !== "")
                ? p.nickname
                : (p.userId ? String(p.userId) : p.playerId);

            if (winnerName) {
              winners.push(winnerName);
              const current = game.points.get(winnerName) || 0;
      game.points.set(winnerName, current + 1);
            }
          } else {
            p.isCorrect = false;
          }
        });
        game.winner = winners;

        game.markModified("points");
        game.status = "finished";
        await game.save();

        console.log("🔮 Winners calculated:", winners);
        console.log("🔮 Scores:", game.points);

        io.to(roomCode).emit("predictionEnded", {
          question: game.question,
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
      roomCode,
      status: "finished",
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
