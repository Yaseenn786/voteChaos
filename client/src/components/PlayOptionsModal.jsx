import React from "react";

export default function PlayOptionsModal({ onClose, onSelect }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-2xl w-80">
        <h2 className="text-xl font-bold mb-4">Play VoteChaos</h2>
        <button
          className="w-full bg-orange-500 py-2 rounded-lg mb-2 hover:bg-orange-600"
          onClick={() => onSelect("create")}
        >
          Create Game
        </button>
        <button
          className="w-full bg-blue-500 py-2 rounded-lg hover:bg-blue-600"
          onClick={() => onSelect("join")}
        >
          Join Game
        </button>
        <button
          className="w-full bg-gray-700 py-2 rounded-lg mt-4"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
