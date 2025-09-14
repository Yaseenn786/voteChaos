// client/components/PredictionSetupModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PredictionSetupModal({ roomCode, socket, onClose, user, nickname }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const navigate = useNavigate();

  const handleAddOption = () => setOptions([...options, ""]);
  const handleChangeOption = (i, value) => {
    const updated = [...options];
    updated[i] = value;
    setOptions(updated);
  };

  const handleStart = async () => {
    const cleanedOptions = options.map((o) => o.trim()).filter((o) => o);
    if (!question.trim() || cleanedOptions.length < 2) {
      alert("Please enter a question and at least 2 options");
      return;
    }
  
    if (!user?._id) {
      alert("You must be logged in to create a game.");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:5050/api/games/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
         },
        body: JSON.stringify({
          hostId: user._id, 
          hostName: nickname || user.email || "Host",
          question: question.trim(),
          options: cleanedOptions,
        }),
      });
  
      const data = await res.json();
      if (data.success) {
        const roomCode = data.roomCode;
  
        onClose();
        navigate(`/game-created/${roomCode}`, {
          state: {
            mode: "prediction",
            roomCode,
            question: question.trim(),
            options: cleanedOptions,
            isHost: true,
            user,
            nickname,
          },
        });
      } else {
        alert(data.error || "Error creating game");
      }
    } catch (err) {
      console.error("Error creating prediction game:", err);
    }
  };
  
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70">
      <div className="bg-[#1c1c1f] p-6 rounded-xl w-full max-w-md shadow-lg border border-orange-500/30">
        <h2 className="text-2xl text-orange-400 font-bold mb-4">
          🔮 Create Prediction
        </h2>

        
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter prediction question..."
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white outline-none focus:ring-2 focus:ring-orange-400"
        />

        
        {options.map((opt, i) => (
          <input
            key={i}
            type="text"
            value={opt}
            onChange={(e) => handleChangeOption(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            className="w-full p-2 mb-2 rounded bg-gray-800 text-white outline-none focus:ring-2 focus:ring-orange-400"
          />
        ))}

        
        <button
          onClick={handleAddOption}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-white mb-4 transition"
        >
          ➕ Add Option
        </button>

        
        <button
          onClick={handleStart}
          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold w-full transition"
        >
          Start Prediction
        </button>
      </div>
    </div>
  );
}
