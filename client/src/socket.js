// socket.js
import { io } from "socket.io-client";

// ✅ Dynamically pick socket server URL
const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://votechaos.com" // EC2 with domain + SSL
    : "http://localhost:5050"; // local dev

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // fallback to polling
  withCredentials: true, // allow cookies/tokens if needed
});

export default socket;
