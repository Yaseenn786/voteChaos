import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Confetti from "react-confetti";
import { Howl } from "howler";

const socket = io("http://localhost:5050");

export default function Game() {
  const { roomCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // ✅ Player info
  const [playerId, setPlayerId] = useState(null);
  const nickname = state?.nickname || state?.user?.nickname || "Anonymous";
  const userId = state?.user?._id || null; // Mongo userId if logged in
  const isHost = state?.isHost || false;
  const viewResults = state?.viewResults || false;

  // State
  const [gameData, setGameData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [roundActive, setRoundActive] = useState(false);

  // Chaos state
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);

  // ✅ Confetti size
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Ding sound
  const playSound = () => {
    const sound = new Howl({
      src: ["/sounds/vote-ding.mp3"],
      volume: 0.8,
    });
    sound.play();
  };

  // ✅ Fetch game
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/games/${roomCode}`);
        const data = await res.json();
        if (data.success) {
          setGameData(data.game);

          if (data.game.status === "voting") {
            const remaining = Math.max(
              0,
              Math.floor((new Date(data.game.timerEnd) - Date.now()) / 1000)
            );
            setRoundActive(true);
            setTimeLeft(remaining);
          }

          if (data.game.status === "finished") {
            setResults({
              question: data.game.question,
              votes: data.game.votes,
              results: data.game.results,
              winner: data.game.winner,
              correctOption: data.game.correctOption,
              scores: data.game.points || {},
            });
          }
        }
      } catch (err) {
        console.error("Error fetching game:", err);
      }
    };
    fetchGame();
  }, [roomCode]);

  // 🎮 Socket connections
  useEffect(() => {
    socket.emit("joinRoom", { roomCode, nickname, userId });

    // After join → save to user's currentGames
    if (userId && gameData?._id) {
      fetch(`http://localhost:5050/api/user/${userId}/currentGames`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: gameData._id }),
      }).catch((err) => console.error("Error saving currentGame:", err));
    }

    socket.on("playerInfo", ({ playerId }) => {
      setPlayerId(playerId);
    });

    socket.on("gameStarted", ({ question, options, roundTime }) => {
      setGameData((prev) => ({ ...prev, question, options, status: "voting" }));
      setRoundActive(true);
      setResults(null);
      setHasVoted(false);
      setSelectedOption(null);
      setTimeLeft(roundTime);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on("roundEnded", ({ votes, results, winner }) => {
      setRoundActive(false);
      setResults({ question: gameData?.question, votes, results, winner });

      if (userId && gameData?._id) {
        fetch(`http://localhost:5050/api/user/${userId}/moveToPast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: gameData._id }),
        }).catch((err) => console.error("Error moving to pastGames:", err));
      }
    });

    // 🔮 Prediction events
    socket.on("predictionStarted", ({ question, options }) => {
      setGameData((prev) => ({ ...prev, question, options, status: "prediction" }));
      setHasVoted(false);
      setSelectedOption(null);
      setResults(null);
    });

    socket.on("predictionEnded", ({ correctOption, winners, scores }) => {
      setResults({ correctOption, winners, scores });
      setRoundActive(false);
    });

    return () => {
      socket.off("playerInfo");
      socket.off("gameStarted");
      socket.off("roundEnded");
      socket.off("predictionStarted");
      socket.off("predictionEnded");
    };
  }, [roomCode, nickname, userId, gameData?._id]);

  // 🗳️ Vote (Classic Mode)
  const handleVote = (option) => {
    if (hasVoted || !option || !roundActive || !playerId) return;
    setSelectedOption(option);
    setHasVoted(true);

    socket.emit("submitVote", { roomCode, option, playerId, nickname });

    playSound();
    setShowVoteSuccess(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 3000);
  };

  // 🔮 Prediction (submit)
  const handlePrediction = (opt) => {
    if (hasVoted || !opt) return;
    setSelectedOption(opt);
    setHasVoted(true);

    socket.emit("submitPrediction", {
      roomCode,
      predictedOption: opt,
      nickname,
      userId,
    });
  };

  // 🔮 End Prediction (host selects correct option)
  const handleEndPrediction = (correctOption) => {
    if (isHost) {
      socket.emit("endPrediction", { roomCode, correctOption });
    }
  };

  // 🛑 End round early (host only, classic)
  const handleEndRound = () => {
    if (isHost) socket.emit("endRound", { roomCode });
  };

  // ✅ Chaos Flash Screen (Classic vote success)
  if (showVoteSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={500}
          gravity={0.2}
          recycle={false}
        />
        <div className="text-center animate-pulse">
          <h1 className="text-6xl font-extrabold text-green-400 mb-6">
            🎉 Vote Locked In!
          </h1>
          <p className="text-orange-300 text-2xl">Brace for Chaos...</p>
          <p className="text-gray-400 mt-3 text-sm">(Redirecting to Dashboard)</p>
        </div>
      </div>
    );
  }

  if (!gameData) return <p className="text-white">Loading game...</p>;

  // ✅ Results only mode (works for both Classic + Prediction)
  if (viewResults && results) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-bold text-orange-400 mb-6">Game Results 🏆</h2>
        <h3 className="text-xl mb-2 text-green-400">Question:</h3>
        <p className="text-2xl mb-6">{results.question || gameData.question}</p>

        {/* Classic results */}
        {results.results?.optionVotes &&
          Object.entries(results.results.optionVotes || {}).map(([opt, count], idx) => (
            <div key={idx} className="text-lg mb-2">
              <span className="text-yellow-400 font-bold">{opt}:</span> {count} votes
            </div>
          ))}

        {/* Prediction results */}
        {results.correctOption && (
          <>
            <p className="text-xl text-green-400 mb-2">
              ✅ Correct Answer: {results.correctOption}
            </p>
            <p className="text-lg text-yellow-400 mb-2">
              Winners: {results.winners?.length ? results.winners.join(", ") : "None"}
            </p>
            <h4 className="text-lg text-white mb-2">🏆 Scoreboard</h4>
            {results.scores &&
              Object.entries(results.scores).map(([player, score], idx) => (
                <p key={idx} className="text-white">
                  {player}: {score} pts
                </p>
              ))}
          </>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 px-6 py-2 bg-orange-400 hover:bg-orange-500 text-black rounded-lg font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold text-orange-400 mb-6">
        {gameData.mode === "classic"
          ? "Classic Vote Battles 🗳️"
          : gameData.mode === "prediction"
          ? "Prediction Battles 🔮"
          : "Open Text ☠️"}
      </h2>

      {/* Classic Mode UI */}
      {gameData.mode === "classic" && results ? (
        <div className="text-center">
          <h3 className="text-xl mb-2 text-green-400">Round Results</h3>
          <p className="text-2xl mb-4">{results.question}</p>
          {Object.entries(results.results.optionVotes || {}).map(([opt, count], idx) => (
            <div key={idx} className="text-lg">
              <span className="text-yellow-400 font-bold">{opt}:</span> {count} votes
            </div>
          ))}
          <p className="mt-4 text-lg text-pink-400">
            🏆 Winner: <span className="font-bold">{results.winner || "No votes"}</span>
          </p>
        </div>
      ) : gameData.mode === "classic" && roundActive ? (
        <div className="text-center max-w-xl w-full">
          <p className="text-sm mb-2 text-white/50">Room: {roomCode}</p>
          <h3 className="text-2xl font-semibold mb-6">{gameData.question}</h3>
          {gameData.options?.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleVote(opt)}
              disabled={hasVoted}
              className={`px-6 py-3 rounded-md text-lg font-bold border-2 transition w-full mb-2 ${
                selectedOption === opt
                  ? "bg-green-500 border-green-700 text-black"
                  : "bg-[#1c1c1f] border-gray-600 hover:border-white hover:bg-gray-800"
              }`}
            >
              {opt}
            </button>
          ))}
          <div className="mt-6 text-lg font-bold text-orange-400">
            Time left: {timeLeft ?? "--"}s
          </div>
        </div>
      ) : null}

      {/* Prediction Mode UI */}
      {gameData.mode === "prediction" && !results && (
        <div className="text-center max-w-xl w-full">
          <p className="text-sm mb-2 text-white/50">Room: {roomCode}</p>
          <h3 className="text-2xl font-semibold mb-6">{gameData.question}</h3>
          {!hasVoted ? (
            gameData.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => handlePrediction(opt)}
                disabled={hasVoted}
                className={`px-6 py-3 rounded-md text-lg font-bold border-2 transition w-full mb-2 ${
                  selectedOption === opt
                    ? "bg-green-500 border-green-700 text-black"
                    : "bg-[#1c1c1f] border-gray-600 hover:border-white hover:bg-gray-800"
                }`}
              >
                {opt}
              </button>
            ))
          ) : (
            <p className="text-green-400 text-xl">
              ✅ Locked in prediction: <span className="font-bold">{selectedOption}</span>
            </p>
          )}

          {/* Host-only button to end prediction */}
          {isHost && hasVoted && (
            <div className="mt-6">
              <h4 className="text-lg mb-2 text-white">Mark the correct answer:</h4>
              {gameData.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleEndPrediction(opt)}
                  className="px-4 py-2 m-1 bg-red-500 hover:bg-red-600 rounded-lg"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {hasVoted && !showVoteSuccess && gameData.mode === "classic" && (
        <p className="mt-4 text-sm text-orange-300">Vote submitted ✅</p>
      )}

      {isHost && roundActive && gameData.mode === "classic" && (
        <button
          onClick={handleEndRound}
          className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          End Round Now
        </button>
      )}
    </div>
  );
}
