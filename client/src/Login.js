import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "./services/api"; // ✅ centralized API service

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Dynamically pick API base URL
  const API_BASE =
    process.env.NODE_ENV === "production"
      ? "https://votechaos.com"
      : "http://localhost:5050";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter both email and password!");
      return;
    }

    setLoading(true);

    try {
      // 🔑 Step 1: Authenticate
      const res = await axios.post(`${API_BASE}/api/login`, {
        email: email.toLowerCase().trim(),
        password,
      });

      localStorage.setItem("token", res.data.token); // ✅ save token only

      // 🔑 Step 2: Fetch user profile fresh from DB
      const profile = await api.getProfile();
      if (profile.user) {
        setUser(profile.user); // push user into React state
        navigate("/dashboard");
      } else {
        setError("Failed to load profile after login.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div
        className="w-full max-w-md bg-gradient-to-br from-[#181818] to-black/80 rounded-3xl shadow-2xl border border-orange-400/30 px-8 py-10 flex flex-col items-center"
        style={{
          boxShadow: "0 10px 40px #ff73007c, 0 0px 0px #fff1",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="text-5xl mb-4 animate-bounce">🎲</div>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-white text-center">
          Join the <span className="text-orange-400">Chaos</span>
        </h2>
        <p className="text-gray-400 mb-7 text-center text-sm">
          Welcome back, agent of chaos.<br />Log in to your secret voting games.
        </p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            className="rounded-lg px-4 py-3 bg-[#222] text-white border border-orange-400/40 focus:outline-none focus:border-orange-400 transition"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            className="rounded-lg px-4 py-3 bg-[#222] text-white border border-orange-400/40 focus:outline-none focus:border-orange-400 transition"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <div className="text-red-400 text-xs font-semibold">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-orange-400 hover:bg-orange-500 transition text-black font-bold rounded-full px-6 py-3 shadow-lg text-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-gray-500 text-xs mt-7">
          New here?{" "}
          <button
            className="text-orange-400 underline font-bold"
            onClick={() => navigate("/signup")}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
