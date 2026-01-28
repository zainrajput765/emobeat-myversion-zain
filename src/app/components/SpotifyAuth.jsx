import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Music2, Check } from "lucide-react";

export function SpotifyAuth({ onAuthenticate }) {
  const permissions = [
    "Access your listening history",
    "Control playback on your devices",
    "Read your currently playing track",
    "Modify your playlists"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0a0a0a] px-6">
      <Card className="bg-[#181818] border-[#282828] p-8 max-w-md w-full">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-[#1DB954] p-4 rounded-full">
              <Music2 className="w-12 h-12 text-black" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Connect to Spotify</h2>
            <p className="text-gray-400">
              EmoBeat needs access to your Spotify account to provide personalized music recommendations
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-400">EmoBeat will be able to:</p>
            {permissions.map((permission, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#1DB954] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{permission}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={onAuthenticate}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black py-6"
            >
              Authorize with Spotify
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              By connecting, you agree to Spotify's Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
