import { useState } from "react";

export default function EnterNameModal({ onClose, onSubmit }) {
  const [nickname, setNickname] = useState("");

  const handleContinue = () => {
    console.log("🟠 CONTINUE BUTTON CLICKED");
    console.log("🟠 NICKNAME VALUE:", nickname);
    
    if (!nickname.trim()) {
      console.log("🔴 NICKNAME IS EMPTY - NOT CALLING onSubmit");
      return;
    }
    
    console.log("🟠 CALLING onSubmit WITH:", nickname.trim());
    onSubmit(nickname.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-xl border border-orange-500 w-[90%] max-w-md">
        <h2 className="text-2xl font-bold text-orange-400 mb-4">What's your name?</h2>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full p-3 text-lg rounded bg-[#111] border border-gray-600 text-white focus:outline-none focus:border-orange-400"
          placeholder="Enter your nickname"
        />
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            className="bg-orange-400 hover:bg-orange-500 px-5 py-2 rounded-lg text-black font-bold"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
