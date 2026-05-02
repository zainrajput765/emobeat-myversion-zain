import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Camera, Music, Bell, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { HelpTooltip } from "./TutorialOverlay";

export function Settings({ onLogout, userMode = "authenticated", userData = null }) {
  const [cameraQuality, setCameraQuality] = useState("high");
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [emotionSensitivity, setEmotionSensitivity] = useState([75]);

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">Customize your EmoBeat experience</p>
        </div>

        {/* Camera Settings */}
        <Card className="bg-[#181818] border-[#282828] p-6">
          <div className="flex items-center gap-3 mb-6">
            <Camera className="w-5 h-5 text-[#1DB954]" />
            <h3 className="text-white">Camera Settings</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="camera-quality" className="text-gray-300">
                Video Quality
              </Label>
              <Select value={cameraQuality} onValueChange={setCameraQuality}>
                <SelectTrigger id="camera-quality" className="bg-[#282828] border-[#404040] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#282828] border-[#404040]">
                  <SelectItem value="low">Low (480p)</SelectItem>
                  <SelectItem value="medium">Medium (720p)</SelectItem>
                  <SelectItem value="high">High (1080p)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="emotion-sensitivity" className="text-gray-300">
                  Emotion Detection Sensitivity
                </Label>
                <span className="text-sm text-gray-400">{emotionSensitivity[0]}%</span>
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
        <Card className="bg-[#181818] border-[#282828] p-6">
          <div className="flex items-center gap-3 mb-6">
            <Music className="w-5 h-5 text-[#1DB954]" />
            <h3 className="text-white">Music Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-play" className="text-gray-300">
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
                <Label htmlFor="notifications" className="text-gray-300">
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
        <Card className="bg-[#181818] border-[#282828] p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-[#1DB954]" />
            <h3 className="text-white">Appearance</h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-gray-300">
                Dark Mode
              </Label>
              <p className="text-sm text-gray-500">
                Use dark theme for better viewing experience
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </Card>

        {/* Privacy & Data */}
        <Card className="bg-[#181818] border-[#282828] p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[#1DB954]" />
            <h3 className="text-white flex items-center gap-1">
              Privacy &amp; Data
              <HelpTooltip topic="privacy" />
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#282828] rounded-lg">
              <p className="text-sm text-gray-400">
                EmoBeat processes facial data locally on your device. No video or images are stored or transmitted to our servers.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full border-[#404040] text-gray-300 hover:bg-[#282828]"
            >
              Download My Data
            </Button>

            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
              onClick={() => { localStorage.removeItem("emobeat_scan_history"); alert("History cleared."); }}
            >
              Clear History
            </Button>
          </div>
        </Card>

        {/* Hidden Admin Access - subtle, not obvious to regular users */}
        <p
          className="text-center text-gray-800 text-[10px] font-bold cursor-pointer hover:text-gray-600 transition-colors select-none"
          onClick={() => window.dispatchEvent(new CustomEvent("navigate-admin"))}
        >
          System Administration
        </p>

        {/* Account */}
        <Card className="bg-[#181818] border-[#282828] p-6">
          <div className="flex items-center gap-3 mb-6">
            <LogOut className="w-5 h-5 text-[#1DB954]" />
            <h3 className="text-white">Account</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#282828] rounded-lg">
              <div>
                <p className="text-white font-medium">{userData?.displayName || "EmoBeat User"}</p>
                <p className="text-sm text-gray-400">{userData?.email || (userMode === "anonymous" ? "Anonymous session" : "Spotify account")}</p>
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
