import { useState, useEffect } from "react";
import { WelcomePage } from "./components/WelcomePage";
import { SpotifyAuth } from "./components/SpotifyAuth";
import { MainDashboard } from "./components/MainDashboard";
import { UserHistory } from "./components/UserHistory";
import { Settings } from "./components/Settings";
import { AdminDashboard } from "./components/AdminDashboard";
import { Navigation } from "./components/Navigation";

function App() {
  const [appState, setAppState] = useState("welcome"); // welcome | auth | app
  const [currentPage, setCurrentPage] = useState("dashboard"); // dashboard | history | settings | admin
  const [isAdmin] = useState(false); // Admin tab hidden from all users - access via Settings

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleStart = () => {
    setAppState("auth");
  };

  const handleAuthenticate = () => {
    setAppState("app");
  };

  const handleLogout = () => {
    setAppState("welcome");
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // Secret admin navigation via custom event (triggered from Settings)
  useEffect(() => {
    const handler = () => setCurrentPage("admin");
    window.addEventListener("navigate-admin", handler);
    return () => window.removeEventListener("navigate-admin", handler);
  }, []);

  // Welcome Page
  if (appState === "welcome") {
    return <WelcomePage onStart={handleStart} />;
  }

  // Spotify Authentication
  if (appState === "auth") {
    return <SpotifyAuth onAuthenticate={handleAuthenticate} />;
  }

  // Main Application
  return (
    <div className="min-h-screen bg-[#121212]">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
      />

      {currentPage === "dashboard" && (
        <MainDashboard onNavigate={handleNavigate} />
      )}

      {currentPage === "history" && <UserHistory />}

      {currentPage === "settings" && (
        <Settings onLogout={handleLogout} />
      )}

      {currentPage === "admin" && isAdmin && <AdminDashboard />}
    </div>
  );
}

export default App;
