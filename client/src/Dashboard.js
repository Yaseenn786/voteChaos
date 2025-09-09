import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

// Components
import PlayOptionsModal from "./components/PlayOptionsModal";
import EnterNameModal from "./components/EnterNameModal";
import GameModeModal from "./components/GameModeModal";
import JoinRoomModal from "./components/JoinRoomModal";
import ClassicVoteSetupModal from "./components/ClassicVoteSetupModal";
import PredictionSetupModal from "./components/PredictionSetupModal"; // 🔮 NEW

function getAvatar(email) {
  if (!email) return "🤪";
  const first = email[0].toUpperCase();
  const emojis = ["😎", "🔥", "😂", "🤯", "🥳"];
  return emojis[first.charCodeAt(0) % emojis.length];
}

const socket = io("http://localhost:5050");

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const email = user?.email || "Agent of Chaos";

  // State
  const [showPlayOptions, setShowPlayOptions] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [showEnterName, setShowEnterName] = useState(false);
  const [showGameMode, setShowGameMode] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [selectedMode, setSelectedMode] = useState(null);
  const [showClassicSetup, setShowClassicSetup] = useState(false);
  const [showPredictionSetup, setShowPredictionSetup] = useState(false); // 🔮 NEW
  const [isUpdating, setIsUpdating] = useState(false);

  // Games
  const [currentGames, setCurrentGames] = useState([]);
  const [pastGames, setPastGames] = useState([]);

  const API_URL = "http://localhost:5050/api";

  // Update nickname in DB
  const updateNicknameInDB = async (newNickname) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/user/profile`,
        { nickname: newNickname },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      console.error("Failed to update nickname:", error);
      return { nickname: newNickname };
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      if (!user?._id) return;

      try {
        const [currentRes, pastRes] = await Promise.all([
          axios.get(`${API_URL}/games/current/${user._id}`),
          axios.get(`${API_URL}/games/past/${user._id}`),
        ]);

        if (currentRes.data.success) setCurrentGames(currentRes.data.games);
        if (pastRes.data.success) setPastGames(pastRes.data.games);
      } catch (err) {
        console.error("Error loading games:", err);
      }
    };

    fetchGames();
    const interval = setInterval(fetchGames, 5000);

    // ✅ Live socket update
    socket.on("gameStatusUpdate", ({ roomCode, status }) => {
      if (status === "finished") {
        setCurrentGames((prev) => {
          const finishedGame = prev.find((g) => g.roomCode === roomCode);
          if (finishedGame) {
            setPastGames((p) => [
              { ...finishedGame, status: "finished" },
              ...p,
            ]);
          }
          return prev.filter((g) => g.roomCode !== roomCode);
        });
      }
    });

    return () => {
      clearInterval(interval);
      socket.off("gameStatusUpdate");
    };
  }, [user?._id]);

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Avatar
  const avatar = getAvatar(email);
  const gamesPlayed = pastGames.length + currentGames.length;
  const favEmoji = "🔥";
  const chaosLevel = Math.min(100, gamesPlayed * 5 + 20);

  // Handle nickname submission
  const handleNameSubmit = async (submittedNickname) => {
    const updatedUser = await updateNicknameInDB(submittedNickname);
    setNickname(updatedUser.nickname);
    setShowEnterName(false);

    if (actionType === "create") {
      setShowGameMode(true);
    } else if (actionType === "join") {
      setShowJoinRoom(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Top Glow */}
      <div className="w-full h-2 bg-gradient-to-r from-orange-400 via-pink-500 to-yellow-400 animate-pulse blur-sm opacity-60"></div>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-5 bg-[#141414] border-b border-orange-500/40 shadow-lg">
        <span className="text-2xl font-extrabold text-orange-400 tracking-tight">
          VoteChaos
        </span>
        <div className="flex items-center gap-5 text-lg">
          <button
            className="hover:text-orange-400"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="hover:text-orange-400"
            onClick={() => setShowPlayOptions(true)}
          >
            Play Game
          </button>
          <button
            className="hover:text-orange-400"
            onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
          >
            Past Games
          </button>
          <span className="flex items-center gap-2">
            <span className="text-2xl rounded-full p-2 bg-[#222] shadow-inner border-4 border-orange-400 animate-avatar-glow">
              {avatar}
            </span>
            <span className="text-sm text-gray-400 hidden sm:inline">
              {nickname || email}
            </span>
          </span>
          <button
            className="bg-orange-400 hover:bg-orange-500 text-black font-semibold rounded-lg px-5 py-2 ml-2"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="flex flex-col md:flex-row gap-10 px-16 py-14 max-w-6xl mx-auto">
        {/* Left */}
        <div className="flex-1 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <span>
                Welcome,{" "}
                <span className="text-orange-400">
                  {nickname || email.split("@")[0]}
                </span>
                !
              </span>
              <span className="animate-wave origin-[70%_70%]">👋</span>
            </h1>

            <div className="flex gap-3 mt-2 mb-4">
              <div className="bg-orange-400/10 px-4 py-1 rounded-lg text-orange-300 font-semibold flex items-center gap-2">
                Games Played:{" "}
                <span className="text-orange-400 font-bold">{gamesPlayed}</span>
              </div>
              <div className="bg-orange-400/10 px-4 py-1 rounded-lg text-orange-300 font-semibold flex items-center gap-2">
                Favorite Emoji: <span className="text-xl">{favEmoji}</span>
              </div>
            </div>

            <div className="mt-4 mb-7">
              <div className="text-orange-400 font-bold mb-1">Chaos Meter</div>
              <div className="w-full h-5 bg-[#222] rounded-full overflow-hidden shadow-inner relative">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-yellow-400 rounded-full transition-all duration-700"
                  style={{ width: `${chaosLevel}%` }}
                />
                <div
                  className="absolute left-1/2 top-1/2 text-xs font-bold text-black"
                  style={{ transform: "translate(-50%, -50%)" }}
                >
                  {chaosLevel}%
                </div>
              </div>
            </div>

            <button
              className="bg-green-500 hover:bg-green-600 text-lg font-bold py-3 px-8 rounded-2xl mb-3 transition"
              onClick={() => setShowPlayOptions(true)}
            >
              + Play Game
            </button>
          </div>
        </div>

        {/* Right: Games */}
        <div className="flex-1 bg-[#181818] rounded-2xl p-8 border border-orange-500/20 shadow-xl min-w-[340px]">
          {/* Current Games */}
          <h2 className="text-2xl font-bold mb-6 text-orange-400">
            Current Games
          </h2>
          {currentGames.length === 0 ? (
            <div className="text-gray-500 italic mb-6">No current games</div>
          ) : (
            currentGames.map((game) => (
              <div
                key={game.roomCode}
                className="bg-[#202020] rounded-xl px-5 py-3 border border-gray-700/40 mb-3"
              >
                <div className="font-semibold">{game.question}</div>
                <div className="text-sm text-gray-400">Room: #{game.roomCode}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-green-400">
                    Status: {game.status}
                  </span>
                  <button
                    onClick={() =>
                      navigate(`/room/${game.roomCode}`, {
                        state: {
                          user,
                          playerId: user._id,
                          nickname,
                          roomCode: game.roomCode,
                          isHost: game.host?.id === user._id,
                        },
                      })
                    }
                    className="text-orange-400 hover:text-orange-500 underline text-xs font-semibold"
                  >
                    Enter
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Past Games */}
          <h2 className="text-2xl font-bold mb-6 text-orange-400 mt-6">
            Past Chaos Games
          </h2>
          {pastGames.length === 0 ? (
            <div className="text-gray-500 italic">No past games yet</div>
          ) : (
            pastGames.map((game) => (
              <div
                key={game._id}
                className="bg-[#202020] rounded-xl px-5 py-3 border border-gray-700/40 mb-3"
              >
                <div className="font-semibold">{game.question}</div>
                <div className="text-sm text-gray-400">
                  Winner:{" "}
                  <span className="text-orange-400">
                    {game.winner || "TBD"}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {new Date(game.createdAt).toLocaleString()}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-pink-400">Status: Finished</span>
                  <button
                    onClick={() =>
                      navigate(`/room/${game.roomCode}`, {
                        state: {
                          user,
                          nickname,
                          roomCode: game.roomCode,
                          isHost: game.host?.id === user._id,
                          viewResults: true,
                        },
                      })
                    }
                    className="text-orange-400 hover:text-orange-500 underline text-xs font-semibold"
                  >
                    View Results
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showPlayOptions && (
        <PlayOptionsModal
          onClose={() => setShowPlayOptions(false)}
          onSelect={(type) => {
            setActionType(type);
            setShowPlayOptions(false);

            if (!nickname) {
              setShowEnterName(true);
            } else {
              if (type === "create") setShowGameMode(true);
              if (type === "join") setShowJoinRoom(true);
            }
          }}
        />
      )}

      {showEnterName && (
        <EnterNameModal
          onClose={() => setShowEnterName(false)}
          onSubmit={handleNameSubmit}
        />
      )}

      {showGameMode && (
        <GameModeModal
          open={showGameMode}
          onClose={() => setShowGameMode(false)}
          onSelect={(mode) => {
            setSelectedMode(mode);
            setShowGameMode(false);

            if (mode === "classic") {
              setShowClassicSetup(true);
            } else if (mode === "prediction") {
              setShowPredictionSetup(true); // 🔮 open prediction modal
            } else {
              const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
              navigate("/game", {
                state: {
                  user: { ...user, nickname },
                  roomCode,
                  isHost: true,
                  mode,
                  nickname,
                },
              });
            }
          }}
        />
      )}

      {showJoinRoom && (
        <JoinRoomModal
          onClose={() => setShowJoinRoom(false)}
          onSubmit={(roomCode) => {
            navigate(`/room/${roomCode}`, {
              state: {
                user: { ...user, nickname },
                roomCode,
                isHost: false,
                nickname,
              },
            });
          }}
        />
      )}

      {showClassicSetup && (
        <ClassicVoteSetupModal
          open={showClassicSetup}
          onClose={() => setShowClassicSetup(false)}
          user={user}
          nickname={nickname}
        />
      )}

      {showPredictionSetup && (
        <PredictionSetupModal
          roomCode={Math.floor(1000 + Math.random() * 9000).toString()}
          socket={socket}
          onClose={() => setShowPredictionSetup(false)}
        />
      )}

      {/* Background Glows */}
      <div className="fixed -z-10 top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-80 h-80 bg-orange-500/10 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-pink-500/10 blur-3xl rounded-full animate-pulse"></div>
      </div>

      <style>
        {`
          .animate-wave { animation: wave 2s infinite; display: inline-block }
          @keyframes wave {
            0%, 60%, 100% { transform: rotate(0deg); }
            10% { transform: rotate(-15deg); }
            20% { transform: rotate(10deg); }
            30% { transform: rotate(-12deg); }
            40% { transform: rotate(9deg); }
            50% { transform: rotate(-7deg); }
          }
          .animate-avatar-glow {
            box-shadow: 0 0 16px 2px #ff9100b0, 0 0 8px 4px #e452ff44;
          }
        `}
      </style>
    </div>
  );
}
