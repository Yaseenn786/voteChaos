import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5050");

export default function Game() {
  const { roomCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // ✅ Player info from navigation
  const playerId = state?.playerId;
  const nickname = state?.nickname;
  const isHost = state?.isHost || false;

  const [gameData, setGameData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [roundActive, setRoundActive] = useState(false);

  // ✅ New state for flash screen
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);

  // ✅ Fetch game details initially
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/games/${roomCode}`);
        const data = await res.json();
        if (data.success) {
          setGameData(data.game);

          // If already voting, sync remaining time
          if (data.game.status === "voting") {
            const remaining = Math.max(
              0,
              Math.floor((new Date(data.game.timerEnd) - Date.now()) / 1000)
            );
            setRoundActive(true);
            setTimeLeft(remaining);
          }
        }
      } catch (err) {
        console.error("Error fetching game:", err);
      }
    };
    fetchGame();
  }, [roomCode]);

  // 🎮 Socket listeners
  useEffect(() => {
    socket.emit("joinRoom", { roomCode, playerId, nickname });

    socket.on("gameStarted", ({ question, options, roundTime }) => {
      setGameData((prev) => ({ ...prev, question, options }));
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
    });

    return () => {
      socket.off("gameStarted");
      socket.off("roundEnded");
    };
  }, [roomCode, playerId, nickname, gameData?.question]);

  // 🗳️ Submit vote
  const handleVote = (option) => {
    if (hasVoted || !option || !roundActive) return;
    setSelectedOption(option);
    setHasVoted(true);

    socket.emit("submitVote", {
      roomCode,
      option,
      playerId,
      nickname,
    });

    // ✅ Flash success screen
    setShowVoteSuccess(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 2500);
  };

  // 🛑 End round early (host only)
  const handleEndRound = () => {
    if (isHost) {
      socket.emit("endRound", { roomCode });
    }
  };

  // ✅ Flash screen UI
  if (showVoteSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center animate-pulse">
          <h1 className="text-4xl font-bold text-green-400 mb-4">✅ Vote Submitted!</h1>
          <p className="text-gray-300">Redirecting back to Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!gameData) return <p className="text-white">Loading game...</p>;

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold text-orange-400 mb-6">
        {gameData.mode === "classic"
          ? "Classic Vote Battles 🗳️"
          : gameData.mode === "prediction"
          ? "Prediction Battles 🔮"
          : "Open Text ☠️"}
      </h2>

      {results ? (
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
      ) : roundActive ? (
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
      ) : (
        <p className="text-gray-400 italic">Loading round…</p>
      )}

      {hasVoted && !showVoteSuccess && (
        <p className="mt-4 text-sm text-orange-300">Vote submitted ✅</p>
      )}

      {isHost && roundActive && (
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
