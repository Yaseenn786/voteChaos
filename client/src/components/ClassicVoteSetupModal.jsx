import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ClassicVoteSetupModal({ open, onClose, user, nickname }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [timerDuration, setTimerDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [burnt, setBurnt] = useState(false);

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
    setBurnt(true); 

    setTimeout(async () => {
      try {
        const res = await fetch("http://localhost:5050/api/games/classic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hostId: user._id,
            hostName: nickname || user.email || "Host",
            question: question.trim(),
            options: validOptions,
            timer: timerDuration,
          }),
        });

        const data = await res.json();
        if (data.success) {
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
    }, 1000);
  };

  const ashes = Array.from({ length: 25 });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              burnt
                ? {
                    opacity: 0,
                    scale: 0.8,
                    rotate: 5,
                    y: -40,
                    transition: { duration: 0.8, ease: "easeInOut" },
                  }
                : { opacity: 0, scale: 0.9, y: 20 }
            }
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-[90%] max-w-lg p-8 rounded-2xl 
                       bg-black/60 backdrop-blur-xl 
                       border border-white/10 
                       shadow-[0_0_40px_rgba(255,115,0,0.2)] overflow-hidden"
          >
            
            {burnt &&
              ashes.map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    scale: Math.random() * 1.5 + 0.5,
                    x: (Math.random() - 0.5) * 200,
                    y: -Math.random() * 200 - 50,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute w-2 h-2 rounded-full bg-orange-400"
                  style={{ left: "50%", top: "50%" }}
                />
              ))}

            <h2 className="text-2xl font-extrabold text-center mb-6 
                           text-transparent bg-clip-text 
                           bg-gradient-to-r from-orange-400 to-pink-400">
              🎮 Create Classic Vote
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-white mb-2">Question</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#111] border border-gray-600 text-white focus:outline-none focus:border-orange-400"
                  placeholder="Enter your question..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Options</label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-[#111] border border-gray-600 text-white focus:outline-none focus:border-orange-400 mr-2"
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg"
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
                    className="text-orange-400 hover:text-orange-300 text-sm"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-white mb-2">Timer Duration</label>
                <select
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(Number(e.target.value))}
                  className="w-full p-3 rounded-lg bg-[#111] border border-gray-600 text-white focus:outline-none focus:border-orange-400"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={120}>2 minutes</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-400 hover:bg-orange-500 text-black font-bold py-2 rounded-lg"
                >
                  {loading ? "Creating..." : "Create Game"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
