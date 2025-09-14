import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./LandingPage";
import Login from "./Login";
import Signup from "./signUp";
import Dashboard from "./Dashboard";
import GameCreatedScreen from "./components/GameCreatedScreen";
import Game from "./Game";
import { api } from "./services/api"; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          
          const response = await api.getProfile();
          if (response.user) {
            setUser(response.user);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          localStorage.removeItem("token"); 
        }
      }

      setLoading(false);
    };

    initializeUser();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />

        
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
        />

        
        <Route path="/game-created/:roomCode" element={<GameCreatedScreen />} />
        <Route path="/game" element={<Game />} />
        <Route path="/room/:roomCode" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
