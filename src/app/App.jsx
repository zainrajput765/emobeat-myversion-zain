import { useState, useEffect } from "react";
import { WelcomePage } from "./components/WelcomePage";
import { SpotifyAuth } from "./components/SpotifyAuth";
import { MainDashboard } from "./components/MainDashboard";
import { UserHistory } from "./components/UserHistory";
import { Settings } from "./components/Settings";
import { AdminDashboard } from "./components/AdminDashboard";
import { Navigation } from "./components/Navigation";
import { TutorialOverlay } from "./components/TutorialOverlay";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";

const SESSION_KEY = "emobeat_user_session";

function App() {
  const [appState, setAppState]       = useState("loading"); // loading | welcome | auth | app
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isAdmin, setIsAdmin]         = useState(false);
  const [userMode, setUserMode]       = useState("authenticated");
  const [userData, setUserData]       = useState(null); // { displayName, email, mode, connectedAt }
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDarkMode, setIsDarkMode]     = useState(true);

  // ── Theme management ─────────────────────────────────────────────────────
  useEffect(() => {
    const savedMode = localStorage.getItem("emobeat_theme");
    if (savedMode !== null) {
      setIsDarkMode(savedMode === "dark");
    } else {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("emobeat_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("emobeat_theme", "light");
    }
  }, [isDarkMode]);

  // ── On mount: restore session from localStorage ──────────────────────────
  useEffect(() => {
    
    // Check if we just returned from Spotify OAuth
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get("session");
    
    if (sessionParam) {
      try {
        const decodedStr = atob(decodeURIComponent(sessionParam));
        const session = JSON.parse(decodedStr);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Sync with MongoDB backend
        const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        fetch(`${BASE_URL}/api/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spotifyId: session.spotifyId,
            email: session.email,
            displayName: session.displayName
          })
        }).then(res => res.json()).then(data => {
          session.isPro = data.isPro;
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          setUserData(session);
          setUserMode(session.mode || "authenticated");
          setAppState("app");
        }).catch(err => {
          console.error("MongoDB sync failed", err);
          // Fallback
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          setUserData(session);
          setUserMode(session.mode || "authenticated");
          setAppState("app");
        });
        
        return;
      } catch (err) {
        console.error("Failed to parse session from URL", err);
      }
    }

    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        // Sync with MongoDB backend
        const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        fetch(`${BASE_URL}/api/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spotifyId: session.spotifyId,
            email: session.email,
            displayName: session.displayName
          })
        }).then(res => res.json()).then(data => {
          session.isPro = data.isPro;
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          setUserData(session);
          setUserMode(session.mode || "authenticated");
          setAppState("app");
        }).catch(err => {
          console.error("MongoDB sync failed", err);
          setUserData(session);
          setUserMode(session.mode || "authenticated");
          setAppState("app");
        });
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
    let anonId = localStorage.getItem("emobeat_anon_id");
    if (!anonId) {
      anonId = `guest_anon_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("emobeat_anon_id", anonId);
    }
    const session = {
      spotifyId: anonId,
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
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
      {currentPage === "history"   && <UserHistory userData={userData} />}
      {currentPage === "settings"  && (
        <Settings 
          onLogout={handleLogout} 
          userMode={userMode} 
          userData={userData} 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      )}
      {currentPage === "admin" && isAdmin && <AdminDashboard />}
      {currentPage === "analytics" && <AnalyticsDashboard userData={userData} />}

      {showTutorial && <TutorialOverlay onClose={handleTutorialClose} />}
    </div>
  );
}

export default App;
