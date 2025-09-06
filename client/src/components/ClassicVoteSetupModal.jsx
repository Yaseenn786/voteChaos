import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClassicVoteSetupModal({ open, onClose, user, nickname }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [timerDuration, setTimerDuration] = useState(60);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      alert("Please enter a question!");
      return;
    }

    const validOptions = options.map((opt) => opt.trim()).filter((opt) => opt);
    if (validOptions.length < 2) {
      alert("Please add at least 2 options!");
      return;
    }

    if (!user?._id) {
      alert("You must be logged in to create a game.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5050/api/games/classic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId: user._id, // ✅ use logged-in user Mongo _id
          hostName: nickname || user.email || "Host",
          question: question.trim(),
          options: validOptions,
          timer: timerDuration,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // ✅ Navigate to game-created screen
        navigate(`/game-created/${data.roomCode}`);
      } else {
        alert(data.error || "Error creating game");
      }
    } catch (err) {
      console.error("Error creating game:", err);
      alert("Server error creating game");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-orange-500 w-[90%] max-w-md">
        <h2 className="text-2xl font-bold text-orange-400 mb-4">
          Create Classic Vote
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Question */}
          <div className="mb-4">
            <label className="block text-white mb-2">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-3 rounded bg-[#111] border border-gray-600 text-white"
              placeholder="Enter your question..."
            />
          </div>

          {/* Options */}
          <div className="mb-4">
            <label className="block text-white mb-2">Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 p-2 rounded bg-[#111] border border-gray-600 text-white mr-2"
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="text-orange-400 text-sm"
              >
                + Add Option
              </button>
            )}
          </div>

          {/* Timer */}
          <div className="mb-4">
            <label className="block text-white mb-2">Timer Duration</label>
            <select
              value={timerDuration}
              onChange={(e) => setTimerDuration(Number(e.target.value))}
              className="w-full p-2 rounded bg-[#111] border border-gray-600 text-white"
            >
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-400 text-black font-bold py-2 rounded"
            >
              {loading ? "Creating..." : "Create Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
