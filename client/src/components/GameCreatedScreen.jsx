import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function GameCreatedScreen() {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard"); // redirect after 5s
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // reset message
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0b0e] text-white">
      <h2 className="text-3xl font-bold text-green-400 mb-4">
        🎉 Game Created & Started!
      </h2>
      <p className="text-xl mb-2">Share this code with your friends:</p>

      {/* Room Code */}
      <button
        onClick={handleCopy}
        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-black font-bold text-2xl rounded-lg transition relative"
      >
        #{roomCode}
      </button>

      {/* Copy Feedback */}
      {copied && (
        <p className="mt-2 text-green-400 text-sm animate-pulse">✅ Copied!</p>
      )}

      {/* Share Link */}
      <p className="mt-6 text-gray-400">
        Or share this link:{" "}
        <a
          href={`${window.location.origin}/room/${roomCode}`}
          className="text-orange-400 underline"
        >
          {window.location.origin}/room/{roomCode}
        </a>
      </p>

      <p className="mt-6 text-gray-500 italic">Redirecting to dashboard...</p>
    </div>
  );
}
