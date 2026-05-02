import { useState, useEffect } from "react";
import { WelcomePage } from "./components/WelcomePage";
import { SpotifyAuth } from "./components/SpotifyAuth";
import { MainDashboard } from "./components/MainDashboard";
import { UserHistory } from "./components/UserHistory";
import { Settings } from "./components/Settings";
import { AdminDashboard } from "./components/AdminDashboard";
import { Navigation } from "./components/Navigation";
import { TutorialOverlay } from "./components/TutorialOverlay";

const SESSION_KEY = "emobeat_user_session";

function App() {
  const [appState, setAppState]       = useState("loading"); // loading | welcome | auth | app
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isAdmin, setIsAdmin]         = useState(false);
  const [userMode, setUserMode]       = useState("authenticated");
  const [userData, setUserData]       = useState(null); // { displayName, email, mode, connectedAt }
  const [showTutorial, setShowTutorial] = useState(false);

  // ── On mount: restore session from localStorage ──────────────────────────
  useEffect(() => {
    document.documentElement.classList.add("dark");
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        setUserData(session);
        setUserMode(session.mode || "authenticated");
        setAppState("app");
      } else {
        setAppState("welcome");
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
      setAppState("welcome");
    }
  }, []);

  // ── Show tutorial for first-time users ────────────────────────────────────
  useEffect(() => {
    if (appState === "app") {
      const seen = localStorage.getItem("emobeat_tutorial_seen");
      if (!seen) {
        const t = setTimeout(() => setShowTutorial(true), 800);
        return () => clearTimeout(t);
      }
    }
  }, [appState]);

  const handleTutorialClose = () => {
    localStorage.setItem("emobeat_tutorial_seen", "true");
    setShowTutorial(false);
  };

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleStart = () => setAppState("auth");

  const handleAuthenticate = (user) => {
    const session = {
      displayName: user?.displayName || "Spotify User",
      email:       user?.email       || "user@spotify.com",
      mode:        "authenticated",
      connectedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUserData(session);
    setUserMode("authenticated");
    setAppState("app");
  };

  const handleSkipAuth = () => {
    const session = {
      displayName: "Anonymous",
      email:       null,
      mode:        "anonymous",
      connectedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUserData(session);
    setUserMode("anonymous");
    setAppState("app");
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("emobeat_tutorial_seen");
    setAppState("welcome");
    setCurrentPage("dashboard");
    setIsAdmin(false);
    setUserMode("authenticated");
    setUserData(null);
  };

  const handleNavigate = (page) => setCurrentPage(page);

  // Secret admin navigation via Settings
  useEffect(() => {
    const handler = () => {
      setIsAdmin(true);
      setCurrentPage("admin");
    };
    window.addEventListener("navigate-admin", handler);
    return () => window.removeEventListener("navigate-admin", handler);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  if (appState === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (appState === "welcome") return <WelcomePage onStart={handleStart} />;

  if (appState === "auth") {
    return (
      <SpotifyAuth
        onAuthenticate={handleAuthenticate}
        onSkip={handleSkipAuth}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        userMode={userMode}
        userData={userData}
      />

      {currentPage === "dashboard" && (
        <MainDashboard onNavigate={handleNavigate} userMode={userMode} userData={userData} />
      )}
      {currentPage === "history"   && <UserHistory />}
      {currentPage === "settings"  && (
        <Settings onLogout={handleLogout} userMode={userMode} userData={userData} />
      )}
      {currentPage === "admin" && isAdmin && <AdminDashboard />}

      {showTutorial && <TutorialOverlay onClose={handleTutorialClose} />}
    </div>
  );
}

export default App;
