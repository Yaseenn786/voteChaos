// client/components/PredictionSetupModal.jsx
import { useState } from "react";

export default function PredictionSetupModal({ roomCode, socket, onClose }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleAddOption = () => setOptions([...options, ""]);
  const handleChangeOption = (i, value) => {
    const updated = [...options];
    updated[i] = value;
    setOptions(updated);
  };

  const handleStart = () => {
    if (!question || options.filter((o) => o.trim()).length < 2) return;
    socket.emit("startPrediction", {
      roomCode,
      question,
      options: options.filter((o) => o.trim()),
      roundTime: 30, // ⏱️ configurable
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70">
      <div className="bg-[#1c1c1f] p-6 rounded-xl w-full max-w-md">
        <h2 className="text-2xl text-orange-400 font-bold mb-4">
          🔮 Create Prediction
        </h2>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter prediction question..."
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        />
        {options.map((opt, i) => (
          <input
            key={i}
            type="text"
            value={opt}
            onChange={(e) => handleChangeOption(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            className="w-full p-2 mb-2 rounded bg-gray-800 text-white"
          />
        ))}
        <button
          onClick={handleAddOption}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-white mb-4"
        >
          ➕ Add Option
        </button>
        <button
          onClick={handleStart}
          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold w-full"
        >
          Start Prediction
        </button>
      </div>
    </div>
  );
}
