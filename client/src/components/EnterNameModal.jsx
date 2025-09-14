import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnterNameModal({ onClose, onSubmit }) {
  const [nickname, setNickname] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const handleContinue = () => {
    if (!nickname.trim()) return;

    
    setIsClosing(true);

    
    setTimeout(() => {
      onSubmit(nickname.trim());
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {!isClosing && (
          <motion.div
            key="modal"
            initial={{ x: 200, y: -200, rotateX: 15, rotateY: -15, scale: 0.8, opacity: 0 }}
            animate={{ x: 0, y: 0, rotateX: 0, rotateY: 0, scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 15 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="relative bg-[#1a1a1a] p-8 rounded-2xl shadow-[0_0_25px_rgba(255,115,0,0.3)] border border-orange-400 w-[90%] max-w-md"
          >
            <h2 className="text-2xl font-extrabold mb-6 text-center text-orange-400 tracking-wide">
              What’s your name?
            </h2>

            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-3 text-lg rounded-lg bg-[#0d0d0d] border border-gray-600 text-white focus:outline-none focus:border-orange-400 transition"
              placeholder="Enter your nickname"
            />

            <div className="flex justify-end mt-6 gap-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-sm transition"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
                className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg text-black font-bold shadow-md transition"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        )}

        
        {isClosing && (
          <motion.div
            key="ashes"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute flex gap-2"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-orange-400 rounded-full"
                initial={{ opacity: 1, scale: 1 }}
                animate={{
                  opacity: 0,
                  scale: 0,
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
