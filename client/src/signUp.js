import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5050/api/signup";

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !confirm) {
      setError("Please fill out all fields!");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const res = await axios.post(API_URL, { email, password });
      // Save user & token to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Signup failed. Try a different email."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md bg-gradient-to-br from-[#181818] to-black/80 rounded-3xl shadow-2xl border border-orange-400/30 px-8 py-10 flex flex-col items-center"
           style={{
             boxShadow: "0 10px 40px #ff73007c, 0 0px 0px #fff1",
             backdropFilter: "blur(4px)",
           }}>
        <div className="text-5xl mb-4 animate-spin-slow">😈</div>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-white text-center">
          Create Your <span className="text-orange-400">Chaos Account</span>
        </h2>
        <p className="text-gray-400 mb-7 text-center text-sm">
          Ready to start a riot? Sign up below.<br />All your chaos, all in one place.
        </p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSignup}>
          <input
            type="email"
            className="rounded-lg px-4 py-3 bg-[#222] text-white border border-orange-400/40 focus:outline-none focus:border-orange-400 transition"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            className="rounded-lg px-4 py-3 bg-[#222] text-white border border-orange-400/40 focus:outline-none focus:border-orange-400 transition"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <input
            type="password"
            className="rounded-lg px-4 py-3 bg-[#222] text-white border border-orange-400/40 focus:outline-none focus:border-orange-400 transition"
            placeholder="Confirm Password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {error && (
            <div className="text-red-400 text-xs font-semibold">{error}</div>
          )}
          <button
            type="submit"
            className="mt-2 bg-orange-400 hover:bg-orange-500 transition text-black font-bold rounded-full px-6 py-3 shadow-lg text-lg"
          >
            Sign Up
          </button>
        </form>
        <div className="text-gray-500 text-xs mt-7">
          Already have an account?{" "}
          <button
            className="text-orange-400 underline font-bold"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
