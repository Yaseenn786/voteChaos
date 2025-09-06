import { useState } from "react";

export default function SubmitResponse({ question, onSubmit }) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="bg-[#0b0b0e] border border-orange-500 p-6 rounded-lg w-full max-w-md text-center">
        <h2 className="text-xl font-bold text-orange-400 mb-4">Your Turn!</h2>
        
        <p className="text-lg italic text-gray-300 mb-6">
          {question}
        </p>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Write your witty response here..."
          className="w-full bg-[#1c1c1f] text-white p-3 rounded-md border border-gray-700 mb-4"
          rows={3}
        />

        <button
          onClick={() => onSubmit(answer.trim())}
          disabled={!answer.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition disabled:opacity-50"
        >
          Submit Response
        </button>
      </div>
    </div>
  );
}
