import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Confetti from "react-confetti";
import { Howl } from "howler";
import GameCreated from "./components/GameCreated";


const socket = io("http://localhost:5050");

export default function Game() {
  const { roomCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // ✅ Player info
  const [playerId, setPlayerId] = useState(null);
  const nickname = state?.nickname || state?.user?.nickname || "Anonymous";
  const userId = state?.user?._id || null;
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
  const [showPredictionSuccess, setShowPredictionSuccess] = useState(false);

  // 🔮 Host confirm modal
  const [showEndModal, setShowEndModal] = useState(false);
  const [pendingCorrectOption, setPendingCorrectOption] = useState(null);

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

  // ✅ Fetch game (initial load)
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/games/${roomCode}`);
        const data = await res.json();
        if (data.success) {
          setGameData(data.game);
          console.log("🎮 FetchGame:", {
            userId,
            gameId: data?.game?._id,
            nickname,
          });
          
          if (userId && data?.game?._id) {
            fetch(`http://localhost:5050/api/user/${userId}/currentGames`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ gameId: data.game._id }),
            }).catch((err) => console.error("Error saving currentGame:", err));
          }

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

  
  useEffect(() => {
    if (userId && gameData?._id) {
      fetch(`http://localhost:5050/api/user/${userId}/currentGames`, {
        

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: gameData._id }),
      }).catch((err) =>
        console.error("Error saving currentGame (joiner):", err)
      );
    }
  }, [userId, gameData?._id]);

  
  useEffect(() => {
    socket.emit("joinRoom", { roomCode, nickname, userId });

    socket.on("playerInfo", ({ playerId }) => {
      setPlayerId(playerId);
    });

    // 🎮 Classic start
    socket.on("gameStarted", ({ question, options, roundTime }) => {
      setGameData((prev) => ({
        ...prev,
        question,
        options,
        status: "voting",
        mode: "classic",
      }));
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

    // 🎮 Classic end
    socket.on("roundEnded", ({ votes, results, winner }) => {
      setRoundActive(false);
      setResults({ question: gameData?.question, votes, results, winner });

      if (userId && gameData?._id) {
        fetch(`http://localhost:5050/api/user/${userId}/moveToPast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: gameData._id }),
        }).catch((err) =>
          console.error("Error moving to pastGames:", err)
        );
      }
    });

    // 🔮 Prediction start
    socket.on("predictionStarted", ({ question, options }) => {
      setGameData((prev) => ({
        ...prev,
        question,
        options,
        status: "prediction",
        mode: "prediction",
      }));
      setHasVoted(false);
      setSelectedOption(null);
      setResults(null);
    });

    // 🔮 Prediction end
    socket.on("predictionEnded", ({ question, correctOption, winners, scores }) => {
      console.log("📩 predictionEnded payload:", {
        question,
        correctOption,
        winners,
        scores,
      });

      setResults({
        question: question || gameData?.question || "",
        correctOption,
        winners: Array.isArray(winners) ? winners : [],
        scores: scores && typeof scores === "object" ? scores : {},
      });
      setRoundActive(false);

      if (userId && gameData?._id) {
        fetch(`http://localhost:5050/api/user/${userId}/moveToPast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: gameData._id }),
        }).catch((err) =>
          console.error("Error moving to pastGames:", err)
        );
      }
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
    setTimeout(() => navigate("/dashboard"), 3000);
  };

  // 🔮 Prediction (submit)
  const handlePrediction = (opt) => {
    if (hasVoted || !opt) return;
    setSelectedOption(opt);
    setHasVoted(true);
    socket.emit("submitPrediction", {
      roomCode,
      predictedOption: opt,
      nickname: nickname,
      userId,
    });

    setShowPredictionSuccess(true);
    setTimeout(() => navigate("/dashboard"), 5000);
  };

  
  const handleEndPrediction = (correctOption) => {
    if (isHost) socket.emit("endPrediction", { roomCode, correctOption });
    navigate("/dashboard");
  };

  
  const handleEndRound = () => {
    if (isHost) socket.emit("endRound", { roomCode });
  };

  
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

  
  if (showPredictionSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={300}
          gravity={0.15}
          recycle={false}
        />
        <div className="text-center animate-pulse">
          <h1 className="text-5xl font-extrabold text-green-400 mb-6">
            🔒 Prediction Locked In!
          </h1>
          <p className="text-orange-300 text-2xl">Good luck…</p>
          <p className="text-gray-400 mt-3 text-sm">(Redirecting to Dashboard)</p>
        </div>
      </div>
    );
  }

  if (!gameData) return <p className="text-white">Loading game...</p>;

  
  if (viewResults && results) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-bold text-orange-400 mb-6">Game Results 🏆</h2>
        <h3 className="text-xl mb-2 text-green-400">Question:</h3>
        <p className="text-2xl mb-6">
          {results.question || gameData.question}
        </p>

        {/* Classic results */}
        {results.results?.optionVotes &&
          Object.entries(results.results.optionVotes || {}).map(
            ([opt, count], idx) => (
              <div key={idx} className="text-lg mb-2">
                <span className="text-yellow-400 font-bold">{opt}:</span>{" "}
                {count} votes
              </div>
            )
          )}

        {/* Prediction results */}
        {results.correctOption && (
          <>
            <p className="text-xl text-green-400 mb-2">
              ✅ Correct Answer: {results.correctOption}
            </p>
            <p className="text-lg text-yellow-400 mb-2">
              Winners:{" "}
              {(
                results.winners && results.winners.length > 0
                  ? results.winners
                  : gameData?.winner && gameData.winner.length > 0
                  ? gameData.winner
                  : []
              ).join(", ") || "None"}
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
      {gameData.mode === "classic" && roundActive && (
        <div className="text-center max-w-xl w-full">
          <p className="text-sm mb-2 text-white/50">Room: {roomCode}</p>
          <h3 className="text-2xl font-semibold mb-6">
            {gameData.question}
          </h3>
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
          {isHost && (
            <button
              onClick={handleEndRound}
              className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              End Round Now
            </button>
          )}
        </div>
      )}

      {/* Prediction Mode UI */}
      {gameData.mode === "prediction" && !results && (
        <div className="text-center max-w-xl w-full">
          <p className="text-sm mb-2 text-white/50">Room: {roomCode}</p>
          <h3 className="text-2xl font-semibold mb-6">
            {gameData.question}
          </h3>
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
              ✅ Locked in prediction:{" "}
              <span className="font-bold">{selectedOption}</span>
            </p>
          )}

          {/* Host-only button to end prediction */}
          {isHost && (
            <div className="mt-6">
              <h4 className="text-lg mb-2 text-white">
                Mark the correct answer:
              </h4>
              {gameData.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPendingCorrectOption(opt);
                    setShowEndModal(true);
                  }}
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

      
      {showEndModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1c1c1f] p-6 rounded-xl shadow-lg w-full max-w-sm border border-orange-500">
            <h2 className="text-xl font-bold text-orange-400 mb-4">
              End Prediction Game?
            </h2>
            <p className="text-white mb-6">
              You are marking{" "}
              <span className="font-bold text-green-400">
                {pendingCorrectOption}
              </span>{" "}
              as the correct answer.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleEndPrediction(pendingCorrectOption);
                  setShowEndModal(false);
                }}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-bold"
              >
                End Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
