import { useState } from "react";

export default function CreateRoomModal({ open, onClose, onSubmit, roomCode }) {
  const [questions, setQuestions] = useState([
    { text: "", options: ["", ""] },
  ]);

  const updateQuestionText = (index, value) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].options.splice(optIndex, 1);
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", ""] }]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = () => {
    const cleaned = questions
      .map(q => ({
        text: q.text.trim(),
        options: q.options.map(o => o.trim()).filter(o => o !== "")
      }))
      .filter(q => q.text !== "" && q.options.length >= 2);

    if (cleaned.length > 0) {
      onSubmit(cleaned); // return structured questions with options
      onClose();
    } else {
      alert("Please enter at least one valid question with 2+ options.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#0b0b0e] border border-orange-500 p-6 rounded-lg w-full max-w-md text-white shadow-lg">
        <h2 className="text-2xl font-bold text-orange-400 mb-2 text-center">Set Round Questions</h2>
        <p className="text-sm text-center mb-4 text-gray-300">
          Add poll-style questions with 2 or more voting options.<br />
          Example: <em>“Is water wet?” — Yes / No</em><br />
          Add at least 1 question.
        </p>

        <div className="mb-4 bg-[#1c1c1f] px-4 py-2 text-center text-lg text-yellow-400 font-mono border border-orange-400 rounded-md">
          Room Code: <span className="font-bold tracking-widest">{roomCode}</span>
        </div>

        {questions.map((q, idx) => (
          <div key={idx} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <input
                className="flex-1 px-4 py-2 rounded-md bg-[#1c1c1f] text-white border border-gray-700"
                placeholder={`Question ${idx + 1}`}
                value={q.text}
                onChange={e => updateQuestionText(idx, e.target.value)}
              />
              <button
                onClick={() => removeQuestion(idx)}
                className="text-red-500 text-xl hover:text-red-700"
              >
                ✖
              </button>
            </div>
            {q.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex gap-2 mb-1">
                <input
                  className="flex-1 px-3 py-2 rounded bg-[#1a1a1d] text-white border border-gray-600"
                  placeholder={`Option ${oIdx + 1}`}
                  value={opt}
                  onChange={e => updateOption(idx, oIdx, e.target.value)}
                />
                {q.options.length > 2 && (
                  <button
                    onClick={() => removeOption(idx, oIdx)}
                    className="text-sm text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addOption(idx)}
              className="text-sm text-green-400 hover:text-green-600 mt-1"
            >
              + Add Option
            </button>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full mb-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-2 rounded-md hover:brightness-110 transition"
        >
          + Add Question
        </button>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md transition"
        >
          Save Questions
        </button>
      </div>
    </div>
  );
}
