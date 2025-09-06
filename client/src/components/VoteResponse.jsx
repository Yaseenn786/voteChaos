import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5050");

const VoteResponse = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const roomCode = state?.roomCode;
  const nickname = state?.user?.nickname || "Anonymous";
  const currentQuestion = state?.currentQuestion;

  const [responses, setResponses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    socket.emit("requestResponses", { roomId: roomCode });

    socket.on("allResponses", (data) => {
      setResponses(data.responses);
    });

    socket.on("votingResults", (results) => {
      navigate("/results", { state: { results } });
    });

    return () => {
      socket.off("allResponses");
      socket.off("votingResults");
    };
  }, [roomCode, navigate]);

  const handleVote = () => {
    if (!selected) return alert("Please select a response to vote for.");

    socket.emit("castVote", {
      roomId: roomCode,
      nickname,
      vote: selected,
      question: currentQuestion,
    });

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4">
      <div className="bg-[#18181c] border border-orange-500 rounded-xl p-8 w-full max-w-2xl shadow-lg animate-fade-in">
        <h2 className="text-2xl text-orange-400 font-bold text-center mb-4">
          Vote for the Best Response
        </h2>
        <p className="text-lg text-center italic mb-6">{currentQuestion}</p>

        {!submitted ? (
          <div className="flex flex-col gap-4">
            {responses.map((r, i) => (
              <button
                key={i}
                onClick={() => setSelected(r)}
                className={`w-full text-left px-4 py-3 rounded-md border text-lg transition-all ${
                  selected === r
                    ? "border-blue-500 bg-gray-800"
                    : "border-gray-700 bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {r}
              </button>
            ))}
            <button
              onClick={handleVote}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transition mt-4 px-4 py-2 rounded-md text-white font-semibold"
            >
              Submit Vote
            </button>
          </div>
        ) : (
          <div className="text-green-400 text-center mt-4 font-semibold">
            ✅ Vote submitted! Waiting for others...
          </div>
        )}
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default VoteResponse;
