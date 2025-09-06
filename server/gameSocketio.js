import Game from "./model/Game.js";

function setupGameSocket(io) {
  io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    // 🔹 Join Room
    socket.on("joinRoom", async ({ roomCode, playerId, nickname }) => {
      try {
        const game = await Game.findOne({ roomCode, status: { $ne: "finished" } });
        if (!game) return socket.emit("errorMessage", "Room not found or finished");

        // Add player if not already in
        if (!game.players.find((p) => p.id === playerId)) {
          game.players.push({ id: playerId, name: nickname });
          await game.save();
        }

        socket.join(roomCode);
        io.to(roomCode).emit("roomUpdate", { players: game.players });

        // 🚀 Immediately sync new player with current voting phase
        if (game.status === "voting") {
          socket.emit("gameStarted", {
            question: game.question,
            options: game.options,
            roundTime: Math.max(0, Math.floor((game.timerEnd - Date.now()) / 1000)),
          });
        }
      } catch (err) {
        console.error("joinRoom error:", err);
        socket.emit("errorMessage", "Server error");
      }
    });

    // 🗳️ Submit Vote
    socket.on("submitVote", async ({ roomCode, playerId, nickname, option }) => {
      try {
        const game = await Game.findOne({ roomCode, status: "voting" });
        if (!game) return;

        if (game.votes.find((v) => v.playerId === playerId)) return;

        game.votes.push({ playerId, nickname, option });
        await game.save();

        if (game.votes.length >= game.players.length) {
          endRound(io, roomCode);
        }
      } catch (err) {
        console.error("submitVote error:", err);
      }
    });

    // ❌ Disconnect
    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
    });
  });
}

// ✅ End round automatically
async function endRound(io, roomCode) {
  try {
    const game = await Game.findOne({ roomCode, status: "voting" });
    if (!game) return;

    const counts = {};
    game.votes.forEach((v) => {
      counts[v.option] = (counts[v.option] || 0) + 1;
    });

    const winner = Object.keys(counts).reduce(
      (a, b) => (counts[a] > counts[b] ? a : b),
      null
    );

    game.status = "finished";
    game.results = { optionVotes: counts, totalVotes: game.votes.length };
    game.winner = winner;
    await game.save();

    io.to(roomCode).emit("roundEnded", {
      votes: game.votes,
      results: game.results,
      winner,
    });
  } catch (err) {
    console.error("endRound error:", err);
  }
}

export default setupGameSocket;
