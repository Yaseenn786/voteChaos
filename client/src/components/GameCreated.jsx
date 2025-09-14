import { motion } from "framer-motion";

export default function GameCreated({ roomCode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-center relative overflow-hidden">
      
      
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="w-2 h-2 bg-orange-500 rounded-full absolute"
          initial={{ y: -20, x: "50%" }}
          animate={{ y: ["-20%", "120%"], x: ["50%", "20%", "80%", "40%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

    
      <motion.h1
        className="text-3xl md:text-4xl font-extrabold text-green-400 flex items-center gap-2"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        🎉 Classic Vote Battles 📦 Created & Started!
      </motion.h1>

      
      <motion.p
        className="text-gray-300 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Share this code with your friends:
      </motion.p>

      
      <motion.div
        className="mt-6 px-8 py-4 bg-orange-500 text-black font-bold text-2xl rounded-xl shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: [1.2, 1] }}
        transition={{ type: "spring", stiffness: 200, damping: 10, delay: 1 }}
      >
        #{roomCode}
      </motion.div>

      
      <motion.a
        href={`/room/${roomCode}`}
        className="mt-6 text-orange-400 hover:text-orange-300 underline decoration-wavy decoration-orange-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        Or share this link: http://localhost:3000/room/{roomCode}
      </motion.a>

      
      <motion.p
        className="mt-8 text-gray-500 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        Redirecting to dashboard...
      </motion.p>
    </div>
  );
}
