import { useState, useEffect } from "react";
import { WelcomePage } from "./components/WelcomePage";
import { SpotifyAuth } from "./components/SpotifyAuth";
import { MainDashboard } from "./components/MainDashboard";
import { UserHistory } from "./components/UserHistory";
import { Settings } from "./components/Settings";
import { AdminDashboard } from "./components/AdminDashboard";
import { Navigation } from "./components/Navigation";
import { TutorialOverlay } from "./components/TutorialOverlay";

function App() {
  const [appState, setAppState] = useState("welcome"); // welcome | auth | app
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userMode, setUserMode] = useState("authenticated"); // "authenticated" | "anonymous"
  const [showTutorial, setShowTutorial] = useState(false);

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Show tutorial overlay for first-time visitors (once per browser session)
  useEffect(() => {
    if (appState === "app") {
      const hasSeenTutorial = localStorage.getItem("emobeat_tutorial_seen");
      if (!hasSeenTutorial) {
        // Small delay so the dashboard renders first
        const t = setTimeout(() => setShowTutorial(true), 800);
        return () => clearTimeout(t);
      }
    }
  }, [appState]);

  const handleTutorialClose = () => {
    localStorage.setItem("emobeat_tutorial_seen", "true");
    setShowTutorial(false);
  };

  const handleStart = () => setAppState("auth");

  const handleAuthenticate = () => {
    setUserMode("authenticated");
    setAppState("app");
  };

  const handleSkipAuth = () => {
    setUserMode("anonymous");
    setAppState("app");
  };

  const handleLogout = () => {
    setAppState("welcome");
    setCurrentPage("dashboard");
    setIsAdmin(false);
    setUserMode("authenticated");
    // Let tutorial show again on next login
    localStorage.removeItem("emobeat_tutorial_seen");
  };

  const handleNavigate = (page) => setCurrentPage(page);

  // Secret admin navigation via custom event (triggered from Settings)
  useEffect(() => {
    const handler = () => {
      setIsAdmin(true);
      setCurrentPage("admin");
    };
    window.addEventListener("navigate-admin", handler);
    return () => window.removeEventListener("navigate-admin", handler);
  }, []);

  // Welcome Page
  if (appState === "welcome") {
    return <WelcomePage onStart={handleStart} />;
  }

  // Spotify Authentication
  if (appState === "auth") {
    return (
      <SpotifyAuth
        onAuthenticate={handleAuthenticate}
        onSkip={handleSkipAuth}
      />
    );
  }

  // Main Application
  return (
    <div className="min-h-screen bg-[#121212]">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        userMode={userMode}
      />

      {currentPage === "dashboard" && (
        <MainDashboard onNavigate={handleNavigate} userMode={userMode} />
      )}

      {currentPage === "history" && <UserHistory />}

      {currentPage === "settings" && (
        <Settings onLogout={handleLogout} userMode={userMode} />
      )}

      {currentPage === "admin" && isAdmin && <AdminDashboard />}

      {/* First-time tutorial overlay */}
      {showTutorial && <TutorialOverlay onClose={handleTutorialClose} />}
    </div>
  );
}

export default App;
