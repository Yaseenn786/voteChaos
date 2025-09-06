import React from "react";

const Results = ({ results, onRestart }) => {
  const { votes = [], summary = [] } = results || {};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 rounded-xl p-8 shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">📊 Round Results</h2>

        {/* 🗳️ Who voted for whom */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Votes Cast:</h3>
          <ul className="space-y-2">
            {votes.map((r, idx) => (
              <li key={idx} className="bg-gray-700 p-3 rounded-md">
                <span className="font-bold text-green-300">{r.nickname}</span>
                <span> voted for </span>
                <span className="text-blue-400 font-semibold">{r.vote}</span>

                {r.bribe && (
                  <span> | <span className="text-yellow-400">Bribed: {r.bribe}</span></span>
                )}
                {r.emoji && (
                  <span> | <span className="text-xl">{r.emoji}</span></span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* 🏆 Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Leaderboard:</h3>
          {summary.length > 0 ? (
            <ul className="space-y-2">
              {summary.map((s, idx) => (
                <li key={idx} className="flex justify-between px-4 py-2 bg-gray-700 rounded-md">
                  <span className="text-white font-medium">{s.name}</span>
                  <span className="text-green-400 font-bold">{s.count} votes</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No votes summary available.</p>
          )}
        </div>

        <button
          className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded font-bold w-full"
          onClick={onRestart}
        >
          🔄 Back to Lobby
        </button>
      </div>
    </div>
  );
};

export default Results;
