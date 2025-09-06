// src/components/AddQuestionModal.js
import { useState } from "react";

export default function AddQuestionModal({ roomCode, onSave }) {
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState([]);

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setOptions([...options, optionInput.trim()]);
      setOptionInput("");
    }
  };

  const handleAddQuestion = () => {
    if (!questionText || options.length < 2) return alert("Need 2+ options");
    setQuestions([...questions, { question: questionText, options }]);
    setQuestionText("");
    setOptions([]);
  };

  const handleSaveAll = () => {
    if (questions.length === 0) return alert("Add at least 1 question");
    onSave(questions);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0b0e] text-white flex items-center justify-center">
      <div className="p-6 md:p-10 rounded-xl border border-orange-500 bg-black/80 w-[90%] max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-4 text-orange-400">
          Set Round Questions
        </h2>

        <div className="mb-4">
          <p className="text-center text-white/70 italic mb-2">
            Room Code: <span className="font-mono text-lg text-orange-300">{roomCode}</span>
          </p>
        </div>

        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question"
          className="w-full mb-2 px-4 py-2 rounded bg-[#1a1a1a] text-white border border-white/10"
        />

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={optionInput}
            onChange={(e) => setOptionInput(e.target.value)}
            placeholder="Add option"
            className="flex-1 px-4 py-2 rounded bg-[#1a1a1a] text-white border border-white/10"
          />
          <button
            onClick={handleAddOption}
            className="bg-pink-600 px-4 py-2 rounded font-bold hover:bg-pink-700"
          >
            + Option
          </button>
        </div>

        <div className="mb-4 text-sm text-white/80">
          {options.length > 0 && (
            <ul className="list-disc ml-6">
              {options.map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleAddQuestion}
          className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 rounded mb-4"
        >
          + Add Question
        </button>

        {questions.length > 0 && (
          <div className="mb-4 max-h-40 overflow-y-auto text-sm text-white/90">
            <h3 className="font-bold mb-2">Questions Preview:</h3>
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li key={i}>
                  <span className="text-orange-300">Q{i + 1}:</span> {q.question}
                  <ul className="list-disc ml-6 text-white/70">
                    {q.options.map((opt, j) => (
                      <li key={j}>{opt}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleSaveAll}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
        >
          Save Questions
        </button>
      </div>
    </div>
  );
}
