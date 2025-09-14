// services/api.js
import axios from "axios";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://votechaos.com/api"
    : "http://localhost:5050/api";

export const api = axios.create({
  baseURL: API_BASE,
  
  withCredentials: false,
});


export const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) return { user: null };

  try {
    const res = await api.get("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch {
    return { user: null };
  }
};
