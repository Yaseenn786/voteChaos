import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";

export default function PlayOptionsModal({ onClose, onSelect }) {
  
  useEffect(() => {
    const sound = new Howl({ src: ["/sounds/modal-open.mp3"], volume: 0.25 });
    sound.play();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-hidden">
      
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full 
                   bg-gradient-to-r from-orange-500 via-purple-600 to-pink-500 
                   blur-3xl opacity-5 z-0"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      />

      
      <motion.div
        initial={{ scale: 0.9, rotateX: -10, opacity: 0 }}
        animate={{ scale: 1, rotateX: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 18 }}
        className="relative z-20 bg-[#1a1a1d] text-white p-8 rounded-2xl w-96 
                   shadow-[0_8px_25px_rgba(0,0,0,0.5)] border border-gray-700"
        style={{ perspective: 1000 }}
      >
        <h2 className="text-2xl font-extrabold mb-6 text-center tracking-wide 
                       text-gradient bg-clip-text text-transparent 
                       bg-gradient-to-r from-orange-400 to-pink-500">
          🎮 Play VoteChaos
        </h2>

        
        <div className="space-y-4">
          <motion.button
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-lg font-bold text-lg 
                       bg-gradient-to-b from-orange-500 to-orange-600 
                       text-black shadow-md hover:shadow-lg"
            onClick={() => onSelect("create")}
          >
            Create Game
          </motion.button>

          <motion.button
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-lg font-bold text-lg 
                       bg-gradient-to-b from-blue-500 to-blue-600 
                       text-white shadow-md hover:shadow-lg"
            onClick={() => onSelect("join")}
          >
            Join Game
          </motion.button>

          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-lg font-bold text-lg 
                       bg-gradient-to-b from-gray-700 to-gray-800 
                       text-white shadow-md hover:shadow-lg"
            onClick={onClose}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
