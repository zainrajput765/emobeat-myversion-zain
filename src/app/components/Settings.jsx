import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Camera, Music, Bell, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { HelpTooltip } from "./TutorialOverlay";

export function Settings({ onLogout, userMode = "authenticated", userData = null, isDarkMode, setIsDarkMode }) {
  const [cameraQuality, setCameraQuality] = useState("high");
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [emotionSensitivity, setEmotionSensitivity] = useState([75]);

  const [downloading, setDownloading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleDownloadData = async () => {
    if (!userData?.spotifyId) {
      alert("No active user session detected to download data.");
      return;
    }

    setDownloading(true);
    try {
      // 1. Fetch scan history from MongoDB
      const res = await fetch(`${BASE_URL}/api/history/${userData.spotifyId}`);
      let dbHistory = [];
      if (res.ok) {
        dbHistory = await res.json();
      }

      // 2. Fetch local storage history
      let localHistory = [];
      try {
        localHistory = JSON.parse(localStorage.getItem("emobeat_scan_history") || "[]");
      } catch (e) {
        console.error("Failed to parse local history", e);
      }

      // 3. Assemble all data
      const dataPayload = {
        app: "EmoBeat",
        downloadedAt: new Date().toISOString(),
        userProfile: {
          displayName: userData.displayName || "EmoBeat User",
          email: userData.email,
          spotifyId: userData.spotifyId,
          sessionMode: userMode,
          subscriptionTier: userData.isPro ? "Premium (Pro)" : "Free Tier"
        },
        preferences: {
          cameraQuality,
          notifications,
          autoPlay,
          emotionSensitivity: emotionSensitivity[0],
          theme: isDarkMode ? "dark" : "light"
        },
        scanHistory: {
          cloudScansCount: dbHistory.length,
          cloudScans: dbHistory,
          localScansCount: localHistory.length,
          localScans: localHistory
        }
      };

      // 4. Download file dynamically
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `emobeat_my_data_${userData.spotifyId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      alert("Data compiled successfully! Your JSON file download has started.");
    } catch (err) {
      console.error("Failed to download data", err);
      alert("An error occurred while compiling your data. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!userData?.spotifyId) {
      alert("No active user session detected.");
      return;
    }

    const confirmClear = window.confirm(
      "WARNING: This will permanently delete your entire emotional scan history from both MongoDB and local storage. This action is irreversible. \n\nAre you sure you want to proceed?"
    );

    if (!confirmClear) return;

    setClearing(true);
    try {
      // 1. Delete from MongoDB via API
      const res = await fetch(`${BASE_URL}/api/history/${userData.spotifyId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Failed to clear database logs from the server");
      }

      // 2. Clear local storage history
      localStorage.removeItem("emobeat_scan_history");

      alert("Success! Your scan history has been completely cleared.");
    } catch (err) {
      console.error("Clear history failure", err);
      alert(`Failed to fully clear history: ${err.message}. Please try again.`);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] p-6 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Customize your EmoBeat experience</p>
        </div>

        {/* Camera Settings */}
        <Card className="bg-white dark:bg-[#181818] border-gray-200 dark:border-[#282828] p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <Camera className="w-5 h-5 text-[#1DB954]" />
            <h3 className="text-gray-900 dark:text-white font-medium">Camera Settings</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="camera-quality" className="text-gray-700 dark:text-gray-300">
                Video Quality
              </Label>
              <Select value={cameraQuality} onValueChange={setCameraQuality}>
                <SelectTrigger id="camera-quality" className="bg-white dark:bg-[#282828] border-gray-200 dark:border-[#404040] text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#282828] border-gray-200 dark:border-[#404040]">
                  <SelectItem value="low">Low (480p)</SelectItem>
                  <SelectItem value="medium">Medium (720p)</SelectItem>
                  <SelectItem value="high">High (1080p)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="emotion-sensitivity" className="text-gray-700 dark:text-gray-300">
                  Emotion Detection Sensitivity
                </Label>
                <span className="text-sm text-gray-500 dark:text-gray-400">{emotionSensitivity[0]}%</span>
              </div>
              <Slider
                id="emotion-sensitivity"
                value={emotionSensitivity}
                onValueChange={setEmotionSensitivity}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Higher sensitivity detects subtle emotional changes faster
              </p>
            </div>
          </div>
        </Card>

        {/* Music Preferences */}
        <Card className="bg-white dark:bg-[#181818] border-gray-200 dark:border-[#282828] p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <Music className="w-5 h-5 text-[#1DB954]" />
            <h3 className="text-gray-900 dark:text-white font-medium">Music Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-play" className="text-gray-700 dark:text-gray-300">
                  Auto-play recommendations
                </Label>
                <p className="text-sm text-gray-500">
                  Automatically play music when emotion is detected
                </p>
              </div>
              <Switch
                id="auto-play"
                checked={autoPlay}
                onCheckedChange={setAutoPlay}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-gray-700 dark:text-gray-300">
                  Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Get notified when new playlists match your mood
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="bg-white dark:bg-[#181818] border-gray-200 dark:border-[#282828] p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-[#1DB954]" />
            <h3 className="text-gray-900 dark:text-white font-medium">Appearance</h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-gray-700 dark:text-gray-300">
                Dark Mode
              </Label>
              <p className="text-sm text-gray-500 max-w-[250px]">
                Toggle between light and dark themes.
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
          </div>
        </Card>

        {/* Privacy & Data */}
        <Card className="bg-white dark:bg-[#181818] border-gray-200 dark:border-[#282828] p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[#1DB954]" />
            <h3 className="text-gray-900 dark:text-white flex items-center gap-1 font-medium">
              Privacy &amp; Data
              <HelpTooltip topic="privacy" />
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-[#282828] rounded-lg border border-gray-100 dark:border-transparent">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                EmoBeat processes facial data locally on your device. No video or images are stored or transmitted to our servers.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full border-gray-200 dark:border-[#404040] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#282828] flex items-center justify-center gap-2"
              onClick={handleDownloadData}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin"></span>
                  Compiling Data...
                </>
              ) : (
                "Download My Data"
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 flex items-center justify-center gap-2"
              onClick={handleClearHistory}
              disabled={clearing}
            >
              {clearing ? (
                <>
                  <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                  Clearing History...
                </>
              ) : (
                "Clear History"
              )}
            </Button>
          </div>
        </Card>

        {/* Hidden Admin Access - subtle, not obvious to regular users */}
        <p
          className="text-center text-gray-400 dark:text-gray-800 text-[10px] font-bold cursor-pointer hover:text-gray-600 transition-colors select-none"
          onClick={() => window.dispatchEvent(new CustomEvent("navigate-admin"))}
        >
          System Administration
        </p>

        {/* Account */}
        <Card className="bg-white dark:bg-[#181818] border-gray-200 dark:border-[#282828] p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <LogOut className="w-5 h-5 text-[#1DB954]" />
            <h3 className="text-gray-900 dark:text-white font-medium">Account</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#282828] rounded-lg border border-gray-100 dark:border-transparent">
              <div>
                <p className="text-gray-900 dark:text-white font-medium">{userData?.displayName || "EmoBeat User"}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{userData?.email || (userMode === "anonymous" ? "Anonymous session" : "Spotify account")}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs ${
                userMode === "authenticated" ? "bg-[#1DB954]/20 text-[#1DB954]" : "bg-gray-700/50 text-gray-500"
              }`}>
                {userMode === "authenticated" ? "Connected" : "Anonymous"}
              </div>
            </div>

            <Button
              onClick={onLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {userMode === "authenticated" ? "Disconnect Spotify" : "Sign Out"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
