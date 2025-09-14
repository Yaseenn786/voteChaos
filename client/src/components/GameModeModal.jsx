import { createPortal } from "react-dom";
import { useEffect } from "react";

const MODES = [
  {
    id: "classic",
    icon: "🗳️",
    title: "Classic Vote Battles",
    desc: "Vote on fun prompts. Earn points and bragging rights.",
    example: 'Example: "Is water wet?" — Yes / No',
  },
  {
    id: "prediction",
    icon: "🔮",
    title: "Prediction Battles",
    desc: "Bet on the future. Win big if you’re right.",
    example: 'Example: "Will BTC hit $100K?" — Yes / No',
  },
  {
    id: "Open Text",
    icon: "☠️",
    title: "Open Text",
    desc: "Vote out one option each round. Last one wins.",
    example: 'Example: "Eliminate one: 🍫 / 🍿 / 🥦"',
  },
];

export default function ModePickerModal({ open, onClose, onSelect }) {
  
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] bg-[#0b0b0e] text-white">
      
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/10 bg-[#0b0b0e]">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide">
          Choose Game Mode
        </h2>
        <button
          onClick={onClose}
          className="rounded-md px-3 py-2 text-white/85 hover:text-white hover:bg-white/10 transition"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      
      <div className="h-[calc(100vh-64px)] overflow-auto px-6 md:px-10 py-6 md:py-8">
        <p className="text-white/70 mb-6 md:mb-8">Pick how you want to play.</p>

        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect?.(m.id)}
              className="text-left rounded-xl p-6 md:p-7 bg-[#141418] border border-white/10
                         hover:border-white/20 hover:-translate-y-0.5 transition
                         focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <div className="text-4xl mb-3">{m.icon}</div>
              <h3 className="text-xl md:text-2xl font-bold">{m.title}</h3>
              <p className="mt-2 text-sm text-white/80">{m.desc}</p>
              <p className="mt-3 text-xs italic text-white/60">{m.example}</p>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}