import { useState } from "react";

export default function JoinRoomModal({ onClose, onSubmit }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      alert("Please enter a room code or link!");
      return;
    }

    let roomCode = inputValue.trim();

    // ✅ Extract code if a full link is pasted
    if (roomCode.includes("/room/")) {
      try {
        const url = new URL(roomCode);
        roomCode = url.pathname.split("/").pop(); // last segment
      } catch {
        // fallback: regex extract after /room/
        const match = roomCode.match(/room\/([^/]+)/);
        if (match) roomCode = match[1];
      }
    }

    if (!roomCode || roomCode.length < 4) {
      alert("Invalid room code");
      return;
    }

    onSubmit(roomCode.toUpperCase()); // send to parent
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-orange-500 w-[90%] max-w-sm">
        <h2 className="text-2xl font-bold text-orange-400 mb-4">Join a Game</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 rounded bg-[#111] border border-gray-600 text-white mb-4"
            placeholder="Enter room code or link"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-400 text-black font-bold py-2 rounded"
            >
              Join Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
