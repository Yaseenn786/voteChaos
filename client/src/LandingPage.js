import { useNavigate } from "react-router-dom";
import chaosHero from "./assets/orange-stairs.png"; 

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-8 md:px-16 py-7">
        <span
          className="text-2xl font-extrabold tracking-wider text-orange-400 cursor-pointer"
          onClick={() => navigate("/")}
        >
          VoteChaos
        </span>
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 bg-orange-400 rounded-full font-bold text-black text-base hover:bg-orange-500 shadow"
        >
          Login
        </button>
      </nav>

      
      <div className="w-full flex-1 flex flex-col items-center">
        {/* HERO SECTION */}
        <main className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 pt-8 md:pt-16 pb-6 px-8 md:px-0">
          {/* Left */}
          <div className="flex-1 flex flex-col justify-center md:items-start items-center text-left">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              <span className="block">Group Voting</span>
              <span className="block text-orange-400">With Pure Chaos.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium mb-7 max-w-md">
              A real-time multiplayer game for decisions, debates, and fun—powered by votes, bribes, and pure chaos.
            </p>
            <button
              className="px-8 py-3 bg-orange-400 rounded-full text-black text-lg font-extrabold shadow hover:bg-orange-500 transition mb-6 md:mb-0"
              onClick={() => navigate("/login")}
            >
              Play Now
            </button>
          </div>
          {/* Right Image */}
          <div className="flex-1 flex justify-center items-center w-full md:w-auto mt-8 md:mt-0">
            <img
              src={chaosHero}
              alt="VoteChaos hero"
              className="rounded-3xl shadow-2xl object-cover w-[260px] h-[260px] md:w-[340px] md:h-[340px] border-8 border-black"
              style={{
                boxShadow: "0 10px 32px 0 #ff73007c, 0 0px 0px 0 #fff3",
                background: "#181818",
              }}
            />
          </div>
        </main>

        {/* HOW IT WORKS */}
        <section className="w-full max-w-6xl pt-6 md:pt-14 pb-3 md:pb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-8 px-2">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row gap-6 px-2">
            <div className="flex-1 bg-[#161616] rounded-2xl p-6 flex flex-col items-start shadow border border-orange-400/10">
              <span className="text-3xl mb-2">🧑‍🤝‍🧑</span>
              <h3 className="font-bold text-base mb-1 text-orange-400">Create or Join Room</h3>
              <p className="text-gray-300 text-sm">
                Instantly make a new chaos room, or join with a code. Bring your group together, no setup needed.
              </p>
            </div>
            <div className="flex-1 bg-[#161616] rounded-2xl p-6 flex flex-col items-start shadow border border-orange-400/10">
              <span className="text-3xl mb-2">🤑</span>
              <h3 className="font-bold text-base mb-1 text-orange-400">Vote, Bribe & Emoji</h3>
              <p className="text-gray-300 text-sm">
                Vote your way to victory, send secret bribes, and add reactions for that extra spice.
              </p>
            </div>
            <div className="flex-1 bg-[#161616] rounded-2xl p-6 flex flex-col items-start shadow border border-orange-400/10">
              <span className="text-3xl mb-2">🥇</span>
              <h3 className="font-bold text-base mb-1 text-orange-400">Reveal & React</h3>
              <p className="text-gray-300 text-sm">
                See the chaos unfold. Who bribed who? Who got roasted? Every round, a new twist!
              </p>
            </div>
          </div>
        </section>

        {/* WHY VOTECHAOS */}
        <section className="w-full max-w-6xl pt-4 md:pt-12 pb-8 md:pb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-8 px-2">
            Why VoteChaos?
          </h2>
          <div className="flex flex-col md:flex-row gap-6 px-2">
            <div className="flex-1 bg-[#181818] rounded-2xl px-6 py-4 flex flex-col items-start shadow border border-orange-400/10">
              <span className="text-2xl mb-1">⚡</span>
              <span className="font-semibold text-orange-400 text-base mb-1">Instant Multiplayer</span>
              <span className="text-gray-300 text-sm">No logins, no waiting. Just grab a code and go.</span>
            </div>
            <div className="flex-1 bg-[#181818] rounded-2xl px-6 py-4 flex flex-col items-start shadow border border-orange-400/10">
              <span className="text-2xl mb-1">🔥</span>
              <span className="font-semibold text-orange-400 text-base mb-1">True Chaos Engine</span>
              <span className="text-gray-300 text-sm">Bribes, emojis, and unpredictable rounds—no two games are the same.</span>
            </div>
            <div className="flex-1 bg-[#181818] rounded-2xl px-6 py-4 flex flex-col items-start shadow border border-orange-400/10">
              <span className="text-2xl mb-1">🧑‍🎨</span>
              <span className="font-semibold text-orange-400 text-base mb-1">Beautiful & Simple</span>
              <span className="text-gray-300 text-sm">Designed for fun, works on any device. No clutter, just vibes.</span>
            </div>
          </div>
        </section>
      </div>

      
      <footer className="bg-black py-5 text-center text-orange-400 text-sm font-semibold tracking-wider border-t border-orange-400/10">
        Made with <span className="text-orange-400">chaos</span> by <span className="underline">Yaseen</span>
      </footer>
    </div>
  );
}
